
import { eq, and } from "drizzle-orm";
import { getDatabase, payments, invoices } from "vantyx-db";
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

export interface PaymentService {
  createPayment(input: CreatePaymentInput): Promise<any>;
  updatePaymentStatus(paymentId: string, status: PaymentStatus, providerPaymentId?: string): Promise<void>;
  getPayment(paymentId: string): Promise<any | null>;
  getPaymentsByInvoice(invoiceId: string): Promise<any[]>;
}

export function createPaymentService(): PaymentService {
  return {
    async createPayment(input) {
      const db = getDatabase();

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

    async updatePaymentStatus(paymentId, status, providerPaymentId) {
      const db = getDatabase();

      await db
        .update(payments)
        .set({
          status,
          providerPaymentId,
          processedAt: status === "completed" ? new Date() : undefined,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, paymentId));
    },

    async getPayment(paymentId) {
      const db = getDatabase();

      const result = await db.query.payments.findFirst({
        where: eq(payments.id, paymentId),
      });

      return result || null;
    },

    async getPaymentsByInvoice(invoiceId) {
      const db = getDatabase();

      const results = await db.query.payments.findMany({
        where: eq(payments.invoiceId, invoiceId),
      });

      return results;
    },
  };
}