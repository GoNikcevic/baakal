const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const IV_LEN = 16;
const TAG_LEN = 16;

/**
 * Derive a 32-byte encryption key from the server secret.
 * Uses ENCRYPTION_SECRET from env, falling back to a machine-derived key.
 */
function getEncryptionKey() {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    // Fallback: derive from a stable machine value so it survives restarts
    // In production, ENCRYPTION_SECRET should always be set explicitly
    const fallback = 'bakal-default-key-change-me-in-production';
    return crypto.scryptSync(fallback, 'bakal-salt', 32);
  }
  return crypto.scryptSync(secret, 'bakal-salt', 32);
}

/**
 * Encrypt a plaintext string → "iv:tag:ciphertext" (all hex-encoded)
 */
function encrypt(plaintext) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt an "iv:tag:ciphertext" string → plaintext
 */
function decrypt(encoded) {
  const key = getEncryptionKey();
  const parts = encoded.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted format');

  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Mask a key for display: show first 7 and last 4 chars.
 * e.g. "sk-ant-api03-xxxx...xxxx" → "sk-ant-***...xxxx"
 */
function maskKey(plaintext) {
  if (!plaintext || plaintext.length < 12) return '***';
  return plaintext.slice(0, 7) + '***...' + plaintext.slice(-4);
}

module.exports = { encrypt, decrypt, maskKey };
