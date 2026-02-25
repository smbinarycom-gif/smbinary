const crypto = require('crypto');

// AES-256-GCM helper. Requires environment variable ENCRYPTION_KEY (base64 or hex).
const RAW_KEY = process.env.ENCRYPTION_KEY || process.env.TWO_FACTOR_ENC_KEY || '';
let KEY = null;
if (RAW_KEY) {
  try {
    // Accept base64 or hex
    if (/^[0-9a-fA-F]+$/.test(RAW_KEY) && (RAW_KEY.length === 64)) {
      KEY = Buffer.from(RAW_KEY, 'hex');
    } else {
      KEY = Buffer.from(RAW_KEY, 'base64');
    }
  } catch (e) {
    console.warn('Invalid ENCRYPTION_KEY format; falling back to insecure mode');
    KEY = null;
  }
} else {
  console.warn('ENCRYPTION_KEY not set; TOTP secrets will be stored in plaintext (not recommended)');
}

function encryptString(plain) {
  if (!KEY) return { version: 'plain', payload: plain };
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // store as base64 iv:cipher:tag
  const payload = Buffer.concat([iv, tag, encrypted]).toString('base64');
  return { version: 'v1', payload };
}

function decryptString(blob) {
  if (!KEY) return blob && blob.payload ? blob.payload : blob;
  try {
    const buf = Buffer.from(blob, 'base64');
    const iv = buf.slice(0, 12);
    const tag = buf.slice(12, 28);
    const encrypted = buf.slice(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    return dec;
  } catch (e) {
    console.error('decrypt error', e);
    return null;
  }
}

module.exports = { encryptString, decryptString };
