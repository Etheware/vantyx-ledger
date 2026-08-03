export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed) && trimmed.length <= 255;
}

export const EMAIL_CODE_LENGTH = 6;

export function generateRandomCode(length: number = EMAIL_CODE_LENGTH): string {
  const digits = "0123456789";
  let code = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    code += digits[array[i] % digits.length];
  }
  return code;
}

export function getEmailCodeExpirationSeconds(): number {
  return 15 * 60;
}
