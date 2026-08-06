import { NextRequest, NextResponse } from "next/server";
import { readVerifiedEmailToken, EMAIL_VERIFIED_COOKIE } from "@/lib/auth/email-code";
import { createLicenseService } from "@/lib/vantyx/license-service";
import { createEntitlementService } from "@/lib/vantyx/entitlement-service";

export async function GET(request: NextRequest) {
  const verifiedCookie = request.cookies.get(EMAIL_VERIFIED_COOKIE)?.value;
  if (!verifiedCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const verified = readVerifiedEmailToken(verifiedCookie);
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const licenseService = createLicenseService();
  const tenantId = request.nextUrl.searchParams.get("tenantId") || "";

  if (!tenantId) {
    return NextResponse.json({ error: "Missing tenantId parameter" }, { status: 400 });
  }

  try {
    // TODO: Verify user has access to this tenant
    // For now, return licenses for the tenant

    const customerId = request.nextUrl.searchParams.get("customerId") || verified.email;
    const licenses = await licenseService.getLicensesByCustomer(customerId, tenantId);

    return NextResponse.json({
      licenses: licenses.map((lic: any) => ({
        id: lic.id,
        key: lic.licenseKey,
        tier: lic.tier,
        status: lic.status,
        seatLimit: lic.seatLimit,
        seatUsed: lic.seatUsed,
        expiresAt: lic.expiresAt,
        activatedAt: lic.activatedAt,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch licenses";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const verifiedCookie = request.cookies.get(EMAIL_VERIFIED_COOKIE)?.value;
  if (!verifiedCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const verified = readVerifiedEmailToken(verifiedCookie);
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as any;
  const action = body?.action || "";

  const licenseService = createLicenseService();
  const entitlementService = createEntitlementService();
  const tenantId = body?.tenantId || "";

  if (!tenantId) {
    return NextResponse.json({ error: "Missing tenantId parameter" }, { status: 400 });
  }

  try {
    if (action === "activate") {
      const licenseId = body?.licenseId || "";
      if (!licenseId) {
        return NextResponse.json({ error: "Missing licenseId" }, { status: 400 });
      }

      await licenseService.activateLicense(licenseId, tenantId);
      return NextResponse.json({ ok: true, message: "License activated" });
    }

    if (action === "suspend") {
      const licenseId = body?.licenseId || "";
      if (!licenseId) {
        return NextResponse.json({ error: "Missing licenseId" }, { status: 400 });
      }

      await licenseService.suspendLicense(licenseId, tenantId);
      return NextResponse.json({ ok: true, message: "License suspended" });
    }

    if (action === "revoke") {
      const licenseId = body?.licenseId || "";
      if (!licenseId) {
        return NextResponse.json({ error: "Missing licenseId" }, { status: 400 });
      }

      await licenseService.revokeLicense(licenseId, tenantId);
      return NextResponse.json({ ok: true, message: "License revoked" });
    }

    if (action === "extend") {
      const licenseId = body?.licenseId || "";
      const expiresAt = body?.expiresAt ? new Date(body.expiresAt) : null;

      if (!licenseId || !expiresAt) {
        return NextResponse.json({ error: "Missing licenseId or expiresAt" }, { status: 400 });
      }

      await licenseService.extendLicense(licenseId, tenantId, expiresAt);
      return NextResponse.json({ ok: true, message: "License extended" });
    }

    if (action === "grant_entitlement") {
      const customerId = body?.customerId || "";
      const feature = body?.feature || "";

      if (!customerId || !feature) {
        return NextResponse.json({ error: "Missing customerId or feature" }, { status: 400 });
      }

      await entitlementService.grantEntitlement({
        tenantId,
        clientId: "system",
        customerId,
        feature,
        metadata: { grantedBy: verified.email },
      });

      return NextResponse.json({ ok: true, message: "Entitlement granted" });
    }

    if (action === "revoke_entitlement") {
      const entitlementId = body?.entitlementId || "";
      if (!entitlementId) {
        return NextResponse.json({ error: "Missing entitlementId" }, { status: 400 });
      }

      await entitlementService.revokeEntitlement(entitlementId);
      return NextResponse.json({ ok: true, message: "Entitlement revoked" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
