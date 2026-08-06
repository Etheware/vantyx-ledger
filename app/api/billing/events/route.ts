
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import {
  recordCheckoutAbandoned,
  recordCheckoutStarted,
  recordInvoiceDownloaded,
  recordReceiptViewed,
} from "../../../../src/db/billing-admin";
import { verifyCheckoutSessionToken } from "../../../../lib/billing/checkout-session";
import { EMAIL_VERIFIED_COOKIE, readVerifiedEmailToken } from "../../../../lib/auth/email-code";
import { getDatabase } from "../../../../src/db/client";
import { receipts, tenants, users } from "../../../../src/db/schema";

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
    const session = verifyCheckoutSessionToken(checkoutToken);
    if (!session) {
      return NextResponse.json({ error: "Invalid or expired checkout session." }, { status: 401 });
    }

    if (eventType === "checkout_started") {
      await recordCheckoutStarted(session.userId, session.userId);
    } else {
      await recordCheckoutAbandoned(session.userId, session.userId);
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

    const verified = readVerifiedEmailToken(verifiedCookie);
    if (!verified) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const resourceId = typeof body?.receiptNumber === "string" ? body.receiptNumber.trim() : "";
    if (!resourceId) {
      return NextResponse.json({ error: "Missing receiptNumber." }, { status: 400 });
    }

    const db = getDatabase();
    if (!db) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }

    const [receipt] = await db
      .select({ tenantId: receipts.tenantId, amount: receipts.amount })
      .from(receipts)
      .where(eq(receipts.id, resourceId))
      .limit(1);

    if (!receipt) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    // A verified email alone is not tenant access. Require ownership of the
    // tenant attached to the requested receipt before recording the event.
    const [tenantOwner] = await db
      .select({ id: users.id })
      .from(tenants)
      .innerJoin(users, eq(tenants.ownerId, users.id))
      .where(and(eq(tenants.id, receipt.tenantId), eq(users.email, verified.email)))
      .limit(1);

    if (!tenantOwner) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    if (eventType === "receipt_viewed") {
      await recordReceiptViewed(resourceId, receipt.tenantId);
    } else {
      await recordInvoiceDownloaded(resourceId, receipt.tenantId, receipt.amount);
    }

    return NextResponse.json({ ok: true, eventType });
  }

  return NextResponse.json({ error: "Unsupported eventType." }, { status: 400 });
}
