
import { NextRequest, NextResponse } from "next/server";
import {
  authenticateUser,
  consumeBackupCode,
  createBackupCodesForUser,
  hasActiveTwoFactor,
  verifyTotpForUser,
} from "../../../../lib/auth/auth-store";
import { EMAIL_VERIFIED_COOKIE, verifyVerifiedEmailToken } from "../../../../lib/auth/email-code";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(EMAIL_VERIFIED_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let verified;
  try {
    verified = verifyVerifiedEmailToken(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { password?: unknown; totpCode?: unknown; backupCode?: unknown }
    | null;
  const password = typeof body?.password === "string" ? body.password : "";
  const totpCode = typeof body?.totpCode === "string" ? body.totpCode.trim() : "";
  const backupCode = typeof body?.backupCode === "string" ? body.backupCode.trim() : "";

  if (!password) {
    return NextResponse.json({ error: "Confirm your password to continue." }, { status: 401 });
  }

  const authenticated = await authenticateUser(verified.email, password);
  if (!authenticated) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  // Regenerating codes invalidates the existing batch, so an account that already has a
  // working 2FA factor must prove possession of it — password alone is not enough, since
  // this same password could be what an attacker obtained a moment before via other means.
  if (await hasActiveTwoFactor(verified.email)) {
    if (!totpCode && !backupCode) {
      return NextResponse.json(
        { error: "Enter your current authenticator code or a backup code to continue.", requiresFactor: true },
        { status: 401 },
      );
    }

    const factorVerified = backupCode
      ? await consumeBackupCode(verified.email, backupCode)
      : await verifyTotpForUser(verified.email, totpCode);

    if (!factorVerified) {
      return NextResponse.json(
        { error: "That code didn't work. Try again.", requiresFactor: true },
        { status: 401 },
      );
    }
  }

  try {
    const batch = await createBackupCodesForUser(verified.email);
    return NextResponse.json({
      ok: true,
      email: verified.email,
      codes: batch.codes,
    });
  } catch {
    return NextResponse.json({ error: "We could not generate backup codes right now." }, { status: 503 });
  }
}