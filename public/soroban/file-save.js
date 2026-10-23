export const MAX_BOOK_FILE_BYTES = 32 * 1024 * 1024;
// Authenticated-encryption envelopes include base64 expansion and bounded metadata.
export const MAX_SAVED_FILE_BYTES = Math.ceil((MAX_BOOK_FILE_BYTES + 16) / 3) * 4 + 2048;

/** Browser-local workbook files. This module never sends workbook data over a network. */
export function createFileSaver(host, env = globalThis) {
  if (!host || typeof host.getBook !== 'function' || typeof host.onChange !== 'function' || typeof host.download !== 'function') {
    throw new TypeError('getBook, onChange and download are required.');
  }
  const supported = typeof env.showSaveFilePicker === 'function' && env.isSecureContext !== false;
  const entries = new Map();
  const later = typeof env.setTimeout === 'function' ? env.setTimeout.bind(env) : setTimeout;
  const cancel = typeof env.clearTimeout === 'function' ? env.clearTimeout.bind(env) : clearTimeout;
  const now = () => Date.now();
  let disposed = false, quiescing = false, quiescePromise = null, databasePromise = null, restorePromise = null;

  function failure(code, message) { return Object.assign(new Error(message), { code }); }
  function describe(error) {
    if (typeof error?.code === 'string' && error.code && error?.message) return { code: error.code, message: String(error.message) };
    if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') return { code: 'PERMISSION_REQUIRED', message: '保存先への書き込みを許可できませんでした。「保存」で許可するか、別の保存先を選んでください。' };
    if (error?.name === 'NotFoundError') return { code: 'FILE_NOT_FOUND', message: '保存先のファイルが見つかりません。「名前を付けて保存」で保存先を選び直してください。' };
    if (error?.name === 'NoModificationAllowedError') return { code: 'FILE_BUSY', message: '別のアプリやタブがこのファイルに保存中です。保存が終わってから再試行するか、別名で保存してください。' };
    if (error?.name === 'QuotaExceededError') return { code: 'QUOTA_EXCEEDED', message: '保存先の空き容量が不足しています。空き容量を確認してから保存してください。' };
    return { code: 'SAVE_FAILED', message: 'ファイルを保存できませんでした。ブラウザ内の内容は残っています。保存先を確認して、もう一度保存してください。' };
  }
  function entryFor(id) {
    if (!entries.has(id)) entries.set(id, {
      id, handle: null, fileName: '', autoSave: true, phase: 'unlinked', savedRevision: null,
      savedAt: null, savedUpdatedAt: null, error: null, remembered: false, signature: null,
      fingerprint: null, timer: null, inFlight: null, manualPromise: null, changingTarget: false,
      manualTouched: false, changedCount: 0, baselineUnknown: false, requestedHandle: null, autoArmed: false,
    });
    return entries.get(id);
  }
  function status(id) {
    const e = entryFor(id);
    return { linked: !!e.handle, fileName: e.fileName, autoSave: e.autoSave, phase: e.phase,
      savedRevision: e.savedRevision, savedAt: e.savedAt, error: e.error, remembered: e.remembered };
  }
  function notify(e) { if (!disposed) { try { host.onChange(e.id, status(e.id)); } catch {} } }
  function clearTimer(e) { if (e.timer !== null) { cancel(e.timer); e.timer = null; } }
  function getBook(id) {
    const source = host.getBook(id);
    if (!source) throw failure('BOOK_UNAVAILABLE', 'このブックは現在保存できません。別のタブとの競合やブックの状態を確認してください。');
    return source;
  }
  function canAuto(e) { try { return !quiescing && (typeof host.canAutoSave !== 'function' || host.canAutoSave(e.id) !== false); } catch { return false; } }
  function pauseAuto(e) { clearTimer(e); e.phase = 'paused'; e.error = null; notify(e); return { ok: false, paused: true }; }
  function dirty(e) {
    const b = host.getBook(e.id);
    if (!b) return false;
    if (e.savedRevision === null || (b.revision ?? 0) !== e.savedRevision || (b.updatedAt ?? null) !== e.savedUpdatedAt) return true;
    return e.fingerprint !== null && JSON.stringify(b) !== e.fingerprint;
  }
  function snapshot(id) {
    const fingerprint = JSON.stringify(getBook(id)), book = JSON.parse(fingerprint), savedAt = new Date(now()).toISOString();
    const payload = { format: 'soroban-workbook', version: 1, savedAt, book };
    const text = JSON.stringify(payload, null, 2);
    const byteLength = new TextEncoder().encode(text).byteLength;
    if (byteLength > MAX_BOOK_FILE_BYTES) throw failure('FILE_TOO_LARGE', 'ブックの保存上限は32MBです。ブックを分けてから保存してください。');
    return { book, payload, fingerprint, text, byteLength, savedAt, revision: book.revision ?? 0, updatedAt: book.updatedAt ?? null };
  }
  async function serializeSnapshot(data) {
    if (typeof host.serialize !== 'function') return data;
    const text = await host.serialize(data.payload);
    if (typeof text !== 'string') throw failure('SERIALIZE_FAILED', '保存用データを作成できませんでした。変更前のファイルは保護されています。');
    if (text.length > MAX_SAVED_FILE_BYTES) throw failure('FILE_TOO_LARGE', '保存用データが大きすぎます。ブックを分けてください。');
    const byteLength = new TextEncoder().encode(text).byteLength;
    if (byteLength > MAX_SAVED_FILE_BYTES) throw failure('FILE_TOO_LARGE', '保存用データが大きすぎます。ブックを分けてください。');
    return { ...data, text, byteLength };
  }
  function nameFor(book) {
    if (typeof host.fileName === 'function') {
      const name = host.fileName(book);
      if (typeof name !== 'string' || !name || name.length > 180 || /[\\/:*?"<>|\u0000-\u001f]/.test(name)) throw failure('INVALID_FILE_NAME', '保存するファイル名を確認してください。');
      return name;
    }
    return String(book.name || '無題のブック').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').slice(0, 90) + '.soroban.json';
  }
  function markError(e, error) {
    const detail = describe(error); e.phase = detail.code === 'PERMISSION_REQUIRED' ? 'permission' : 'error';
    e.error = detail.message; clearTimer(e); notify(e); return { ok: false, error: detail };
  }
  function metadata(file) { return { lastModified: file.lastModified, size: file.size }; }
  function sameMetadata(a, b) { return !!a && !!b && a.lastModified === b.lastModified && a.size === b.size; }

  function database() {
    if (databasePromise) return databasePromise;
    databasePromise = new Promise(resolve => {
      if (!env.indexedDB || typeof env.indexedDB.open !== 'function') { resolve(null); return; }
      let settled = false, request;
      const finish = db => { if (settled) { db?.close?.(); return; } settled = true; cancel(timeout); resolve(db); };
      const timeout = later(() => finish(null), 1500);
      try {
        request = env.indexedDB.open('soroban-file-targets-v1', 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('targets')) db.createObjectStore('targets', { keyPath: 'bookId' });
        };
        request.onsuccess = () => { const db = request.result; db.onversionchange = () => db.close(); finish(db); };
        request.onerror = request.onblocked = () => finish(null);
      } catch { finish(null); }
    });
    return databasePromise;
  }
  async function storedRecords() {
    if (host.rememberTargets === false) return [];
    const db = await database(); if (!db) return [];
    return new Promise(resolve => {
      let done = false, tx, rows = [];
      const finish = value => { if (!done) { done = true; cancel(timeout); resolve(value); } };
      const timeout = later(() => { try { tx?.abort(); } catch {} finish([]); }, 1500);
      try {
        tx = db.transaction('targets', 'readonly');
        const request = tx.objectStore('targets').getAll();
        request.onsuccess = () => { rows = Array.isArray(request.result) ? request.result : []; };
        tx.oncomplete = () => finish(rows); tx.onerror = tx.onabort = () => finish([]);
      } catch { finish([]); }
    });
  }
  async function remember(e) {
    if (host.rememberTargets === false) { e.remembered = false; return false; }
    const db = await database(); if (!db || disposed) { e.remembered = false; return false; }
    const record = { bookId: e.id, handle: e.handle, fileName: e.fileName, autoSave: e.autoSave,
      savedRevision: e.savedRevision, savedAt: e.savedAt, savedUpdatedAt: e.savedUpdatedAt, signature: e.signature };
    const success = await new Promise(resolve => {
      let done = false, tx;
      const finish = value => { if (!done) { done = true; cancel(timeout); resolve(value); } };
      const timeout = later(() => { try { tx?.abort(); } catch {} finish(false); }, 1500);
      try {
        tx = db.transaction('targets', 'readwrite'); tx.objectStore('targets').put(record);
        tx.oncomplete = () => finish(true); tx.onerror = tx.onabort = () => finish(false);
      } catch { finish(false); }
    });
    e.remembered = success; return success;
  }
  async function permission(handle, request = false) {
    // New picker handles are already user-authorized. Restored handles require an explicit check.
    if (typeof handle.queryPermission !== 'function') return true;
    if (await handle.queryPermission({ mode: 'readwrite' }) === 'granted') return true;
    if (request && typeof handle.requestPermission === 'function' && await handle.requestPermission({ mode: 'readwrite' }) === 'granted') return true;
    return false;
  }
  async function checkOtherTargets(id, handle) {
    for (const other of entries.values()) {
      if (other.id === id) continue;
      if (!host.getBook(other.id) && !other.inFlight && !other.manualPromise) continue;
      for (const otherHandle of [other.handle, other.requestedHandle]) {
        if (!otherHandle) continue;
        let same = handle === otherHandle;
        if (!same && typeof handle.isSameEntry === 'function') same = await handle.isSameEntry(otherHandle);
        if (same) throw failure('TARGET_IN_USE', 'このファイルは別のブックの保存先です。別の名前で保存してください。');
      }
    }
  }
  function schedule(e) {
    clearTimer(e);
    if (disposed || quiescing || !e.handle || !e.autoSave || !e.autoArmed || e.changingTarget || !dirty(e)) return;
    if (!canAuto(e)) { pauseAuto(e); return; }
    if (e.phase === 'permission' || e.phase === 'error') return;
    if (!e.inFlight) e.phase = 'waiting';
    notify(e);
    e.timer = later(() => { e.timer = null; void ensureWrite(e, { manual: false }); }, 900);
  }
  async function performWrite(e, { manual = false, target = null } = {}) {
    const handle = target || e.handle;
    if (!handle || disposed || quiescing) return { ok: false, cancelled: true };
    if (!manual && (!e.autoSave || !e.autoArmed || !canAuto(e))) return pauseAuto(e);
    let writer, closed = false;
    try {
      if (!await permission(handle, manual)) throw failure('PERMISSION_REQUIRED', '保存先への書き込み許可が必要です。「保存」を押して許可してください。');
      const baseline = metadata(await handle.getFile());
      if (!target) {
        if (e.baselineUnknown || !e.signature) throw failure('BASELINE_UNKNOWN', '保存先の状態を確認できません。「名前を付けて保存」で保存先を選び直してください。');
        if (!sameMetadata(e.signature, baseline)) throw failure('EXTERNAL_FILE_CHANGED', 'ファイルが別のアプリやタブで更新されました。上書きせずに停止しました。「名前を付けて保存」で別ファイルに保存してください。');
      }
      if (!manual && (!e.autoSave || !e.autoArmed || !canAuto(e))) return pauseAuto(e);
      const pendingData = snapshot(e.id), changedAtStart = e.changedCount;
      e.phase = 'saving'; e.error = null; notify(e);
      const data = await serializeSnapshot(pendingData);
      getBook(e.id);
      if (disposed || quiescing || !manual && (!e.autoSave || !e.autoArmed || !canAuto(e))) return { ok: false, cancelled: true };
      writer = await handle.createWritable({ mode: 'exclusive' });
      if (disposed || quiescing || !manual && (!e.autoSave || !e.autoArmed || !canAuto(e))) { try { await writer.abort?.(); } catch {} return disposed || quiescing ? { ok: false, cancelled: true } : pauseAuto(e); }
      await writer.write(data.text);
      // The temporary stream is not committed until close(). Recheck after asynchronous work.
      if (!sameMetadata(baseline, metadata(await handle.getFile()))) throw failure('EXTERNAL_FILE_CHANGED', '保存中にファイルが別のアプリやタブで更新されました。上書きせずに停止しました。別名で保存してください。');
      getBook(e.id);
      if (disposed || quiescing || !manual && (!e.autoSave || !e.autoArmed || !canAuto(e))) { try { await writer.abort?.(); } catch {} return disposed || quiescing ? { ok: false, cancelled: true } : pauseAuto(e); }
      await writer.close(); closed = true;
      // Commit the link only after the complete file has been written and closed.
      e.handle = handle; e.fileName = handle.name || nameFor(data.book); e.savedRevision = data.revision;
      e.savedAt = data.savedAt; e.savedUpdatedAt = data.updatedAt; e.fingerprint = data.fingerprint;
      if (e.changedCount === changedAtStart) e.autoArmed = false;
      e.remembered = false; e.baselineUnknown = true;
      try {
        const actual = await handle.getFile();
        if (actual.size !== data.byteLength || await actual.text() !== data.text) throw failure('EXTERNAL_FILE_CHANGED', '保存直後にファイルの内容が変更されました。自動上書きを停止しました。「名前を付けて保存」で別ファイルに退避してください。');
        e.signature = metadata(actual); e.baselineUnknown = false;
      } catch (error) {
        e.signature = null;
        if (error?.code === 'EXTERNAL_FILE_CHANGED') throw error;
        throw failure('BASELINE_UNKNOWN', 'ファイルへの保存は完了しましたが、保存先を再確認できません。次回は「名前を付けて保存」で保存先を確認してください。');
      }
      await remember(e);
      e.phase = dirty(e) ? (e.autoSave && e.autoArmed ? 'waiting' : 'paused') : 'saved'; e.error = null; notify(e);
      return { ok: true, mode: 'file', revision: data.revision, savedAt: data.savedAt, fileName: e.fileName };
    } catch (error) {
      if (writer && !closed && typeof writer.abort === 'function') { try { await writer.abort(); } catch {} }
      return markError(e, error);
    }
  }
  async function ensureWrite(e, options = {}) {
    clearTimer(e);
    if (e.inFlight) {
      const pending = e.inFlight; await pending;
      if (!options.manual && (!e.autoSave || !e.autoArmed || !dirty(e) || ['error', 'permission'].includes(e.phase))) return { ok: e.phase === 'saved', mode: 'file' };
      return ensureWrite(e, options);
    }
    if (disposed || quiescing) return { ok: false, cancelled: true };
    if (!options.manual && (!e.autoSave || !e.autoArmed || !e.handle || !dirty(e) || e.changingTarget || ['error', 'permission'].includes(e.phase))) return { ok: e.phase === 'saved', mode: 'file' };
    if (!options.manual && (!e.autoSave || !e.autoArmed || !canAuto(e))) return pauseAuto(e);
    const work = performWrite(e, options); e.inFlight = work;
    try { return await work; }
    finally { if (e.inFlight === work) e.inFlight = null; if (e.phase !== 'error' && e.phase !== 'permission') schedule(e); }
  }

  async function downloadWorkbook(e) {
    try {
      const data = await serializeSnapshot(snapshot(e.id));
      if (disposed || quiescing) return { ok: false, cancelled: true };
      getBook(e.id);
      await host.download(data.text, nameFor(data.book), 'application/json');
      if (!e.handle) { e.phase = 'downloaded'; e.savedAt = data.savedAt; }
      e.error = null; notify(e);
      return { ok: true, mode: 'download', fileName: nameFor(data.book) };
    } catch (error) { return markError(e, error); }
  }
  function unavailablePicker(error) { return ['SecurityError', 'NotSupportedError'].includes(error?.name); }
  function save(id, { asNew = false } = {}) {
    const e = entryFor(id);
    if (disposed || quiescing) return Promise.resolve({ ok: false, cancelled: true });
    if (e.manualPromise) return e.manualPromise;
    e.manualTouched = true; clearTimer(e);
    let picker, fallback = !supported;
    // This call is deliberately before any await, preserving the caller's click/keypress activation.
    if (supported && (asNew || !e.handle)) {
      try {
        const data = snapshot(id);
        picker = Promise.resolve(env.showSaveFilePicker({ id: 'soroban-workbook-save', suggestedName: nameFor(data.book),
          types: [{ description: 'そろばんのブック', accept: { 'application/json': ['.json'] } }] }));
      } catch (error) {
        if (error?.name === 'AbortError') return Promise.resolve({ ok: false, cancelled: true });
        if (unavailablePicker(error)) fallback = true;
        else return Promise.resolve(markError(e, error));
      }
    }
    const work = (async () => {
      if (fallback) return downloadWorkbook(e);
      if (picker) {
        e.changingTarget = true;
        try {
          const handle = await picker;
          if (!handle || typeof handle.createWritable !== 'function' || typeof handle.getFile !== 'function') throw failure('INVALID_FILE_HANDLE', '保存先を利用できません。別の保存先を選んでください。');
          // Reserve before awaiting identity checks, so simultaneous first saves cannot share a target.
          e.requestedHandle = handle;
          await checkOtherTargets(id, handle);
          if (e.inFlight) await e.inFlight;
          return await ensureWrite(e, { manual: true, target: handle });
        } catch (error) {
          if (error?.name === 'AbortError') return { ok: false, cancelled: true };
          if (unavailablePicker(error) && !e.requestedHandle) return downloadWorkbook(e);
          return markError(e, error);
        } finally { e.requestedHandle = null; e.changingTarget = false; if (!['error', 'permission'].includes(e.phase)) schedule(e); }
      }
      return ensureWrite(e, { manual: true });
    })();
    e.manualPromise = work;
    void work.then(() => { if (e.manualPromise === work) e.manualPromise = null; }, () => { if (e.manualPromise === work) e.manualPromise = null; });
    return work;
  }
  function changed(id) {
    if (disposed || quiescing) return; const e = entryFor(id); e.changedCount++; e.autoArmed = true;
    if (!e.handle) { if (e.phase === 'downloaded') e.phase = 'unlinked'; notify(e); return; }
    if (!host.getBook(id)) { clearTimer(e); markError(e, failure('BOOK_UNAVAILABLE', 'このブックは現在保存できません。別のタブとの競合やブックの状態を確認してください。')); return; }
    if (!dirty(e)) { if (!e.inFlight) e.phase = 'saved'; notify(e); return; }
    if (!e.autoSave) { if (!e.inFlight) e.phase = 'paused'; notify(e); return; }
    schedule(e);
  }
  async function setAutoSave(id, enabled) {
    if (typeof enabled !== 'boolean') return { ok: false, error: { code: 'INVALID_INPUT', message: '自動保存にはtrueまたはfalseを指定してください。' } };
    const e = entryFor(id); e.manualTouched = true; e.autoSave = enabled; e.autoArmed = enabled && dirty(e); clearTimer(e);
    if (e.handle && !e.inFlight && dirty(e) && !['error', 'permission'].includes(e.phase)) e.phase = enabled ? 'waiting' : 'paused';
    await remember(e); notify(e); if (enabled) schedule(e); return { ok: true };
  }
  function restore() {
    if (restorePromise) return restorePromise;
    restorePromise = (async () => {
      const records = await storedRecords();
      for (const record of records) {
        if (disposed || quiescing || !record || typeof record.bookId !== 'string' || !host.getBook(record.bookId)) continue;
        const e = entryFor(record.bookId); if (e.manualTouched || e.handle) continue;
        e.autoSave = record.autoSave !== false; e.autoArmed = false; e.remembered = true;
        if (!record.handle || typeof record.handle.createWritable !== 'function' || typeof record.handle.getFile !== 'function') { notify(e); continue; }
        e.handle = record.handle; e.fileName = record.fileName || record.handle.name || '';
        e.savedRevision = record.savedRevision ?? null; e.savedAt = record.savedAt || null;
        e.savedUpdatedAt = record.savedUpdatedAt ?? null; e.signature = record.signature || null;
        const handle = e.handle;
        const current = () => !disposed && !quiescing && !e.manualTouched && e.handle === handle;
        try {
          const allowed = await permission(handle, false);
          if (!current()) continue;
          if (!allowed) throw failure('PERMISSION_REQUIRED', '前回の保存先への書き込み許可が必要です。「保存」を押すと再開できます。');
          const actual = metadata(await handle.getFile());
          if (!current()) continue;
          if (!e.signature || !sameMetadata(actual, e.signature)) throw failure('EXTERNAL_FILE_CHANGED', '保存先のファイルが更新されています。自動上書きを停止しました。必要なファイルを読み込むか、別名で保存してください。');
          e.phase = dirty(e) ? 'paused' : 'saved'; e.error = null; notify(e);
        } catch (error) { if (current()) markError(e, error); }
      }
      return { ok: true };
    })();
    return restorePromise;
  }
  async function flush() {
    await Promise.all([...entries.values()].map(async e => {
      clearTimer(e);
      if (e.inFlight) await e.inFlight;
      // Repeat only when another committed edit arrived while a previous write was closing.
      while (!disposed && !quiescing && e.autoSave && e.autoArmed && e.handle && canAuto(e) && dirty(e) && !e.changingTarget && !['error', 'permission'].includes(e.phase)) {
        const result = await ensureWrite(e, { manual: false });
        clearTimer(e); if (!result.ok) break;
      }
    }));
  }
  async function forgetTargets() {
    const db = await database();
    if (!db && env.indexedDB) throw failure('FILE_TARGETS_UNAVAILABLE', '以前の保存先を消去できませんでした。ほかのタブを閉じてから再試行してください。');
    if (db) await new Promise((resolve, reject) => {
      let done = false, tx;
      const finish = error => { if (!done) { done = true; cancel(timeout); error ? reject(error) : resolve(); } };
      const timeout = later(() => { try { tx?.abort(); } catch {} finish(failure('FILE_TARGETS_UNAVAILABLE', '以前の保存先を消去できませんでした。もう一度試してください。')); }, 1500);
      try {
        tx = db.transaction('targets', 'readwrite'); tx.objectStore('targets').clear();
        tx.oncomplete = () => finish(); tx.onerror = tx.onabort = () => finish(failure('FILE_TARGETS_UNAVAILABLE', '以前の保存先を消去できませんでした。もう一度試してください。'));
      } catch { finish(failure('FILE_TARGETS_UNAVAILABLE', '以前の保存先を消去できませんでした。もう一度試してください。')); }
    });
    entries.clear(); restorePromise = null;
  }
  function quiesce({ forgetTargets: shouldForget = false } = {}) {
    quiescing = true; entries.forEach(clearTimer);
    if (quiescePromise) return quiescePromise.then(result => result.ok && shouldForget ? quiesce({ forgetTargets: true }) : result);
    const work = (async () => {
      try {
        while (true) {
          const pending = [...entries.values()].flatMap(e => [e.inFlight, e.manualPromise].filter(Boolean));
          if (!pending.length) break;
          await Promise.allSettled(pending);
        }
        if (restorePromise) await restorePromise;
        if (shouldForget) await forgetTargets();
        for (const e of entries.values()) { e.autoArmed = false; e.phase = e.handle ? 'paused' : 'unlinked'; notify(e); }
        return { ok: true };
      } catch (error) { return { ok: false, error: describe(error) }; }
    })();
    quiescePromise = work;
    void work.finally(() => { if (quiescePromise === work) quiescePromise = null; });
    return work;
  }
  function resume() { if (!disposed && !quiescePromise) { quiescing = false; entries.forEach(e => { notify(e); schedule(e); }); } }
  function hasPending() { return [...entries.values()].some(e => !!e.inFlight || !!e.manualPromise || e.timer !== null); }
  function dispose() { disposed = true; entries.forEach(clearTimer); if (databasePromise) void databasePromise.then(db => db?.close?.()); }
  return Object.freeze({ supported, restore, status, save, changed, setAutoSave, hasPending, flush, quiesce, resume, dispose });
}
