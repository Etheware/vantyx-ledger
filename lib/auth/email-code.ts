import { generateRandomCode, getEmailCodeExpirationSeconds } from "./email-code-shared";
import crypto from "crypto";

export const EMAIL_OTP_COOKIE = "vantyx_email_otp_session";
export const EMAIL_VERIFIED_COOKIE = "vantyx_email_verified";
const EMAIL_VERIFIED_PURPOSE = "email-verified";

type VerifiedEmailPayload = {
  purpose: typeof EMAIL_VERIFIED_PURPOSE;
  email: string;
  iat: number;
  exp: number;
};

let devEmailSecret: string | undefined;

function getEmailVerificationSecret() {
  const secret = process.env.SESSION_SECRET;
  const isPlaceholder =
    !secret || secret === "replace_with_session_secret" || secret === "session_secret_change_me";

  if (isPlaceholder) {
    if (process.env.NODE_ENV !== "production") {
      if (!devEmailSecret) {
        devEmailSecret = crypto.randomBytes(32).toString("hex");
      }
      return devEmailSecret;
    }
    throw new Error("SESSION_SECRET is not configured");
  }

  return secret;
}

function base64UrlEncode(value: Buffer | string) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
  return buffer.toString("base64").split("+").join("-").split("/").join("_").split("=").join("");
}

function base64UrlDecode(value: string) {
  const normalized = value.split("-").join("+").split("_").join("/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

export interface EmailOtpChallenge {
  code: string;
  token: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
}

export function createEmailOtpChallenge(): EmailOtpChallenge {
  const now = Date.now();
  const expirationSeconds = getEmailCodeExpirationSeconds();
  const code = generateRandomCode(6);

  return {
    code,
    token: code,
    createdAt: now,
    expiresAt: now + expirationSeconds * 1000,
    attempts: 0,
    maxAttempts: 5,
  };
}

export function isEmailOtpExpired(challenge: EmailOtpChallenge): boolean {
  return Date.now() > challenge.expiresAt;
}

export function isEmailOtpLocked(challenge: EmailOtpChallenge): boolean {
  return challenge.attempts >= challenge.maxAttempts;
}

export function verifyEmailOtpCode(challenge: EmailOtpChallenge, code: string): boolean {
  if (isEmailOtpExpired(challenge)) {
    return false;
  }
  if (isEmailOtpLocked(challenge)) {
    return false;
  }
  return challenge.code === code;
}

export function verifyVerifiedEmailToken(token: string): boolean {
  return Boolean(readVerifiedEmailToken(token));
}

export function createVerifiedEmailToken(email: string) {
  const now = Math.floor(Date.now() / 1000);
  const ttlSeconds = getEmailCodeExpirationSeconds();
  const payload: VerifiedEmailPayload = {
    purpose: EMAIL_VERIFIED_PURPOSE,
    email: email.trim().toLowerCase(),
    iat: now,
    exp: now + ttlSeconds,
  };
  const serialized = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", getEmailVerificationSecret()).update(serialized).digest();
  return `${base64UrlEncode(serialized)}.${base64UrlEncode(signature)}`;
}

export function readVerifiedEmailToken(token: string): VerifiedEmailPayload | null {
  const [encodedPayload, encodedSignature] = token.split(".");
  if (!encodedPayload || !encodedSignature) {
    return null;
  }

  try {
    const serialized = base64UrlDecode(encodedPayload);
    const expected = crypto.createHmac("sha256", getEmailVerificationSecret()).update(serialized).digest();
    const provided = Buffer.from(encodedSignature.split("-").join("+").split("_").join("/"), "base64");

    if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
      return null;
    }

    const payload = JSON.parse(serialized) as Partial<VerifiedEmailPayload>;
    const now = Math.floor(Date.now() / 1000);
    if (
      payload.purpose !== EMAIL_VERIFIED_PURPOSE ||
      typeof payload.email !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= now
    ) {
      return null;
    }

    return {
      purpose: EMAIL_VERIFIED_PURPOSE,
      email: payload.email.trim().toLowerCase(),
      iat: typeof payload.iat === "number" ? payload.iat : now,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
