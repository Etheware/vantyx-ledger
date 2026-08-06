import { NextRequest, NextResponse } from "next/server";
import { canWithdraw } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, tenantId, publicToken, amount } = body;

    if (!userId || !tenantId || !publicToken || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const allowed = await canWithdraw(userId, tenantId);
    if (!allowed) {
      return NextResponse.json(
        { error: "Withdrawal not allowed" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "ACH transfer initiated",
      reference: `ach_${Date.now()}`,
    });
  } catch (error) {
    console.error("ACH processing error:", error);
    return NextResponse.json(
      { error: "Failed to process ACH transfer" },
      { status: 500 }
    );
  }
}
