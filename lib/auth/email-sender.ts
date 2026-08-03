
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const RESEND_FROM = process.env.RESEND_FROM || "Vantyx Ledger <noreply@vantyxledger.com>";

/**
 * Send email verification code to user during signup or login.
 */
export async function sendEmailVerificationCode(
  recipientEmail: string,
  code: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured. Skipping email send in development.");
    return { success: true };
  }

  try {
    const result = await resend.emails.send({
      from: RESEND_FROM,
      to: recipientEmail,
      subject: "Verify your Vantyx Ledger email",
      html: `
        <h1>Verify your email</h1>
        <p>Enter this code to verify your email address:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
      text: `Verify your email\n\nEnter this code: ${code}\n\nThis code expires in 10 minutes.`,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send password reset link to user.
 */
export async function sendPasswordResetEmail(
  recipientEmail: string,
  resetLink: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured. Skipping email send in development.");
    return { success: true };
  }

  try {
    const result = await resend.emails.send({
      from: RESEND_FROM,
      to: recipientEmail,
      subject: "Reset your Vantyx Ledger password",
      html: `
        <h1>Reset your password</h1>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetLink}" style="color: #1877f2; text-decoration: none;">Reset Password</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
      text: `Reset your password\n\nClick this link: ${resetLink}\n\nThis link expires in 1 hour.`,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}