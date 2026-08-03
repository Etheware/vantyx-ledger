
import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getBillingExportRows } from "../../../../../src/db/billing-admin";

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

function toCsvValue(value: unknown) {
  const text = value === null || value === undefined ? "" : typeof value === "string" ? value : JSON.stringify(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const tenantId = request.nextUrl.searchParams.get("tenantId")?.trim() || undefined;
  const rows = await getBillingExportRows(tenantId);
  const header = [
    "recordType",
    "id",
    "tenantId",
    "clientSlug",
    "publicName",
    "status",
    "eventType",
    "amountCents",
    "currency",
    "createdAt",
    "updatedAt",
    "payload",
  ];
  const csv = [header.join(","), ...rows.map((row) => header.map((key) => toCsvValue((row as Record<string, unknown>)[key])).join(","))].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="billing-export.csv"',
      "cache-control": "no-store",
    },
  });
}