import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/session";
import { readVerifiedEmailToken, EMAIL_VERIFIED_COOKIE } from "@/lib/auth/email-code";
import { stripe } from "@/lib/billing/stripe";
import { canWithdraw, getWalletAccessGrant, type WalletSession } from "@/lib/auth";
import { activateLicenseAfterPayment } from "@/lib/billing/license-fulfillment";

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("vantyx_session")?.value;
    const emailVerifiedCookie = request.cookies.get(EMAIL_VERIFIED_COOKIE)?.value;

    if (!sessionCookie && !emailVerifiedCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let authenticatedUserId: string | null = null;
    let authenticatedTenantId: string | null = null;

    if (sessionCookie) {
      const session = await verifySessionToken(sessionCookie);
      if (session) {
        authenticatedUserId = session.userId;
        authenticatedTenantId = session.orgUuid;
      }
    } else if (emailVerifiedCookie) {
      const verified = readVerifiedEmailToken(emailVerifiedCookie);
      if (!verified) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    if (!authenticatedUserId || !authenticatedTenantId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      paymentMethodId,
      amount,
      clientId,
      checkoutSessionId,
      customerId,
      customerEmail,
      productKey,
      invoiceId,
      licenseId,
      tenantId: requestedTenantId,
    } = body;

    if (!paymentMethodId || !amount || !requestedTenantId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (requestedTenantId !== authenticatedTenantId) {
      return NextResponse.json(
        { error: "Tenant mismatch" },
        { status: 403 }
      );
    }

    const grant = await getWalletAccessGrant(authenticatedUserId, authenticatedTenantId);
    if (!grant) {
      return NextResponse.json(
        { error: "No access grant found" },
        { status: 403 }
      );
    }
    const session: WalletSession = {
      userId: authenticatedUserId,
      tenantId: authenticatedTenantId,
      email: "",
      emailVerified: true,
      twoFactorEnabled: true,
    };
    const allowed = await canWithdraw(session, grant);
    if (!allowed) {
      return NextResponse.json(
        { error: "Payment not allowed" },
        { status: 403 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
    });

    if (paymentIntent.status === "succeeded" && clientId && customerId && customerEmail && productKey) {
      await activateLicenseAfterPayment({
        tenantId: authenticatedTenantId,
        clientId,
        customerId,
        customerEmail,
        productKey,
        paymentConfirmed: true,
        checkoutSessionId,
        invoiceId,
        paymentId: paymentIntent.id,
        licenseId,
      });
    }

    return NextResponse.json({
      ok: true,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error("Card processing error:", error);
    return NextResponse.json(
      { error: "Failed to process card payment" },
      { status: 500 }
    );
  }
}
