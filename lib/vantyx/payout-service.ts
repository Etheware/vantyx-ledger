import { getDatabase } from "@/lib/db-compat";
import { v4 as uuid } from "uuid";

export type PayoutStatus =
  | "pending"
  | "in_transit"
  | "paid"
  | "failed"
  | "cancelled";

export interface Payout {
  id: string;
  tenantId: string;
  stripePayoutId: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  method: "bank_account" | "debit_card";
  arrivalDate: Date | null;
  failureCode: string | null;
  failureMessage: string | null;
  issuedAt: Date;
  updatedAt: Date;
}

export interface PayoutService {
  initiatePayout(tenantId: string, amount: number, method: "bank_account" | "debit_card"): Promise<Payout>;
  getPayout(payoutId: string, tenantId: string): Promise<Payout | null>;
  getPayoutsByTenant(tenantId: string, limit?: number): Promise<Payout[]>;
  updatePayoutStatus(payoutId: string, tenantId: string, status: PayoutStatus, arrivalDate?: Date): Promise<void>;
  recordPayoutFailure(payoutId: string, tenantId: string, code: string, message: string): Promise<void>;
  canPayout(tenantId: string, amount: number): Promise<boolean>;
}

export function createPayoutService(): PayoutService {
  const store = new Map<string, Payout[]>();

  return {
    async initiatePayout(tenantId, amount, method) {
      const db = getDatabase() as any;
      const payout: Payout = {
        id: uuid(),
        tenantId,
        stripePayoutId: `po_${uuid().slice(0, 20)}`,
        amount,
        currency: "USD",
        status: "pending",
        method,
        arrivalDate: null,
        failureCode: null,
        failureMessage: null,
        issuedAt: new Date(),
        updatedAt: new Date(),
      };

      const existing = store.get(tenantId) || [];
      existing.push(payout);
      store.set(tenantId, existing);

      if (db?.insert && db?.payouts) {
        try {
          await db.insert(db.payouts).values({
            id: payout.id,
            tenantId: payout.tenantId,
            stripePayoutId: payout.stripePayoutId,
            amount: payout.amount,
            currency: payout.currency,
            status: payout.status,
            method: payout.method,
            arrivalDate: payout.arrivalDate,
            failureCode: payout.failureCode,
            failureMessage: payout.failureMessage,
            issuedAt: payout.issuedAt,
            updatedAt: payout.updatedAt,
          });
        } catch {
          // Fallback to in-memory
        }
      }

      return payout;
    },

    async getPayout(payoutId, tenantId) {
      const db = getDatabase() as any;

      if (db?.query?.payouts) {
        try {
          const payout = await db.query.payouts.findFirst({
            where: (p: any) => p.id === payoutId && p.tenantId === tenantId,
          });
          if (payout) {
            return payout;
          }
        } catch {
          // Fall through to memory
        }
      }

      const payouts = store.get(tenantId) || [];
      return payouts.find((p) => p.id === payoutId) || null;
    },

    async getPayoutsByTenant(tenantId, limit = 50) {
      const db = getDatabase() as any;

      if (db?.query?.payouts) {
        try {
          const payouts = await db.query.payouts.findMany({
            where: (p: any) => p.tenantId === tenantId,
            limit,
          });
          return payouts;
        } catch {
          // Fall through to memory
        }
      }

      return (store.get(tenantId) || []).slice(-limit);
    },

    async updatePayoutStatus(payoutId, tenantId, status, arrivalDate) {
      const db = getDatabase() as any;
      const payouts = store.get(tenantId) || [];
      const payout = payouts.find((p) => p.id === payoutId);

      if (payout) {
        payout.status = status;
        if (arrivalDate) payout.arrivalDate = arrivalDate;
        payout.updatedAt = new Date();

        store.set(tenantId, payouts);

        if (db?.update && db?.payouts) {
          try {
            await db
              .update(db.payouts)
              .set({
                status: payout.status,
                arrivalDate: payout.arrivalDate,
                updatedAt: payout.updatedAt,
              })
              .where((p: any) => p.id === payoutId);
          } catch {
            // Fallback to in-memory
          }
        }
      }
    },

    async recordPayoutFailure(payoutId, tenantId, code, message) {
      const db = getDatabase() as any;
      const payouts = store.get(tenantId) || [];
      const payout = payouts.find((p) => p.id === payoutId);

      if (payout) {
        payout.status = "failed";
        payout.failureCode = code;
        payout.failureMessage = message;
        payout.updatedAt = new Date();

        store.set(tenantId, payouts);

        if (db?.update && db?.payouts) {
          try {
            await db
              .update(db.payouts)
              .set({
                status: payout.status,
                failureCode: payout.failureCode,
                failureMessage: payout.failureMessage,
                updatedAt: payout.updatedAt,
              })
              .where((p: any) => p.id === payoutId);
          } catch {
            // Fallback to in-memory
          }
        }
      }
    },

    async canPayout(tenantId, amount) {
      const db = getDatabase() as any;

      try {
        const balance = await db.query.ledgerEntries
          ?.findMany({
            where: (e: any) => e.tenantId === tenantId && e.account === "assets:cash",
          })
          .then((entries: any[]) =>
            entries.reduce((sum: number, e: any) => sum + (e.debit || 0) - (e.credit || 0), 0)
          );

        return Boolean(balance && balance >= amount);
      } catch {
        return false;
      }
    },
  };
}
