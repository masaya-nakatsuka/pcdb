// Browser-local authenticated encryption. No key or password is persisted here.
// PBKDF2 is provided by Web Crypto; the 600,000 SHA-256 iterations follow OWASP's
// PBKDF2 work-factor guidance. Encryption is optional, and has no recovery key.
export const VAULT_FORMAT = 'soroban-encrypted';
export const VAULT_VERSION = 1;
export const VAULT_ITERATIONS = 600000;
export const MIN_VAULT_PASSWORD_LENGTH = 12;
export const MAX_VAULT_PASSWORD_BYTES = 1024;
export const MAX_VAULT_PLAINTEXT_BYTES = 32 * 1024 * 1024;
export const MAX_VAULT_ENVELOPE_BYTES = Math.ceil((MAX_VAULT_PLAINTEXT_BYTES + 16) / 3) * 4 + 2048;

const vaultEncoder = new TextEncoder();
const vaultDecoder = new TextDecoder('utf-8', { fatal: true });
const vaultOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
function vaultFailure(code, message) { return Object.assign(new Error(message), { code }); }
function invalidVault() { return vaultFailure('VAULT_INVALID', '暗号化ファイルの形式を確認してください。'); }
function authenticationFailed() { return vaultFailure('VAULT_AUTH_FAILED', 'パスワードが違うか、暗号化データが破損しています。'); }
function vaultRecord(input, keys) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || ![Object.prototype, null].includes(Object.getPrototypeOf(input))) throw invalidVault();
  const ownKeys = Reflect.ownKeys(input);
  if (ownKeys.length !== keys.length || ownKeys.some(key => !keys.includes(key))) throw invalidVault();
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (!descriptor || !vaultOwn(descriptor, 'value')) throw invalidVault();
  }
}
function vaultBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}
function vaultBytes(value, minimum, maximum) {
  if (typeof value !== 'string' || value.length > Math.ceil(maximum / 3) * 4 || value.length % 4 || /[^A-Za-z0-9+/=]/.test(value)) throw invalidVault();
  const padding = value.indexOf('=');
  if (padding >= 0 && (padding < value.length - 2 || value.slice(padding) !== '=' && value.slice(padding) !== '==')) throw invalidVault();
  let binary;
  try { binary = atob(value); } catch { throw invalidVault(); }
  if (binary.length < minimum || binary.length > maximum) throw invalidVault();
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  if (vaultBase64(bytes) !== value) throw invalidVault();
  return bytes;
}
function vaultPurpose(purpose) {
  if (!['workspace', 'workbook'].includes(purpose)) throw invalidVault();
  return purpose;
}
function vaultMetadata(envelope) {
  return {
    format: VAULT_FORMAT, version: VAULT_VERSION, purpose: envelope.purpose,
    kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: VAULT_ITERATIONS, salt: envelope.kdf.salt },
    cipher: { name: 'AES-GCM', iv: envelope.cipher.iv, tagLength: 128 },
  };
}
function vaultAdditionalData(envelope) { return vaultEncoder.encode(JSON.stringify(vaultMetadata(envelope))); }

/** A marker only. Always validate/authenticate with parse/unlock before use. */
export function isVaultEnvelope(input) {
  try {
    if (typeof input === 'string') {
      if (input.length > MAX_VAULT_ENVELOPE_BYTES) return false;
      input = JSON.parse(input);
    }
    const descriptor = input && Object.getOwnPropertyDescriptor(input, 'format');
    return !!descriptor && vaultOwn(descriptor, 'value') && descriptor.value === VAULT_FORMAT;
  } catch { return false; }
}

/** Strictly validates algorithms and bounds before any expensive derivation. */
export function parseVaultEnvelope(input, { purpose } = {}) {
  if (typeof input === 'string') {
    if (input.length > MAX_VAULT_ENVELOPE_BYTES) throw vaultFailure('VAULT_TOO_LARGE', '暗号化データが大きすぎます。ブックを分けてください。');
    try { input = JSON.parse(input); } catch { throw invalidVault(); }
  }
  vaultRecord(input, ['format', 'version', 'purpose', 'kdf', 'cipher', 'ciphertext']);
  if (input.format !== VAULT_FORMAT || input.version !== VAULT_VERSION) throw invalidVault();
  vaultPurpose(input.purpose);
  if (purpose !== undefined && input.purpose !== vaultPurpose(purpose)) throw invalidVault();
  vaultRecord(input.kdf, ['name', 'hash', 'iterations', 'salt']);
  vaultRecord(input.cipher, ['name', 'iv', 'tagLength']);
  if (input.kdf.name !== 'PBKDF2' || input.kdf.hash !== 'SHA-256' || input.kdf.iterations !== VAULT_ITERATIONS || input.cipher.name !== 'AES-GCM' || input.cipher.tagLength !== 128) throw invalidVault();
  vaultBytes(input.kdf.salt, 16, 16);
  vaultBytes(input.cipher.iv, 12, 12);
  vaultBytes(input.ciphertext, 16, MAX_VAULT_PLAINTEXT_BYTES + 16);
  const envelope = { ...vaultMetadata(input), ciphertext: input.ciphertext };
  Object.freeze(envelope.kdf); Object.freeze(envelope.cipher);
  return Object.freeze(envelope);
}

export function createVaultSession(env = globalThis) {
  const crypto = env?.crypto;
  const available = !!crypto?.subtle && typeof crypto.getRandomValues === 'function' && env.isSecureContext !== false;
  let sessionKey = null, sessionSalt = null, generation = 0;
  function needCrypto() { if (!available) throw vaultFailure('VAULT_UNAVAILABLE', 'このブラウザでは暗号化を利用できません。HTTPSまたは対応ブラウザで開いてください。'); }
  function checkGeneration(expected) { if (expected !== generation) throw vaultFailure('VAULT_LOCKED', 'ロックされたため処理を中止しました。'); }
  function needKey() { needCrypto(); if (!sessionKey) throw vaultFailure('VAULT_LOCKED', 'パスワードを入力してロックを解除してください。'); }
  function passwordBytes(password, creating = false) {
    if (typeof password !== 'string' || !password.length || creating && Array.from(password).length < MIN_VAULT_PASSWORD_LENGTH) throw vaultFailure('VAULT_PASSWORD', 'パスワードは12文字以上で設定してください。');
    if (password.length > MAX_VAULT_PASSWORD_BYTES) throw vaultFailure('VAULT_PASSWORD', 'パスワードが長すぎます。');
    const bytes = vaultEncoder.encode(password);
    if (bytes.byteLength > MAX_VAULT_PASSWORD_BYTES) { bytes.fill(0); throw vaultFailure('VAULT_PASSWORD', 'パスワードが長すぎます。'); }
    return bytes;
  }
  async function derive(password, salt, creating = false) {
    const bytes = passwordBytes(password, creating);
    try {
      const material = await crypto.subtle.importKey('raw', bytes, 'PBKDF2', false, ['deriveKey']);
      return await crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', iterations: VAULT_ITERATIONS, salt }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    } finally { bytes.fill(0); }
  }
  function lock() { generation++; sessionKey = null; sessionSalt = null; }
  async function initialize(password) {
    needCrypto(); const salt = crypto.getRandomValues(new Uint8Array(16)), operation = ++generation;
    sessionKey = null; sessionSalt = null;
    const key = await derive(password, salt, true); checkGeneration(operation);
    sessionKey = key; sessionSalt = vaultBase64(salt);
  }
  async function decode(envelope, key) {
    let plaintext;
    try {
      plaintext = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: vaultBytes(envelope.cipher.iv, 12, 12), additionalData: vaultAdditionalData(envelope), tagLength: 128 }, key, vaultBytes(envelope.ciphertext, 16, MAX_VAULT_PLAINTEXT_BYTES + 16)));
      if (plaintext.byteLength > MAX_VAULT_PLAINTEXT_BYTES) throw authenticationFailed();
      return vaultDecoder.decode(plaintext);
    } catch { throw authenticationFailed(); }
    finally { plaintext?.fill(0); }
  }
  async function unlock(input, password, { purpose } = {}) {
    needCrypto(); const operation = ++generation;
    sessionKey = null; sessionSalt = null;
    try {
      const envelope = parseVaultEnvelope(input, { purpose });
      const key = await derive(password, vaultBytes(envelope.kdf.salt, 16, 16)); checkGeneration(operation);
      const text = await decode(envelope, key); checkGeneration(operation);
      sessionKey = key; sessionSalt = envelope.kdf.salt; return text;
    } catch (error) {
      checkGeneration(operation);
      if (error?.code === 'VAULT_TOO_LARGE') throw error;
      throw authenticationFailed();
    }
  }
  async function encrypt(text, { purpose = 'workspace' } = {}) {
    needKey(); vaultPurpose(purpose);
    if (typeof text !== 'string') throw vaultFailure('VAULT_INVALID', '保存するデータの形式を確認してください。');
    if (text.length > MAX_VAULT_PLAINTEXT_BYTES) throw vaultFailure('VAULT_TOO_LARGE', '暗号化の上限は32MBです。ブックを分けてください。');
    const bytes = vaultEncoder.encode(text);
    if (bytes.byteLength > MAX_VAULT_PLAINTEXT_BYTES) { bytes.fill(0); throw vaultFailure('VAULT_TOO_LARGE', '暗号化の上限は32MBです。ブックを分けてください。'); }
    const operation = generation, key = sessionKey;
    const metadata = vaultMetadata({ purpose, kdf: { salt: sessionSalt }, cipher: { iv: vaultBase64(crypto.getRandomValues(new Uint8Array(12))) } });
    try {
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: vaultBytes(metadata.cipher.iv, 12, 12), additionalData: vaultAdditionalData(metadata), tagLength: 128 }, key, bytes);
      checkGeneration(operation);
      return JSON.stringify({ ...metadata, ciphertext: vaultBase64(new Uint8Array(encrypted)) });
    } finally { bytes.fill(0); }
  }
  async function decrypt(input, { purpose } = {}) {
    needKey(); const operation = generation;
    let envelope;
    try { envelope = parseVaultEnvelope(input, { purpose }); } catch { throw authenticationFailed(); }
    if (envelope.kdf.salt !== sessionSalt) throw authenticationFailed();
    const text = await decode(envelope, sessionKey); checkGeneration(operation); return text;
  }
  return Object.freeze({ available, isUnlocked: () => !!sessionKey, initialize, unlock, encrypt, decrypt, lock });
}
