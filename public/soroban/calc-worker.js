import { calculateWorkbook } from './calc-worker-core.js';

export function executeCalculationTask(type, payload) {
  if (type !== 'calculate-book') throw Object.assign(new Error('対応していない処理です。'), { code: 'INVALID_INPUT' });
  return calculateWorkbook(payload?.book, payload?.sheetId);
}

if (typeof self !== 'undefined' && typeof document === 'undefined' && typeof self.addEventListener === 'function') {
  let running = false;
  self.addEventListener('message', event => {
    const message = event.data;
    if (running || !message || !Number.isSafeInteger(message.id) || message.id < 1) return;
    running = true;
    try {
      const result = executeCalculationTask(message.type, message.payload);
      self.postMessage({ id: message.id, ok: true, result });
    } catch (error) {
      self.postMessage({ id: message.id, ok: false, error: { code: typeof error?.code === 'string' ? error.code : 'TASK_FAILED', message: typeof error?.message === 'string' ? error.message : '処理を完了できませんでした。' } });
    }
  });
}
