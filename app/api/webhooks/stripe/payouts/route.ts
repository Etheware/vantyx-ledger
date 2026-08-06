import { NextRequest, NextResponse } from "next/server";
import { createPayoutService } from "@/lib/vantyx/payout-service";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
    if (!secret) {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const body = await request.text();

    const parts = signature.split(",").reduce((acc: Record<string, string>, part: string) => {
      const [key, value] = part.split("=");
      acc[key] = value;
      return acc;
    }, {});

    const timestamp = parts.t;
    const v1Signature = parts.v1;

    if (!timestamp || !v1Signature) {
      return NextResponse.json(
        { error: "Invalid signature format" },
        { status: 400 }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const signedContent = `${timestamp}.${body}`;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(signedContent)
      .digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(v1Signature), Buffer.from(expectedSignature))) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    if (Math.abs(now - parseInt(timestamp)) > 300) {
      return NextResponse.json(
        { error: "Signature timestamp outside tolerance window" },
        { status: 401 }
      );
    }

    const event = JSON.parse(body) as any;
    const payoutService = createPayoutService();

    if (event.type === "payout.paid") {
      const payout = event.data.object;
      const tenantId = payout.metadata?.tenantId;

      if (tenantId) {
        await payoutService.updatePayoutStatus(
          payout.metadata?.payoutId,
          tenantId,
          "paid",
          new Date(payout.arrival_date * 1000)
        );
      }
    }

    if (event.type === "payout.failed") {
      const payout = event.data.object;
      const tenantId = payout.metadata?.tenantId;

      if (tenantId) {
        await payoutService.recordPayoutFailure(
          payout.metadata?.payoutId,
          tenantId,
          payout.failure_code || "unknown",
          payout.failure_message || "Payout failed"
        );
      }
    }

    if (event.type === "payout.in_transit") {
      const payout = event.data.object;
      const tenantId = payout.metadata?.tenantId;

      if (tenantId) {
        await payoutService.updatePayoutStatus(
          payout.metadata?.payoutId,
          tenantId,
          "in_transit"
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
