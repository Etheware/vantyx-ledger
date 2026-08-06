import { getDatabase } from "@/lib/db-compat";
import { eq } from "@/lib/db-compat";
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
  void userId;
  const db = getDatabase() as any;
  if (!db) {
    return { available: 0, pending: 0, reserved: 0, withdrawalPending: 0, negative: 0, lifetimeEarnings: 0, lifetimeWithdrawals: 0, total: 0 };
  }
  const events = await db.select().from(paymentEvents).where(eq(paymentEvents.tenantId, tenantId));
  let available = 0, pending = 0, reserved = 0, withdrawalPending = 0, negative = 0, lifetimeEarnings = 0, lifetimeWithdrawals = 0;
  for (const event of events) {
    switch (event.status) {
      case "available": available += event.amount / 100; break;
      case "pending": pending += event.amount / 100; break;
      case "reserved": reserved += event.amount / 100; break;
      case "withdrawalPending": withdrawalPending += event.amount / 100; break;
      case "negative": negative += event.amount / 100; break;
    }
    if (event.amount > 0) lifetimeEarnings += event.amount / 100;
    else lifetimeWithdrawals += Math.abs(event.amount) / 100;
  }
  return { available, pending, reserved, withdrawalPending, negative, lifetimeEarnings, lifetimeWithdrawals, total: available + pending + reserved + withdrawalPending + negative };
}

export async function getTransactions(tenantId: string, userId: string, limit: number = 50) {
  const db = getDatabase() as any;
  if (!db) {
    return [];
  }
  return await db.select().from(paymentEvents).where(eq(paymentEvents.tenantId, tenantId)).orderBy(paymentEvents.createdAt).limit(limit);
}
