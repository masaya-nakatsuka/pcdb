import { colName, parseRef, numericValue, evaluateCellResult, shiftFormula, transformFormulaReferences } from './engine.js';
import { TABLE_OPERATION_TYPES, applyTableOperation, normalizeTables, reconcileTablesAfterWrite, transformTablesForStructure } from './table-ops.js';

/** Pure workbook operations shared by the UI and the agent API. No storage or history. */
export const SHEET_LIMITS = Object.freeze({ rows: 500, columns: 52, cell_characters: 8192 });
export const FILTER_OPERATORS = Object.freeze(['in', 'equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'gt', 'gte', 'lt', 'lte', 'blank', 'not_blank']);
export const SHEET_OPERATION_TYPES = Object.freeze(['insert_rows', 'delete_rows', 'insert_columns', 'delete_columns', 'autofill', 'set_freeze', 'set_filter', 'clear_filter', 'sort_table', ...TABLE_OPERATION_TYPES]);

export class SheetOperationError extends Error {
  constructor(code, message, details) { super(message); this.code = code; if (details !== undefined) this.details = details; }
}
const opsClone = value => JSON.parse(JSON.stringify(value));
const opsKey = (row, column) => colName(column) + (row + 1);
const opsOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const opsFail = (code, message, details) => { throw new SheetOperationError(code, message, details); };
function opsObject(value, keys, name = 'operation') {
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) opsFail('INVALID_INPUT', name + ' は通常のオブジェクトで指定してください。');
  for (const key of Object.keys(value)) if (!keys.includes(key) || ['__proto__', 'constructor', 'prototype'].includes(key)) opsFail('INVALID_INPUT', name + ' に未対応の項目があります: ' + key);
}
function opsInteger(value, name, min, max) {
  if (!Number.isSafeInteger(value) || value < min || value > max) opsFail('INVALID_INPUT', name + ' は ' + min + '〜' + max + ' の整数で指定してください。');
  return value;
}
function opsScalar(value, name) {
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.length <= SHEET_LIMITS.cell_characters) return value;
  opsFail('INVALID_FILTER', name + ' は数値・真偽値・空白、または8,192文字以内の文字列で指定してください。');
}
export function parseSheetRange(value) {
  if (typeof value !== 'string' || value.length > 30 || !/^\$?[A-Z]{1,2}\$?[1-9]\d{0,2}(?::\$?[A-Z]{1,2}\$?[1-9]\d{0,2})?$/i.test(value.trim())) opsFail('INVALID_RANGE', 'A1:AZ500 の中で、左上から右下への範囲を指定してください。');
  const parts = value.trim().split(':'), first = parseRef(parts[0]), last = parseRef(parts[1] || parts[0]);
  if (!first || !last || first.r > last.r || first.c > last.c || last.r >= SHEET_LIMITS.rows || last.c >= SHEET_LIMITS.columns) opsFail('INVALID_RANGE', 'A1:AZ500 の中で、左上から右下への範囲を指定してください。');
  return { r1: first.r, c1: first.c, r2: last.r, c2: last.c, rows: last.r - first.r + 1, columns: last.c - first.c + 1, canonical: opsRangeText(first.r, first.c, last.r, last.c) };
}
function opsRangeText(r1, c1, r2, c2) { const first = opsKey(r1, c1), last = opsKey(r2, c2); return first === last ? first : first + ':' + last; }
function opsSheet(book, id) {
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,160}$/.test(id)) opsFail('INVALID_INPUT', 'シートIDの形式を確認してください。');
  const sheet = book.sheets.find(item => item.id === id);
  if (!sheet) opsFail('SHEET_NOT_FOUND', '指定されたシートがブック内に見つかりません。');
  return sheet;
}
function opsWidths(sheet) { sheet.widths = Array.from({ length: sheet.cols }, (_, index) => sheet.widths?.[index] || 108); }
function opsChangedCells(before, after) {
  let count = 0;
  for (const oldSheet of before.sheets) {
    const next = after.sheets.find(sheet => sheet.id === oldSheet.id);
    for (const address of new Set([...Object.keys(oldSheet.cells), ...Object.keys(next.cells)])) {
      if (JSON.stringify(oldSheet.cells[address] || { raw: '' }) !== JSON.stringify(next.cells[address] || { raw: '' })) count++;
    }
  }
  return count;
}

/** Validates and normalizes persisted filter metadata. Columns use absolute zero-based indexes. */
export function normalizeFilter(sheet, input) {
  if (input === null || input === undefined) return null;
  opsObject(input, ['range', 'criteria'], 'filter');
  const area = parseSheetRange(input.range);
  if (area.r2 >= sheet.rows || area.c2 >= sheet.cols) opsFail('INVALID_RANGE', '現在のシート内でフィルター範囲を指定してください。');
  if (!Array.isArray(input.criteria) || input.criteria.length > SHEET_LIMITS.columns) opsFail('INVALID_FILTER', 'フィルター条件は52件以内で指定してください。');
  const criteria = Array.from(input.criteria, criterion => {
    opsObject(criterion, ['column', 'operator', 'value', 'values'], 'filter criterion');
    const column = opsInteger(criterion.column, 'column', area.c1, area.c2), operator = criterion.operator;
    if (!FILTER_OPERATORS.includes(operator)) opsFail('INVALID_FILTER', 'このフィルター条件には対応していません。');
    if (operator === 'in') {
      if (opsOwn(criterion, 'value') || !Array.isArray(criterion.values) || criterion.values.length > SHEET_LIMITS.rows) opsFail('INVALID_FILTER', '値の選択には500件以内の values 配列を指定し、value は省略してください。');
      return { column, operator, values: Array.from(criterion.values, value => opsScalar(value, 'values item')) };
    }
    if (['blank', 'not_blank'].includes(operator)) {
      if (opsOwn(criterion, 'value') || opsOwn(criterion, 'values')) opsFail('INVALID_FILTER', '空白の判定では value / values を省略してください。');
      return { column, operator };
    }
    if (!opsOwn(criterion, 'value') || opsOwn(criterion, 'values')) opsFail('INVALID_FILTER', 'この条件では比較する値を value に1つ指定してください。');
    const value = opsScalar(criterion.value, 'value');
    if (['gt', 'gte', 'lt', 'lte'].includes(operator) && numericValue(value) === null) opsFail('INVALID_FILTER', '大小の比較には数値を指定してください。');
    return { column, operator, value };
  });
  return { range: area.canonical, criteria };
}

/** Value-list membership is case-sensitive; text conditions are case-insensitive. */
export function matchesFilter(value, criterion) {
  const actual = String(value ?? ''), expected = String(criterion?.value ?? '');
  const left = actual.toLocaleLowerCase(), right = expected.toLocaleLowerCase();
  switch (criterion?.operator) {
    case 'in': return Array.isArray(criterion.values) && criterion.values.some(item => String(item ?? '') === actual);
    case 'equals': return left === right;
    case 'not_equals': return left !== right;
    case 'contains': return left.includes(right);
    case 'not_contains': return !left.includes(right);
    case 'starts_with': return left.startsWith(right);
    case 'ends_with': return left.endsWith(right);
    case 'blank': return actual === '';
    case 'not_blank': return actual !== '';
    case 'gt': case 'gte': case 'lt': case 'lte': {
      const a = numericValue(value), b = numericValue(criterion.value);
      if (a === null || b === null) return false;
      return criterion.operator === 'gt' ? a > b : criterion.operator === 'gte' ? a >= b : criterion.operator === 'lt' ? a < b : a <= b;
    }
    default: return false;
  }
}
function opsFilters(sheet) {
  const filters = [];
  for (const filter of [sheet.filter, ...(sheet.tables || [])]) {
    if (!filter || !Array.isArray(filter.criteria)) continue;
    try { filters.push({ area: parseSheetRange(filter.range), criteria: filter.criteria }); } catch {}
  }
  return filters;
}
function opsVisibleRow(row, getValue, filters) {
  if (filters.some(filter => row === filter.area.r1)) return true;
  return filters.every(({ area, criteria }) => row < area.r1 || row > area.r2 || criteria.every(criterion => matchesFilter(getValue(row, criterion.column), criterion)));
}
export function isRowVisible(sheet, rowIndex, getValue) {
  return opsVisibleRow(rowIndex, getValue, opsFilters(sheet));
}
export function visibleRows(sheet, getValue) {
  const filters = opsFilters(sheet);
  return Array.from({ length: sheet.rows }, (_, row) => row).filter(row => opsVisibleRow(row, getValue, filters));
}

function opsTransformInterval(start, end, index, count, action) {
  if (action === 'insert') return index <= start ? [start + count, end + count] : index <= end ? [start, end + count] : [start, end];
  const last = index + count - 1;
  if (end < index) return [start, end];
  if (start > last) return [start - count, end - count];
  if (start >= index && end <= last) return null;
  const nextStart = start < index ? start : index, nextEnd = end > last ? end - count : index - 1;
  return nextStart > nextEnd ? null : [nextStart, nextEnd];
}
function opsMoveMetadata(sheet, axis, index, count, action) {
  const frozenKey = axis === 'row' ? 'freezeRows' : 'freezeCols';
  let frozen = Number.isSafeInteger(sheet[frozenKey]) ? sheet[frozenKey] : 0;
  if (action === 'insert') { if (index < frozen) frozen += count; }
  else frozen -= Math.max(0, Math.min(frozen, index + count) - Math.min(frozen, index));
  if (opsOwn(sheet, frozenKey) || frozen) sheet[frozenKey] = Math.max(0, Math.min(frozen, axis === 'row' ? sheet.rows : sheet.cols));
  if (!sheet.filter) return;
  const area = parseSheetRange(sheet.filter.range);
  if (axis === 'row' && action === 'delete' && area.r1 >= index && area.r1 < index + count) { sheet.filter = null; return; }
  const next = opsTransformInterval(axis === 'row' ? area.r1 : area.c1, axis === 'row' ? area.r2 : area.c2, index, count, action);
  if (!next) { sheet.filter = null; return; }
  if (axis === 'row') [area.r1, area.r2] = next; else [area.c1, area.c2] = next;
  sheet.filter.range = opsRangeText(area.r1, area.c1, area.r2, area.c2);
  if (axis === 'col') sheet.filter.criteria = sheet.filter.criteria.flatMap(criterion => {
    if (action === 'delete' && criterion.column >= index && criterion.column < index + count) return [];
    if (criterion.column >= index) return [{ ...criterion, column: criterion.column + (action === 'insert' ? count : -count) }];
    return [criterion];
  });
}
function opsStructure(book, sheet, operation) {
  const axis = operation.type.endsWith('rows') ? 'row' : 'col', action = operation.type.startsWith('insert') ? 'insert' : 'delete';
  const dimension = axis === 'row' ? 'rows' : 'cols', oldSize = sheet[dimension], maximum = axis === 'row' ? SHEET_LIMITS.rows : SHEET_LIMITS.columns;
  const index = opsInteger(operation.index, 'index', 0, action === 'insert' ? oldSize : oldSize - 1);
  const count = opsInteger(operation.count, 'count', 1, maximum);
  if (action === 'insert' && oldSize + count > maximum) opsFail('LIMIT_EXCEEDED', '挿入すると上限の500行・52列を超えます。不要な行や列を整理してください。');
  if (action === 'delete' && (index + count > oldSize || oldSize - count < 1)) opsFail('INVALID_RANGE', 'シートの範囲内を削除し、少なくとも1行・1列を残してください。');
  const nextCells = {};
  for (const [address, entry] of Object.entries(sheet.cells)) {
    const ref = parseRef(address); if (!ref) opsFail('INVALID_INPUT', 'シートに不正なセル番地があります。');
    const coordinate = axis === 'row' ? ref.r : ref.c;
    if (action === 'delete' && coordinate >= index && coordinate < index + count) continue;
    const next = coordinate >= index ? coordinate + (action === 'insert' ? count : -count) : coordinate;
    nextCells[opsKey(axis === 'row' ? next : ref.r, axis === 'col' ? next : ref.c)] = entry;
  }
  sheet.cells = nextCells;
  if (axis === 'col') {
    opsWidths(sheet);
    if (action === 'insert') sheet.widths.splice(index, 0, ...Array(count).fill(108)); else sheet.widths.splice(index, count);
  }
  sheet[dimension] = oldSize + (action === 'insert' ? count : -count);
  transformTablesForStructure(sheet, axis, index, count, action);
  opsMoveMetadata(sheet, axis, index, count, action);
  for (const formulaSheet of book.sheets) for (const entry of Object.values(formulaSheet.cells)) {
    if (!/^\s*[=＝]/.test(entry.raw)) continue;
    entry.raw = transformFormulaReferences(entry.raw, { formulaSheetName: formulaSheet.name, targetSheetName: sheet.name, axis, index, count, action });
    if (entry.raw.length > SHEET_LIMITS.cell_characters) opsFail('LIMIT_EXCEEDED', '参照を更新すると1セルの上限8,192文字を超えます。');
  }
  return { axis, action, index, count, old_size: oldSize, new_size: sheet[dimension] };
}

const OPS_DAY = 86400000;
function opsDate(raw) {
  if (typeof raw !== 'string') return null;
  const match = raw.trim().match(/^(\d{4})([-/年])(\d{1,2})([-/月])(\d{1,2})(日?)$/);
  if (!match || !((match[2] === '-' && match[4] === '-' && !match[6]) || (match[2] === '/' && match[4] === '/' && !match[6]) || (match[2] === '年' && match[4] === '月' && match[6] === '日'))) return null;
  const year = Number(match[1]), month = Number(match[3]), day = Number(match[5]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(0); date.setUTCHours(0, 0, 0, 0); date.setUTCFullYear(year, month - 1, day);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { day: date.getTime() / OPS_DAY, separator: match[2], monthWidth: match[2] === '年' ? 1 : match[3].length, dayWidth: match[2] === '年' ? 1 : match[5].length };
}
function opsDateText(day, format) {
  const date = new Date(day * OPS_DAY), year = date.getUTCFullYear();
  if (!Number.isInteger(day) || year < 1 || year > 9999 || !Number.isFinite(date.getTime())) opsFail('INVALID_SERIES', '日付の連続データは西暦1年〜9999年の範囲で作成してください。');
  const month = String(date.getUTCMonth() + 1).padStart(format.monthWidth, '0'), value = String(date.getUTCDate()).padStart(format.dayWidth, '0');
  return String(year).padStart(4, '0') + format.separator + month + (format.separator === '年' ? '月' : format.separator) + value + (format.separator === '年' ? '日' : '');
}
function opsProgression(entries, mode) {
  if (mode === 'copy') return null;
  const dates = entries.map(entry => opsDate(entry.raw));
  const allDates = dates.every(Boolean), numbers = allDates ? dates.map(date => date.day) : entries.map(entry => numericValue(entry.raw));
  if (numbers.some(value => value === null)) return null;
  if (entries.length === 1 && mode === 'auto' && !allDates && entries[0].format !== 'date') return null;
  const step = entries.length > 1 ? numbers[1] - numbers[0] : 1;
  const exactIntegers = numbers.every(Number.isSafeInteger);
  if (!numbers.every((value, index) => {
    const offset = step * index, expected = numbers[0] + offset;
    if (value === expected) return true;
    // Integer differences are meaningful even for large IDs/amounts. For
    // decimal seeds, allow only the rounding noise of these arithmetic steps,
    // including cancellation near zero, not a percentage of the cell value.
    if (exactIntegers) return false;
    const tolerance = Number.EPSILON * Math.max(Math.abs(numbers[0]), Math.abs(offset), Math.abs(value), Math.abs(expected)) * 4;
    return Math.abs(value - expected) <= tolerance;
  })) {
    if (mode === 'series') opsFail('INVALID_SERIES', '連続データの元になる数値や日付を、一定の間隔で入力してください。');
    return null;
  }
  return { first: numbers[0], step, dates: allDates ? dates : null };
}
function opsAutofill(sheet, operation) {
  const source = parseSheetRange(operation.source), target = parseSheetRange(operation.target), mode = operation.mode === undefined ? 'auto' : operation.mode;
  if (!['auto', 'copy', 'series'].includes(mode)) opsFail('INVALID_INPUT', 'オートフィル方式は auto・copy・series のいずれかを指定してください。');
  if (source.r2 >= sheet.rows || source.c2 >= sheet.cols) opsFail('INVALID_RANGE', 'オートフィルの元の範囲は、現在のシート内で指定してください。');
  const sameColumns = source.c1 === target.c1 && source.c2 === target.c2, sameRows = source.r1 === target.r1 && source.r2 === target.r2;
  if (target.r1 > source.r1 || target.r2 < source.r2 || target.c1 > source.c1 || target.c2 < source.c2 || (!sameColumns && !sameRows) || (target.r1 < source.r1 && target.r2 > source.r2) || (target.c1 < source.c1 && target.c2 > source.c2)) opsFail('INVALID_RANGE', '元の範囲全体を含めて、上・下・左・右のいずれか1方向に広げてください。');
  if (sameRows && sameColumns) return { source: source.canonical, target: target.canonical, direction: null, mode, touched_cells: 0 };
  const vertical = sameColumns, direction = vertical ? (target.r1 < source.r1 ? 'up' : 'down') : (target.c1 < source.c1 ? 'left' : 'right');
  const first = vertical ? source.r1 : source.c1, last = vertical ? source.r2 : source.c2, length = last - first + 1;
  const laneFirst = vertical ? source.c1 : source.r1, laneLast = vertical ? source.c2 : source.r2;
  const extendFirst = vertical ? target.r1 : target.c1, extendLast = vertical ? target.r2 : target.c2;
  for (let lane = laneFirst; lane <= laneLast; lane++) {
    const seeds = Array.from({ length }, (_, index) => opsClone(sheet.cells[opsKey(vertical ? first + index : lane, vertical ? lane : first + index)] || { raw: '' }));
    const progression = opsProgression(seeds, mode);
    for (let coordinate = extendFirst; coordinate <= extendLast; coordinate++) {
      if (coordinate >= first && coordinate <= last) continue;
      const offset = coordinate - first, seedIndex = ((offset % length) + length) % length, seed = seeds[seedIndex], entry = opsClone(seed);
      const row = vertical ? coordinate : lane, column = vertical ? lane : coordinate;
      const seedRow = vertical ? first + seedIndex : lane, seedColumn = vertical ? lane : first + seedIndex;
      if (progression) {
        const value = progression.first + progression.step * offset;
        if (!Number.isFinite(value)) opsFail('INVALID_SERIES', '連続データの数値が計算できる範囲を超えています。');
        entry.raw = progression.dates ? opsDateText(value, progression.dates[seedIndex]) : String(Number.isInteger(value) ? value : Number(value.toPrecision(15)));
      } else entry.raw = shiftFormula(entry.raw, row - seedRow, column - seedColumn);
      if (entry.raw.length > SHEET_LIMITS.cell_characters) opsFail('LIMIT_EXCEEDED', 'オートフィル後のセルが上限8,192文字を超えます。');
      sheet.cells[opsKey(row, column)] = entry;
    }
  }
  sheet.rows = Math.max(sheet.rows, target.r2 + 1); sheet.cols = Math.max(sheet.cols, target.c2 + 1); opsWidths(sheet);
  return { source: source.canonical, target: target.canonical, direction, mode, touched_cells: target.rows * target.columns - source.rows * source.columns };
}

function opsSortTable(book, sheet, operation) {
  if (typeof operation.table_id !== 'string' || !/^[A-Za-z0-9_-]{1,160}$/.test(operation.table_id)) opsFail('INVALID_INPUT', 'テーブルIDの形式を確認してください。');
  const table = normalizeTables(sheet).find(item => item.id === operation.table_id);
  if (!table) opsFail('TABLE_NOT_FOUND', '並べ替えるテーブルが見つかりません。');
  const area = parseSheetRange(table.range);
  if (!Array.isArray(operation.keys) || !operation.keys.length || operation.keys.length > area.columns) opsFail('INVALID_SORT', '並べ替え条件は、テーブルの列数以内で1件以上指定してください。');
  const columns = new Set(), keys = Array.from(operation.keys, item => {
    opsObject(item, ['column', 'direction'], '並べ替え条件');
    const column = opsInteger(item.column, 'column', area.c1, area.c2);
    if (columns.has(column)) opsFail('INVALID_SORT', '同じ列を複数の並べ替え条件に指定できません。');
    if (!['asc', 'desc'].includes(item.direction)) opsFail('INVALID_SORT', '並べ替え順は asc（昇順）または desc（降順）で指定してください。');
    columns.add(column); return { column, direction: item.direction };
  });
  const details = { table_id: table.id, range: area.canonical, keys, moved_rows: 0, touched_cells: 0 };
  if (area.rows <= 2) return details;
  const cache = new Map(), context = { sheetId: sheet.id, sheets: book.sheets };
  // Resolve every key before moving any row; formulas can depend on other rows/sheets.
  const rows = Array.from({ length: area.r2 - area.r1 }, (_, index) => {
    const row = area.r1 + index + 1;
    return {
      row,
      values: keys.map(key => {
        const result = evaluateCellResult(opsKey(row, key.column), sheet.cells, cache, undefined, context);
        if (result.error === '#LIMIT!') opsFail('LIMIT_EXCEEDED', '並べ替えに必要な計算が上限に達しました。数式の参照範囲を小さくしてから再試行してください。');
        if (result.error === '#SCOPE!') opsFail('SCOPE_DENIED', '並べ替えに必要なセルが許可範囲外です。');
        return result.value;
      }),
      cells: Array.from({ length: area.columns }, (_, offset) => {
        const address = opsKey(row, area.c1 + offset);
        return opsOwn(sheet.cells, address) ? opsClone(sheet.cells[address]) : null;
      })
    };
  });
  const collator = new Intl.Collator('ja', { numeric: true });
  const rank = value => typeof value === 'number' ? 0 : typeof value === 'boolean' ? 2 : 1;
  rows.sort((left, right) => {
    for (let index = 0; index < keys.length; index++) {
      const a = left.values[index], b = right.values[index], blankA = a == null || a === '', blankB = b == null || b === '';
      if (blankA || blankB) { if (blankA !== blankB) return blankA ? 1 : -1; continue; }
      let comparison = rank(a) - rank(b);
      if (!comparison) comparison = typeof a === 'number' || typeof a === 'boolean' ? (a < b ? -1 : a > b ? 1 : 0) : collator.compare(String(a), String(b));
      if (comparison) return keys[index].direction === 'desc' ? -comparison : comparison;
    }
    return left.row - right.row;
  });
  details.moved_rows = rows.filter((item, index) => item.row !== area.r1 + index + 1).length;
  details.touched_cells = details.moved_rows * area.columns;
  if (!details.moved_rows) return details;
  const nextCells = { ...sheet.cells };
  for (const [index, item] of rows.entries()) {
    const destination = area.r1 + index + 1, delta = destination - item.row;
    if (!delta) continue;
    for (let offset = 0; offset < area.columns; offset++) {
      const address = opsKey(destination, area.c1 + offset), entry = item.cells[offset];
      if (entry === null) { delete nextCells[address]; continue; }
      entry.raw = shiftFormula(entry.raw, delta, 0);
      if (entry.raw.length > SHEET_LIMITS.cell_characters) opsFail('LIMIT_EXCEEDED', '並べ替えで数式の参照を更新すると1セルの上限8,192文字を超えます。');
      nextCells[address] = entry;
    }
  }
  sheet.cells = nextCells;
  return details;
}

/** Returns a new workbook; a caller can commit it as one undo step after validation. */
export function applySheetOperation(book, operation) {
  if (!book || !Array.isArray(book.sheets) || !book.sheets.length) opsFail('INVALID_INPUT', '操作するブックを指定してください。');
  if (!operation || !SHEET_OPERATION_TYPES.includes(operation.type)) opsFail('INVALID_OPERATION', 'このシート操作には対応していません。');
  const common = ['type', 'sheet_id'], extra = operation.type === 'autofill' ? ['source', 'target', 'mode'] : operation.type === 'set_freeze' ? ['rows', 'columns'] : operation.type === 'set_filter' ? ['range', 'criteria'] : operation.type === 'clear_filter' ? [] : operation.type === 'create_table' ? ['range', 'name'] : operation.type === 'resize_table' ? ['table_id', 'range'] : operation.type === 'set_table_filter' ? ['table_id', 'criteria'] : operation.type === 'sort_table' ? ['table_id', 'keys'] : TABLE_OPERATION_TYPES.includes(operation.type) ? ['table_id'] : ['index', 'count'];
  opsObject(operation, [...common, ...extra]);
  opsSheet(book, operation.sheet_id);
  const next = opsClone(book), sheet = opsSheet(next, operation.sheet_id);
  let details = {};
  if (['insert_rows', 'delete_rows', 'insert_columns', 'delete_columns'].includes(operation.type)) details = opsStructure(next, sheet, operation);
  else if (operation.type === 'autofill') {
    const beforeSheet = opsClone(sheet); details = opsAutofill(sheet, operation);
    const source = parseSheetRange(operation.source), target = parseSheetRange(operation.target), addresses = [];
    for (let row = target.r1; row <= target.r2; row++) for (let column = target.c1; column <= target.c2; column++) if (row < source.r1 || row > source.r2 || column < source.c1 || column > source.c2) addresses.push(opsKey(row, column));
    const tables = reconcileTablesAfterWrite(beforeSheet, sheet, addresses), explicit = new Set(addresses);
    details.touched_cells += tables.changed_cells.filter(address => !explicit.has(address)).length;
    if (tables.expanded_tables.length) details.expanded_tables = tables.expanded_tables;
    if (tables.blocked_expansions.length) details.blocked_expansions = tables.blocked_expansions;
  }
  else if (operation.type === 'sort_table') details = opsSortTable(next, sheet, operation);
  else if (TABLE_OPERATION_TYPES.includes(operation.type)) details = applyTableOperation(sheet, operation);
  else if (operation.type === 'set_freeze') {
    const rows = opsInteger(operation.rows, 'rows', 0, sheet.rows), columns = opsInteger(operation.columns, 'columns', 0, sheet.cols);
    if (rows !== (sheet.freezeRows || 0)) sheet.freezeRows = rows;
    if (columns !== (sheet.freezeCols || 0)) sheet.freezeCols = columns;
  }
  else if (operation.type === 'set_filter') {
    const filter = normalizeFilter(sheet, { range: operation.range, criteria: operation.criteria }), area = parseSheetRange(filter.range);
    if ((sheet.tables || []).some(table => { const other = parseSheetRange(table.range); return area.r1 <= other.r2 && area.r2 >= other.r1 && area.c1 <= other.c2 && area.c2 >= other.c1; })) opsFail('TABLE_FILTER_OVERLAP', 'テーブルと重なる範囲です。テーブルの見出しからフィルターを使用してください。');
    sheet.filter = filter;
  }
  else if (sheet.filter != null) sheet.filter = null;
  const changedSheets = next.sheets.filter((item, index) => JSON.stringify(item) !== JSON.stringify(book.sheets[index])).map(item => item.id), changedCells = opsChangedCells(book, next);
  return { book: next, changed: changedSheets.length > 0, summary: { type: operation.type, sheet_id: sheet.id, ...details, touched_cells: details.touched_cells ?? changedCells, changed_cells: changedCells, changed_sheet_ids: changedSheets } };
}
