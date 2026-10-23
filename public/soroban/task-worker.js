import { parseDelimited } from './engine.js';
import { calculateWorkbook } from './calc-worker-core.js';
import { importXlsx, exportXlsx, MAX_XLSX_BYTES } from './xlsx-io.js';
import { isVaultEnvelope, parseVaultEnvelope, MAX_VAULT_ENVELOPE_BYTES } from './vault.js';

function jobFailure(code, message) { return Object.assign(new Error(message), { code }); }
const MAX_JSON_INPUT_BYTES = 32 * 1024 * 1024;
function boundedText(text, maximum) {
  if (typeof text !== 'string') throw jobFailure('INVALID_INPUT', '読み込む文字列の形式を確認してください。');
  if (text.length > maximum || new TextEncoder().encode(text).byteLength > maximum) throw jobFailure('LIMIT_EXCEEDED', 'ファイルが大きすぎます。データを分けてください。');
  return text;
}
function checkJsonGraph(data) {
  const pending = [{ value: data, depth: 0 }]; let objects = 0, properties = 0, bytes = 0;
  while (pending.length) {
    const { value, depth } = pending.pop();
    if (depth > 64) throw jobFailure('LIMIT_EXCEEDED', 'JSONの階層が深すぎます。そろばんで書き出したファイルを選んでください。');
    if (typeof value === 'string') bytes += value.length * 2 + 32;
    else if (value && typeof value === 'object') {
      objects++; bytes += 64;
      for (const key of Object.keys(value)) {
        if (['__proto__', 'constructor', 'prototype'].includes(key)) throw jobFailure('INVALID_INPUT', 'JSONに使用できない項目名があります。そろばんで書き出したファイルを選んでください。');
        properties++; bytes += key.length * 2 + 16;
        if (properties > 1000000 || pending.length >= 500000) throw jobFailure('LIMIT_EXCEEDED', 'JSONの項目が多すぎます。ブックを分けてください。');
        pending.push({ value: value[key], depth: depth + 1 });
      }
    } else bytes += 16;
    if (objects > 500000 || bytes > 64 * 1024 * 1024) throw jobFailure('LIMIT_EXCEEDED', 'JSONのデータ量が多すぎます。ブックを分けてください。');
  }
}
function preflightJson(text) {
  let quoted = false, escaped = false, depth = 0, containers = 0, separators = 0;
  for (const char of text) {
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === '{' || char === '[') {
      depth++; containers++;
      if (depth > 64 || containers > 500000) throw jobFailure('LIMIT_EXCEEDED', 'JSONの階層または項目が多すぎます。ブックを分けてください。');
    } else if (char === '}' || char === ']') depth--;
    else if (char === ',' || char === ':') {
      if (++separators > 2000000) throw jobFailure('LIMIT_EXCEEDED', 'JSONの項目が多すぎます。ブックを分けてください。');
    }
  }
}
function parseJsonText(text) {
  preflightJson(text);
  try { return JSON.parse(text.replace(/^\uFEFF/, '')); }
  catch { throw jobFailure('INVALID_JSON', 'JSONファイルを読み込めませんでした。形式を確認してください。'); }
}
export async function executeTask(type, payload) {
  if (type === 'calculate-book') return calculateWorkbook(payload?.book, payload?.sheetId);
  if (type === 'parse-delimited') {
    const text = boundedText(payload?.text, 5 * 1024 * 1024), options = {};
    for (const [key, maximum] of Object.entries({ maxRows: 500, maxColumns: 52, maxCellLength: 8192 })) {
      const requested = payload?.options?.[key] ?? maximum;
      if (!Number.isSafeInteger(requested) || requested < 1) throw jobFailure('INVALID_INPUT', '読み込み上限の設定を確認してください。');
      options[key] = Math.min(requested, maximum);
    }
    return { rows: parseDelimited(text, payload?.delimiter, options) };
  }
  if (type === 'import-json') {
    const text = boundedText(payload?.text, MAX_VAULT_ENVELOPE_BYTES), data = parseJsonText(text);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw jobFailure('INVALID_INPUT', 'バックアップファイルの形式を確認してください。');
    // The larger input allowance is only for a strictly validated encryption
    // envelope. A marker alone cannot bypass the ordinary JSON budget. The
    // envelope has exactly three records and bounded base64 strings, so its
    // stricter schema replaces the generic object-graph memory estimate.
    if (isVaultEnvelope(data)) return { encrypted: true, data: parseVaultEnvelope(data, { purpose: payload?.purpose }) };
    boundedText(text, MAX_JSON_INPUT_BYTES);
    checkJsonGraph(data);
    return { encrypted: false, data };
  }
  if (type === 'parse-json') {
    const data = parseJsonText(boundedText(payload?.text, MAX_JSON_INPUT_BYTES));
    checkJsonGraph(data);
    return { data };
  }
  if (type === 'import-xlsx') {
    const bytes = payload?.bytes;
    if (!(bytes instanceof ArrayBuffer) && !(bytes instanceof Uint8Array)) throw jobFailure('INVALID_INPUT', 'Excel ファイルの形式を確認してください。');
    if (bytes.byteLength > MAX_XLSX_BYTES) throw jobFailure('FILE_TOO_LARGE', 'Excel ファイルは32MB以下にしてください。');
    return importXlsx(bytes, payload.options || {});
  }
  if (type === 'export-xlsx') return exportXlsx(payload?.book);
  throw jobFailure('INVALID_INPUT', '対応していない処理です。');
}

if (typeof self !== 'undefined' && typeof document === 'undefined' && typeof self.addEventListener === 'function') {
  let running = false;
  self.addEventListener('message', async event => {
    const message = event.data;
    if (running || !message || !Number.isSafeInteger(message.id) || message.id < 1) return;
    running = true;
    try {
      const result = await executeTask(message.type, message.payload);
      const transfers = result?.data instanceof Uint8Array ? [result.data.buffer] : [];
      self.postMessage({ id: message.id, ok: true, result }, transfers);
    } catch (error) {
      self.postMessage({ id: message.id, ok: false, error: { code: typeof error?.code === 'string' ? error.code : 'TASK_FAILED', message: typeof error?.message === 'string' ? error.message : '処理を完了できませんでした。' } });
    }
  });
}
