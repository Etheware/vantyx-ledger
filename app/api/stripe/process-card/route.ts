import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/billing/stripe";
import { canWithdraw, getWalletAccessGrant, type WalletSession } from "@/lib/auth";
import { activateLicenseAfterPayment } from "@/lib/billing/license-fulfillment";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      tenantId,
      paymentMethodId,
      amount,
      clientId,
      checkoutSessionId,
      customerId,
      customerEmail,
      productKey,
      invoiceId,
      licenseId,
    } = body;

    if (!userId || !tenantId || !paymentMethodId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const grant = await getWalletAccessGrant(userId, tenantId);
    if (!grant) {
      return NextResponse.json(
        { error: "No access grant found" },
        { status: 403 }
      );
    }
    const session: WalletSession = {
      userId,
      tenantId,
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
        tenantId,
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
