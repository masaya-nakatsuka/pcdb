import { evaluateCellResult, createEvaluationCache, getEvaluationStatus, parseRef } from './engine.js';

function calculationFailure(code, message) { return Object.assign(new Error(message), { code }); }
const MAX_CALCULATION_RESPONSE = 16 * 1024 * 1024;

// Both worker entry points share validation, one cache budget, and output bounds.
export function calculateWorkbook(book, requestedSheetId) {
  if (!book || !Array.isArray(book.sheets) || !book.sheets.length || book.sheets.length > 15) throw calculationFailure('INVALID_INPUT', 'ブックの形式を確認してください。');
  const sheetId = requestedSheetId ?? book.activeSheet, sheet = book.sheets.find(item => item.id === sheetId);
  if (!sheet || !sheet.cells || typeof sheet.cells !== 'object' || Array.isArray(sheet.cells)) throw calculationFailure('INVALID_INPUT', '計算するシートが見つかりません。');
  const cache = createEvaluationCache(), cells = Object.create(null); let responseBytes = 0;
  for (const [address, entry] of Object.entries(sheet.cells)) {
    const ref = parseRef(address);
    if (!ref || ref.r >= 500 || ref.c >= 52 || !entry || typeof entry.raw !== 'string' || entry.raw.length > 8192) throw calculationFailure('INVALID_INPUT', 'セルの形式または上限を確認してください。');
    if (!/^\s*[=＝]/.test(entry.raw)) continue;
    const result = evaluateCellResult(address, sheet.cells, cache, undefined, { sheetId: sheet.id, sheets: book.sheets });
    // Count without producing an extra giant JSON string. UTF-16 * 3 bounds UTF-8.
    responseBytes += 128 + (typeof result.value === 'string' ? result.value.length * 3 : 16);
    if (responseBytes > MAX_CALCULATION_RESPONSE) throw calculationFailure('LIMIT_EXCEEDED', '計算結果が大きすぎます。表を分けてください。');
    cells[address] = result;
  }
  return { book_id: book.id, revision: book.revision ?? 0, sheet_id: sheet.id, cells, calculation: getEvaluationStatus(cache) };
}
