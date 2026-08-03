
import { NextRequest, NextResponse } from "next/server";
import { confirmTwoFactorEnrollment } from "../../../../../lib/auth/auth-store";
import { EMAIL_VERIFIED_COOKIE, readVerifiedEmailToken } from "../../../../../lib/auth/email-code";

export async function POST(request: NextRequest) {
  const verifiedCookie = request.cookies.get(EMAIL_VERIFIED_COOKIE)?.value;
  if (!verifiedCookie) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const verified = readVerifiedEmailToken(verifiedCookie);
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { code?: unknown } | null;
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!code) {
    return NextResponse.json({ error: "Enter the 6-digit code from your authenticator app." }, { status: 400 });
  }

  const result = await confirmTwoFactorEnrollment(verified.email, code);
  if (!result) {
    return NextResponse.json({ error: "That code didn't match. Try again." }, { status: 401 });
  }

  return NextResponse.json({ ok: true, codes: result.codes });
}
