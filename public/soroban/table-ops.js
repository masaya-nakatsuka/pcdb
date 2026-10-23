import { colName, parseRef, numericValue, shiftFormula, inspectFormula } from './engine.js';

/** Table metadata and edits. Call mutation helpers only on a caller-owned draft. */
export const TABLE_OPERATION_TYPES = Object.freeze(['create_table', 'remove_table', 'resize_table', 'set_table_filter', 'clear_table_filter']);
export const TABLE_LIMITS = Object.freeze({ tables_per_sheet: 100, name_characters: 80 });
const tableClone = value => JSON.parse(JSON.stringify(value));
const tableOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const tableKey = (row, column) => colName(column) + (row + 1);
const tableFormula = raw => /^\s*[=＝]/.test(raw || '');
const tableRaw = (sheet, address) => String(sheet.cells?.[address]?.raw ?? '');
const tableStyleKeys = ['bold', 'italic', 'underline', 'align', 'color', 'background', 'fontSize', 'font', 'format'];
const tableFilterOperators = ['in', 'equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'gt', 'gte', 'lt', 'lte', 'blank', 'not_blank'];
export class TableOperationError extends Error {
  constructor(code, message, details) { super(message); this.code = code; if (details !== undefined) this.details = details; }
}
const tableFail = (code, message, details) => { throw new TableOperationError(code, message, details); };
function tableObject(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) tableFail('INVALID_INPUT', label + ' は通常のオブジェクトで指定してください。');
  for (const key of Object.keys(value)) if (!keys.includes(key) || ['__proto__', 'constructor', 'prototype'].includes(key)) tableFail('INVALID_INPUT', label + ' に未対応の項目があります: ' + key);
}
function tableArea(value) {
  if (typeof value !== 'string' || value.length > 30 || !/^\$?[A-Z]{1,2}\$?[1-9]\d{0,2}(?::\$?[A-Z]{1,2}\$?[1-9]\d{0,2})?$/i.test(value.trim())) tableFail('INVALID_RANGE', 'テーブルの範囲は A1:AZ500 の中で指定してください。');
  const parts = value.trim().split(':'), first = parseRef(parts[0]), last = parseRef(parts[1] || parts[0]);
  if (!first || !last || first.r > last.r || first.c > last.c || last.r >= 500 || last.c >= 52) tableFail('INVALID_RANGE', 'テーブルの範囲は左上から右下への範囲で指定してください。');
  return { r1: first.r, c1: first.c, r2: last.r, c2: last.c };
}
function tableRange(area) { const first = tableKey(area.r1, area.c1), last = tableKey(area.r2, area.c2); return first === last ? first : first + ':' + last; }
function tableInside(sheet, area) {
  if (area.r2 >= sheet.rows || area.c2 >= sheet.cols) tableFail('INVALID_RANGE', '現在のシート内でテーブルの範囲を指定してください。');
}
function tableOverlap(a, b) { return a.r1 <= b.r2 && a.r2 >= b.r1 && a.c1 <= b.c2 && a.c2 >= b.c1; }
function tableName(value) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > TABLE_LIMITS.name_characters || /[\u0000-\u001f\u007f]/.test(value)) tableFail('INVALID_TABLE', 'テーブル名は1〜80文字で指定してください。');
  return value.trim();
}
function tableId(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,160}$/.test(value)) tableFail('INVALID_TABLE', 'テーブルIDの形式を確認してください。');
  return value;
}
function tableScalar(value) {
  if (value === null || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value)) || (typeof value === 'string' && value.length <= 8192)) return value;
  tableFail('INVALID_FILTER', 'フィルターの値は数値・真偽値・空白・8,192文字以内の文字列で指定してください。');
}
function tableCriteria(input, area) {
  if (!Array.isArray(input) || input.length > 52) tableFail('INVALID_FILTER', 'テーブルの条件は52件以内で指定してください。');
  return Array.from(input, criterion => {
    tableObject(criterion, ['column', 'operator', 'value', 'values'], 'フィルター条件');
    const { column, operator } = criterion;
    if (!Number.isSafeInteger(column) || column < area.c1 || column > area.c2 || !tableFilterOperators.includes(operator)) tableFail('INVALID_FILTER', 'テーブル内の列と対応するフィルター条件を指定してください。');
    if (operator === 'in') {
      if (tableOwn(criterion, 'value') || !Array.isArray(criterion.values) || criterion.values.length > 500) tableFail('INVALID_FILTER', '値の選択には500件以内の values を指定してください。');
      return { column, operator, values: Array.from(criterion.values, tableScalar) };
    }
    if (['blank', 'not_blank'].includes(operator)) {
      if (tableOwn(criterion, 'value') || tableOwn(criterion, 'values')) tableFail('INVALID_FILTER', '空白の条件では value / values を省略してください。');
      return { column, operator };
    }
    if (!tableOwn(criterion, 'value') || tableOwn(criterion, 'values')) tableFail('INVALID_FILTER', '比較する値を value に指定してください。');
    const value = tableScalar(criterion.value);
    if (['gt', 'gte', 'lt', 'lte'].includes(operator) && numericValue(value) === null) tableFail('INVALID_FILTER', '大小の比較には数値を指定してください。');
    return { column, operator, value };
  });
}

/** Strict metadata validation; never changes cells or fills headers when loading. */
export function normalizeTables(sheet, input = sheet.tables) {
  if (input == null) return [];
  if (!Array.isArray(input) || input.length > TABLE_LIMITS.tables_per_sheet) tableFail('INVALID_TABLE', '1シートのテーブルは100件以内にしてください。');
  const ids = new Set(), names = new Set(), areas = [];
  return Array.from(input, value => {
    tableObject(value, ['id', 'name', 'range', 'banded', 'criteria'], 'テーブル');
    const id = tableId(value.id), name = tableName(value.name), area = tableArea(value.range), normalizedName = name.toLocaleLowerCase();
    tableInside(sheet, area);
    if (ids.has(id) || names.has(normalizedName)) tableFail('INVALID_TABLE', '同じシートのテーブルIDと名前は重複できません。');
    if (areas.some(other => tableOverlap(area, other))) tableFail('TABLE_OVERLAP', 'テーブル同士の範囲は重ねられません。');
    if (value.banded !== undefined && typeof value.banded !== 'boolean') tableFail('INVALID_TABLE', 'banded は真偽値で指定してください。');
    const criteria = tableCriteria(value.criteria === undefined ? [] : value.criteria, area);
    ids.add(id); names.add(normalizedName); areas.push(area);
    return { id, name, range: tableRange(area), banded: value.banded !== false, criteria };
  });
}

export function tableAt(sheet, row, column) {
  for (const table of sheet.tables || []) {
    const area = tableArea(table.range);
    if (row >= area.r1 && row <= area.r2 && column >= area.c1 && column <= area.c2) return table;
  }
  return null;
}
function tableGet(sheet, id) {
  tableId(id);
  const table = sheet.tables?.find(item => item.id === id);
  if (!table) tableFail('TABLE_NOT_FOUND', '指定されたテーブルが見つかりません。');
  return table;
}
function tableAssertNoOverlap(sheet, area, exceptId) {
  if ((sheet.tables || []).some(table => table.id !== exceptId && tableOverlap(area, tableArea(table.range)))) tableFail('TABLE_OVERLAP', 'テーブル同士の範囲は重ねられません。');
}
function tableNormalizeHeaders(sheet, table, changed, edited = new Set()) {
  const area = tableArea(table.range), used = new Set();
  sheet.cells ||= {};
  const headers = Array.from({ length: area.c2 - area.c1 + 1 }, (_, index) => {
    const column = area.c1 + index, address = tableKey(area.r1, column), raw = tableRaw(sheet, address);
    return { column, address, raw, priority: tableFormula(raw) ? 0 : !raw.trim() ? 3 : edited.has(address) ? 2 : 1 };
  }).sort((a, b) => a.priority - b.priority || a.column - b.column);
  for (const { column, address, raw } of headers) {
    // Formula headers remain formulas. Positional columns do not need text names.
    if (tableFormula(raw)) { used.add(raw.toLocaleLowerCase()); continue; }
    const base = raw.trim() ? raw : '列' + (column - area.c1 + 1);
    let value = base, suffix = 2;
    while (used.has(value.trim().toLocaleLowerCase())) { const ending = String(suffix++); value = base.slice(0, 8192 - ending.length) + ending; }
    used.add(value.trim().toLocaleLowerCase());
    if (value !== raw) { sheet.cells[address] = { ...sheet.cells[address], raw: value }; changed?.add(address); }
  }
}
function tableFreshId(tables) { let i = 1; while (tables.some(table => table.id === 'table_' + i)) i++; return 'table_' + i; }
function tableFreshName(tables) { let i = 1; while (tables.some(table => table.name.toLocaleLowerCase() === '表' + i)) i++; return '表' + i; }

/** Called by applySheetOperation after cloning the workbook. */
export function applyTableOperation(sheet, operation) {
  const type = operation?.type, common = ['type', 'sheet_id'];
  const fields = type === 'create_table' ? ['range', 'name'] : type === 'resize_table' ? ['table_id', 'range'] : type === 'set_table_filter' ? ['table_id', 'criteria'] : ['table_id'];
  if (!TABLE_OPERATION_TYPES.includes(type)) tableFail('INVALID_OPERATION', 'このテーブル操作には対応していません。');
  tableObject(operation, [...common, ...fields], 'テーブル操作');
  const tables = normalizeTables(sheet), changed = new Set();
  sheet.tables = tables;
  if (type === 'create_table') {
    if (tables.length >= TABLE_LIMITS.tables_per_sheet) tableFail('LIMIT_EXCEEDED', '1シートに作成できるテーブルは100件までです。');
    const area = tableArea(operation.range); tableInside(sheet, area); tableAssertNoOverlap(sheet, area);
    const name = operation.name === undefined ? tableFreshName(tables) : tableName(operation.name);
    if (tables.some(table => table.name.toLocaleLowerCase() === name.toLocaleLowerCase())) tableFail('INVALID_TABLE', 'このテーブル名はすでに使われています。');
    let criteria = [];
    if (sheet.filter && tableOverlap(area, tableArea(sheet.filter.range))) {
      if (tableRange(area) !== tableRange(tableArea(sheet.filter.range))) tableFail('TABLE_FILTER_OVERLAP', '既存のフィルターを解除するか、同じ範囲をテーブルにしてください。');
      criteria = tableCriteria(sheet.filter.criteria, area); sheet.filter = null;
    }
    const table = { id: tableFreshId(tables), name, range: tableRange(area), banded: true, criteria };
    tables.push(table); tableNormalizeHeaders(sheet, table, changed);
    return { table_id: table.id, name, range: table.range, touched_cells: changed.size };
  }
  const table = tableGet(sheet, operation.table_id), before = table.range;
  if (type === 'remove_table') sheet.tables = tables.filter(item => item.id !== table.id);
  else if (type === 'resize_table') {
    const area = tableArea(operation.range), previous = tableArea(table.range); tableInside(sheet, area); tableAssertNoOverlap(sheet, area, table.id);
    if (area.r1 !== previous.r1 || area.c1 !== previous.c1) tableFail('INVALID_RANGE', 'テーブルの左上の位置を変えずに、右端・下端を変更してください。');
    if (sheet.filter && tableOverlap(area, tableArea(sheet.filter.range))) tableFail('TABLE_FILTER_OVERLAP', '既存のフィルターとテーブルの範囲は重ねられません。');
    table.range = tableRange(area); table.criteria = table.criteria.filter(item => item.column >= area.c1 && item.column <= area.c2); tableNormalizeHeaders(sheet, table, changed);
  } else if (type === 'set_table_filter') table.criteria = tableCriteria(operation.criteria, tableArea(table.range));
  else table.criteria = [];
  return { table_id: table.id, name: table.name, before, range: type === 'remove_table' ? null : table.range, touched_cells: changed.size };
}

function tableConsistentFormula(sheet, area, column) {
  if (area.r2 <= area.r1) return null;
  const seed = tableRaw(sheet, tableKey(area.r2, column));
  if (!tableFormula(seed) || !inspectFormula(seed).syntaxValid) return null;
  for (let row = area.r1 + 1; row <= area.r2; row++) {
    const raw = tableRaw(sheet, tableKey(row, column));
    if (!raw) continue;
    if (!tableFormula(raw) || shiftFormula(raw, area.r2 - row, 0) !== seed) return null;
  }
  return seed;
}
function tableExtendRows(before, draft, previous, area, explicit, changed) {
  if (area.r2 <= previous.r2 || previous.r2 <= previous.r1) return;
  for (let column = area.c1; column <= area.c2; column++) {
    const seed = draft.cells[tableKey(previous.r2, column)] || { raw: '' }, formula = tableConsistentFormula(draft, previous, column);
    for (let row = previous.r2 + 1; row <= area.r2; row++) {
      const address = tableKey(row, column), current = draft.cells[address] || { raw: '' }, next = { ...current };
      for (const key of tableStyleKeys) if (!tableOwn(next, key) && tableOwn(seed, key)) next[key] = seed[key];
      if (formula && !next.raw && !explicit.has(address) && !tableRaw(before, address)) {
        next.raw = shiftFormula(formula, row - previous.r2, 0);
        if (next.raw.length > 8192) tableFail('LIMIT_EXCEEDED', 'テーブルの数式を延長すると1セルの上限8,192文字を超えます。');
      }
      if (JSON.stringify(current) !== JSON.stringify(next)) { draft.cells[address] = next; changed.add(address); }
    }
  }
}

/** Reconcile explicit writes; input drafts remain intact if generated formulas fail. */
export function reconcileTablesAfterWrite(beforeSheet, draftSheet, addresses) {
  const result = { expanded_tables: [], changed_cells: [], blocked_expansions: [] };
  if (!draftSheet.tables?.length) return result;
  if (!Array.isArray(addresses)) tableFail('INVALID_INPUT', '編集したセル番地を配列で指定してください。');
  const explicit = new Set(), triggers = new Set();
  for (const value of addresses) {
    const point = parseRef(value);
    if (!point || point.r >= 500 || point.c >= 52) tableFail('INVALID_RANGE', '編集したセル番地が範囲外です。');
    const address = tableKey(point.r, point.c); explicit.add(address);
    if (tableRaw(beforeSheet, address) === '' && tableRaw(draftSheet, address) !== '') triggers.add(address);
  }
  const next = tableClone(draftSheet), changed = new Set(); next.tables = normalizeTables(next); next.cells ||= {};
  for (const table of next.tables) {
    const previous = tableArea(table.range), area = { ...previous };
    const blocked = candidate => {
      if (next.tables.some(other => other.id !== table.id && tableOverlap(candidate, tableArea(other.range)))) return 'TABLE_OVERLAP';
      if (next.filter && tableOverlap(candidate, tableArea(next.filter.range))) return 'TABLE_FILTER_OVERLAP';
      return null;
    };
    while (area.c2 + 1 < Math.min(next.cols, 52) && triggers.has(tableKey(area.r1, area.c2 + 1))) {
      const candidate = { ...area, c2: area.c2 + 1 }, reason = blocked(candidate);
      if (reason) { result.blocked_expansions.push({ table_id: table.id, reason }); break; }
      area.c2++;
    }
    while (area.r2 + 1 < Math.min(next.rows, 500)) {
      let triggered = false;
      for (let column = area.c1; column <= area.c2; column++) if (triggers.has(tableKey(area.r2 + 1, column))) { triggered = true; break; }
      if (!triggered) break;
      const candidate = { ...area, r2: area.r2 + 1 }, reason = blocked(candidate);
      if (reason) { result.blocked_expansions.push({ table_id: table.id, reason }); break; }
      area.r2++;
    }
    const range = tableRange(area);
    if (range !== table.range) {
      result.expanded_tables.push({ table_id: table.id, before: table.range, after: range });
      table.range = range; tableExtendRows(beforeSheet, next, previous, area, explicit, changed);
    }
    if (range !== tableRange(previous) || [...explicit].some(address => { const point = parseRef(address); return point.r === area.r1 && point.c >= area.c1 && point.c <= area.c2; })) {
      const edited = new Set([...explicit].filter(address => tableRaw(beforeSheet, address) !== tableRaw(draftSheet, address)));
      tableNormalizeHeaders(next, table, changed, edited);
    }
  }
  draftSheet.tables = next.tables; draftSheet.cells = next.cells;
  result.changed_cells = [...changed];
  return result;
}

function tableTransformInterval(start, end, index, count, action) {
  if (action === 'insert') return index <= start ? [start + count, end + count] : index <= end ? [start, end + count] : [start, end];
  const last = index + count - 1;
  if (end < index) return [start, end];
  if (start > last) return [start - count, end - count];
  if (start >= index && end <= last) return null;
  const nextStart = start < index ? start : index, nextEnd = end > last ? end - count : index - 1;
  return nextStart > nextEnd ? null : [nextStart, nextEnd];
}

/** Cells/dimensions have already moved; update table bounds and absolute criteria. */
export function transformTablesForStructure(sheet, axis, index, count, action) {
  if (!sheet.tables?.length) return;
  const changed = new Set();
  sheet.tables = sheet.tables.flatMap(table => {
    const area = tableArea(table.range);
    if (axis === 'row' && action === 'delete' && area.r1 >= index && area.r1 < index + count) return [];
    const next = tableTransformInterval(axis === 'row' ? area.r1 : area.c1, axis === 'row' ? area.r2 : area.c2, index, count, action);
    if (!next) return [];
    if (axis === 'row') [area.r1, area.r2] = next; else [area.c1, area.c2] = next;
    table.range = tableRange(area);
    if (axis === 'col') table.criteria = (table.criteria || []).flatMap(criterion => {
      if (action === 'delete' && criterion.column >= index && criterion.column < index + count) return [];
      return [{ ...criterion, column: criterion.column >= index ? criterion.column + (action === 'insert' ? count : -count) : criterion.column }];
    });
    tableNormalizeHeaders(sheet, table, changed);
    return [table];
  });
}
