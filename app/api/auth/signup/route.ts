
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { SignupRequestSchema } from "../../../../lib/auth/validators";
import {
  findOrCreateAuthUser,
  setUserPassword,
  createStoredAuthChallenge,
} from "../../../../lib/auth/auth-store";
import {
  createEmailOtpChallenge,
  EMAIL_OTP_COOKIE,
} from "../../../../lib/auth/email-code";
import { sendEmailVerificationCode } from "../../../../lib/auth/email-sender";
import { createErrorResponse } from "../../../../lib/auth/errors";
import { getDatabase, authUsers } from "@/lib/db-compat";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  // Validate request body
  const parsed = SignupRequestSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      createErrorResponse("invalid_email", {
        field: issue.path[0],
        message: issue.message,
      }),
      { status: 400 }
    );
  }

  const { email, firstName, lastName, company, password, agreeToTerms } = parsed.data;

  try {
    const db = getDatabase() as any;

    // Check if email already exists
    const existing = await db.query.authUsers.findFirst({
      where: eq(authUsers.email, email.toLowerCase().trim()),
    });

    if (existing && existing.passwordHash) {
      return NextResponse.json(
        createErrorResponse("email_exists"),
        { status: 409 }
      );
    }

    // Create or get user
    await findOrCreateAuthUser(email);

    // Set password (overwrites if already set)
    await setUserPassword(email, password);

    // Store user's name in metadata (if schema supports it, or in a profile table)
    // For now, just creating the user without full profile

    // Create email OTP challenge
    const { code, token, expiresAt } = createEmailOtpChallenge();
    await createStoredAuthChallenge({
      email,
      purpose: "email_otp",
      secret: code,
      expiresAt: new Date(expiresAt),
      metadata: { firstName, lastName, company, agreeToTerms },
    });

    // Send verification email
    const sendResult = await sendEmailVerificationCode(email, code);
    if (!sendResult.success) {
      console.error("Failed to send verification email:", sendResult.error);
      return NextResponse.json(
        createErrorResponse("internal_error"),
        { status: 500 }
      );
    }

    // Create response with email OTP cookie
    const response = NextResponse.json({
      ok: true,
      next: `/auth/verify-email?email=${encodeURIComponent(email)}`,
    });

    response.cookies.set(EMAIL_OTP_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      createErrorResponse("internal_error"),
      { status: 500 }
    );
  }
}
