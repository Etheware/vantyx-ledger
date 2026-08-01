import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/billing/stripe";
import { canWithdraw } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, tenantId, paymentMethodId, amount } = body;

    if (!userId || !tenantId || !paymentMethodId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const allowed = await canWithdraw(userId, tenantId);
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
