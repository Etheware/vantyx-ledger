
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, findOrCreateAuthUser, createStoredAuthChallenge } from "../../../../lib/auth/auth-store";
import { isValidEmail } from "../../../../lib/auth/email-code-shared";
import { createPendingTwoFactorToken, getPendingTwoFactorTtlSeconds, TWO_FACTOR_PENDING_COOKIE } from "../../../../lib/auth/two-factor-session";
import { createEmailOtpChallenge, EMAIL_OTP_COOKIE } from "../../../../lib/auth/email-code";
import { sendEmailVerificationCode } from "../../../../lib/auth/email-sender";
import { createSession } from "../../../../lib/auth/session";
import { getOrCreatePersonalOrg } from "../../../../lib/auth/org-helper";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!password) {
    return NextResponse.json({ error: "Enter your password." }, { status: 400 });
  }

  try {
    const user = await authenticateUser(email, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // 2FA flow: if enabled, require 2FA verification
    if (user.twoFactorEnabled && user.twoFactorSecretEncrypted) {
      const response = NextResponse.json({ ok: true, next: "/auth/2fa" });
      response.cookies.set(TWO_FACTOR_PENDING_COOKIE, createPendingTwoFactorToken(user.email), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: getPendingTwoFactorTtlSeconds(),
      });
      return response;
    }

    // Email verified: create session immediately
    if (user.emailVerifiedAt) {
      const org = await getOrCreatePersonalOrg(user.email);
      const session = await createSession(
        {
          id: user.id,
          email: user.email,
          emailVerified: true,
          mfaEnabled: user.twoFactorEnabled ?? false,
        },
        {
          uuid: org.uuid,
          slug: org.slug,
          name: org.name,
        },
        "owner"
      );

      const response = NextResponse.json({
        ok: true,
        next: "/dashboard",
        sessionId: session.sessionId,
      });

      response.cookies.set("vantyx_session_id", session.sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return response;
    }

    // Email not verified: send OTP
    const { code, token, expiresAt } = createEmailOtpChallenge(email);
    await createStoredAuthChallenge({
      email,
      purpose: "email_otp",
      secret: code,
      expiresAt,
      metadata: { purpose: "login" },
    });

    const sendResult = await sendEmailVerificationCode(email, code);
    if (!sendResult.success) {
      console.error("Failed to send verification email:", sendResult.error);
      return NextResponse.json(
        { error: "We could not send a verification email. Try again." },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      next: `/auth/verify-email?email=${encodeURIComponent(email)}&next=/dashboard`,
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
    console.error("Login error:", error);
    return NextResponse.json({ error: "We could not sign you in right now." }, { status: 503 });
  }
}