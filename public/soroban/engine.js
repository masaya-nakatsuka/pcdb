/* Small, dependency-free spreadsheet expression engine. No dynamic code execution. */
const MAX_ROW = 1048576;
const MAX_COL = 16384;
const MAX_RANGE = 26000;
const RANGE_CACHE = Symbol('evaluated ranges');
const MAX_DEPTH = 128;
const MAX_TEXT = 32767;
const ERRORS = new Set(['#DIV/0!', '#REF!', '#VALUE!', '#NAME?', '#CYCLE!', '#NUM!', '#ERROR!', '#N/A', '#SPILL!', '#NULL!', '#LIMIT!', '#SCOPE!']);
class CalcError extends Error { constructor(code) { super(code); this.code = code; } }
// Resource/policy diagnostics cannot be caught by IFERROR or consumed by COUNT.
// They terminate this calculation, rather than becoming ordinary cell data.
class CalcBoundaryError extends CalcError { constructor(code, reason) { super(code); this.reason = reason; } }
const CALC_BUDGET = Symbol('calculation budget');
const CALC_POLICY = Symbol('calculation access policy');
export const CALCULATION_LIMITS = Object.freeze({ maxOperations: 5000000, maxCells: 100000, maxBytes: 16 * 1024 * 1024, maxMilliseconds: 750 });
const calculationNow = () => globalThis.performance?.now?.() ?? Date.now();
function newBudget(options = {}) {
  const limits = {};
  for (const [name, maximum] of Object.entries(CALCULATION_LIMITS)) {
    const requested = options[name] ?? maximum;
    if (!Number.isFinite(requested) || requested <= 0 || (name !== 'maxMilliseconds' && !Number.isSafeInteger(requested))) throw new TypeError('Invalid calculation limit: ' + name);
    limits[name] = Math.min(requested, maximum);
  }
  return { limits: Object.freeze(limits), operations: 0, cells: 0, bytes: 0, elapsed: 0, active: 0, started: 0, nextClockCheck: 0, exceeded: null };
}
function calculationBudget(cache) {
  let budget = cache instanceof Map ? cache.get(CALC_BUDGET) : cache[CALC_BUDGET];
  if (!budget) {
    budget = newBudget();
    if (cache instanceof Map) cache.set(CALC_BUDGET, budget); else Object.defineProperty(cache, CALC_BUDGET, { value: budget, configurable: true });
  }
  return budget;
}
export function createEvaluationCache(limits = {}) {
  const cache = new Map(); cache.set(CALC_BUDGET, newBudget(limits)); return cache;
}
export function getEvaluationStatus(cache) {
  const budget = calculationBudget(cache);
  return { operations: budget.operations, cells: budget.cells, estimated_bytes: budget.bytes, elapsed_ms: budget.elapsed + (budget.active ? calculationNow() - budget.started : 0), exceeded: !!budget.exceeded, reason: budget.exceeded?.reason ?? null, limits: { ...budget.limits } };
}
function stopCalculation(budget, reason) {
  budget.exceeded ||= new CalcBoundaryError('#LIMIT!', reason);
  throw budget.exceeded;
}
function spend(budget, operations = 1, bytes = 0, cells = 0) {
  if (budget.exceeded) throw budget.exceeded;
  budget.operations += operations; budget.bytes += bytes; budget.cells += cells;
  if (budget.operations > budget.limits.maxOperations) stopCalculation(budget, 'operations');
  if (budget.cells > budget.limits.maxCells) stopCalculation(budget, 'cells');
  if (budget.bytes > budget.limits.maxBytes) stopCalculation(budget, 'memory');
  if (budget.operations >= budget.nextClockCheck) {
    budget.nextClockCheck = budget.operations + 256;
    if (budget.elapsed + (budget.active ? calculationNow() - budget.started : 0) > budget.limits.maxMilliseconds) stopCalculation(budget, 'time');
  }
}
function retainValue(budget, value, overhead = 32) { spend(budget, 0, overhead + (typeof value === 'string' ? value.length * 2 : 0)); }
function withCalculationBudget(cache, calculate, context) {
  const policy = typeof context?.authorizeCell === 'function' ? context.authorizeCell : null;
  const previous = cache instanceof Map ? cache.get(CALC_POLICY) : cache[CALC_POLICY];
  // A cache may not retain unrestricted results when a different scope is used.
  if (previous !== undefined && previous !== policy) {
    const limits = calculationBudget(cache).limits;
    if (cache instanceof Map) { cache.clear(); cache.set(CALC_BUDGET, newBudget(limits)); }
    else { for (const key of Reflect.ownKeys(cache)) delete cache[key]; Object.defineProperty(cache, CALC_BUDGET, { value: newBudget(limits), configurable: true }); }
  }
  if (cache instanceof Map) cache.set(CALC_POLICY, policy); else Object.defineProperty(cache, CALC_POLICY, { value: policy, configurable: true });
  const budget = calculationBudget(cache);
  if (!budget.active++) budget.started = calculationNow();
  try {
    if (budget.elapsed > budget.limits.maxMilliseconds) stopCalculation(budget, 'time');
    spend(budget, 0);
    const value = calculate(budget);
    if (budget.elapsed + calculationNow() - budget.started > budget.limits.maxMilliseconds) stopCalculation(budget, 'time');
    return value;
  }
  finally {
    if (!--budget.active) { budget.elapsed += calculationNow() - budget.started; budget.started = 0; }
  }
}
class PendingCell {
  constructor(key, cells, context, cacheKey, raw) { Object.assign(this, { key, cells, context, cacheKey, raw, state: { memo: new WeakMap(), ranges: new WeakMap() } }); }
}
const fail = code => { throw new CalcError(code); };
// Keep calculation errors distinct from text such as ="#N/A" or '#REF!.
const isError = value => value instanceof CalcError;
const isCycle = value => isError(value) && value.code === '#CYCLE!';
const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);

export function colName(index) {
  if (!Number.isInteger(index) || index < 0 || index >= MAX_COL) return '';
  let result = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) result = String.fromCharCode(65 + (n - 1) % 26) + result;
  return result;
}

export function parseRef(input) {
  const match = String(input).match(/^\$?([A-Z]+)\$?([1-9]\d*)$/i);
  if (!match) return null;
  let c = 0;
  for (const char of match[1].toUpperCase()) c = c * 26 + char.charCodeAt(0) - 64;
  const r = Number(match[2]);
  return c <= MAX_COL && r <= MAX_ROW && Number.isSafeInteger(r) ? { r: r - 1, c: c - 1 } : null;
}

function canonicalRef(input) {
  const parsed = parseRef(input);
  if (!parsed) fail('#REF!');
  return colName(parsed.c) + (parsed.r + 1);
}

export function numericValue(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  let normalized = value.normalize('NFKC').trim();
  if (!normalized || normalized.startsWith("'")) return null;
  let percent = false;
  if (normalized.endsWith('%')) { percent = true; normalized = normalized.slice(0, -1).trim(); }
  normalized = normalized.replace(/^[¥￥]\s*/, '').replace(/\s*円$/, '');
  // Commas must be thousands separators, never an accidental decimal or date.
  if (normalized.includes(',')) {
    if (!/^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(normalized)) return null;
    normalized = normalized.replace(/,/g, '');
  }
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(normalized)) return null;
  const number = Number(normalized) / (percent ? 100 : 1);
  return Number.isFinite(number) ? number : null;
}

function literalCellValue(raw) {
  const text = String(raw ?? '');
  if (typeof raw === 'boolean') return raw;
  if (text.startsWith("'")) return text.slice(1);
  if (text === '') return null;
  const parsed = numericValue(raw);
  return parsed === null ? text : parsed;
}

/** Parse a non-formula input without creating a calculation cache or budget. */
export function parseCellLiteral(raw) {
  if (/^\s*[=＝]/.test(String(raw ?? ''))) return { value: '#VALUE!', error: '#VALUE!' };
  return { value: publicValue(literalCellValue(raw)), error: null };
}

function normalizeFormula(input) {
  let quote = null, result = '';
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quote && char === quote) {
      if (input[i + 1] === quote) { result += quote + quote; i++; continue; }
      quote = null;
      result += char;
    } else if (!quote && (char === '"' || char === "'")) { quote = char; result += char; }
    else if (!quote && /^[\p{L}_$]/u.test(char)) {
      const word = input.slice(i).match(/^[\p{L}_$][\p{L}\p{N}_.$]*/u)[0];
      // Sheet names are identifiers, and full-width/half-width names can be
      // distinct sheets. Normalize formula syntax and refs, never the name.
      result += /^\s*[!！]/u.test(input.slice(i + word.length)) ? word : word.normalize('NFKC');
      i += word.length - 1;
    } else result += quote ? char : char.normalize('NFKC');
  }
  return result;
}

function tokenize(input) {
  if (input.length > 8192) fail('#VALUE!');
  const source = normalizeFormula(input);
  const tokens = [];
  let i = 0;
  while (i < source.length) {
    if (tokens.length > 4096) fail('#VALUE!');
    const char = source[i], start = i;
    if (/\s/.test(char)) { i++; continue; }
    if (char === '"' || char === "'") {
      const quote = char;
      i++;
      let text = '', closed = false;
      while (i < source.length) {
        if (source[i] === quote) {
          if (source[i + 1] === quote) { text += quote; i += 2; }
          else { i++; closed = true; break; }
        } else text += source[i++];
      }
      if (!closed) fail('#VALUE!');
      tokens.push({ type: quote === '"' ? 'literal' : 'sheet', value: text, start, end: i });
      continue;
    }
    const error = source.slice(i).match(/^#(?:DIV\/0!|REF!|VALUE!|NAME\?|CYCLE!|NUM!|ERROR!|N\/A|SPILL!|NULL!|LIMIT!|SCOPE!)/i);
    if (error) { i += error[0].length; tokens.push({ type: 'error', value: error[0].toUpperCase(), start, end: i }); continue; }
    const number = source.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
    if (number) { i += number[0].length; tokens.push({ type: 'literal', value: Number(number[0]), start, end: i }); continue; }
    const name = source.slice(i).match(/^[\p{L}_$][\p{L}\p{N}_.$]*/u);
    if (name) { i += name[0].length; tokens.push({ type: 'name', value: name[0], start, end: i }); continue; }
    const pair = source.slice(i, i + 2);
    if (['>=', '<=', '<>'].includes(pair)) { i += 2; tokens.push({ type: pair, start, end: i }); continue; }
    if ('+-*/^%():,=<> &!'.includes(char)) { i++; tokens.push({ type: char, start, end: i }); continue; }
    fail('#VALUE!');
  }
  tokens.push({ type: 'end' });
  return tokens;
}

function parse(input) {
  const source = normalizeFormula(input), tokens = tokenize(source);
  let index = 0, depth = 0;
  const peek = type => tokens[index].type === type;
  const take = type => { if (!peek(type)) fail('#VALUE!'); return tokens[index++]; };
  const binaryChain = (read, operators) => {
    let left = read();
    while (operators.includes(tokens[index].type)) {
      const op = tokens[index++].type;
      left = { type: 'binary', op, left, right: read() };
    }
    return left;
  };
  const comparison = () => binaryChain(concat, ['=', '<>', '<', '>', '<=', '>=']);
  const concat = () => binaryChain(addition, ['&']);
  const addition = () => binaryChain(multiply, ['+', '-']);
  const multiply = () => binaryChain(power, ['*', '/']);
  // Spreadsheet convention: unary minus precedes exponentiation.
  const power = () => binaryChain(unary, ['^']);
  function unary() {
    if (++depth > MAX_DEPTH) fail('#VALUE!');
    let result;
    if (peek('+') || peek('-')) result = { type: 'unary', op: tokens[index++].type, value: unary() };
    else {
      result = primary();
      while (peek('%')) { index++; result = { type: 'unary', op: '%', value: result }; }
    }
    depth--;
    return result;
  }
  function primary() {
    if (peek('literal')) return { type: 'literal', value: tokens[index++].value };
    if (peek('error')) return { type: 'error', value: tokens[index++].value };
    if (peek('(')) { index++; const result = comparison(); take(')'); return result; }
    if (!peek('name') && !peek('sheet')) fail('#VALUE!');
    const first = tokens[index++], name = first.value.toUpperCase();
    if (first.type === 'name' && peek('(')) {
      index++;
      const args = [];
      if (!peek(')')) {
        args.push(peek(',') ? { type: 'missing' } : comparison());
        while (peek(',')) { index++; args.push(peek(',') || peek(')') ? { type: 'missing' } : comparison()); }
      }
      take(')');
      return { type: 'function', name, args };
    }
    if (!peek('!') && first.type === 'name' && (name === 'TRUE' || name === 'FALSE')) return { type: 'literal', value: name === 'TRUE' };
    let ref = first, sheetName = null, prefix = '';
    if (peek('!')) {
      index++; sheetName = first.value;
      if (peek('error')) return { type: 'error', value: tokens[index++].value };
      ref = take('name'); prefix = source.slice(first.start, ref.start);
    } else if (first.type === 'sheet') fail('#VALUE!');
    if (!parseRef(ref.value)) fail(/\d/.test(ref.value) ? '#REF!' : '#NAME?');
    const from = canonicalRef(ref.value);
    if (peek(':')) {
      index++;
      if (!peek('name') && !peek('sheet')) fail('#VALUE!');
      const second = tokens[index++];
      let toRef = second, endSheetName = null, endPrefix = '';
      if (peek('!')) { index++; endSheetName = second.value; toRef = take('name'); endPrefix = source.slice(second.start, toRef.start); }
      else if (second.type === 'sheet') fail('#VALUE!');
      return { type: 'range', from, to: canonicalRef(toRef.value), sheetName, endSheetName, fromRaw: ref.value, toRaw: toRef.value, prefix, endPrefix, start: first.start, end: toRef.end };
    }
    return { type: 'ref', key: from, sheetName, fromRaw: ref.value, prefix, start: first.start, end: ref.end };
  }
  const result = comparison();
  take('end');
  return result;
}

function checked(value) { if (isError(value)) throw value; return value; }
function number(value) {
  checked(value);
  if (Array.isArray(value)) fail('#VALUE!');
  if (value === '' || value == null) return 0;
  if (typeof value === 'boolean') return value ? 1 : 0;
  const parsed = numericValue(value);
  if (parsed === null) fail('#VALUE!');
  return parsed;
}
function finite(value) { if (!Number.isFinite(value)) fail('#NUM!'); return Object.is(value, -0) ? 0 : value; }
function truthy(value) {
  checked(value);
  if (typeof value === 'boolean') return value;
  if (value === '') return false;
  if (typeof value === 'string' && /^(true|false)$/i.test(value)) return value.toUpperCase() === 'TRUE';
  return number(value) !== 0;
}

export const SUPPORTED_FUNCTIONS = Object.freeze([
  'SUM', 'AVERAGE', 'COUNT', 'COUNTA', 'MIN', 'MAX', 'ROUND', 'ROUNDUP', 'ROUNDDOWN', 'IF', 'ABS',
  'SUMIF', 'SUMIFS', 'COUNTIF', 'COUNTIFS', 'IFERROR', 'XLOOKUP', 'INDEX', 'MATCH', 'AND', 'OR', 'NOT',
  'DATE', 'TODAY', 'YEAR', 'MONTH', 'DAY', 'LEFT', 'RIGHT', 'MID', 'LEN', 'TRIM', 'CONCAT', 'UPPER', 'LOWER'
]);

function sameSheetName(a, b) { return String(a).toLocaleUpperCase() === String(b).toLocaleUpperCase(); }
function referenceContext(sheetName, cells, context) {
  if (sheetName == null) return { cells, context };
  const sheets = context?.sheets;
  if (!Array.isArray(sheets)) fail('#REF!');
  const target = sheets.find(sheet => sheet.name === sheetName) || sheets.find(sheet => sameSheetName(sheet.name, sheetName));
  if (!target) fail('#REF!');
  return { cells: target.cells || {}, context: { ...context, sheetId: target.id ?? target.name } };
}
function dimensions(value) { return { rows: value.rows ?? value.length, cols: value.cols ?? 1 }; }
function rangeArgument(value) { return Array.isArray(value) ? value : Object.assign([value], { rows: 1, cols: 1 }); }
function textValue(value) {
  checked(value);
  if (Array.isArray(value)) fail('#VALUE!');
  return typeof value === 'boolean' ? value ? 'TRUE' : 'FALSE' : String(value ?? '');
}
function textResult(value) { if (value.length > MAX_TEXT) fail('#VALUE!'); return value; }
function arity(args, min, max = min) { if (args.length < min || args.length > max) fail('#VALUE!'); }
function sharedRanges(cache, cells) {
  if (!(cache instanceof Map) || !cells || typeof cells !== 'object') return null;
  // Keep range results inside the caller's cell cache so clear()/replacement
  // invalidates both together. A global memo would keep obsolete workbook data.
  let memo = cache.get(RANGE_CACHE);
  if (!memo) { memo = { cells: new WeakMap(), size: 0 }; cache.set(RANGE_CACHE, memo); }
  let ranges = memo.cells.get(cells);
  if (!ranges) { ranges = new Map(); memo.cells.set(cells, ranges); }
  return { memo, ranges };
}
function wildcardPattern(input, budget) {
  const tokens = [];
  spend(budget, String(input).length, String(input).length * 16);
  const chars = Array.from(String(input));
  const escape = char => char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (let i = 0; i < chars.length; i++) {
    let char = chars[i];
    const escaped = char === '~' && i + 1 < chars.length && ['*', '?', '~'].includes(chars[i + 1]);
    if (escaped) char = chars[++i];
    if (!escaped && char === '*') {
      if (tokens.at(-1)?.type !== '*') tokens.push({ type: '*' });
    } else if (!escaped && char === '?') tokens.push({ type: '?' });
    else tokens.push({ type: 'literal', value: char, pattern: new RegExp('^' + escape(char) + '$', 'iu') });
  }
  // Revisit only the most recent star instead of exploring every possible
  // partition, which makes even short a*a*...b criteria exponential in RegExp.
  // Each literal regexp contains one code point, preserving Unicode /iu case
  // folding without allowing wildcard backtracking in the regular expression.
  return { test(value) {
    spend(budget, String(value).length, String(value).length * 8);
    const text = Array.from(String(value));
    let ti = 0, pi = 0, star = -1, retry = 0;
    while (ti < text.length) {
      spend(budget);
      const token = tokens[pi];
      if (token?.type === '?' || (token?.type === 'literal' && (token.value === text[ti] || token.pattern.test(text[ti])))) { ti++; pi++; }
      else if (token?.type === '*') { star = pi++; retry = ti; }
      else if (star >= 0) { pi = star + 1; ti = ++retry; }
      else return false;
    }
    while (tokens[pi]?.type === '*') pi++;
    return pi === tokens.length;
  } };
}
function criterionMatcher(criterion, budget) {
  checked(criterion);
  if (Array.isArray(criterion)) fail('#VALUE!');
  // An empty criterion cell is numeric zero; an explicit empty string remains
  // an empty-text criterion. The evaluator preserves that distinction as null.
  if (criterion == null) criterion = 0;
  const input = typeof criterion === 'string' ? criterion : String(criterion ?? '');
  const match = input.match(/^(<=|>=|<>|=|<|>)([\s\S]*)$/);
  const op = match?.[1] || '=', operand = match ? match[2] : criterion;
  const numeric = numericValue(operand), isBlank = operand === '' || operand == null;
  const wildcard = typeof operand === 'string' && /[*?~]/.test(operand) ? wildcardPattern(operand, budget) : null;
  return value => {
    spend(budget, 1 + Math.ceil((typeof value === 'string' ? value.length : 0) / 16));
    if (isError(value)) {
      const matchesError = typeof operand === 'string' && ERRORS.has(operand.toUpperCase()) && value.code === operand.toUpperCase();
      return op === '=' ? matchesError : op === '<>' ? !matchesError : false;
    }
    let result;
    if (isBlank) result = value === '' || value == null;
    else if (numeric !== null) {
      const val = value === '' || value == null ? 0 : numericValue(value);
      if (val === null) return op === '<>';
      return ({ '=': () => val === numeric, '<>': () => val !== numeric, '<': () => val < numeric, '>': () => val > numeric, '<=': () => val <= numeric, '>=': () => val >= numeric })[op]();
    } else if (typeof operand === 'boolean') result = value === operand;
    else if (wildcard && (op === '=' || op === '<>')) result = typeof value === 'string' && wildcard.test(value);
    else {
      const a = String(value ?? '').toLocaleUpperCase(), b = String(operand).toLocaleUpperCase();
      if (!['=', '<>'].includes(op)) return ({ '<': () => a < b, '>': () => a > b, '<=': () => a <= b, '>=': () => a >= b })[op]();
      result = a === b;
    }
    return op === '<>' ? !result : ['=', '<=', '>='].includes(op) ? result : false;
  };
}
function equalLookup(a, b) {
  return typeof a === 'string' && typeof b === 'string' ? a.toLocaleUpperCase() === b.toLocaleUpperCase() : a === b;
}
function compareLookup(a, b) {
  if (typeof a !== typeof b) return null;
  const left = typeof a === 'string' ? a.toLocaleUpperCase() : a;
  const right = typeof b === 'string' ? b.toLocaleUpperCase() : b;
  return left < right ? -1 : left > right ? 1 : 0;
}
function lookupPosition(needle, values, mode = 0, backwards = false, budget) {
  const wildcard = mode === 2 && typeof needle === 'string' ? wildcardPattern(needle, budget) : null;
  let closest = -1;
  for (let offset = 0; offset < values.length; offset++) {
    spend(budget);
    const i = backwards ? values.length - 1 - offset : offset;
    const candidate = values[i];
    if (isError(candidate)) continue;
    if (wildcard ? typeof candidate === 'string' && wildcard.test(candidate) : equalLookup(candidate, needle)) return i;
    if (mode !== -1 && mode !== 1) continue;
    const compared = compareLookup(candidate, needle);
    if (compared === null || (mode === -1 ? compared >= 0 : compared <= 0)) continue;
    if (closest < 0 || (mode === -1 ? compareLookup(candidate, values[closest]) > 0 : compareLookup(candidate, values[closest]) < 0)) closest = i;
  }
  return closest;
}

const DAY_MS = 86400000, DATE_EPOCH = Date.UTC(1899, 11, 31), MAX_DATE_SERIAL = 2958465;
function utcDate(year, month, day) {
  const value = new Date(0); value.setUTCHours(0, 0, 0, 0); value.setUTCFullYear(year, month - 1, day); return value;
}
function serialFromUTC(value) {
  const days = Math.round((value.getTime() - DATE_EPOCH) / DAY_MS);
  return days >= 60 ? days + 1 : days;
}
function makeDateSerial(year, month, day) {
  year = Math.trunc(year); month = Math.trunc(month); day = Math.trunc(day);
  if (year < 0 || year > 9999) fail('#NUM!');
  if (year < 1900) year += 1900;
  const first = utcDate(year, month, 1);
  const result = serialFromUTC(first) + day - 1;
  if (!Number.isFinite(result) || result < 0 || result > MAX_DATE_SERIAL) fail('#NUM!');
  return result;
}
function dateSerial(value) {
  checked(value);
  const numeric = numericValue(value);
  if (numeric !== null) { if (numeric < 0 || numeric > MAX_DATE_SERIAL) fail('#NUM!'); return Math.floor(numeric); }
  if (typeof value !== 'string') fail('#VALUE!');
  const match = value.trim().match(/^(\d{4})(?:[-/]|年)(\d{1,2})(?:[-/]|月)(\d{1,2})日?$/);
  if (!match) fail('#VALUE!');
  const [year, month, day] = match.slice(1).map(Number);
  if (year === 1900 && month === 2 && day === 29) return 60;
  const date = utcDate(year, month, day);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) fail('#VALUE!');
  const serial = serialFromUTC(date);
  if (serial < 0 || serial > MAX_DATE_SERIAL) fail('#NUM!');
  return serial;
}
function serialParts(value) {
  const serial = dateSerial(value);
  if (serial === 60) return { year: 1900, month: 2, day: 29 };
  const date = new Date(DATE_EPOCH + (serial >= 60 ? serial - 1 : serial) * DAY_MS);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}
export function formatDateSerial(value) {
  try { const { year, month, day } = serialParts(value); return String(year).padStart(4, '0') + '/' + String(month).padStart(2, '0') + '/' + String(day).padStart(2, '0'); }
  catch { return String(value ?? ''); }
}

function binaryValue(op, left, right) {
  checked(left); checked(right);
  if (Array.isArray(left) || Array.isArray(right)) fail('#VALUE!');
  if (op === '&') return textResult(textValue(left) + textValue(right));
  if (['=', '<>', '<', '>', '<=', '>='].includes(op)) {
    const blankAs = other => typeof other === 'string' ? '' : typeof other === 'boolean' ? false : 0;
    const l = left == null ? blankAs(right) : left, r = right == null ? blankAs(left) : right;
    const a = typeof l === 'string' ? l.toUpperCase() : l, b = typeof r === 'string' ? r.toUpperCase() : r;
    const rank = value => typeof value === 'number' ? 0 : typeof value === 'string' ? 1 : 2;
    const comparison = typeof a === typeof b ? a < b ? -1 : a > b ? 1 : 0 : rank(a) - rank(b);
    return ({ '=': () => comparison === 0, '<>': () => comparison !== 0, '<': () => comparison < 0, '>': () => comparison > 0, '<=': () => comparison <= 0, '>=': () => comparison >= 0 })[op]();
  }
  const a = number(left), b = number(right);
  if (op === '/' && b === 0) fail('#DIV/0!');
  return finite(({ '+': () => a + b, '-': () => a - b, '*': () => a * b, '/': () => a / b, '^': () => a ** b })[op]());
}

function evaluate(ast, cells, cache, visiting, context, depth = 0, state = null) {
  const budget = calculationBudget(cache);
  spend(budget);
  if (depth > MAX_DEPTH) fail('#VALUE!');
  if (state?.memo.has(ast)) return state.memo.get(ast);
  let result;
  try { result = evaluateNode(ast, cells, cache, visiting, context, depth, state); }
  catch (error) { if (!(error instanceof CalcError) || error instanceof CalcBoundaryError) throw error; result = error; }
  if (Array.isArray(result)) { const cycle = result.find(isCycle); if (cycle) result = cycle; }
  retainValue(budget, result);
  state?.memo.set(ast, result);
  return result;
}
function evaluateNode(ast, cells, cache, visiting, context, depth, state) {
  const budget = calculationBudget(cache);
  const run = node => {
    const value = evaluate(node, cells, cache, visiting, context, depth + 1, state);
    // Circular dependencies are an engine diagnostic, not ordinary cell data.
    // Letting a function consume one makes its value depend on read order.
    if (isCycle(value)) throw value;
    return value;
  };
  const runRange = node => {
    // An error stored in a real cell is range data; a missing sheet or broken
    // range expression is an invalid argument and must propagate its error.
    if (node.type === 'ref') referenceContext(node.sheetName, cells, context);
    const value = run(node);
    return rangeArgument(node.type === 'ref' ? value : checked(value));
  };
  if (ast.type === 'literal') return ast.value;
  if (ast.type === 'missing') return '';
  if (ast.type === 'error') return new CalcError(ast.value);
  if (ast.type === 'ref') { const target = referenceContext(ast.sheetName, cells, context); return readCellValue(ast.key, target.cells, cache, visiting, target.context); }
  if (ast.type === 'range') {
    const target = referenceContext(ast.sheetName, cells, context);
    if (ast.endSheetName != null && referenceContext(ast.endSheetName, cells, context).cells !== target.cells) fail('#REF!');
    const from = parseRef(ast.from), to = parseRef(ast.to);
    const r0 = Math.min(from.r, to.r), r1 = Math.max(from.r, to.r);
    const c0 = Math.min(from.c, to.c), c1 = Math.max(from.c, to.c);
    if ((r1 - r0 + 1) * (c1 - c0 + 1) > MAX_RANGE) fail('#REF!');
    const width = c1 - c0 + 1, length = (r1 - r0 + 1) * width;
    const shared = sharedRanges(cache, target.cells);
    const rangeKey = JSON.stringify([target.context?.sheetId ?? '', r0, c0, r1, c1]);
    if (shared?.ranges.has(rangeKey)) return shared.ranges.get(rangeKey);
    let values = state?.ranges.get(ast);
    if (!values) {
      spend(budget, 0, length * 8 + 64);
      values = [];
      Object.defineProperties(values, { rows: { value: r1 - r0 + 1 }, cols: { value: width } });
      state?.ranges.set(ast, values);
    }
    // Preserve progress when evaluation pauses for a formula dependency.
    for (let i = values.length; i < length; i++) values.push(readCellValue(colName(c0 + i % width) + (r0 + Math.floor(i / width) + 1), target.cells, cache, visiting, target.context));
    // Share only completed ranges, with a fixed retention budget. Partially
    // evaluated/circular ranges must remain local to their dependency traversal.
    if (shared && shared.memo.size + length <= MAX_RANGE * 4 && !values.some(isCycle)) { shared.ranges.set(rangeKey, values); shared.memo.size += length; }
    return values;
  }
  if (ast.type === 'unary') {
    const value = number(run(ast.value));
    return finite(ast.op === '-' ? -value : ast.op === '%' ? value / 100 : value);
  }
  if (ast.type === 'binary') {
    // A long A1+A2+... chain is not deeply nested; evaluate its left spine iteratively.
    const chain = []; let first = ast;
    while (first.type === 'binary' && (first === ast || !state?.memo.has(first))) { spend(budget, 1, 8); chain.push(first); first = first.left; }
    let result = checked(run(first));
    while (chain.length) { spend(budget); const node = chain.pop(); result = binaryValue(node.op, result, run(node.right)); retainValue(budget, result); state?.memo.set(node, result); }
    return result;
  }
  if (ast.type !== 'function') fail('#VALUE!');
  const { name, args } = ast;
  if (name === 'IF') {
    if (args.length < 2 || args.length > 3) fail('#VALUE!');
    // Only evaluate the chosen branch, as in a spreadsheet.
    const chosen = truthy(run(args[0])) ? args[1] : args[2];
    return chosen ? chosen.type === 'missing' ? 0 : run(chosen) : false;
  }
  if (name === 'IFERROR') {
    arity(args, 2);
    try { return checked(run(args[0])); } catch (error) { if (!(error instanceof CalcError) || isCycle(error) || error instanceof CalcBoundaryError) throw error; return run(args[1]); }
  }
  if (name === 'AND' || name === 'OR' || name === 'NOT') {
    arity(args, 1, name === 'NOT' ? 1 : 255);
    if (name === 'NOT') return !truthy(run(args[0]));
    let logicalCount = 0, anyTrue = false, anyFalse = false;
    const includeLogical = value => { logicalCount++; if (value) anyTrue = true; else anyFalse = true; };
    for (const arg of args) {
      const value = run(arg);
      if (Array.isArray(value) || arg.type === 'ref') {
        const values = Array.isArray(value) ? value : [value];
        // Preserve range-error precedence without copying the range values.
        for (const item of values) { spend(budget); checked(item); }
        for (const item of values) { spend(budget); if (typeof item === 'number' || typeof item === 'boolean') includeLogical(truthy(item)); }
      } else includeLogical(truthy(value));
    }
    if (!logicalCount) fail('#VALUE!');
    return name === 'AND' ? !anyFalse : anyTrue;
  }
  if (['SUMIF', 'SUMIFS', 'COUNTIF', 'COUNTIFS'].includes(name)) {
    let totals = null, pairs = [];
    if (name === 'SUMIF' || name === 'COUNTIF') {
      arity(args, 2, name === 'SUMIF' ? 3 : 2);
      const range = runRange(args[0]);
      pairs.push({ range, match: criterionMatcher(run(args[1]), budget) });
      if (name === 'SUMIF') totals = args[2] ? runRange(args[2]) : range;
    } else {
      const offset = name === 'SUMIFS' ? 1 : 0;
      if (args.length < 2 + offset || (args.length - offset) % 2 !== 0) fail('#VALUE!');
      if (offset) totals = runRange(args[0]);
      for (let i = offset; i < args.length; i += 2) pairs.push({ range: runRange(args[i]), match: criterionMatcher(run(args[i + 1]), budget) });
    }
    const first = pairs[0].range, shape = dimensions(first);
    for (const range of [...pairs.map(pair => pair.range), ...(totals ? [totals] : [])]) {
      const other = dimensions(range);
      if (range.length !== first.length || shape.rows !== other.rows || shape.cols !== other.cols) fail('#VALUE!');
    }
    let result = 0;
    for (let i = 0; i < first.length; i++) if (pairs.every(pair => pair.match(pair.range[i]))) {
      if (!totals) result++;
      else { const value = checked(totals[i]); if (typeof value === 'number') result += value; }
    }
    return finite(result);
  }
  if (name === 'XLOOKUP' || name === 'MATCH') {
    arity(args, name === 'MATCH' ? 2 : 3, name === 'MATCH' ? 3 : 6);
    const needle = name === 'XLOOKUP' && args[0].type === 'missing' ? null : checked(run(args[0])); if (Array.isArray(needle)) fail('#VALUE!');
    const lookup = runRange(args[1]), shape = dimensions(lookup);
    if (shape.rows > 1 && shape.cols > 1) fail('#VALUE!');
    if (name === 'MATCH') {
      const requested = args[2] && args[2].type !== 'missing' ? number(run(args[2])) : 1;
      if (![0, 1, -1].includes(requested)) fail('#VALUE!');
      const position = lookupPosition(needle, lookup, requested === 0 ? typeof needle === 'string' ? 2 : 0 : -requested, requested !== 0, budget);
      if (position < 0) fail('#N/A');
      return position + 1;
    }
    const returns = runRange(args[2]), returnShape = dimensions(returns);
    if (lookup.length !== returns.length || (returnShape.rows > 1 && returnShape.cols > 1)) fail('#VALUE!');
    const mode = args[4] && args[4].type !== 'missing' ? number(run(args[4])) : 0;
    const search = args[5] && args[5].type !== 'missing' ? number(run(args[5])) : 1;
    if (![0, -1, 1, 2].includes(mode) || ![1, -1, 2, -2].includes(search)) fail('#VALUE!');
    const position = lookupPosition(needle, lookup, mode, search < 0, budget);
    if (position < 0) { if (args[3] && args[3].type !== 'missing') return run(args[3]); fail('#N/A'); }
    return checked(returns[position]) == null ? 0 : returns[position];
  }
  if (name === 'INDEX') {
    arity(args, 2, 3);
    const range = runRange(args[0]), shape = dimensions(range);
    let row = Math.trunc(number(run(args[1]))), column = args[2] ? Math.trunc(number(run(args[2]))) : 1;
    if (!args[2] && shape.rows === 1) { column = row; row = 1; }
    if (row < 1 || column < 1 || row > shape.rows || column > shape.cols) fail('#REF!');
    const value = checked(range[(row - 1) * shape.cols + column - 1]);
    return value == null ? 0 : value;
  }
  if (name === 'DATE') { arity(args, 3); return makeDateSerial(...args.map(arg => number(run(arg)))); }
  if (name === 'TODAY') {
    arity(args, 0);
    const now = context?.now == null ? new Date() : new Date(context.now);
    if (!Number.isFinite(now.getTime())) fail('#VALUE!');
    return makeDateSerial(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }
  if (['YEAR', 'MONTH', 'DAY'].includes(name)) { arity(args, 1); return serialParts(run(args[0]))[name.toLowerCase()]; }
  if (['LEFT', 'RIGHT', 'MID', 'LEN', 'TRIM', 'CONCAT', 'UPPER', 'LOWER'].includes(name)) {
    if (name === 'CONCAT') {
      arity(args, 1, 255); let result = '';
      for (const arg of args) {
        const evaluated = run(arg), values = Array.isArray(evaluated) ? evaluated : [evaluated];
        for (const value of values) { spend(budget); result = textResult(result + textValue(value)); retainValue(budget, result, 0); }
      }
      return result;
    }
    arity(args, name === 'MID' ? 3 : 1, ['LEFT', 'RIGHT'].includes(name) ? 2 : name === 'MID' ? 3 : 1);
    const value = textValue(run(args[0]));
    spend(budget, value.length, value.length * 8);
    if (name === 'LEN') return Array.from(value).length;
    if (name === 'TRIM') return value.replace(/^ +| +$/g, '').replace(/ {2,}/g, ' ');
    if (name === 'UPPER') return textResult(value.toLocaleUpperCase());
    if (name === 'LOWER') return textResult(value.toLocaleLowerCase());
    const chars = Array.from(value);
    if (name === 'MID') {
      const start = Math.trunc(number(run(args[1]))), count = Math.trunc(number(run(args[2])));
      if (start < 1 || count < 0) fail('#VALUE!');
      return chars.slice(start - 1, start - 1 + count).join('');
    }
    const count = args[1] ? Math.trunc(number(run(args[1]))) : 1;
    if (count < 0) fail('#VALUE!');
    return (name === 'LEFT' ? chars.slice(0, count) : count === 0 ? [] : chars.slice(-count)).join('');
  }
  if (['ROUND', 'ROUNDUP', 'ROUNDDOWN'].includes(name)) {
    if (args.length !== 2) fail('#VALUE!');
    const value = number(run(args[0])), digits = Math.trunc(number(run(args[1])));
    if (digits < -15 || digits > 15) fail('#NUM!');
    // Shift the decimal exponent rather than adding an EPSILON proportional to
    // the value: that adjustment changed large integers and erased tiny values.
    const shift = (value, places) => { const [mantissa, exponent = '0'] = String(value).split('e'); return Number(mantissa + 'e' + (Number(exponent) + places)); };
    let scaled = shift(Math.abs(value), digits);
    if (!Number.isFinite(scaled)) return value; // Rounding cannot affect these already integral significant digits.
    // Correct only tiny representation noise at the actual rounding boundary.
    // A capped tolerance never moves a large integer or erases a nonzero input.
    const boundary = name === 'ROUND' ? Math.floor(scaled) + 0.5 : Math.round(scaled);
    if (boundary > 0 && Math.abs(scaled - boundary) <= Math.min(1e-12, Number.EPSILON * scaled * 2)) scaled = boundary;
    const rounded = name === 'ROUNDUP' ? scaled === 0 && value !== 0 ? 1 : Math.ceil(scaled) : name === 'ROUNDDOWN' ? Math.floor(scaled) : Math.round(scaled);
    return finite(Math.sign(value) * shift(rounded, -digits));
  }
  if (name === 'ABS') { if (args.length !== 1) fail('#VALUE!'); return Math.abs(number(run(args[0]))); }
  if (!['SUM', 'AVERAGE', 'COUNT', 'COUNTA', 'MIN', 'MAX'].includes(name)) fail('#NAME?');
  if (!args.length) fail('#VALUE!');
  // A short formula can repeat a large range hundreds of times. Aggregate
  // directly instead of copying every argument into giant intermediate arrays.
  // Defer ordinary value errors until all arguments have been evaluated, as
  // before; invalid direct scalar coercions and cycle diagnostics still win.
  let count = 0, nonempty = 0, sum = 0, minimum = Infinity, maximum = -Infinity, firstError = null;
  const include = value => {
    spend(budget);
    if (value != null) nonempty++;
    if (!firstError && isError(value)) firstError = value;
    if (typeof value === 'number' && (name !== 'COUNT' || Number.isFinite(value))) {
      count++; sum += value; minimum = Math.min(minimum, value); maximum = Math.max(maximum, value);
    }
  };
  for (const arg of args) {
    const value = run(arg);
    if (Array.isArray(value)) { for (const item of value) include(item); }
    else if (!['ref', 'range'].includes(arg.type) && name !== 'COUNTA' && (typeof value === 'boolean' || typeof value === 'string')) {
      const converted = typeof value === 'boolean' ? Number(value) : numericValue(value);
      if (converted === null && name !== 'COUNT') fail('#VALUE!');
      include(converted);
    } else include(value);
  }
  if (name === 'COUNTA') return nonempty;
  if (name === 'COUNT') return count;
  if (firstError) throw firstError;
  if (name === 'SUM') return finite(sum);
  if (name === 'AVERAGE') { if (!count) fail('#DIV/0!'); return finite(sum / count); }
  if (!count) return 0;
  return name === 'MIN' ? minimum : maximum;
}

function evaluateFormulaValue(raw, cells = {}, cache = new Map(), visiting = new Set(), context = null, state = { memo: new WeakMap(), ranges: new WeakMap() }) {
  try {
    const input = String(raw).trim().replace(/^[=＝]/, '');
    if (!state.ast) spend(calculationBudget(cache), input.length, input.length * 12 + 64);
    const ast = state.ast ||= parse(input), result = checked(evaluate(ast, cells, cache, visiting, context, 0, state));
    if (Array.isArray(result)) fail('#VALUE!');
    return typeof result === 'number' ? finite(result) : result == null ? 0 : result;
  } catch (error) { if (error instanceof PendingCell || error instanceof CalcBoundaryError) throw error; return error instanceof CalcError ? error : new CalcError('#VALUE!'); }
}

function readCellValue(key, cells, cache, visiting, context) {
  let canonical;
  try { canonical = canonicalRef(key); } catch { return new CalcError('#REF!'); }
  const sheetId = context?.sheetId ?? context?.sheets?.find(sheet => sheet.cells === cells)?.id ?? '';
  if (typeof context?.authorizeCell === 'function') {
    let allowed = false; try { allowed = context.authorizeCell({ sheetId, address: canonical }) === true; } catch {}
    if (!allowed) throw new CalcBoundaryError('#SCOPE!', 'cell');
  }
  const budget = calculationBudget(cache); spend(budget);
  const cacheKey = context ? JSON.stringify([sheetId, canonical]) : canonical;
  const hasCache = cache instanceof Map ? cache.has(cacheKey) : own(cache, cacheKey);
  if (hasCache) return cache instanceof Map ? cache.get(cacheKey) : cache[cacheKey];
  if (visiting.has(cacheKey)) return new CalcError('#CYCLE!');
  if (visiting.size >= MAX_RANGE) return new CalcError('#NUM!');
  spend(budget, 0, 64, 1);
  const cell = own(cells, canonical) ? cells[canonical] : '';
  const raw = cell && typeof cell === 'object' ? cell.raw ?? '' : cell ?? '';
  let result;
  const text = String(raw);
  spend(budget, Math.ceil(text.length / 16));
  if (/^\s*[=＝]/.test(text)) {
    spend(budget, 0, 128);
    throw new PendingCell(canonical, cells, context, cacheKey, text);
  } else result = literalCellValue(raw); // A genuinely empty cell differs from a formula returning "".
  retainValue(budget, result);
  if (cache instanceof Map) cache.set(cacheKey, result); else cache[cacheKey] = result;
  return result;
}

// Cross-cell dependencies use an explicit stack so reading a running balance
// from its last row gives the same result as reading from top to bottom.
function resolvePending(first, cache, visiting) {
  const stack = [first]; visiting.add(first.cacheKey); let result;
  try {
    while (stack.length) {
      const task = stack[stack.length - 1];
      try { result = evaluateFormulaValue(task.raw, task.cells, cache, visiting, task.context, task.state); }
      catch (error) {
        if (!(error instanceof PendingCell)) throw error;
        visiting.add(error.cacheKey); stack.push(error); continue;
      }
      retainValue(calculationBudget(cache), result);
      if (cache instanceof Map) cache.set(task.cacheKey, result); else cache[task.cacheKey] = result;
      visiting.delete(task.cacheKey); stack.pop();
    }
    return result;
  } finally { for (const task of stack) visiting.delete(task.cacheKey); }
}
function evaluateCellValue(key, cells = {}, cache = new Map(), visiting = new Set(), context = null) {
  try { return readCellValue(key, cells, cache, visiting, context); }
  catch (error) { if (error instanceof PendingCell) return resolvePending(error, cache, visiting); throw error; }
}

function publicValue(value) { return isError(value) ? value.code : value == null ? '' : value; }
export function evaluateFormula(raw, cells = {}, cache = new Map(), visiting = new Set(), context = null) {
  try { return withCalculationBudget(cache, () => {
    const state = { memo: new WeakMap(), ranges: new WeakMap() };
    while (true) {
      try { return publicValue(evaluateFormulaValue(raw, cells, cache, visiting, context, state)); }
      catch (error) { if (!(error instanceof PendingCell)) throw error; resolvePending(error, cache, visiting); }
    }
  }, context); } catch (error) { if (error instanceof CalcBoundaryError) return error.code; throw error; }
}
export function evaluateCellResult(key, cells = {}, cache = new Map(), visiting = new Set(), context = null) {
  try { return withCalculationBudget(cache, () => {
    const result = evaluateCellValue(key, cells, cache, visiting, context);
    return { value: publicValue(result), error: isError(result) ? result.code : null };
  }, context); } catch (error) { if (error instanceof CalcBoundaryError) return { value: error.code, error: error.code }; throw error; }
}
export function evaluateCell(key, cells = {}, cache = new Map(), visiting = new Set(), context = null) {
  return evaluateCellResult(key, cells, cache, visiting, context).value;
}

function walkFormula(node, visit) {
  const stack = [node];
  while (stack.length) {
    const current = stack.pop(); visit(current);
    if (current.type === 'binary') stack.push(current.right, current.left);
    else if (current.type === 'unary') stack.push(current.value);
    else if (current.type === 'function') for (let i = current.args.length - 1; i >= 0; i--) stack.push(current.args[i]);
  }
}
export function inspectFormula(raw) {
  const source = String(raw);
  if (!/^\s*[=＝]/.test(source)) return { syntaxValid: true, supported: true, functions: [], unsupportedFunctions: [], references: [], error: null };
  try {
    const ast = parse(source.trim().replace(/^[=＝]/, '')), functions = new Set(), references = [];
    walkFormula(ast, node => {
      if (node.type === 'function') functions.add(node.name);
      if (node.type === 'ref' || node.type === 'range') references.push({ sheetName: node.sheetName, address: node.type === 'ref' ? node.key : node.from + ':' + node.to, range: node.type === 'range', ...(node.endSheetName ? { endSheetName: node.endSheetName } : {}) });
    });
    const unsupportedFunctions = [...functions].filter(name => !SUPPORTED_FUNCTIONS.includes(name));
    return { syntaxValid: true, supported: !unsupportedFunctions.length, functions: [...functions], unsupportedFunctions, references, error: unsupportedFunctions.length ? '#NAME?' : null };
  } catch (error) { return { syntaxValid: false, supported: false, functions: [], unsupportedFunctions: [], references: [], error: error instanceof CalcError ? error.code : '#VALUE!' }; }
}
function rewriteReferences(raw, rewrite, strict = false) {
  const input = String(raw), match = input.match(/^(\s*[=＝])([\s\S]*)$/);
  if (!match) return raw;
  try {
    let body = normalizeFormula(match[2]);
    const ast = parse(body), changes = [];
    walkFormula(ast, node => {
      if (node.type !== 'ref' && node.type !== 'range') return;
      const replacement = rewrite(node);
      if (replacement != null && replacement !== body.slice(node.start, node.end)) changes.push({ start: node.start, end: node.end, replacement });
    });
    if (!changes.length) return raw;
    changes.sort((a, b) => b.start - a.start).forEach(change => { body = body.slice(0, change.start) + change.replacement + body.slice(change.end); });
    return match[1] + body;
  } catch (error) { if (strict) throw error; return raw; }
}
function changedRef(original, coordinates) {
  if (!coordinates || coordinates.r < 0 || coordinates.c < 0 || coordinates.r >= MAX_ROW || coordinates.c >= MAX_COL) return null;
  const match = original.match(/^(\$?)[A-Z]+(\$?)[1-9]\d*$/i);
  return match[1] + colName(coordinates.c) + match[2] + (coordinates.r + 1);
}
function renderedReference(node, from, to, prefix = node.prefix, endPrefix = node.endPrefix) {
  if (from == null || (node.type === 'range' && to == null)) return '#REF!';
  return prefix + from + (node.type === 'range' ? ':' + (endPrefix || '') + to : '');
}
export function shiftFormula(raw, deltaRows, deltaColumns) {
  if (!Number.isInteger(deltaRows) || !Number.isInteger(deltaColumns)) return raw;
  const move = ref => {
    const original = ref.match(/^(\$?)[A-Z]+(\$?)[1-9]\d*$/i), point = parseRef(ref);
    return changedRef(ref, { r: point.r + (original[2] ? 0 : deltaRows), c: point.c + (original[1] ? 0 : deltaColumns) });
  };
  return rewriteReferences(raw, node => renderedReference(node, move(node.fromRaw), node.type === 'range' ? move(node.toRaw) : null));
}
export function transformFormulaReferences(raw, { formulaSheetName, targetSheetName, axis, index, count = 1, action } = {}) {
  const coordinate = axis === 'row' ? 'r' : axis === 'col' || axis === 'column' ? 'c' : null;
  if (!coordinate || !['insert', 'delete'].includes(action) || !Number.isInteger(index) || index < 0 || !Number.isInteger(count) || count < 1) return raw;
  return rewriteReferences(raw, node => {
    const target = node.sheetName ?? formulaSheetName;
    if (!sameSheetName(target, targetSheetName)) return null;
    if (node.type === 'range' && node.endSheetName != null && !sameSheetName(node.endSheetName, targetSheetName)) return null;
    const from = parseRef(node.fromRaw), to = node.type === 'range' ? parseRef(node.toRaw) : null;
    if (action === 'insert') {
      if (from[coordinate] >= index) from[coordinate] += count;
      if (to && to[coordinate] >= index) to[coordinate] += count;
    } else if (!to) {
      if (from[coordinate] >= index && from[coordinate] < index + count) return '#REF!';
      if (from[coordinate] >= index + count) from[coordinate] -= count;
    } else {
      const ascending = from[coordinate] <= to[coordinate], low = Math.min(from[coordinate], to[coordinate]), high = Math.max(from[coordinate], to[coordinate]);
      const lastDeleted = index + count - 1;
      let nextLow, nextHigh;
      if (high < index) { nextLow = low; nextHigh = high; }
      else if (low > lastDeleted) { nextLow = low - count; nextHigh = high - count; }
      else {
        nextLow = low < index ? low : index;
        nextHigh = high > lastDeleted ? high - count : index - 1;
        if (nextLow > nextHigh) return '#REF!';
      }
      from[coordinate] = ascending ? nextLow : nextHigh; to[coordinate] = ascending ? nextHigh : nextLow;
    }
    return renderedReference(node, changedRef(node.fromRaw, from), to ? changedRef(node.toRaw, to) : null);
  });
}
export function transformFormulaForStructure(raw, options = {}) {
  return transformFormulaReferences(raw, { formulaSheetName: options.sheetName, targetSheetName: options.targetSheetName, axis: options.axis, index: options.index, count: options.count, action: options.delete ? 'delete' : 'insert' });
}
function sheetPrefix(name) {
  const text = String(name);
  return text.normalize('NFKC') === text && /^[\p{L}_][\p{L}\p{N}_.]*$/u.test(text) ? text + '!' : "'" + text.replace(/'/g, "''") + "'!";
}
/** Cut/move preserves referents, including absolute refs, across worksheet boundaries. */
export function transformFormulaForMove(raw, { formulaSheetName, resultingFormulaSheetName = formulaSheetName, sourceSheetName, targetSheetName, source, target } = {}) {
  const invalid = (message, code = 'UNSUPPORTED_REFERENCE') => { const error = new Error(message); error.code = code; throw error; };
  const areaValid = area => area && ['r1', 'r2', 'c1', 'c2'].every(key => Number.isSafeInteger(area[key])) && area.r1 >= 0 && area.c1 >= 0 && area.r2 >= area.r1 && area.c2 >= area.c1 && area.r2 < MAX_ROW && area.c2 < MAX_COL;
  if (![formulaSheetName, resultingFormulaSheetName, sourceSheetName, targetSheetName].every(name => typeof name === 'string' && name.length) || !areaValid(source) || !areaValid(target) || source.r2 - source.r1 !== target.r2 - target.r1 || source.c2 - source.c1 !== target.c2 - target.c1) invalid('移動元・移動先のシートと同じ大きさの範囲を指定してください。', 'INVALID_INPUT');
  const dr = target.r1 - source.r1, dc = target.c1 - source.c1;
  try {
    return rewriteReferences(raw, node => {
      const referentSheet = node.sheetName ?? formulaSheetName;
      if (node.type === 'range' && node.endSheetName != null && !sameSheetName(referentSheet, node.endSheetName)) invalid('複数のシートにまたがる範囲参照を含むため、移動できません。');
      const from = parseRef(node.fromRaw), to = node.type === 'range' ? parseRef(node.toRaw) : from;
      const r1 = Math.min(from.r, to.r), r2 = Math.max(from.r, to.r), c1 = Math.min(from.c, to.c), c2 = Math.max(from.c, to.c);
      if (sameSheetName(referentSheet, sourceSheetName) && r1 <= source.r2 && r2 >= source.r1 && c1 <= source.c2 && c2 >= source.c1) {
        if (r1 < source.r1 || r2 > source.r2 || c1 < source.c1 || c2 > source.c2) invalid('参照範囲の一部だけを切り取る移動には対応していません。参照範囲全体を選択してください。');
        const shiftedFrom = changedRef(node.fromRaw, { r: from.r + dr, c: from.c + dc });
        const shiftedTo = node.type === 'range' ? changedRef(node.toRaw, { r: to.r + dr, c: to.c + dc }) : null;
        const prefix = node.sheetName != null || !sameSheetName(resultingFormulaSheetName, targetSheetName) ? sheetPrefix(targetSheetName) : '';
        return renderedReference(node, shiftedFrom, shiftedTo, prefix, node.endSheetName != null ? sheetPrefix(targetSheetName) : '');
      }
      // A formula moved to another sheet still refers to cells left behind.
      if (node.sheetName == null && !sameSheetName(formulaSheetName, resultingFormulaSheetName)) return renderedReference(node, node.fromRaw, node.toRaw, sheetPrefix(formulaSheetName));
      return null;
    }, true);
  } catch (error) {
    if (error.code === 'UNSUPPORTED_REFERENCE') throw error;
    invalid('参照を安全に解析できない数式があるため、移動できません。');
  }
}
export function renameSheetReferences(raw, oldName, newName) {
  return rewriteReferences(raw, node => {
    const first = node.sheetName != null && sameSheetName(node.sheetName, oldName);
    const second = node.endSheetName != null && sameSheetName(node.endSheetName, oldName);
    if (!first && !second) return null;
    return renderedReference(node, node.fromRaw, node.toRaw, first ? sheetPrefix(newName) : node.prefix, second ? sheetPrefix(newName) : node.endPrefix);
  });
}
export function deleteSheetReferences(raw, sheetName) {
  return rewriteReferences(raw, node => (node.sheetName != null && sameSheetName(node.sheetName, sheetName)) || (node.endSheetName != null && sameSheetName(node.endSheetName, sheetName)) ? '#REF!' : null);
}

export function parseDelimited(text, delimiter, options = {}) {
  const source = String(text).replace(/^\uFEFF/, '');
  if (source.length > 10 * 1024 * 1024) throw new Error('ファイルは10 MB以下にしてください。');
  const limit = name => {
    const value = options?.[name];
    if (value === undefined) return Infinity;
    if (!Number.isSafeInteger(value) || value < 1) throw new Error('CSVの読み込み上限は正の整数で指定してください。');
    return value;
  };
  const maxRows = limit('maxRows'), maxColumns = limit('maxColumns'), maxCellLength = limit('maxCellLength');
  const exceeded = message => { const error = new Error(message); error.code = 'LIMIT_EXCEEDED'; throw error; };
  if (!source) return [];
  if (delimiter == null) {
    let quoted = false, commas = 0, tabs = 0;
    for (let i = 0; i < source.length; i++) {
      const char = source[i];
      if (char === '"') { if (quoted && source[i + 1] === '"') i++; else quoted = !quoted; }
      else if (!quoted) { if (char === '\r' || char === '\n') break; if (char === ',') commas++; if (char === '\t') tabs++; }
    }
    delimiter = tabs > commas ? '\t' : ',';
  }
  if (![',', '\t', ';'].includes(delimiter)) throw new Error('区切り文字が不正です。');
  const rows = [];
  let row = [], field = '', quoted = false, endedWithNewline = false;
  const append = char => { field += char; if (field.length > maxCellLength) exceeded('1セルの上限' + maxCellLength.toLocaleString('ja-JP') + '文字を超えています。'); };
  const pushField = () => { if (row.length >= maxColumns) exceeded('読み込む列数が上限' + maxColumns + '列を超えています。'); row.push(field); field = ''; };
  const pushRow = () => { if (rows.length >= maxRows) exceeded('読み込む行数が上限' + maxRows + '行を超えています。'); rows.push(row); row = []; };
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    endedWithNewline = false;
    if (quoted) {
      if (char === '"') { if (source[i + 1] === '"') { append('"'); i++; } else quoted = false; }
      else append(char);
      continue;
    }
    if (char === '"' && field === '') { quoted = true; continue; }
    if (char === delimiter) { pushField(); continue; }
    if (char === '\n' || char === '\r') {
      if (char === '\r' && source[i + 1] === '\n') i++;
      pushField(); pushRow(); endedWithNewline = true;
      continue;
    }
    append(char);
  }
  if (quoted) throw new Error('CSVの引用符が閉じられていません。');
  if (!endedWithNewline || row.length || field) { pushField(); pushRow(); }
  return rows;
}

export function stringifyDelimited(rows, delimiter = ',') {
  return rows.map(row => row.map(value => {
    const text = String(value ?? '');
    // A lone empty field otherwise looks like an absent record or an optional
    // final line break, so quoting it is necessary to preserve the row count.
    return (row.length === 1 && text === '') || text.includes(delimiter) || /["\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  }).join(delimiter)).join('\r\n');
}

export const FUNCTION_HELP = [
  { name: 'SUM', label: '合計', example: '=SUM(B2:B10)' },
  { name: 'AVERAGE', label: '平均', example: '=AVERAGE(B2:B10)' },
  { name: 'COUNT', label: '数値の個数', example: '=COUNT(B2:B10)' },
  { name: 'COUNTA', label: '入力済みの個数', example: '=COUNTA(A2:A10)' },
  { name: 'MIN', label: '最小値', example: '=MIN(B2:B10)' },
  { name: 'MAX', label: '最大値', example: '=MAX(B2:B10)' },
  { name: 'ROUND', label: '四捨五入', example: '=ROUND(B2,0)' },
  { name: 'ROUNDUP', label: '切り上げ', example: '=ROUNDUP(B2,0)' },
  { name: 'ROUNDDOWN', label: '切り捨て', example: '=ROUNDDOWN(B2,0)' },
  { name: 'IF', label: '条件で分岐', example: '=IF(B2>=1000,"達成","未達")' },
  { name: 'ABS', label: '絶対値', example: '=ABS(B2)' },
  { name: 'SUMIF', label: '条件に合う合計', example: '=SUMIF(A2:A10,"交通費",B2:B10)' },
  { name: 'SUMIFS', label: '複数条件の合計', example: '=SUMIFS(C2:C10,A2:A10,"交通費",B2:B10,">=1000")' },
  { name: 'COUNTIF', label: '条件に合う個数', example: '=COUNTIF(A2:A10,"購入済み")' },
  { name: 'COUNTIFS', label: '複数条件の個数', example: '=COUNTIFS(A2:A10,"交通費",B2:B10,">=1000")' },
  { name: 'IFERROR', label: 'エラー時の表示', example: '=IFERROR(A1/B1,0)' },
  { name: 'XLOOKUP', label: '対応する値を検索', example: '=XLOOKUP(A2,商品一覧!A2:A20,商品一覧!B2:B20,"該当なし")' },
  { name: 'INDEX', label: '範囲内の値を取得', example: '=INDEX(A2:C10,2,3)' },
  { name: 'MATCH', label: '一致する位置を検索', example: '=MATCH("お茶",A2:A10,0)' },
  { name: 'AND', label: 'すべての条件を満たす', example: '=AND(A1>0,B1>0)' },
  { name: 'OR', label: 'いずれかの条件を満たす', example: '=OR(A1>0,B1>0)' },
  { name: 'NOT', label: '条件を反転', example: '=NOT(A1=0)' },
  { name: 'DATE', label: '日付を作成', example: '=DATE(2026,10,22)' },
  { name: 'TODAY', label: '今日の日付', example: '=TODAY()' },
  { name: 'YEAR', label: '年を取得', example: '=YEAR(A1)' },
  { name: 'MONTH', label: '月を取得', example: '=MONTH(A1)' },
  { name: 'DAY', label: '日を取得', example: '=DAY(A1)' },
  { name: 'LEFT', label: '先頭の文字を取得', example: '=LEFT(A1,3)' },
  { name: 'RIGHT', label: '末尾の文字を取得', example: '=RIGHT(A1,3)' },
  { name: 'MID', label: '途中の文字を取得', example: '=MID(A1,2,3)' },
  { name: 'LEN', label: '文字数', example: '=LEN(A1)' },
  { name: 'TRIM', label: '余分な空白を整理', example: '=TRIM(A1)' },
  { name: 'CONCAT', label: '文字列を結合', example: '=CONCAT(A1:C1)' },
  { name: 'UPPER', label: '英字を大文字に', example: '=UPPER(A1)' },
  { name: 'LOWER', label: '英字を小文字に', example: '=LOWER(A1)' }
];
