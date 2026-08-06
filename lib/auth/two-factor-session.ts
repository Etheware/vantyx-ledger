
import crypto from "crypto";

export const TWO_FACTOR_PENDING_COOKIE = "vantyx_2fa_pending";
const TTL_SECONDS = 5 * 60;

// Generated once per process on first use when SESSION_SECRET is unset in a
// non-production env. Never a fixed string — a hardcoded dev secret would
// still be exploitable if NODE_ENV is ever misconfigured in a real
// deployment. A random per-boot secret just invalidates pending sessions on
// restart instead, which is a much safer failure mode.
let devSessionSecret: string | undefined;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  const isPlaceholder =
    !secret || secret === "replace_with_session_secret" || secret === "session_secret_change_me";

  if (isPlaceholder) {
    if (process.env.NODE_ENV !== "production") {
      if (!devSessionSecret) {
        const bytes = new Uint8Array(32);
        globalThis.crypto.getRandomValues(bytes);
        devSessionSecret = Buffer.from(bytes).toString("hex");
      }
      return devSessionSecret;
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

type PendingTwoFactorPayload = {
  purpose: "2fa-pending";
  email: string;
  iat: number;
  exp: number;
};

export function createPendingTwoFactorToken(email: string) {
  const now = Math.floor(Date.now() / 1000);
  const payload: PendingTwoFactorPayload = {
    purpose: "2fa-pending",
    email: email.trim().toLowerCase(),
    iat: now,
    exp: now + TTL_SECONDS,
  };
  const serialized = JSON.stringify(payload);
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("Session secret not configured");
  }
  const signature = crypto.createHmac("sha256", secret).update(serialized).digest();
  return `${base64UrlEncode(serialized)}.${base64UrlEncode(signature)}`;
}

export function verifyPendingTwoFactorToken(token: string) {
  const [encodedPayload, encodedSignature] = token.split(".");
  if (!encodedPayload || !encodedSignature) {
    throw new Error("Invalid token");
  }

  const serialized = base64UrlDecode(encodedPayload);
  const expected = crypto.createHmac("sha256", getSessionSecret()).update(serialized).digest();
  const provided = Buffer.from(encodedSignature.split("-").join("+").split("_").join("/"), "base64");

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    throw new Error("Invalid token");
  }

  const payload = JSON.parse(serialized) as PendingTwoFactorPayload;
  const now = Math.floor(Date.now() / 1000);

  if (payload.purpose !== "2fa-pending" || payload.exp <= now) {
    throw new Error("Invalid or expired token");
  }

  return payload;
}

export function getPendingTwoFactorTtlSeconds() {
  return TTL_SECONDS;
}
