
import { NextRequest, NextResponse } from "next/server";
import { hasActiveTwoFactor } from "../../../../../lib/auth/auth-store";
import { EMAIL_VERIFIED_COOKIE, verifyVerifiedEmailToken } from "../../../../../lib/auth/email-code";

export async function GET(request: NextRequest) {
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

  const enabled = await hasActiveTwoFactor(verified.email);
  return NextResponse.json({ enabled });
}