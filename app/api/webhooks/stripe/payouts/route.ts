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

    const body = await request.text();
    const secret = process.env.STRIPE_WEBHOOK_SECRET || "";

    const hash = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    const [timestamp, hash_sig] = signature.split(",").map((s) => s.split("=")[1]);

    if (hash !== hash_sig) {
      return NextResponse.json(
        { error: "Invalid signature" },
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
