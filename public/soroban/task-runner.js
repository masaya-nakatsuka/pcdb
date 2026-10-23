/* One disposable Worker per job. This module never falls back to blocking UI work. */
export const TASK_LIMITS = Object.freeze({ inputBytes: 48 * 1024 * 1024, inputObjects: 500000, timeoutMs: 10000, calculationTimeoutMs: 3000 });
const TASK_TYPES = new Set(['import-xlsx', 'export-xlsx', 'calculate-book', 'parse-delimited', 'import-json', 'parse-json']);
function taskFailure(code, message) { return Object.assign(new Error(message), { code }); }
function utf8Size(value) {
  let bytes = 0;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 0x80) bytes++;
    else if (code < 0x800) bytes += 2;
    else if (code >= 0xd800 && code <= 0xdbff && value.charCodeAt(i + 1) >= 0xdc00 && value.charCodeAt(i + 1) <= 0xdfff) { bytes += 4; i++; }
    else bytes += 3;
  }
  return bytes;
}
function validateTaskInput(payload) {
  const pending = [payload], seen = new WeakSet(); let bytes = 0, objects = 0;
  while (pending.length) {
    const value = pending.pop();
    if (typeof value === 'string') bytes += utf8Size(value) + 2;
    else if (value == null || typeof value === 'boolean' || typeof value === 'number' && Number.isFinite(value)) bytes += 16;
    else if (value instanceof ArrayBuffer || value instanceof Uint8Array) bytes += value.byteLength;
    else if (typeof value === 'object' && (Array.isArray(value) || Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)) {
      if (seen.has(value)) continue;
      seen.add(value); objects++;
      if (objects > TASK_LIMITS.inputObjects) throw taskFailure('LIMIT_EXCEEDED', '処理するデータが多すぎます。ブックを分けてください。');
      for (const key of Object.keys(value)) {
        bytes += utf8Size(key) + 8;
        pending.push(value[key]);
        if (pending.length > TASK_LIMITS.inputObjects || bytes > TASK_LIMITS.inputBytes) throw taskFailure('LIMIT_EXCEEDED', '処理するデータが大きすぎます。ブックを分けてください。');
      }
    } else throw taskFailure('INVALID_INPUT', '処理するデータの形式を確認してください。');
    if (bytes > TASK_LIMITS.inputBytes) throw taskFailure('LIMIT_EXCEEDED', '処理するデータが大きすぎます。ブックを分けてください。');
  }
}

/** workerSource is the fully bundled trusted Worker source for offline HTML. */
export function createTaskRunner({ workerURL = new URL('./task-worker.js', import.meta.url), workerSource = null, timeoutMs = TASK_LIMITS.timeoutMs } = {}, env = globalThis) {
  let current = null, nextId = 0, disposed = false;
  const later = env.setTimeout.bind(env), clear = env.clearTimeout.bind(env);
  function cancel() { current?.finish(taskFailure('TASK_CANCELLED', '処理を中止しました。元の表は変更されていません。')); }
  function run(type, payload, options = {}) {
    if (disposed) return Promise.reject(taskFailure('WORKER_UNAVAILABLE', '処理を開始できません。ページを開き直してください。'));
    if (!TASK_TYPES.has(type)) return Promise.reject(taskFailure('INVALID_INPUT', '対応していない処理です。'));
    if (options.signal?.aborted) return Promise.reject(taskFailure('TASK_CANCELLED', '処理を中止しました。'));
    try { validateTaskInput(payload); } catch (error) { return Promise.reject(error); }
    if (typeof env.Worker !== 'function') return Promise.reject(taskFailure('WORKER_UNAVAILABLE', 'このブラウザでは安全に処理を実行できません。対応ブラウザで開いてください。'));
    const requestedTimeout = options.timeoutMs ?? (type === 'calculate-book' ? TASK_LIMITS.calculationTimeoutMs : timeoutMs);
    if (!Number.isFinite(requestedTimeout) || requestedTimeout <= 0) return Promise.reject(taskFailure('INVALID_INPUT', '処理時間の設定が不正です。'));
    const duration = Math.min(requestedTimeout, TASK_LIMITS.timeoutMs);
    cancel();
    return new Promise((resolve, reject) => {
      let worker = null, objectURL = null, timer = null, settled = false;
      const id = ++nextId;
      const aborted = () => finish(taskFailure('TASK_CANCELLED', '処理を中止しました。元の表は変更されていません。'));
      function finish(error, result) {
        if (settled) return;
        settled = true; if (timer !== null) clear(timer);
        options.signal?.removeEventListener('abort', aborted);
        if (worker) { worker.onmessage = worker.onerror = worker.onmessageerror = null; worker.terminate(); }
        if (objectURL) env.URL.revokeObjectURL(objectURL);
        if (current?.id === id) current = null;
        if (error) reject(error); else resolve(result);
      }
      current = { id, finish };
      try {
        if (workerSource !== null) {
          if (typeof workerSource !== 'string' || !workerSource) throw new TypeError('Invalid Worker source.');
          objectURL = env.URL.createObjectURL(new env.Blob([workerSource], { type: 'text/javascript' }));
        }
        worker = new env.Worker(objectURL || workerURL, { type: 'module', name: 'soroban-' + type });
        worker.onmessage = event => {
          const message = event.data;
          if (settled || current?.id !== id || !message || message.id !== id) return;
          if (message.ok === true) finish(null, message.result);
          else finish(taskFailure(typeof message.error?.code === 'string' ? message.error.code : 'TASK_FAILED', typeof message.error?.message === 'string' ? message.error.message : '処理を完了できませんでした。元の表は変更されていません。'));
        };
        worker.onerror = event => { event.preventDefault?.(); finish(taskFailure('TASK_FAILED', '処理を完了できませんでした。元の表は変更されていません。')); };
        worker.onmessageerror = () => finish(taskFailure('TASK_FAILED', '処理結果を読み取れませんでした。元の表は変更されていません。'));
        timer = later(() => finish(taskFailure('TASK_TIMEOUT', '処理時間の上限に達したため中止しました。元の表は変更されていません。データを分けて再試行してください。')), duration);
        options.signal?.addEventListener('abort', aborted, { once: true });
        if (options.signal?.aborted) { aborted(); return; }
        // No transfer here: cancellation must not detach a caller-owned input.
        worker.postMessage({ id, type, payload });
      } catch {
        finish(taskFailure('WORKER_UNAVAILABLE', '処理を開始できませんでした。ブラウザの対応状況と設定を確認してください。'));
      }
    });
  }
  return Object.freeze({ run, cancel, dispose() { disposed = true; cancel(); }, get pending() { return current !== null; } });
}
