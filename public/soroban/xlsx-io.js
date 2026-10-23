/* Browser-only XLSX conversion. No network, macros, hyperlink navigation, or eval. */
import './vendor/exceljs-4.4.0.min.js';
import './vendor/fflate-0.8.3.min.js';
import { colName, parseRef, numericValue, evaluateCellResult, inspectFormula, SUPPORTED_FUNCTIONS } from './engine.js';
import { normalizeTables } from './table-ops.js';

export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
export const MAX_XLSX_BYTES = 32 * 1024 * 1024;
export const XLSX_LIMITS = Object.freeze({ rows: 500, columns: 52, sheets: 15, cellCharacters: 8192, expandedBytes: 64 * 1024 * 1024 });
export class XlsxIOError extends Error {
  constructor(code, message) { super(message); this.name = 'XlsxIOError'; this.code = code; }
}

const xlsxFail = (code, message) => { throw new XlsxIOError(code, message); };
const xlsxId = () => 's' + (globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + '_' + Math.random().toString(36).slice(2));
const XLSX_FONTS = { sans: 'Yu Gothic', serif: 'Yu Mincho', mono: 'Consolas' };
const XLSX_FONT_SIZES = [11, 13, 14, 16, 18, 20];
const XLSX_ERRORS = new Set(['#NULL!', '#DIV/0!', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#N/A', '#SPILL!']);
const XLSX_NUMFMTS = { auto: 'General', yen: '"¥"#,##0', percent: '0.########%', number: '#,##0.########', date: 'yyyy/mm/dd' };
const XLSX_DAY = 86400000;

function xlsxWellFormedText(text) {
  for (let i = 0; i < text.length; i++) {
    const unit = text.charCodeAt(i);
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = text.charCodeAt(++i);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false;
    } else if (unit >= 0xdc00 && unit <= 0xdfff) return false;
  }
  return true;
}
function xlsxTruncateText(text, length) {
  const result = text.slice(0, length), last = result.charCodeAt(result.length - 1);
  return last >= 0xd800 && last <= 0xdbff ? result.slice(0, -1) : result;
}
function xlsxEncodeString(text, attribute = false) {
  if (!xlsxWellFormedText(text)) xlsxFail('INVALID_CELL_TEXT', 'Excel で保持できない不正な文字（孤立したサロゲート）があります。文字を修正してください。内容は変更せず、書き出しを中止しました。');
  // ST_Xstring: escape a literal escape's opening underscore before encoding
  // XML controls. Match only that underscore so overlapping escapes survive.
  const escaped = text.replace(/_(?=x[0-9a-f]{4}_)/gi, '_x005F_');
  const controls = attribute ? /[\u0000-\u001f\u007f\ufffe\uffff]/g : /[\u0000-\u0008\u000b-\u001f\u007f\ufffe\uffff]/g;
  return escaped.replace(controls, char => '_x' + char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0') + '_');
}
function xlsxValidateSheetName(name) {
  if (typeof name !== 'string' || !name || name.length > 31 || /[\[\]*?:/\\]/.test(name) || /^'|'$/.test(name)) xlsxFail('INVALID_SHEET_NAME', `Excel のシート名は31文字以内で、[]:*?/\\ や先頭・末尾の ' を含められません。「${name || '無名'}」の名前を変更してください。`);
  // The bundled reader does not decode ST_Xstring in sheet-name attributes.
  // Refuse names it cannot preserve rather than silently retargeting formulas.
  if (!xlsxWellFormedText(name) || /[\u0000-\u001f\u007f\ufffe\uffff]|_x[0-9a-f]{4}_/i.test(name)) xlsxFail('INVALID_SHEET_NAME', `「${name}」のシート名には、この Excel 変換で安全に保持できない制御文字・特殊な文字列・不正な文字があります。シート名を変更してください。内容は変更せず、変換を中止しました。`);
}

function xlsxWarnings() {
  const records = new Map();
  return {
    add(code, message, sheet, count = 1) {
      const key = JSON.stringify([code, sheet || '']);
      if (records.has(key)) records.get(key).count += count;
      else records.set(key, { code, message, ...(sheet ? { sheet } : {}), count });
    },
    list() {
      return [...records.values()].map(item => ({ ...item, message: (item.sheet ? `「${item.sheet}」: ` : '') + item.message + (item.count > 1 ? `（${item.count}件）` : '') }));
    }
  };
}

function xlsxBytes(input) {
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  xlsxFail('INVALID_INPUT', 'Excel ファイルのバイトデータを指定してください。');
}

function xlsxArchiveEntries(bytes) {
  if (!bytes.length) xlsxFail('INVALID_FILE', 'ファイルが空です。');
  if (bytes.length > MAX_XLSX_BYTES) xlsxFail('FILE_TOO_LARGE', 'Excel ファイルは32MB以下にしてください。');
  if (bytes[0] === 0xd0 && bytes[1] === 0xcf) xlsxFail('UNSUPPORTED_FORMAT', '古い .xls 形式や暗号化された Excel ファイルには対応していません。暗号化されていない .xlsx で保存してください。');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 22 || view.getUint32(0, true) !== 0x04034b50) xlsxFail('INVALID_FILE', '.xlsx 形式のファイルを選んでください。');
  let end = bytes.length - 22;
  while (end >= Math.max(0, bytes.length - 65557) && view.getUint32(end, true) !== 0x06054b50) end--;
  if (end < Math.max(0, bytes.length - 65557)) xlsxFail('INVALID_FILE', 'Excel ファイルの圧縮データが壊れています。');
  const count = view.getUint16(end + 10, true), size = view.getUint32(end + 12, true);
  let offset = view.getUint32(end + 16, true);
  if (view.getUint16(end + 4, true) || view.getUint16(end + 6, true) || view.getUint16(end + 8, true) !== count || count === 65535 || offset === 0xffffffff || size === 0xffffffff) xlsxFail('UNSUPPORTED_ARCHIVE', '分割ファイルや ZIP64 形式の Excel ファイルには対応していません。');
  if (!count || count > 4096 || offset + size > end) xlsxFail('INVALID_FILE', 'Excel ファイルの内部構造を確認してください。');
  const entries = new Map();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let expanded = 0;
  for (let i = 0; i < count; i++) {
    if (offset + 46 > end || view.getUint32(offset, true) !== 0x02014b50) xlsxFail('INVALID_FILE', 'Excel ファイルの圧縮データが壊れています。');
    const flags = view.getUint16(offset + 8, true), method = view.getUint16(offset + 10, true);
    const compressed = view.getUint32(offset + 20, true), original = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true), extraLength = view.getUint16(offset + 30, true), commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true), next = offset + 46 + nameLength + extraLength + commentLength;
    if (next > end || localOffset + 30 > bytes.length || compressed > bytes.length || original === 0xffffffff) xlsxFail('INVALID_FILE', 'Excel ファイルの内部構造を確認してください。');
    if (flags & 1) xlsxFail('PASSWORD_PROTECTED', '暗号化された Excel ファイルには対応していません。');
    if (![0, 8].includes(method)) xlsxFail('UNSUPPORTED_ARCHIVE', 'この Excel ファイルの圧縮方式には対応していません。');
    let name;
    try { name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength)); }
    catch { xlsxFail('INVALID_FILE', 'Excel ファイル内のファイル名が不正です。'); }
    if (!name || name.startsWith('/') || name.includes('\\') || name.split('/').some(part => part === '..' || part === '__proto__' || part === 'constructor') || entries.has(name)) xlsxFail('INVALID_FILE', 'Excel ファイル内のファイル名が不正です。');
    expanded += original;
    if (expanded > XLSX_LIMITS.expandedBytes || original > MAX_XLSX_BYTES) xlsxFail('EXPANDED_FILE_TOO_LARGE', '展開後の Excel ファイルが大きすぎます。不要なシート・画像・書式を減らしてください。');
    entries.set(name, { original, compressed, crc: view.getUint32(offset + 16, true) });
    offset = next;
  }
  if (!entries.has('[Content_Types].xml') || !entries.has('xl/workbook.xml')) xlsxFail('UNSUPPORTED_FORMAT', '通常の .xlsx ワークブックを選んでください。');
  return entries;
}

let xlsxCrcTable;
function xlsxUpdateCrc32(value, bytes) {
  if (!xlsxCrcTable) xlsxCrcTable = Array.from({ length: 256 }, (_, i) => {
    let n = i;
    for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
    return n >>> 0;
  });
  for (const byte of bytes) value = xlsxCrcTable[(value ^ byte) & 255] ^ (value >>> 8);
  return value >>> 0;
}

function xlsxCheckedXmlArchive(bytes, entries) {
  const xml = new Map(), seen = new Set();
  let expanded = 0, completed = 0;
  const unzipper = new globalThis.fflate.Unzip(file => {
    const entry = entries.get(file.name);
    if (!entry || seen.has(file.name)) xlsxFail('INVALID_FILE', 'Excel ファイルの内部構造が一致しません。');
    seen.add(file.name);
    const retain = file.name === 'xl/workbook.xml' || file.name === 'xl/_rels/workbook.xml.rels' || file.name === '[Content_Types].xml' || /^xl\/worksheets\/(?:[^/]+\.xml|_rels\/[^/]+\.xml\.rels)$/.test(file.name) || /^xl\/(?:theme|tables)\/[^/]+\.xml$/.test(file.name);
    const decoder = /\.(?:xml|rels)$/i.test(file.name) ? new TextDecoder('utf-8') : null;
    let length = 0, crc = 0xffffffff, tail = '';
    const chunks = [];
    file.ondata = (error, data, final) => {
      if (error instanceof XlsxIOError) throw error;
      if (error) xlsxFail('INVALID_FILE', 'Excel ファイルを展開できません。ファイルが壊れていないか確認してください。');
      length += data.length; expanded += data.length;
      if (length > entry.original) xlsxFail('INVALID_FILE', 'Excel ファイルの展開サイズが申告内容と一致しません。');
      if (length > MAX_XLSX_BYTES || expanded > XLSX_LIMITS.expandedBytes) xlsxFail('EXPANDED_FILE_TOO_LARGE', '展開後の Excel ファイルが大きすぎます。');
      crc = xlsxUpdateCrc32(crc, data);
      if (decoder) {
        const source = tail + decoder.decode(data, { stream: !final });
        if (/<!DOCTYPE|<!ENTITY/i.test(source)) xlsxFail('UNSUPPORTED_XML', '外部エンティティを含む Excel ファイルは読み込めません。');
        tail = source.slice(-16);
      }
      if (retain) chunks.push(data);
      if (final) {
        if (length !== entry.original || ((crc ^ 0xffffffff) >>> 0) !== entry.crc) xlsxFail('INVALID_FILE', 'Excel ファイルの検査に失敗しました。ファイルが壊れている可能性があります。');
        completed++;
        if (retain) {
          const data = new Uint8Array(length); let offset = 0;
          for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.length; }
          xml.set(file.name, globalThis.fflate.strFromU8(data));
        }
      }
    };
    file.start();
  });
  unzipper.register(globalThis.fflate.UnzipInflate);
  try {
    // Small compressed chunks cap temporary inflation even when ZIP size headers are dishonest.
    for (let offset = 0; offset < bytes.length; offset += 4096) unzipper.push(bytes.subarray(offset, offset + 4096), offset + 4096 >= bytes.length);
  } catch (error) {
    if (error instanceof XlsxIOError) throw error;
    xlsxFail('INVALID_FILE', 'Excel ファイルを展開できません。ファイルが壊れていないか確認してください。');
  }
  if (seen.size !== entries.size || completed !== entries.size) xlsxFail('INVALID_FILE', 'Excel ファイルの圧縮データが壊れています。');
  return xml;
}

function xlsxXmlText(text) {
  return text.replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/gi, entity => {
    const basic = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };
    if (basic[entity]) return basic[entity];
    const n = entity[2]?.toLowerCase() === 'x' ? parseInt(entity.slice(3, -1), 16) : parseInt(entity.slice(2, -1), 10);
    return Number.isInteger(n) && n >= 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '';
  });
}
function xlsxAttributes(source) {
  const result = Object.create(null);
  for (const match of source.matchAll(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) result[match[1]] = xlsxXmlText(match[2] ?? match[3]);
  return result;
}
function xlsxCheckRef(reference, sheet) {
  const parts = String(reference).split(':');
  if (!parts.length || parts.length > 2) xlsxFail('INVALID_FILE', 'セルの範囲が不正です。');
  for (const part of parts) {
    const point = parseRef(part);
    if (!point) xlsxFail('INVALID_FILE', 'セルの番地が不正です。');
    if (point.r >= XLSX_LIMITS.rows || point.c >= XLSX_LIMITS.columns) xlsxFail('GRID_LIMIT_EXCEEDED', `「${sheet}」に500行 × 52列（AZ列）を超える範囲 ${reference} があります。内容は切り捨てず、読み込みを中止しました。`);
  }
}

function xlsxTablePath(sheetPath, target) {
  if (typeof target !== 'string' || !target || target.includes('\\') || /^[a-z][a-z\d+.-]*:/i.test(target)) xlsxFail('INVALID_FILE', 'Excel テーブルの参照先が不正です。');
  const parts = target.startsWith('/') ? [] : sheetPath.split('/').slice(0, -1);
  for (const part of target.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') { if (!parts.length) xlsxFail('INVALID_FILE', 'Excel テーブルの参照先が不正です。'); parts.pop(); }
    else parts.push(part);
  }
  const path = parts.join('/');
  if (!/^xl\/tables\/[^/]+\.xml$/i.test(path)) xlsxFail('INVALID_FILE', 'Excel テーブルの参照先が不正です。');
  return path;
}

// Validate table rectangles before ExcelJS loads or allocates the worksheet.
function xlsxReadTables(xml, sheetPath, sheetXml, sheetName, warnings, names) {
  const relPath = sheetPath.replace(/([^/]+)$/, '_rels/$1.rels'), relations = new Map();
  for (const match of (xml.get(relPath) || '').matchAll(/<(?:\w+:)?Relationship\b([^>]*)\/?\s*>/g)) {
    const attrs = xlsxAttributes(match[1]);
    if (attrs.Type?.endsWith('/table')) {
      if (attrs.TargetMode === 'External' || relations.has(attrs.Id)) xlsxFail('INVALID_FILE', 'Excel テーブルの参照先が不正です。');
      relations.set(attrs.Id, xlsxTablePath(sheetPath, attrs.Target));
    }
  }
  const tables = [], paths = new Set();
  let lastRow = 0, lastColumn = 0;
  for (const match of sheetXml.matchAll(/<(?:\w+:)?tablePart\b([^>]*)\/?\s*>/g)) {
    const relation = xlsxAttributes(match[1])['r:id'], path = relations.get(relation);
    if (!path || paths.has(path) || !xml.has(path)) xlsxFail('INVALID_FILE', `「${sheetName}」の Excel テーブルが見つからないか、重複しています。`);
    paths.add(path);
    const source = xml.get(path), root = source.match(/<(?:\w+:)?table\b([^>]*)>/), attrs = root ? xlsxAttributes(root[1]) : null;
    if (!attrs?.ref || !attrs.name || ['__proto__', 'constructor', 'prototype'].includes(attrs.name) || attrs.name.length > 255) xlsxFail('INVALID_FILE', 'Excel テーブルの名前や範囲が不正です。');
    xlsxCheckRef(attrs.ref, sheetName);
    const refs = attrs.ref.split(':'), first = parseRef(refs[0]), last = parseRef(refs.at(-1));
    if (first.r > last.r || first.c > last.c) xlsxFail('INVALID_FILE', 'Excel テーブルの範囲が逆順になっています。');
    const columns = [...source.matchAll(/<(?:\w+:)?tableColumn\b([^>]*)\/?\s*>/g)].map(item => xlsxAttributes(item[1]));
    if (columns.length !== last.c - first.c + 1 || columns.some(column => typeof column.name !== 'string' || column.name.length > XLSX_LIMITS.cellCharacters)) xlsxFail('INVALID_FILE', 'Excel テーブルの列数または見出しの形式が不正です。');
    const nativeName = attrs.name.toLocaleUpperCase();
    if (names.has(nativeName)) xlsxFail('INVALID_FILE', 'ブック内で Excel テーブルの名前が重複しています。');
    names.add(nativeName);
    lastRow = Math.max(lastRow, last.r + 1); lastColumn = Math.max(lastColumn, last.c + 1);
    const headerCount = attrs.headerRowCount === undefined ? 1 : Number(attrs.headerRowCount);
    const totalsCount = attrs.totalsRowCount === undefined ? 0 : Number(attrs.totalsRowCount);
    if (![0, 1].includes(headerCount) || ![0, 1].includes(totalsCount)) xlsxFail('INVALID_FILE', 'Excel テーブルの見出しや集計行の設定が不正です。');
    if (!headerCount) { warnings.add('HEADERLESS_TABLE_AS_RANGE', '見出しのないテーブルは通常のセル範囲として読み込みます。', sheetName); continue; }
    if (totalsCount) {
      if (last.r === first.r) xlsxFail('INVALID_FILE', 'Excel テーブルの集計行の範囲が不正です。');
      last.r--;
      warnings.add('TABLE_TOTALS_AS_CELLS', 'テーブルの集計行は、テーブルの下に通常のセルとして残します。', sheetName);
    }
    const styleMatch = source.match(/<(?:\w+:)?tableStyleInfo\b([^>]*)\/?\s*>/), style = styleMatch ? xlsxAttributes(styleMatch[1]) : {};
    if (style.name && style.name !== 'TableStyleMedium4' || ['showFirstColumn', 'showLastColumn', 'showColumnStripes'].some(key => ['1', 'true'].includes(style[key]))) warnings.add('TABLE_STYLE_APPROXIMATED', 'テーブルの配色はそろばんの標準色になります。行の縞模様は保持します。', sheetName);
    if (/<(?:\w+:)?(?:filters|customFilters|dynamicFilter|colorFilter|iconFilter|top10)\b/.test(source)) warnings.add('TABLE_FILTER_CRITERIA_OMITTED', 'テーブルの範囲は保持し、Excel の絞り込み条件は解除して読み込みます。', sheetName);
    let name = attrs.name.slice(0, 80), suffix = 2;
    while (tables.some(table => table.name.toLocaleUpperCase() === name.toLocaleUpperCase())) { const ending = '_' + suffix++; name = attrs.name.slice(0, 80 - ending.length) + ending; }
    if (name !== attrs.name) warnings.add('TABLE_NAME_SHORTENED', '一部のテーブル名を80文字以内で重複しない名前に調整しました。', sheetName);
    tables.push({ id: 'table_' + (tables.length + 1), name, range: colName(first.c) + (first.r + 1) + (first.r === last.r && first.c === last.c ? '' : ':' + colName(last.c) + (last.r + 1)), banded: ['1', 'true'].includes(style.showRowStripes), criteria: [] });
  }
  try { normalizeTables({ rows: XLSX_LIMITS.rows, cols: XLSX_LIMITS.columns, cells: {} }, tables); }
  catch { xlsxFail('INVALID_FILE', `「${sheetName}」のテーブル範囲が重なるか、テーブル設定が不正です。`); }
  return { tables, lastRow, lastColumn };
}

function xlsxPreflight(bytes, warnings) {
  const entries = xlsxArchiveEntries(bytes);
  const xml = xlsxCheckedXmlArchive(bytes, entries);
  const workbookXml = xml.get('xl/workbook.xml') || '';
  const sheets = [...workbookXml.matchAll(/<(?:\w+:)?sheet\b([^>]*)\/?\s*>/g)].map(match => xlsxAttributes(match[1]));
  if (!sheets.length) xlsxFail('INVALID_FILE', 'ワークシートがありません。');
  if (sheets.length > XLSX_LIMITS.sheets) xlsxFail('SHEET_LIMIT_EXCEEDED', `シートは最大15枚です。このファイルには${sheets.length}枚あります。読み込むシートを Excel 側で減らしてください。`);
  const rels = new Map();
  for (const match of (xml.get('xl/_rels/workbook.xml.rels') || '').matchAll(/<(?:\w+:)?Relationship\b([^>]*)\/?\s*>/g)) {
    const attrs = xlsxAttributes(match[1]);
    if (attrs.TargetMode !== 'External' && attrs.Target) rels.set(attrs.Id, attrs.Target.startsWith('/') ? attrs.Target.slice(1) : 'xl/' + attrs.Target.replace(/^\.\//, ''));
  }
  const sheetData = new Map(), tableNames = new Set();
  for (const descriptor of sheets) {
    xlsxValidateSheetName(descriptor.name);
    const name = descriptor.name, path = rels.get(descriptor['r:id']);
    if (descriptor.state && descriptor.state !== 'visible') warnings.add('HIDDEN_SHEET_VISIBLE', '非表示のシートを表示状態で読み込みます。', name);
    if (!path || !/^xl\/worksheets\//.test(path)) { warnings.add('NON_WORKSHEET_OMITTED', 'グラフシートなど、通常のワークシート以外は読み込まれません。', name); continue; }
    const source = xml.get(path);
    if (source == null) xlsxFail('INVALID_FILE', `「${name}」のシートデータが見つかりません。`);
    const dimension = source.match(/<(?:\w+:)?dimension\b([^>]*)\/?\s*>/);
    const dimensionRef = dimension && xlsxAttributes(dimension[1]).ref;
    if (dimensionRef) xlsxCheckRef(dimensionRef, name);
    let count = 0;
    for (const match of source.matchAll(/<(?:\w+:)?c\b([^>]*)>/g)) {
      const attrs = xlsxAttributes(match[1]);
      if (attrs.r) xlsxCheckRef(attrs.r, name);
      if (++count > XLSX_LIMITS.rows * XLSX_LIMITS.columns) xlsxFail('GRID_LIMIT_EXCEEDED', `「${name}」のセル数が上限を超えています。`);
    }
    let lastRow = 0, lastColumn = 0;
    for (const match of source.matchAll(/<(?:\w+:)?row\b([^>]*)>/g)) {
      const attrs = xlsxAttributes(match[1]);
      if (attrs.r && (!/^\d+$/.test(attrs.r) || Number(attrs.r) > XLSX_LIMITS.rows || Number(attrs.r) < 1)) xlsxFail('GRID_LIMIT_EXCEEDED', `「${name}」は500行を超えています。`);
      lastRow = Math.max(lastRow, Number(attrs.r) || 0);
      if (attrs.hidden === '1' || attrs.hidden === 'true') warnings.add('HIDDEN_ROWS_VISIBLE', '非表示の行を表示状態で読み込みます。', name);
      if (attrs.ht) warnings.add('ROW_HEIGHT_NOT_PRESERVED', '行の高さは、そろばんの標準の高さになります。', name);
    }
    for (const match of source.matchAll(/<(?:\w+:)?col\b([^>]*)\/?\s*>/g)) {
      const attrs = xlsxAttributes(match[1]);
      const min = Number(attrs.min), max = Number(attrs.max);
      if (!Number.isInteger(min) || !Number.isInteger(max) || min < 1 || max < min) xlsxFail('INVALID_FILE', `「${name}」の列設定が不正です。`);
      if (Number(attrs.max) > XLSX_LIMITS.columns) xlsxFail('GRID_LIMIT_EXCEEDED', `「${name}」の列設定が52列（AZ列）を超えています。`);
      lastColumn = Math.max(lastColumn, Number(attrs.max) || 0);
      if (attrs.hidden === '1' || attrs.hidden === 'true') warnings.add('HIDDEN_COLUMNS_VISIBLE', '非表示の列を表示状態で読み込みます。', name);
    }
    for (const match of source.matchAll(/<(?:\w+:)?mergeCell\b([^>]*)\/?\s*>/g)) {
      const ref = xlsxAttributes(match[1]).ref;
      if (ref) xlsxCheckRef(ref, name);
      warnings.add('MERGED_CELLS_FLATTENED', '結合セルは解除し、左上のセルに値を残します。', name);
    }
    for (const [tag, code, message] of [
      ['conditionalFormatting', 'CONDITIONAL_FORMATTING_OMITTED', '条件付き書式は引き継がれません。'],
      ['dataValidation', 'DATA_VALIDATION_OMITTED', '入力規則は引き継がれません。'],
      ['sheetProtection', 'SHEET_PROTECTION_OMITTED', 'シートの保護設定は引き継がれません。'],
    ]) if (new RegExp('<(?:\\w+:)?' + tag + '\\b').test(source)) warnings.add(code, message, name);
    const paneMatch = source.match(/<(?:\w+:)?pane\b([^>]*)\/?\s*>/);
    const pane = paneMatch ? xlsxAttributes(paneMatch[1]) : {};
    const frozen = pane.state === 'frozen' || pane.state === 'frozenSplit';
    const freezeRows = frozen ? Math.max(0, Math.min(XLSX_LIMITS.rows, Math.trunc(Number(pane.ySplit) || 0))) : 0;
    const freezeCols = frozen ? Math.max(0, Math.min(XLSX_LIMITS.columns, Math.trunc(Number(pane.xSplit) || 0))) : 0;
    if (paneMatch && !frozen) warnings.add('PANE_SETTINGS_OMITTED', 'Excel のウィンドウ分割設定は引き継がれません。', name);
    const filterMatch = source.match(/<(?:\w+:)?autoFilter\b([^>]*)>/);
    const filterRef = filterMatch ? xlsxAttributes(filterMatch[1]).ref : null;
    if (filterRef) {
      xlsxCheckRef(filterRef, name);
      for (const ref of filterRef.split(':')) { const point = parseRef(ref); lastRow = Math.max(lastRow, point.r + 1); lastColumn = Math.max(lastColumn, point.c + 1); }
    }
    if (/<(?:\w+:)?filterColumn\b/.test(source)) warnings.add('FILTER_CRITERIA_OMITTED', 'フィルター範囲は保持しますが、Excel の絞り込み条件は解除して全行を読み込みます。', name);
    const numbers = new Map();
    for (const match of source.matchAll(/<(?:\w+:)?c\b([^>]*)>([\s\S]*?)<\/(?:\w+:)?c\s*>/g)) {
      const attrs = xlsxAttributes(match[1]);
      if (attrs.t && attrs.t !== 'n') continue;
      const value = match[2].match(/<(?:\w+:)?v\b[^>]*>([^<]*)<\/(?:\w+:)?v\s*>/);
      if (attrs.r && value && /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value[1])) numbers.set(attrs.r.replace(/\$/g, '').toUpperCase(), Number(value[1]));
    }
    const tableData = xlsxReadTables(xml, path, source, name, warnings, tableNames);
    lastRow = Math.max(lastRow, tableData.lastRow); lastColumn = Math.max(lastColumn, tableData.lastColumn);
    sheetData.set(name, { numbers, dimensionRef, lastRow, lastColumn, freezeRows, freezeCols, filterRef, tables: tableData.tables });
  }
  if (/<(?:\w+:)?definedName\b/.test(workbookXml)) warnings.add('DEFINED_NAMES_OMITTED', '名前付き範囲は引き継がれません。名前を使う数式は、このアプリで計算できない場合があります。');
  const featurePaths = [
    [/^xl\/charts\/[^/]+\.xml$/i, 'CHARTS_OMITTED', 'グラフは引き継がれません。元のファイルを保管してください。'],
    [/^xl\/media\/[^/]+$/i, 'IMAGES_OMITTED', '画像は引き継がれません。'],
    [/^xl\/(?:vbaProject\.bin|macrosheets\/)/i, 'MACROS_OMITTED', 'マクロは読み込み・実行・書き出しをしません。'],
    [/^xl\/(?:activeX|embeddings)\//i, 'EMBEDDED_OBJECTS_OMITTED', '埋め込みオブジェクトや ActiveX は引き継がれません。'],
    [/^xl\/externalLinks\/[^/]+\.xml$/i, 'EXTERNAL_LINKS_OMITTED', '外部ブックへの接続は読み込み・更新をしません。'],
    [/^xl\/pivotTables\/[^/]+\.xml$/i, 'PIVOT_TABLES_OMITTED', 'ピボットテーブルの設定は引き継がれません。'],
    [/^xl\/comments[^/]*\.xml$/i, 'COMMENTS_OMITTED', 'セルのコメントは引き継がれません。']
  ];
  for (const [pattern, code, message] of featurePaths) {
    const count = [...entries.keys()].filter(path => pattern.test(path)).length;
    if (count) warnings.add(code, message, undefined, count);
  }
  const activeMatch = workbookXml.match(/<(?:\w+:)?workbookView\b([^>]*)\/?\s*>/);
  const activeIndex = Number(activeMatch ? xlsxAttributes(activeMatch[1]).activeTab : 0) || 0;
  const date1904 = /<(?:\w+:)?workbookPr\b[^>]*\bdate1904\s*=\s*["'](?:1|true)["']/.test(workbookXml);
  const theme = [...xml.entries()].find(([path]) => /^xl\/theme\//.test(path))?.[1] || '';
  return { sheetData, date1904, activeName: sheets[activeIndex]?.name, theme };
}

function xlsxThemeColors(source) {
  const keys = ['lt1', 'dk1', 'lt2', 'dk2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6', 'hlink', 'folHlink'];
  const fallback = ['FFFFFF', '000000', 'EEECE1', '1F497D', '4F81BD', 'C0504D', '9BBB59', '8064A2', '4BACC6', 'F79646', '0000FF', '800080'];
  return keys.map((key, index) => {
    const block = source.match(new RegExp('<(?:\\w+:)?' + key + '\\b[^>]*>([\\s\\S]*?)<\\/(?:\\w+:)?' + key + '>'));
    const color = block?.[1].match(/<(?:\w+:)?(?:srgbClr|sysClr)\b([^>]*)\/?\s*>/);
    const attrs = color ? xlsxAttributes(color[1]) : {};
    return /^[0-9a-f]{6}$/i.test(attrs.lastClr || attrs.val || '') ? attrs.lastClr || attrs.val : fallback[index];
  });
}
function xlsxColor(value, theme, warnings, sheet) {
  if (!value) return undefined;
  let hex = typeof value.argb === 'string' && /^[0-9a-f]{6,8}$/i.test(value.argb) ? value.argb.slice(-6) : undefined;
  if (!hex && Number.isInteger(value.theme)) hex = theme[value.theme];
  if (!hex && Number.isInteger(value.indexed)) hex = ['000000', 'FFFFFF', 'FF0000', '00FF00', '0000FF', 'FFFF00', 'FF00FF', '00FFFF'][value.indexed % 8];
  if (!hex) { if (!value.auto) warnings.add('COLOR_APPROXIMATED', '一部の色は標準色になります。', sheet); return undefined; }
  if (typeof value.tint === 'number' && value.tint !== 0) {
    const tint = Math.max(-1, Math.min(1, value.tint));
    hex = hex.match(/../g).map(part => { const channel = parseInt(part, 16); return Math.round(tint < 0 ? channel * (1 + tint) : channel + (255 - channel) * tint).toString(16).padStart(2, '0'); }).join('');
    warnings.add('COLOR_APPROXIMATED', 'テーマ色の明るさを近い色に変換しました。', sheet);
  }
  if (value.indexed >= 16) warnings.add('COLOR_APPROXIMATED', '一部のインデックス色を近い色に変換しました。', sheet);
  return '#' + hex.toLowerCase();
}

function xlsxDateFormat(format) {
  const stripped = String(format || '').replace(/"[^"]*"|\\.|\[(?![hms]+\])[^\]]*\]/gi, '');
  return /[ymdhis]/i.test(stripped) && !/General/i.test(stripped);
}
function xlsxReadStyle(cell, theme, warnings, sheet, isDate) {
  const style = {}, font = cell.font || {}, alignment = cell.alignment || {}, fill = cell.fill || {};
  if (font.bold) style.bold = true;
  if (font.italic) style.italic = true;
  if (font.underline) style.underline = true;
  if (font.underline && font.underline !== true && font.underline !== 'single') warnings.add('STYLE_APPROXIMATED', '二重下線など一部の書式を標準の書式に変換しました。', sheet);
  const color = xlsxColor(font.color, theme, warnings, sheet);
  if (color) style.color = color;
  if (font.size != null && Number.isFinite(Number(font.size))) {
    style.fontSize = XLSX_FONT_SIZES.reduce((best, size) => Math.abs(size - font.size) < Math.abs(best - font.size) ? size : best, 13);
    if (style.fontSize !== Number(font.size)) warnings.add('FONT_SIZE_APPROXIMATED', '文字サイズを、そろばんで使える近いサイズに変換しました。', sheet);
  }
  if (font.name) {
    style.font = /(?:Mincho|明朝|Times|Georgia|Cambria|Baskerville|Garamond)/i.test(font.name) ? 'serif' : /(?:Mono|Courier|Consolas|Menlo|Source Code|ＭＳ ゴシック|MS Gothic)/i.test(font.name) ? 'mono' : 'sans';
    if (!Object.values(XLSX_FONTS).includes(font.name)) warnings.add('FONT_FAMILY_APPROXIMATED', 'フォントをゴシック・明朝・等幅のいずれかに置き換えました。', sheet);
  }
  if (['left', 'center', 'right'].includes(alignment.horizontal)) style.align = alignment.horizontal;
  else if (alignment.horizontal && alignment.horizontal !== 'general') warnings.add('ALIGNMENT_APPROXIMATED', '一部の文字配置を標準の配置に変換しました。', sheet);
  if (alignment.wrapText || alignment.indent || alignment.textRotation || alignment.shrinkToFit || (alignment.vertical && alignment.vertical !== 'bottom') || font.strike || font.vertAlign) warnings.add('STYLE_OMITTED', '折り返し・縦配置・文字回転などの詳細書式は引き継がれません。', sheet);
  if (fill.type === 'pattern' && fill.pattern === 'solid') {
    const background = xlsxColor(fill.fgColor, theme, warnings, sheet);
    if (background) style.background = background;
  } else if (fill.type === 'gradient' || (fill.pattern && fill.pattern !== 'none')) warnings.add('FILL_APPROXIMATED', 'グラデーションやパターンの塗りつぶしは引き継がれません。', sheet);
  if (cell.border && Object.values(cell.border).some(part => part && typeof part === 'object' && part.style)) warnings.add('BORDERS_OMITTED', 'セルごとの罫線は引き継がれません。標準のグリッド線で表示します。', sheet);
  const numberFormat = cell.numFmt || 'General';
  if (isDate || xlsxDateFormat(numberFormat)) {
    style.format = 'date';
    if (!/^(?:yyyy[/-]mm[/-]dd|mm-dd-yy|m\/d\/yy|yyyy年m月d日)$/i.test(numberFormat)) warnings.add('DATE_FORMAT_APPROXIMATED', '日付を yyyy/mm/dd 形式で表示します。時刻を含む値も数値として保持しますが、時刻の表示書式は引き継がれません。', sheet);
  } else if (/%/.test(numberFormat.replace(/"[^"]*"/g, ''))) style.format = 'percent';
  else if (/[¥￥円]/.test(numberFormat)) style.format = 'yen';
  else if (/#,##0/.test(numberFormat)) style.format = 'number';
  else if (!['General', '@', '0'].includes(numberFormat)) { style.format = 'number'; warnings.add('NUMBER_FORMAT_APPROXIMATED', '独自の数値書式は標準の数値表示になります。元の数値は保持します。', sheet); }
  if (['percent', 'number', 'yen'].includes(style.format) && numberFormat !== XLSX_NUMFMTS[style.format] && (/%/.test(numberFormat) || /#,##0/.test(numberFormat) || /[¥￥円]/.test(numberFormat))) warnings.add('NUMBER_FORMAT_APPROXIMATED', '桁数・小数点以下などの数値表示を標準の書式に変換しました。元の数値は保持します。', sheet);
  return style;
}

function xlsxMapFormulaOutsideStrings(formula, transform) {
  let output = '', chunk = '', quote = null;
  for (let i = 0; i < formula.length; i++) {
    const char = formula[i];
    if (quote) {
      output += char;
      if (char === quote) { if (formula[i + 1] === quote) output += formula[++i]; else quote = null; }
    } else if (char === '"' || char === "'") { output += transform(chunk) + char; chunk = ''; quote = char; }
    else chunk += char;
  }
  return output + transform(chunk);
}
function xlsxNormalizeFormula(formula) {
  return xlsxMapFormulaOutsideStrings(formula, text => {
    let output = '', offset = 0;
    for (const match of text.matchAll(/[\p{L}_$][\p{L}\p{N}_.$]*(?=\s*[!！])/gu)) {
      output += text.slice(offset, match.index).normalize('NFKC');
      const name = match[0];
      // A full-width sheet name can coexist with its normalized spelling.
      output += name.normalize('NFKC') === name ? name : "'" + name.replace(/'/g, "''") + "'";
      offset = match.index + name.length;
    }
    return output + text.slice(offset).normalize('NFKC');
  });
}
function xlsxImportFormula(formula) {
  return xlsxMapFormulaOutsideStrings(String(formula), text => text.replace(/(?:_xlfn\.|_xlws\.)+([A-Za-z][\w.]*)\s*(?=\()/g, (whole, name) => SUPPORTED_FUNCTIONS.includes(name.toUpperCase()) ? name.toUpperCase() : whole));
}
function xlsxUnsafeFormula(raw) {
  const normalized = xlsxMapFormulaOutsideStrings(String(raw), text => text.normalize('NFKC'));
  const withoutStrings = normalized.replace(/"(?:[^"]|"")*"/g, '""');
  return /\[[^\]]+\][^!\r\n]*!/.test(withoutStrings) || /\|[^!]*!/.test(withoutStrings) || /\b(?:WEBSERVICE|FILTERXML|HYPERLINK|IMAGE|RTD|CALL|REGISTER(?:\.ID)?|EXEC|RUN|SQL\.REQUEST|DDE)\s*\(/i.test(withoutStrings);
}
function xlsxFormulaWarnings(raw, warnings, sheet) {
  if (xlsxUnsafeFormula(raw)) { warnings.add('EXTERNAL_FORMULA_DISABLED', '外部接続・リンク・実行を伴う数式は、このアプリでは実行しません。Excel 出力時は文字列になります。', sheet); return; }
  const inspection = inspectFormula(raw);
  if (!inspection.syntaxValid) warnings.add('UNSUPPORTED_FORMULA_SYNTAX', 'このアプリで計算できない構文の数式があります。数式の文字列は保持します。', sheet);
  else if (!inspection.supported) warnings.add('UNSUPPORTED_FORMULA_FUNCTION', 'このアプリで未対応の関数があります。数式は保持しますが、結果は Excel と一致しない場合があります。', sheet);
}

function xlsxLiteral(value) {
  const text = String(value ?? '');
  return text.startsWith("'") || /^\s*[=＝]/.test(text) || numericValue(text) !== null ? "'" + text : text;
}
function xlsxReadCell(cell, preflight, warnings, sheetName) {
  const value = cell.value;
  if (cell.isMerged && cell.master?.address !== cell.address) return { raw: '' };
  if (cell.formula) {
    const raw = '=' + xlsxImportFormula(cell.formula);
    if (preflight.date1904) warnings.add('DATE_SYSTEM_FORMULAS_RECALCULATED', 'このブックは1904年基準の日付を使っています。日付の値は1900年基準へ変換しますが、数式は1900年基準で再計算するため、日付・日付シリアル値を使う計算結果が1,462日分など変わる場合があります。元のファイルを保管し、取り込み前に確認してください。');
    xlsxFormulaWarnings(raw, warnings, sheetName);
    if (cell.model?.shareType === 'array') warnings.add('ARRAY_FORMULA_NOT_SUPPORTED', '配列数式の連動・展開は再現されません。各セルの内容は保持します。', sheetName);
    return { raw };
  }
  if (value instanceof Date) {
    const original = preflight.sheetData.get(sheetName)?.numbers.get(cell.address);
    const serial = original == null ? 25569 + value.getTime() / XLSX_DAY : original + (preflight.date1904 ? 1462 : 0);
    if (!Number.isFinite(serial)) xlsxFail('INVALID_DATE', `「${sheetName}」の${cell.address}に不正な日付があります。`);
    return { raw: String(serial), date: true };
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) xlsxFail('INVALID_NUMBER', `「${sheetName}」の${cell.address}に不正な数値があります。`);
    return { raw: String(value) };
  }
  if (typeof value === 'boolean') {
    warnings.add('BOOLEAN_AS_FORMULA', '論理値を =TRUE / =FALSE の定数式で保持します。', sheetName);
    return { raw: value ? '=TRUE' : '=FALSE' };
  }
  if (value && typeof value === 'object') {
    if (value.error) {
      const error = String(value.error);
      if (!XLSX_ERRORS.has(error)) xlsxFail('UNSUPPORTED_CELL', `「${sheetName}」の${cell.address}に未対応のエラー値があります。内容は変更せず、読み込みを中止しました。`);
      return { raw: '=' + error };
    }
    if (Array.isArray(value.richText)) { warnings.add('RICH_TEXT_FLATTENED', 'セル内で文字ごとに異なる書式は、通常の文字列になります。', sheetName); return { raw: xlsxLiteral(value.richText.map(part => part.text || '').join('')) }; }
    if (value.hyperlink != null) { warnings.add('HYPERLINKS_REMOVED', 'ハイパーリンクは文字だけを読み込み、接続先を開きません。', sheetName); return { raw: xlsxLiteral(value.text ?? value.hyperlink) }; }
    xlsxFail('UNSUPPORTED_CELL', `「${sheetName}」の${cell.address}に未対応のセル形式があります。`);
  }
  return { raw: value == null ? '' : xlsxLiteral(value) };
}

/** Import an XLSX into a new, detached workbook. The caller reviews warnings before committing it. */
export async function importXlsx(arrayBuffer, options = {}) {
  const warnings = xlsxWarnings(), bytes = xlsxBytes(arrayBuffer);
  const preflight = xlsxPreflight(bytes, warnings), workbook = new globalThis.ExcelJS.Workbook();
  try { await workbook.xlsx.load(bytes); }
  catch { xlsxFail('INVALID_FILE', 'Excel ファイルを読み込めませんでした。暗号化されていない .xlsx で保存し直してください。'); }
  if (!workbook.worksheets.length) xlsxFail('NO_WORKSHEETS', '読み込めるワークシートがありません。');
  if (workbook.worksheets.length > XLSX_LIMITS.sheets) xlsxFail('SHEET_LIMIT_EXCEEDED', '1ブックの上限は15シートです。');
  const theme = xlsxThemeColors(preflight.theme);
  const suppliedName = String(options.name || '読み込んだブック').replace(/\.xlsx$/i, '');
  if (suppliedName.length > 80) warnings.add('BOOK_NAME_SHORTENED', 'ブック名を80文字に短縮しました。');
  const book = { id: xlsxId(), name: xlsxTruncateText(suppliedName, 80) || '読み込んだブック', sheets: [], activeSheet: '', updatedAt: Date.now(), revision: 0, sample: false };
  for (const worksheet of workbook.worksheets) {
    const name = worksheet.name;
    if (worksheet.rowCount > XLSX_LIMITS.rows || worksheet.columnCount > XLSX_LIMITS.columns) xlsxFail('GRID_LIMIT_EXCEEDED', `「${name}」は500行 × 52列の上限を超えています。`);
    const dimension = preflight.sheetData.get(name)?.dimensionRef?.split(':').at(-1);
    const extent = dimension ? parseRef(dimension) : null;
    const view = preflight.sheetData.get(name);
    const rows = Math.max(40, worksheet.rowCount, extent ? extent.r + 1 : 0, view?.lastRow || 0);
    const cols = Math.max(12, worksheet.columnCount, extent ? extent.c + 1 : 0, view?.lastColumn || 0);
    const sheet = { id: xlsxId(), name, rows, cols, widths: [], cells: {}, kind: 'blank', freezeRows: Math.min(rows, view?.freezeRows || 0), freezeCols: Math.min(cols, view?.freezeCols || 0) };
    if (view?.filterRef) sheet.filter = { range: view.filterRef, criteria: [] };
    for (let c = 1; c <= cols; c++) {
      const width = worksheet.getColumn(c).width ?? worksheet.properties.defaultColWidth;
      const pixels = Number.isFinite(width) ? Math.round(width * 7 + 5) : 108;
      sheet.widths.push(Math.max(64, Math.min(360, pixels)));
      if (pixels < 64 || pixels > 360) warnings.add('COLUMN_WIDTH_CLAMPED', '列幅を64〜360pxの範囲に調整しました。', name);
    }
    for (let r = 1; r <= rows; r++) for (let c = 1; c <= cols; c++) {
      const source = worksheet.getCell(r, c);
      if (source.value == null && !Object.keys(source.style || {}).length) continue;
      const imported = xlsxReadCell(source, preflight, warnings, name);
      if (imported.raw.length > XLSX_LIMITS.cellCharacters) xlsxFail('CELL_LIMIT_EXCEEDED', `「${name}」の${source.address}が1セル8,192文字の上限を超えています。`);
      const style = xlsxReadStyle(source, theme, warnings, name, imported.date);
      if (imported.raw !== '' || Object.keys(style).length) sheet.cells[source.address] = { raw: imported.raw, ...style };
    }
    sheet.tables = normalizeTables(sheet, view?.tables || []);
    if (sheet.filter && sheet.tables.some(table => {
      const a = sheet.filter.range.split(':').map(parseRef), b = table.range.split(':').map(parseRef);
      const aEnd = a.at(-1), bEnd = b.at(-1);
      return a[0].r <= bEnd.r && aEnd.r >= b[0].r && a[0].c <= bEnd.c && aEnd.c >= b[0].c;
    })) {
      sheet.filter = null;
      warnings.add('SHEET_FILTER_OVERLAPS_TABLE', 'テーブルと重なるシートの通常フィルターを解除しました。絞り込みはテーブルの見出しから設定できます。', name);
    }
    book.sheets.push(sheet);
  }
  book.activeSheet = (book.sheets.find(sheet => sheet.name === preflight.activeName) || book.sheets[0]).id;
  if (new TextEncoder().encode(JSON.stringify(book)).byteLength > MAX_XLSX_BYTES) xlsxFail('WORKBOOK_TOO_LARGE', '読み込んだブックのデータが32MBを超えています。シートやセルの内容を減らしてください。');
  return { book, warnings: warnings.list() };
}

function xlsxValidateBook(book) {
  if (!book || !Array.isArray(book.sheets) || !book.sheets.length) xlsxFail('INVALID_WORKBOOK', '保存するブックにシートがありません。');
  if (book.sheets.length > XLSX_LIMITS.sheets) xlsxFail('SHEET_LIMIT_EXCEEDED', '1ブックの上限は15シートです。');
  const names = new Set();
  for (const sheet of book.sheets) {
    xlsxValidateSheetName(sheet.name);
    const normalized = sheet.name.toLocaleUpperCase();
    if (names.has(normalized)) xlsxFail('DUPLICATE_SHEET_NAME', 'Excel では大文字・小文字だけが違うシート名を使えません。シート名を変更してください。');
    names.add(normalized);
    if (!Number.isInteger(sheet.rows) || !Number.isInteger(sheet.cols) || sheet.rows < 1 || sheet.cols < 1 || sheet.rows > XLSX_LIMITS.rows || sheet.cols > XLSX_LIMITS.columns || !sheet.cells || typeof sheet.cells !== 'object' || Array.isArray(sheet.cells)) xlsxFail('INVALID_WORKBOOK', `「${sheet.name}」の行・列・セルの形式を確認してください。`);
    for (const [address, entry] of Object.entries(sheet.cells)) {
      xlsxCheckRef(address, sheet.name);
      if (!entry || typeof entry !== 'object' || typeof entry.raw !== 'string') xlsxFail('INVALID_WORKBOOK', `「${sheet.name}」の${address}の入力値は文字列で指定してください。`);
      if (entry.raw.length > XLSX_LIMITS.cellCharacters) xlsxFail('CELL_LIMIT_EXCEEDED', `「${sheet.name}」の${address}が1セル8,192文字の上限を超えています。`);
      if (!xlsxWellFormedText(entry.raw)) xlsxFail('INVALID_CELL_TEXT', `「${sheet.name}」の${address}に Excel で保持できない不正な文字（孤立したサロゲート）があります。文字を修正してください。内容は変更せず、書き出しを中止しました。`);
      if (/^\s*[=＝]/.test(entry.raw) && /[\u0000-\u0008\u000b-\u001f\u007f\ufffe\uffff]/.test(entry.raw)) xlsxFail('INVALID_FORMULA_TEXT', `「${sheet.name}」の${address}の数式に、Excel 変換で保持できない改行コード（CR）または制御文字があります。文字を修正してください。内容は変更せず、書き出しを中止しました。`);
    }
    try { normalizeTables(sheet); }
    catch { xlsxFail('INVALID_WORKBOOK', `「${sheet.name}」のテーブル設定を確認してください。`); }
  }
}
function xlsxWriteStyle(target, entry) {
  const font = { name: XLSX_FONTS[entry.font] || XLSX_FONTS.sans, size: XLSX_FONT_SIZES.includes(entry.fontSize) ? entry.fontSize : 13 };
  for (const flag of ['bold', 'italic', 'underline']) if (entry[flag]) font[flag] = true;
  if (/^#[0-9a-f]{6}$/i.test(entry.color || '')) font.color = { argb: 'FF' + entry.color.slice(1).toUpperCase() };
  if (XLSX_FONT_SIZES.includes(entry.fontSize)) font.size = entry.fontSize;
  if (XLSX_FONTS[entry.font]) font.name = XLSX_FONTS[entry.font];
  if (Object.keys(font).length) target.font = font;
  if (/^#[0-9a-f]{6}$/i.test(entry.background || '')) target.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + entry.background.slice(1).toUpperCase() } };
  if (['left', 'center', 'right'].includes(entry.align)) target.alignment = { horizontal: entry.align };
  if (XLSX_NUMFMTS[entry.format]) target.numFmt = XLSX_NUMFMTS[entry.format];
}

function xlsxNativeTableName(input, names) {
  let name = input;
  // Excel names are workbook-scoped. Avoid object-special names used internally
  // by the bundled writer as well as Excel's reserved/cell-reference names.
  const valid = typeof name === 'string' && name.length <= 255 && /^[\p{L}_\\][\p{L}\p{M}\p{N}_.]*$/u.test(name) && !/^(?:[CR]|\$?[A-Z]{1,3}\$?\d+|R\d+C\d+)$/i.test(name) && !Object.prototype.hasOwnProperty.call(Object.prototype, name) && name !== 'prototype';
  if (!valid || names.has(name.toLocaleUpperCase())) { let next = 1; do { name = 'Table' + next++; } while (names.has(name.toLocaleUpperCase())); }
  names.add(name.toLocaleUpperCase());
  return name;
}

function xlsxWriteTables(worksheet, sheet, book, cache, warnings, names) {
  for (const table of normalizeTables(sheet)) {
    const refs = table.range.split(':'), first = parseRef(refs[0]), last = parseRef(refs.at(-1));
    const name = xlsxNativeTableName(table.name, names), seen = new Set(), columns = [], labels = [];
    if (name !== table.name) warnings.add('TABLE_NAME_ADJUSTED', `テーブル「${table.name}」を Excel で使える名前「${name}」で書き出します。テーブル名を使う数式は更新されません。`, sheet.name);
    for (let c = first.c; c <= last.c; c++) {
      const address = colName(c) + (first.r + 1), entry = sheet.cells[address] || { raw: '' };
      let label = entry.raw.startsWith("'") ? entry.raw.slice(1) : entry.raw;
      if (/^\s*[=＝]/.test(entry.raw)) {
        const result = evaluateCellResult(address, sheet.cells, cache, new Set(), { sheetId: sheet.id, sheets: book.sheets });
        label = String(result.error ?? result.value ?? '');
        warnings.add('TABLE_HEADER_FORMULA_AS_TEXT', '見出し行の数式は、Excel テーブルの列名として計算結果の文字列を書き出します。元の数式は JSON バックアップに保持されます。', sheet.name);
      } else if (!entry.raw.startsWith("'") && numericValue(entry.raw) !== null) warnings.add('TABLE_HEADER_NUMBER_AS_TEXT', '見出し行の数値は、Excel テーブルの列名として文字列になります。見出しを参照する集計などの計算結果が変わる場合があります。元の数値は JSON バックアップに保持されます。', sheet.name);
      const original = label;
      label = label.trim() ? xlsxTruncateText(label, 255) : '列' + (c - first.c + 1);
      let suffix = 2, base = label;
      while (seen.has(label.toLocaleUpperCase())) { const ending = '_' + suffix++; label = xlsxTruncateText(base, 255 - ending.length) + ending; }
      seen.add(label.toLocaleUpperCase());
      if (original !== label) warnings.add('TABLE_HEADER_ADJUSTED', '空白・重複・長すぎる見出しを、Excel テーブルで使える列名に調整しました。', sheet.name);
      labels.push(label);
      columns.push({ name: xlsxEncodeString(label, true), filterButton: true });
    }
    const rows = [];
    for (let r = first.r + 1; r <= last.r; r++) rows.push(Array.from({ length: last.c - first.c + 1 }, (_, i) => worksheet.getCell(r + 1, first.c + i + 1).value));
    worksheet.addTable({ name, ref: colName(first.c) + (first.r + 1), headerRow: true, totalsRow: false, style: { theme: 'TableStyleMedium4', showRowStripes: table.banded !== false }, columns, rows });
    // addTable copies attribute-escaped names into cells. Text nodes retain LF
    // and tab literally, so write their separately escaped header text back.
    labels.forEach((label, i) => { worksheet.getCell(first.r + 1, first.c + i + 1).value = xlsxEncodeString(label); });
    if (table.criteria.length) warnings.add('TABLE_FILTER_CRITERIA_OMITTED', 'テーブルは保持します。絞り込み条件は引き継がず、すべての行を書き出します。', sheet.name);
  }
}

/** Export a new XLSX. It never replaces the JSON file used for browser/native autosave. */
export async function exportXlsx(book) {
  xlsxValidateBook(book);
  const warnings = xlsxWarnings(), workbook = new globalThis.ExcelJS.Workbook();
  workbook.creator = 'そろばん';
  workbook.title = String(book.name || 'ブック');
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.calcProperties.fullCalcOnLoad = true;
  workbook.views = [{ activeTab: Math.max(0, book.sheets.findIndex(sheet => sheet.id === book.activeSheet)) }];
  const cache = new Map(), tableNames = new Set();
  for (const sheet of book.sheets) {
    const worksheet = workbook.addWorksheet(sheet.name);
    if (sheet.freezeRows || sheet.freezeCols) worksheet.views = [{ state: 'frozen', xSplit: Math.max(0, Math.min(sheet.cols, Math.trunc(Number(sheet.freezeCols) || 0))), ySplit: Math.max(0, Math.min(sheet.rows, Math.trunc(Number(sheet.freezeRows) || 0))) }];
    if (sheet.filter?.range) {
      xlsxCheckRef(sheet.filter.range, sheet.name);
      worksheet.autoFilter = sheet.filter.range;
      if (sheet.filter.criteria?.length) warnings.add('FILTER_CRITERIA_OMITTED', 'フィルター範囲を保存します。絞り込み条件は引き継がず、すべての行を書き出します。', sheet.name);
    }
    for (let c = 0; c < sheet.cols; c++) worksheet.getColumn(c + 1).width = (Math.max(64, Math.min(360, Number(sheet.widths?.[c]) || 108)) - 5) / 7;
    for (const [address, entry] of Object.entries(sheet.cells)) {
      const target = worksheet.getCell(address), raw = entry.raw;
      if (/^\s*[=＝]/.test(raw)) {
        if (xlsxUnsafeFormula(raw)) {
          target.value = xlsxEncodeString(raw);
          warnings.add('EXTERNAL_FORMULA_AS_TEXT', '外部接続・リンク・実行を伴う数式を、実行されない文字列として書き出しました。', sheet.name);
        } else {
          const inspection = inspectFormula(raw);
          let formula = xlsxNormalizeFormula(raw.trimStart().slice(1));
          formula = xlsxMapFormulaOutsideStrings(formula, text => text.replace(/(?<![\w.])(?:XLOOKUP|CONCAT)(?=\s*\()/gi, name => '_xlfn.' + name.toUpperCase()));
          const value = { formula };
          if (inspection.supported) {
            const result = evaluateCellResult(address, sheet.cells, cache, new Set(), { sheetId: sheet.id, sheets: book.sheets });
            if (result.error && XLSX_ERRORS.has(result.error)) value.result = { error: result.error };
            else if (!result.error && (typeof result.value === 'number' && Number.isFinite(result.value) || typeof result.value === 'boolean' || typeof result.value === 'string')) value.result = typeof result.value === 'string' ? xlsxEncodeString(result.value) : result.value;
            else warnings.add('FORMULA_RESULT_UNAVAILABLE', '一部の数式の計算結果を保存できませんでした。Excel で再計算してください。', sheet.name);
          } else xlsxFormulaWarnings(raw, warnings, sheet.name);
          target.value = value;
        }
      } else if (raw.startsWith("'")) target.value = xlsxEncodeString(raw.slice(1));
      else { const number = numericValue(raw); target.value = number === null ? xlsxEncodeString(raw) : number; }
      xlsxWriteStyle(target, entry);
    }
    xlsxWriteTables(worksheet, sheet, book, cache, warnings, tableNames);
    const lastAddress = colName(sheet.cols - 1) + sheet.rows;
    if (!sheet.cells[lastAddress] && worksheet.getCell(lastAddress).value == null) worksheet.getCell(lastAddress).value = '';
  }
  let output;
  try { output = await workbook.xlsx.writeBuffer({ useStyles: true, useSharedStrings: true, zip: { compression: 'DEFLATE', compressionOptions: { level: 6 } } }); }
  catch { xlsxFail('EXPORT_FAILED', 'Excel ファイルを作成できませんでした。ブックの内容を確認してください。'); }
  const data = new Uint8Array(output.buffer, output.byteOffset || 0, output.byteLength);
  if (data.byteLength > MAX_XLSX_BYTES) xlsxFail('FILE_TOO_LARGE', '作成した Excel ファイルが32MBを超えています。');
  return { data, warnings: warnings.list() };
}
