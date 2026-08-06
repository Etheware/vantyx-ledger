import { NextRequest, NextResponse } from "next/server";
import { validateLicenseAccess, checkFeatureAccess } from "@/lib/vantyx/license-validator";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as any;

  const licenseKey = body?.licenseKey || "";
  const tenantId = body?.tenantId || "";
  const feature = body?.feature || null;

  if (!licenseKey || !tenantId) {
    return NextResponse.json(
      { error: "Missing licenseKey or tenantId" },
      { status: 400 }
    );
  }

  try {
    const result = await validateLicenseAccess(licenseKey, tenantId, feature);

    if (!result.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: result.error,
          license: result.license,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      valid: true,
      license: result.license,
      entitlements: result.entitlements,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get("customerId") || "";
  const feature = request.nextUrl.searchParams.get("feature") || "";
  const tenantId = request.nextUrl.searchParams.get("tenantId") || "";

  if (!customerId || !feature || !tenantId) {
    return NextResponse.json(
      { error: "Missing customerId, feature, or tenantId" },
      { status: 400 }
    );
  }

  try {
    const hasAccess = await checkFeatureAccess(customerId, feature, tenantId);

    return NextResponse.json({
      customerId,
      feature,
      hasAccess,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
