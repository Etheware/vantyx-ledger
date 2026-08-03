
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, beginTwoFactorEnrollment } from "../../../../../lib/auth/auth-store";
import { EMAIL_VERIFIED_COOKIE, readVerifiedEmailToken } from "../../../../../lib/auth/email-code";
import { generateQrCodeDataUrl } from "../../../../../lib/auth/totp";

export async function POST(request: NextRequest) {
  const verifiedCookie = request.cookies.get(EMAIL_VERIFIED_COOKIE)?.value;
  if (!verifiedCookie) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const verified = readVerifiedEmailToken(verifiedCookie);
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  if (!password) {
    return NextResponse.json({ error: "Confirm your password to continue." }, { status: 401 });
  }

  const authenticated = await authenticateUser(verified.email, password);
  if (!authenticated) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  try {
    const { secret, otpauthUri } = await beginTwoFactorEnrollment(verified.email);
    const qrCodeDataUrl = await generateQrCodeDataUrl(otpauthUri);
    return NextResponse.json({ ok: true, secret, qrCodeDataUrl });
  } catch {
    return NextResponse.json({ error: "We could not start two-factor setup right now." }, { status: 503 });
  }
}
