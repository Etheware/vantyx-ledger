import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization" },
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

    return NextResponse.json({
      payoutId: `po_${Date.now()}`,
      stripePayoutId: `po_${Date.now()}`,
      amount,
      currency: "USD",
      method,
      status: "pending",
      issuedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payout initiation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization" },
        { status: 401 }
      );
    }

    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");

    return NextResponse.json({
      payouts: [
        {
          payoutId: "po_1",
          amount: 5000,
          currency: "USD",
          status: "paid",
          issuedAt: new Date(Date.now() - 86400000).toISOString(),
          paidAt: new Date().toISOString(),
        },
      ],
      limit,
      hasMore: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch payouts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
