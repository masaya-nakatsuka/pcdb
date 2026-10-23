import { colName, evaluateCellResult, transformFormulaForMove } from './engine.js';
import { SHEET_LIMITS, SheetOperationError, parseSheetRange, visibleRows } from './sheet-ops.js';
import { reconcileTablesAfterWrite } from './table-ops.js';

// Cutting is a single workbook change. The UI keeps the original cells until a
// successful paste, then commits this result once so undo restores the move.
const clipClone = value => JSON.parse(JSON.stringify(value));
const clipKey = (row, column) => colName(column) + (row + 1);
const clipOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
function clipFail(code, message, details) { throw new SheetOperationError(code, message, details); }
function clipSheet(book, id) {
  if (typeof id !== 'string' || !id) clipFail('INVALID_INPUT', '切り取り元と貼り付け先のシートIDを指定してください。');
  const matches = book.sheets.filter(sheet => sheet.id === id);
  if (matches.length !== 1) clipFail('SHEET_NOT_FOUND', '切り取り元または貼り付け先のシートが見つかりません。');
  return matches[0];
}
function clipCheckVisible(book, sheet, area) {
  if (!sheet.filter?.criteria?.length && !sheet.tables?.some(table => table.criteria?.length)) return;
  const cache = new Map(), context = { sheetId: sheet.id, sheets: book.sheets };
  const rows = new Set(visibleRows(sheet, (row, column) => {
    const result = evaluateCellResult(clipKey(row, column), sheet.cells, cache, undefined, context);
    if (result.error === '#LIMIT!') clipFail('LIMIT_EXCEEDED', '表示行の計算が上限に達しました。フィルターを解除するか、数式の参照範囲を小さくしてから移動してください。');
    if (result.error === '#SCOPE!') clipFail('SCOPE_DENIED', '表示行の確認に必要なセルが許可範囲外です。');
    return result.value;
  }));
  for (let row = area.r1; row <= Math.min(area.r2, sheet.rows - 1); row++) {
    if (!rows.has(row)) clipFail('HIDDEN_ROWS', '切り取り元と貼り付け先のフィルターを解除してから移動してください。');
  }
}
function clipCheckTableHeaders(sheet, area) {
  for (const table of sheet.tables || []) {
    const bounds = parseSheetRange(table.range);
    if (bounds.r1 >= area.r1 && bounds.r1 <= area.r2 && bounds.c1 <= area.c2 && bounds.c2 >= area.c1) {
      clipFail('TABLE_HEADER_MOVE', 'テーブルの見出しを含む範囲は移動できません。先に「テーブル → 通常の範囲に戻す」を選ぶか、本文だけを選択してください。', { sheet_id: sheet.id, table_id: table.id });
    }
  }
}

/**
 * Move a rectangular range within one workbook without mutating it. `target`
 * is the destination's top-left cell. Revision, persistence and history are
 * owned by the caller. A failure returns no partially changed workbook.
 */
export function moveWorkbookRange(book, options = {}) {
  if (!book || !Array.isArray(book.sheets) || !options || typeof options !== 'object' || Array.isArray(options)) clipFail('INVALID_INPUT', 'ブックと切り取り範囲を指定してください。');
  const { source_sheet_id, target_sheet_id, source: sourceText, target: targetText, expected_revision } = options;
  if (expected_revision !== undefined) {
    if (!Number.isSafeInteger(expected_revision) || expected_revision < 0) clipFail('INVALID_INPUT', 'expected_revision は0以上の整数で指定してください。');
    if ((book.revision || 0) !== expected_revision) clipFail('REVISION_CONFLICT', '切り取り後に表が更新されています。もう一度切り取ってください。');
  }
  const sourceSheet = clipSheet(book, source_sheet_id), targetSheet = clipSheet(book, target_sheet_id);
  const source = parseSheetRange(sourceText), start = parseSheetRange(targetText);
  if (source.r2 >= sourceSheet.rows || source.c2 >= sourceSheet.cols) clipFail('INVALID_RANGE', '現在のシート内で切り取り範囲を指定してください。');
  if (start.rows !== 1 || start.columns !== 1) clipFail('INVALID_RANGE', '貼り付け先は左上の1セルを指定してください。');
  const lastRow = start.r1 + source.rows - 1, lastColumn = start.c1 + source.columns - 1;
  if (lastRow >= SHEET_LIMITS.rows || lastColumn >= SHEET_LIMITS.columns) clipFail('LIMIT_EXCEEDED', '貼り付け範囲が500行 × 52列を超えています。');
  const target = parseSheetRange(clipKey(start.r1, start.c1) + ':' + clipKey(lastRow, lastColumn));
  if (source_sheet_id === target_sheet_id && source.r1 === target.r1 && source.c1 === target.c1) {
    return { book: clipClone(book), changed: false, source, target, summary: { changed_cells: 0, changed_sheet_ids: [] } };
  }
  clipCheckTableHeaders(sourceSheet, source);
  clipCheckTableHeaders(targetSheet, target);
  clipCheckVisible(book, sourceSheet, source);
  clipCheckVisible(book, targetSheet, target);

  const next = clipClone(book), nextSource = clipSheet(next, source_sheet_id), nextTarget = clipSheet(next, target_sheet_id);
  const entries = [];
  for (let row = source.r1; row <= source.r2; row++) for (let column = source.c1; column <= source.c2; column++) {
    const address = clipKey(row, column);
    if (clipOwn(nextSource.cells, address)) entries.push({ row: row - source.r1, column: column - source.c1, entry: nextSource.cells[address] });
    delete nextSource.cells[address];
  }
  // Clear the destination before placing the snapshot, including source blanks.
  // This is safe for overlapping ranges in either direction.
  const targetAddresses = [];
  for (let row = target.r1; row <= target.r2; row++) for (let column = target.c1; column <= target.c2; column++) {
    const address = clipKey(row, column);
    targetAddresses.push(address);
    delete nextTarget.cells[address];
  }
  const movedAddresses = new Set();
  for (const { row, column, entry } of entries) {
    const address = clipKey(target.r1 + row, target.c1 + column);
    nextTarget.cells[address] = entry;
    movedAddresses.add(address);
  }
  nextTarget.rows = Math.max(nextTarget.rows, target.r2 + 1);
  if (target.c2 >= nextTarget.cols) {
    nextTarget.cols = target.c2 + 1;
    nextTarget.widths = Array.from({ length: nextTarget.cols }, (_, column) => nextTarget.widths?.[column] || 108);
  }

  // References follow the moved cells even when they are absolute references.
  // A moved formula retains references to cells outside the source rectangle.
  for (const current of next.sheets) for (const [address, entry] of Object.entries(current.cells)) {
    if (typeof entry.raw !== 'string' || !/^\s*[=＝]/.test(entry.raw)) continue;
    const wasMoved = current.id === target_sheet_id && movedAddresses.has(address);
    try {
      entry.raw = transformFormulaForMove(entry.raw, {
        formulaSheetName: wasMoved ? sourceSheet.name : current.name,
        resultingFormulaSheetName: current.name,
        sourceSheetName: sourceSheet.name,
        targetSheetName: targetSheet.name,
        source,
        target
      });
    } catch (error) {
      clipFail(error.code || 'UNSUPPORTED_REFERENCE', current.name + '!' + address + ' の数式を安全に移動できません。' + error.message, { sheet_id: current.id, address });
    }
    if (entry.raw.length > SHEET_LIMITS.cell_characters) clipFail('LIMIT_EXCEEDED', '参照の更新で数式が8,192文字を超えるため、移動できません。', { sheet_id: current.id, address });
  }

  // Appending moved body cells follows the same table expansion rules as typing
  // and pasting. Metadata and cells are committed together by the caller.
  // Empty source cells are explicit pasted values too, even when the sparse
  // cell map has no entry. A table must not replace those blanks with formulas.
  reconcileTablesAfterWrite(targetSheet, nextTarget, targetAddresses);

  let changedCells = 0;
  const changedSheets = [];
  for (const before of book.sheets) {
    const after = clipSheet(next, before.id);
    if (JSON.stringify(before) !== JSON.stringify(after)) changedSheets.push(before.id);
    for (const address of new Set([...Object.keys(before.cells), ...Object.keys(after.cells)])) {
      if (JSON.stringify(before.cells[address] || { raw: '' }) !== JSON.stringify(after.cells[address] || { raw: '' })) changedCells++;
    }
  }
  return { book: next, changed: changedSheets.length > 0, source, target, summary: { changed_cells: changedCells, changed_sheet_ids: changedSheets } };
}
