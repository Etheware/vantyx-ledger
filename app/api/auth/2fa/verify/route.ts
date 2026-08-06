
import { NextRequest, NextResponse } from "next/server";
import {
  consumeBackupCode,
  verifyTotpForUser,
  findOrCreateAuthUser,
} from "../../../../../lib/auth/auth-store";
import { TWO_FACTOR_PENDING_COOKIE, verifyPendingTwoFactorToken } from "../../../../../lib/auth/two-factor-session";
import { createSession } from "../../../../../lib/auth/session";
import { getOrCreatePersonalOrg } from "../../../../../lib/auth/org-helper";

export async function POST(request: NextRequest) {
  const pendingCookie = request.cookies.get(TWO_FACTOR_PENDING_COOKIE)?.value;
  if (!pendingCookie) {
    return NextResponse.json({ error: "Your sign-in session has expired. Sign in again." }, { status: 401 });
  }

  let pending;
  try {
    pending = verifyPendingTwoFactorToken(pendingCookie);
  } catch {
    return NextResponse.json({ error: "Your sign-in session has expired. Sign in again." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { code?: unknown; backupCode?: unknown } | null;
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const backupCode = typeof body?.backupCode === "string" ? body.backupCode.trim() : "";

  if (!code && !backupCode) {
    return NextResponse.json({ error: "Enter your authentication code." }, { status: 400 });
  }

  const verified = backupCode
    ? await consumeBackupCode(pending.email, backupCode)
    : await verifyTotpForUser(pending.email, code);

  if (!verified) {
    return NextResponse.json({ error: "That code didn't work. Try again." }, { status: 401 });
  }

  try {
    // Get user and create session
    const user = await findOrCreateAuthUser(pending.email);
    const org = await getOrCreatePersonalOrg(pending.email);

    const session = await createSession(
      {
        id: user.id,
        email: pending.email,
        emailVerified: user.emailVerifiedAt ? true : false,
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

    response.cookies.delete(TWO_FACTOR_PENDING_COOKIE);
    return response;
  } catch (error) {
    console.error("2FA session creation error:", error);
    return NextResponse.json({ error: "Failed to create session." }, { status: 500 });
  }
}
