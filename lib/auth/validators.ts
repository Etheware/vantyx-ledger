
import { z } from "zod";

const PASSWORD_MIN = 8;
const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
const PASSWORD_HELP =
  "Password must be at least 8 characters and include uppercase letter, number, and special character.";

export const SignupRequestSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  firstName: z.string().min(1, "First name is required.").max(50),
  lastName: z.string().min(1, "Last name is required.").max(50),
  company: z.string().min(1, "Company name is required.").max(100),
  password: z
    .string()
    .min(PASSWORD_MIN, "Password must be at least 8 characters.")
    .regex(PASSWORD_PATTERN, PASSWORD_HELP),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and privacy policy.",
  }),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const EmailVerifyRequestSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit code."),
});

export type EmailVerifyRequest = z.infer<typeof EmailVerifyRequestSchema>;

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1, "Reset token is required."),
  newPassword: z
    .string()
    .min(PASSWORD_MIN, "Password must be at least 8 characters.")
    .regex(PASSWORD_PATTERN, PASSWORD_HELP),
  confirmPassword: z.string(),
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

export const TwoFactorVerifySchema = z.object({
  code: z.string().regex(/^[\d]{6}$|^[\d\w-]{4,12}$/, "Enter a valid code or backup code."),
});

export type TwoFactorVerify = z.infer<typeof TwoFactorVerifySchema>;

export const LogoutRequestSchema = z.object({
  global: z.boolean().optional().default(false),
});

export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;