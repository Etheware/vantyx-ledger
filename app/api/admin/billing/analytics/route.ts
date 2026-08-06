
/* global Buffer */

import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getBillingTrends } from "../../../../../src/db/billing-admin";

function isAuthorized(request: NextRequest) {
  const expected =
    process.env.BILLING_ADMIN_SECRET?.trim() ||
    process.env.ADMIN_KEY?.trim() ||
    process.env.INTERNAL_API_KEY?.trim();
  if (!expected) {
    return false;
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const bearer = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
  const provided = request.headers.get("x-admin-secret")?.trim() || bearer;
  if (!provided) {
    return false;
  }

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const tenantId = request.nextUrl.searchParams.get("tenantId")?.trim() || "";
  const period = (request.nextUrl.searchParams.get("period")?.trim() as "day" | "week" | "month" | null) || "month";
  const trends = await getBillingTrends(tenantId, period);
  return NextResponse.json({ ok: true, tenantId: tenantId ?? null, trends });
}
