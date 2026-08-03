
export type ErrorCode =
  | "invalid_email"
  | "weak_password"
  | "email_exists"
  | "invalid_credentials"
  | "expired_token"
  | "invalid_code"
  | "max_attempts"
  | "mfa_required"
  | "user_not_found"
  | "session_expired"
  | "insufficient_permissions"
  | "password_mismatch"
  | "invalid_backup_code"
  | "mfa_already_enabled"
  | "internal_error";

export const AUTH_ERROR_MESSAGES: Record<ErrorCode, string> = {
  invalid_email: "Enter a valid email address.",
  weak_password:
    "Password must be 8+ characters, include uppercase, number, and special character.",
  email_exists: "This email is already registered.",
  invalid_credentials: "Invalid email or password.",
  expired_token: "Verification code or reset link has expired.",
  invalid_code: "Invalid verification code.",
  max_attempts: "Too many failed attempts. Try again in 10 minutes.",
  mfa_required: "Two-factor authentication required.",
  user_not_found: "Account not found.",
  session_expired: "Your session has expired. Please sign in again.",
  insufficient_permissions: "You don't have permission to perform this action.",
  password_mismatch: "Passwords do not match.",
  invalid_backup_code: "Invalid or already-used backup code.",
  mfa_already_enabled: "Two-factor authentication is already enabled.",
  internal_error: "An unexpected error occurred. Please try again.",
};

export const AUTH_ERROR_STATUS: Record<ErrorCode, number> = {
  invalid_email: 400,
  weak_password: 400,
  email_exists: 409,
  invalid_credentials: 401,
  expired_token: 410,
  invalid_code: 400,
  max_attempts: 429,
  mfa_required: 403,
  user_not_found: 404,
  session_expired: 401,
  insufficient_permissions: 403,
  password_mismatch: 400,
  invalid_backup_code: 400,
  mfa_already_enabled: 400,
  internal_error: 500,
};

export function createErrorResponse(
  code: ErrorCode,
  details?: Record<string, unknown>,
  retryAfter?: number
): {
  error: string;
  code: ErrorCode;
  details?: Record<string, unknown>;
  retryAfter?: number;
} {
  const response: {
    error: string;
    code: ErrorCode;
    details?: Record<string, unknown>;
    retryAfter?: number;
  } = {
    error: AUTH_ERROR_MESSAGES[code],
    code,
  };

  if (details) {
    response.details = details;
  }

  if (retryAfter) {
    response.retryAfter = retryAfter;
  }

  return response;
}

export function getErrorStatus(code: ErrorCode): number {
  return AUTH_ERROR_STATUS[code] || 500;
}