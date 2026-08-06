
/* global Buffer, URLSearchParams */

import crypto from "crypto";
import QRCode from "qrcode";

const ISSUER = "Vantyx Ledger";
const STEP_SECONDS = 30;
const DIGITS = 6;
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buffer: Buffer) {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(input: string) {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

function getVaultKey() {
  const raw = process.env.VAULT_MASTER_KEY;
  const isPlaceholder = !raw || raw === "replace_with_a_64_character_hex_key";

  if (isPlaceholder) {
    if (process.env.NODE_ENV !== "production") {
      // Deterministic dev-only fallback so local development doesn't require provisioning
      // a real vault key; production always requires a real VAULT_MASTER_KEY.
      return crypto.createHash("sha256").update("vantyx-dev-vault-key").digest();
    }
    throw new Error("VAULT_MASTER_KEY is not configured");
  }

  const key = Buffer.from(raw, "hex");
  if (key.length !== 32) {
    throw new Error("VAULT_MASTER_KEY must be a 64-character hex string (32 bytes)");
  }
  return key;
}

/** AES-256-GCM encrypt, format: iv:authTag:ciphertext (all hex) */
export function encryptSecret(plaintext: string) {
  const key = getVaultKey();
  const ivBytes = new Uint8Array(12);
  globalThis.crypto.getRandomValues(ivBytes);
  const iv = Buffer.from(ivBytes);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintextBuf = Buffer.from(plaintext, "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintextBuf), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${(iv as any).toString("hex")}:${(authTag as any).toString("hex")}:${(ciphertext as any).toString("hex")}`;
}

export function decryptSecret(encrypted: string) {
  const key = getVaultKey();
  const [ivHex, authTagHex, ciphertextHex] = encrypted.split(":");
  if (!ivHex || !authTagHex || !ciphertextHex) {
    throw new Error("Malformed encrypted secret");
  }

  const ciphertextBuf = Buffer.from(ciphertextHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const plaintext = Buffer.concat([
    decipher.update(ciphertextBuf),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

export function generateTotpSecret() {
  const secretBytes = new Uint8Array(20);
  globalThis.crypto.getRandomValues(secretBytes);
  return base32Encode(Buffer.from(secretBytes));
}

export function buildProvisioningUri(email: string, base32Secret: string) {
  const label = encodeURIComponent(`${ISSUER}:${email}`);
  const params = new URLSearchParams({
    secret: base32Secret,
    issuer: ISSUER,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

export async function generateQrCodeDataUrl(otpauthUri: string) {
  return QRCode.toDataURL(otpauthUri, { margin: 1, width: 240 });
}

function hotp(secretBytes: Buffer, counter: number) {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = crypto.createHmac("sha1", secretBytes).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binary % 10 ** DIGITS).padStart(DIGITS, "0");
}

/**
 * Verifies a 6-digit TOTP code against a base32 secret, allowing +/-1 step
 * (30s each) of clock drift, per RFC 6238.
 */
export function verifyTotpCode(base32Secret: string, code: string, windowSteps = 1) {
  const cleanCode = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleanCode)) return false;

  const secretBytes = base32Decode(base32Secret);
  const currentStep = Math.floor(Date.now() / 1000 / STEP_SECONDS);

  for (let errorWindow = -windowSteps; errorWindow <= windowSteps; errorWindow++) {
    const candidate = hotp(secretBytes, currentStep + errorWindow);
    const expected = Buffer.from(candidate);
    const actual = Buffer.from(cleanCode);
    if (expected.length === actual.length && crypto.timingSafeEqual(expected, actual)) {
      return true;
    }
  }

  return false;
}
