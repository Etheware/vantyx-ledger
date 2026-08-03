import { generateRandomCode, getEmailCodeExpirationSeconds } from "./email-code-shared";

export const EMAIL_OTP_COOKIE = "vantyx_email_otp_session";
export const EMAIL_VERIFIED_COOKIE = "vantyx_email_verified";

export interface EmailOtpChallenge {
  code: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
}

export function createEmailOtpChallenge(): EmailOtpChallenge {
  const now = Date.now();
  const expirationSeconds = getEmailCodeExpirationSeconds();

  return {
    code: generateRandomCode(6),
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
  // TODO: Implement email verification token validation
  return !!token && token.length > 0;
}
