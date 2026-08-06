import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/session";
import { createTransferService } from "@/lib/vantyx/transfer-service";

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

    if (!session.capabilities?.includes("billing:admin")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => null)) as any;
    const { fromAccount, toAccount, amount, metadata } = body;

    if (!fromAccount || !toAccount || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid transfer parameters" },
        { status: 400 }
      );
    }

    const transferService = createTransferService();
    const canTransfer = await transferService.canTransfer(
      session.orgUuid,
      fromAccount,
      amount
    );

    if (!canTransfer) {
      return NextResponse.json(
        { error: "Insufficient balance in source account" },
        { status: 400 }
      );
    }

    const transfer = await transferService.transferBetweenAccounts(
      session.orgUuid,
      fromAccount,
      toAccount,
      amount,
      "internal",
      metadata
    );

    return NextResponse.json({
      transferId: transfer.id,
      fromAccount: transfer.fromAccount,
      toAccount: transfer.toAccount,
      amount: transfer.amount,
      currency: transfer.currency,
      status: transfer.status,
      createdAt: transfer.createdAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transfer failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
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

    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");

    const transferService = createTransferService();
    const transfers = await transferService.getTransfersByTenant(
      session.orgUuid,
      limit
    );

    return NextResponse.json({
      transfers: transfers.map((t) => ({
        id: t.id,
        fromAccount: t.fromAccount,
        toAccount: t.toAccount,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        createdAt: t.createdAt,
        completedAt: t.completedAt,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fetch transfers failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
