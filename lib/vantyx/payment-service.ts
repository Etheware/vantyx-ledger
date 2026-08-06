
import { eq, and } from "drizzle-orm";
import { getDatabase, payments } from "@/lib/db-compat";
import { v4 as uuid } from "uuid";

export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";
export type PaymentRail = "stripe_card" | "stripe_bank" | "plaid_ach" | "solana_usdc" | "manual";

export interface CreatePaymentInput {
  tenantId: string;
  clientId: string;
  invoiceId?: string;
  customerId: string;
  customerEmail: string;
  paymentRail: PaymentRail;
  amountCents: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
}

/* Interface parameters are part of the service contract even when an implementation is a stub. */
/* eslint-disable no-unused-vars */
export interface PaymentService {
  createPayment(input: CreatePaymentInput): Promise<any>;
  updatePaymentStatus(paymentId: string, tenantId: string, status: PaymentStatus, providerPaymentId?: string): Promise<void>;
  getPayment(paymentId: string, tenantId: string): Promise<any | null>;
  getPaymentsByInvoice(invoiceId: string, tenantId: string): Promise<any[]>;
}
/* eslint-enable no-unused-vars */

export function createPaymentService(): PaymentService {
  return {
    async createPayment(input) {
      const db = getDatabase() as any;
      if (!db) {
        throw new Error("Database unavailable");
      }

      const payment = await db
        .insert(payments)
        .values({
          id: uuid(),
          tenantId: input.tenantId,
          clientId: input.clientId,
          invoiceId: input.invoiceId,
          customerId: input.customerId,
          customerEmail: input.customerEmail,
          paymentRail: input.paymentRail,
          status: "pending",
          amountCents: input.amountCents,
          currency: input.currency || "usd",
          description: input.description,
          metadata: input.metadata || {},
        })
        .returning();

      return payment[0];
    },

    async updatePaymentStatus(paymentId, tenantId, status, providerPaymentId) {
      const db = getDatabase() as any;
      if (!db) {
        throw new Error("Database unavailable");
      }

      await db
        .update(payments)
        .set({
          status,
          providerPaymentId,
          processedAt: status === "completed" ? new Date() : undefined,
          updatedAt: new Date(),
        })
        .where(and(eq(payments.id, paymentId), eq(payments.tenantId, tenantId)));
    },

    async getPayment(paymentId, tenantId) {
      const db = getDatabase() as any;
      if (!db) {
        return null;
      }

      const result = await db.query.payments.findFirst({
        where: and(eq(payments.id, paymentId), eq(payments.tenantId, tenantId)),
      });

      return result || null;
    },

    async getPaymentsByInvoice(invoiceId, tenantId) {
      const db = getDatabase() as any;
      if (!db) {
        return [];
      }

      const results = await db.query.payments.findMany({
        where: and(eq(payments.invoiceId, invoiceId), eq(payments.tenantId, tenantId)),
      });

      return results;
    },
  };
}
