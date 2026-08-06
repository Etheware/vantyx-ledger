import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/session";
import { createPayoutService } from "@/lib/vantyx/payout-service";
import { createConnectService } from "@/lib/vantyx/connect-service";

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("vantyx_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(sessionCookie);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => null)) as any;
    const { amount, method = "bank_account" } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const connectService = createConnectService();
    const isEnabled = await connectService.isPayoutEnabled(session.orgUuid);

    if (!isEnabled) {
      return NextResponse.json(
        { error: "Payouts not enabled for this organization" },
        { status: 403 }
      );
    }

    const payoutService = createPayoutService();
    const canPayout = await payoutService.canPayout(session.orgUuid, amount);

    if (!canPayout) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    const payout = await payoutService.initiatePayout(
      session.orgUuid,
      amount,
      method as "bank_account" | "debit_card"
    );

    return NextResponse.json({
      payoutId: payout.id,
      stripePayoutId: payout.stripePayoutId,
      amount: payout.amount,
      currency: payout.currency,
      status: payout.status,
      issuedAt: payout.issuedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payout initiation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
