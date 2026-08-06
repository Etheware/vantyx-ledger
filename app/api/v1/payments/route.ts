import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization" },
        { status: 401 }
      );
    }

    const apiKey = authHeader.slice(7);

    const body = (await request.json().catch(() => null)) as any;
    const { amount, currency = "USD", method, description, idempotencyKey } = body;

    if (!amount || amount <= 0 || !method) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      paymentId: `pay_${Date.now()}`,
      amount,
      currency,
      method,
      status: "succeeded",
      description,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment creation failed";
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
      payments: [
        {
          paymentId: "pay_1",
          amount: 5000,
          currency: "USD",
          status: "succeeded",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      limit,
      hasMore: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch payments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
