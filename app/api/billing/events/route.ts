
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import {
  recordCheckoutAbandoned,
  recordCheckoutStarted,
  recordInvoiceDownloaded,
  recordReceiptViewed,
} from "../../../../src/db/billing-admin";
import { verifyCheckoutSessionToken } from "../../../../lib/billing/checkout-session";
import { EMAIL_VERIFIED_COOKIE, verifyVerifiedEmailToken } from "../../../../lib/auth/email-code";
import { getDatabase } from "../../../../src/db/client";
import { checkoutSessions, licenses, receipts } from "../../../../src/db/schema";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        eventType?: unknown;
        checkoutToken?: unknown;
        productKey?: unknown;
        productName?: unknown;
        receiptNumber?: unknown;
      }
    | null;

  const eventType = typeof body?.eventType === "string" ? body.eventType.trim() : "";

  if (eventType === "checkout_started" || eventType === "checkout_abandoned") {
    // Identity and tenant come from the signed checkout-session token, never from the request body,
    // so a caller cannot attribute these audit-log events to an arbitrary tenant/customer.
    const checkoutToken = typeof body?.checkoutToken === "string" ? body.checkoutToken : "";
    let session;
    try {
      session = verifyCheckoutSessionToken(checkoutToken);
    } catch {
      return NextResponse.json({ error: "Invalid or expired checkout session." }, { status: 401 });
    }

    if (eventType === "checkout_started") {
      await recordCheckoutStarted({
        tenantId: session.tenantId,
        clientSlug: session.tenantId,
        customerEmail: session.customerEmail,
        productKey: session.productKey ?? "",
        productName: session.productName,
        checkoutTokenId: session.tokenId,
        metadata: {},
      });
    } else {
      await recordCheckoutAbandoned({
        tenantId: session.tenantId,
        clientSlug: session.tenantId,
        customerEmail: session.customerEmail,
        productKey: session.productKey ?? "",
        checkoutTokenId: session.tokenId,
      });
    }

    return NextResponse.json({ ok: true, eventType });
  }

  if (eventType === "receipt_viewed" || eventType === "invoice_downloaded") {
    // Identity comes from the verified session cookie; the resource's tenant is looked up
    // server-side and cross-checked against that identity — never trusted from the body.
    const verifiedCookie = request.cookies.get(EMAIL_VERIFIED_COOKIE)?.value;
    if (!verifiedCookie) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    let verified;
    try {
      verified = verifyVerifiedEmailToken(verifiedCookie);
    } catch {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const resourceId = typeof body?.receiptNumber === "string" ? body.receiptNumber.trim() : "";
    if (!resourceId) {
      return NextResponse.json({ error: "Missing receiptNumber." }, { status: 400 });
    }

    const db = getDatabase();

    if (eventType === "receipt_viewed") {
      const [receipt] = await db
        .select({ tenantId: receipts.tenantId, purchaserEmail: licenses.purchaserEmail })
        .from(receipts)
        .innerJoin(licenses, eq(receipts.licenseId, licenses.id))
        .where(eq(receipts.receiptNumber, resourceId))
        .limit(1);

      if (!receipt || receipt.purchaserEmail !== verified.email) {
        return NextResponse.json({ error: "Not found." }, { status: 404 });
      }

      await recordReceiptViewed({ tenantId: receipt.tenantId, resourceId, customerEmail: verified.email });
    } else {
      const [session] = await db
        .select({ tenantId: checkoutSessions.tenantId, customerEmail: checkoutSessions.customerEmail })
        .from(checkoutSessions)
        .where(eq(checkoutSessions.checkoutTokenId, resourceId))
        .limit(1);

      if (!session || session.customerEmail !== verified.email) {
        return NextResponse.json({ error: "Not found." }, { status: 404 });
      }

      await recordInvoiceDownloaded({ tenantId: session.tenantId, resourceId, customerEmail: verified.email });
    }

    return NextResponse.json({ ok: true, eventType });
  }

  return NextResponse.json({ error: "Unsupported eventType." }, { status: 400 });
}