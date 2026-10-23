// Writes to one localStorage key, with ordered asynchronous encoding and a
// synchronous comparison immediately before each setItem. Web Locks coordinate
// queued writes from cooperating tabs. The comparison alone is not a transaction
// against other scripts: localStorage has no atomic compare-and-swap API.
export function createBrowserPersistence({ storage, key, maxPlainBytes = 16 * 1024 * 1024, locks = globalThis.navigator?.locks } = {}) {
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function' || typeof key !== 'string' || !key) throw new TypeError('storage and key are required.');
  if (!Number.isSafeInteger(maxPlainBytes) || maxPlainBytes < 1 || maxPlainBytes > 32 * 1024 * 1024) throw new TypeError('maxPlainBytes must be between 1 and 33554432.');
  if (locks != null && typeof locks.request !== 'function') throw new TypeError('locks.request must be a function.');
  const maxEncodedBytes = Math.ceil((maxPlainBytes + 16) / 3) * 4 + 2048;
  const lockName = 'soroban:persistence:' + key;
  let expected = null, loaded = false, queued = 0, tail = Promise.resolve();
  const failure = (code, message) => Object.assign(new Error(message), { code });
  function rawStored() {
    try {
      const raw = storage.getItem(key);
      if (raw !== null && typeof raw !== 'string') throw Error('invalid storage');
      return raw;
    } catch { throw failure('STORAGE_ERROR', 'ブラウザの保存データを確認できません。バックアップしてから再試行してください。'); }
  }
  function load() {
    if (!loaded) { expected = rawStored(); loaded = true; }
    return expected;
  }
  function idle() { if (queued) throw failure('SAVE_PENDING', '保存中です。保存が終わってからもう一度操作してください。'); }
  function check() {
    load();
    if (rawStored() !== expected) throw failure('STORAGE_CONFLICT', '別のタブで保存内容が更新されました。上書きせずに停止しました。');
    return expected;
  }
  function adopt(raw) {
    idle();
    if (raw !== null && typeof raw !== 'string') throw new TypeError('raw must be a string or null.');
    if (rawStored() !== raw) throw failure('STORAGE_CONFLICT', '別のタブで保存内容が更新されました。最新のデータを読み直してください。');
    expected = raw; loaded = true; return expected;
  }
  function limit(text, maximum) {
    if (typeof text !== 'string') throw failure('SAVE_INVALID', '保存するデータの形式を確認してください。');
    if (text.length > maximum) throw failure('STORAGE_LIMIT', '保存データが大きすぎます。ブックを分けてバックアップしてください。');
    // Count UTF-8 without first allocating another potentially large buffer.
    let bytes = 0;
    for (let i = 0; i < text.length; i++) {
      const value = text.charCodeAt(i);
      if (value < 0x80) bytes++;
      else if (value < 0x800) bytes += 2;
      else if (value >= 0xd800 && value <= 0xdbff && i + 1 < text.length && text.charCodeAt(i + 1) >= 0xdc00 && text.charCodeAt(i + 1) <= 0xdfff) { bytes += 4; i++; }
      else bytes += 3;
      if (bytes > maximum) throw failure('STORAGE_LIMIT', '保存データが大きすぎます。ブックを分けてバックアップしてください。');
    }
  }
  function validateNow(validate) {
    if (validate === undefined) return;
    if (typeof validate !== 'function') throw new TypeError('validate must be a function.');
    const valid = validate();
    if (valid && typeof valid.then === 'function') throw new TypeError('validate must be synchronous.');
    if (valid === false) throw failure('SAVE_CANCELLED', '保存中に状態が変わったため、上書きせずに中止しました。');
  }
  function put(serialized) {
    // No await or user callback between this comparison and setItem.
    check();
    try { storage.setItem(key, serialized); }
    catch { throw failure('STORAGE_ERROR', 'ブラウザに保存できません。以前の保存データを保護しています。ファイルにバックアップしてください。'); }
    expected = serialized; return { serialized };
  }
  function writePlain(text, { validate } = {}) {
    idle(); limit(text, maxPlainBytes); check(); validateNow(validate); return put(text);
  }
  function writeEncrypted(text, encode, { validate } = {}) {
    try {
      limit(text, maxPlainBytes);
      if (typeof encode !== 'function') throw new TypeError('encode must be a function.');
      if (validate !== undefined && typeof validate !== 'function') throw new TypeError('validate must be a function.');
      load();
    } catch (error) { return Promise.reject(error); }
    queued++;
    const work = tail.then(async () => {
      check(); validateNow(validate);
      const serialized = await encode(text);
      limit(serialized, maxEncodedBytes);
      const commit = () => { validateNow(validate); return put(serialized); };
      if (!locks) return commit();
      let outcome;
      try {
        outcome = await locks.request(lockName, { mode: 'exclusive' }, () => {
          try { return { value: commit() }; } catch (error) { return { error }; }
        });
      } catch { throw failure('STORAGE_LOCK_FAILED', 'タブ間の保存を調整できませんでした。ほかのタブを閉じてから再試行してください。'); }
      if (Object.prototype.hasOwnProperty.call(outcome, 'error')) throw outcome.error;
      return outcome.value;
    });
    const completed = work.finally(() => { queued--; });
    tail = completed.catch(() => {});
    return completed;
  }
  return Object.freeze({ load, adopt, check, writePlain, writeEncrypted, pending: () => queued, drain: () => tail, baseline: () => loaded ? expected : undefined });
}
