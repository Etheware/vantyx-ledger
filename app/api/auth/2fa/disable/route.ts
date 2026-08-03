
import { NextRequest, NextResponse } from "next/server";
import {
  authenticateUser,
  consumeBackupCode,
  disableTwoFactor,
  verifyTotpForUser,
} from "../../../../../lib/auth/auth-store";
import { EMAIL_VERIFIED_COOKIE, verifyVerifiedEmailToken } from "../../../../../lib/auth/email-code";

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

  if (!totpCode && !backupCode) {
    return NextResponse.json(
      { error: "Enter your current authenticator code or a backup code to continue." },
      { status: 401 },
    );
  }

  const factorVerified = backupCode
    ? await consumeBackupCode(verified.email, backupCode)
    : await verifyTotpForUser(verified.email, totpCode);

  if (!factorVerified) {
    return NextResponse.json({ error: "That code didn't work. Try again." }, { status: 401 });
  }

  await disableTwoFactor(verified.email);
  return NextResponse.json({ ok: true });
}