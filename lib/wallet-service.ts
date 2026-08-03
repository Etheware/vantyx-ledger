import { getDatabase } from "@/lib/db-compat";
import { and, eq } from "@/lib/db-compat";
import { paymentEvents } from "@/lib/db-compat";

export interface WalletBalance {
  available: number;
  pending: number;
  reserved: number;
  withdrawalPending: number;
  negative: number;
  lifetimeEarnings: number;
  lifetimeWithdrawals: number;
  total: number;
}

export async function getWalletBalance(tenantId: string, userId: string): Promise<WalletBalance> {
  const db = getDatabase();
  const events = await db.select().from(paymentEvents).where(eq(paymentEvents.tenantId, tenantId));
  let available = 0, pending = 0, reserved = 0, withdrawalPending = 0, negative = 0, lifetimeEarnings = 0, lifetimeWithdrawals = 0;
  for (const event of events) {
    switch (event.status) {
      case "available": available += event.amountCents / 100; break;
      case "pending": pending += event.amountCents / 100; break;
      case "reserved": reserved += event.amountCents / 100; break;
      case "withdrawalPending": withdrawalPending += event.amountCents / 100; break;
      case "negative": negative += event.amountCents / 100; break;
    }
    if (event.amountCents > 0) lifetimeEarnings += event.amountCents / 100;
    else lifetimeWithdrawals += Math.abs(event.amountCents) / 100;
  }
  return { available, pending, reserved, withdrawalPending, negative, lifetimeEarnings, lifetimeWithdrawals, total: available + pending + reserved + withdrawalPending + negative };
}

export async function getTransactions(tenantId: string, userId: string, limit: number = 50) {
  const db = getDatabase();
  return await db.select().from(paymentEvents).where(eq(paymentEvents.tenantId, tenantId)).orderBy(paymentEvents.createdAt).limit(limit);
}