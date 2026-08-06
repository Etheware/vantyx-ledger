
import { eq, desc, and } from "drizzle-orm";
import { getDatabase, invoices } from "@/lib/db-compat";
import { v4 as uuid } from "uuid";

export type InvoiceStatus = "draft" | "issued" | "paid" | "overdue" | "cancelled";

export interface CreateInvoiceInput {
  tenantId: string;
  clientId: string;
  subscriptionId?: string;
  customerId: string;
  customerEmail: string;
  customerName?: string;
  subtotalCents: number;
  taxCents?: number;
  currency?: string;
  description?: string;
  dueAt?: Date;
  metadata?: Record<string, any>;
}

/* Interface parameters are part of the service contract even when an implementation is a stub. */
/* eslint-disable no-unused-vars */
export interface InvoiceService {
  createInvoice(input: CreateInvoiceInput): Promise<any>;
  issueInvoice(invoiceId: string, tenantId: string): Promise<void>;
  markAsPaid(invoiceId: string, tenantId: string, paidAt?: Date): Promise<void>;
  getInvoice(invoiceId: string, tenantId: string): Promise<any | null>;
  getInvoicesByCustomer(customerId: string, tenantId: string): Promise<any[]>;
}
/* eslint-enable no-unused-vars */

async function generateInvoiceNumber(tenantId: string): Promise<string> {
  const db = getDatabase() as any;
  if (!db) {
    throw new Error("Database unavailable");
  }
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);

  const latest = await db.query.invoices.findFirst({
    where: and(eq(invoices.tenantId, tenantId), eq(invoices.status, "draft")),
    orderBy: [desc(invoices.createdAt)],
  });

  const sequence = latest ? parseInt(latest.invoiceNumber.split("-").pop() || "0") + 1 : 1;

  return `INV-${year}${month}-${String(sequence).padStart(6, "0")}`;
}

export function createInvoiceService(): InvoiceService {
  return {
    async createInvoice(input) {
      const db = getDatabase() as any;
      if (!db) {
        throw new Error("Database unavailable");
      }
      const invoiceNumber = await generateInvoiceNumber(input.tenantId);

      const invoice = await db
        .insert(invoices)
        .values({
          id: uuid(),
          tenantId: input.tenantId,
          clientId: input.clientId,
          subscriptionId: input.subscriptionId,
          invoiceNumber,
          customerId: input.customerId,
          customerEmail: input.customerEmail,
          customerName: input.customerName,
          status: "draft",
          subtotalCents: input.subtotalCents,
          taxCents: input.taxCents || 0,
          totalCents: input.subtotalCents + (input.taxCents || 0),
          currency: input.currency || "usd",
          description: input.description,
          dueAt: input.dueAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          metadata: input.metadata || {},
        })
        .returning();

      return invoice[0];
    },

    async issueInvoice(invoiceId, tenantId) {
      const db = getDatabase() as any;
      if (!db) {
        throw new Error("Database unavailable");
      }

      const result = await db
        .update(invoices)
        .set({
          status: "issued",
          issuedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId), eq(invoices.status, "draft")))
        .returning({ id: invoices.id });

      if (result.length === 0) {
        throw new Error("Invoice not found or cannot be issued");
      }
    },

    async markAsPaid(invoiceId, tenantId, paidAt) {
      const db = getDatabase() as any;
      if (!db) {
        throw new Error("Database unavailable");
      }

      const result = await db
        .update(invoices)
        .set({
          status: "paid",
          paidAt: paidAt || new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId), eq(invoices.status, "issued")))
        .returning({ id: invoices.id });

      if (result.length === 0) {
        throw new Error("Invoice not found or cannot be marked paid");
      }
    },

    async getInvoice(invoiceId, tenantId) {
      const db = getDatabase() as any;
      if (!db) {
        return null;
      }

      const result = await db.query.invoices.findFirst({
        where: and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)),
      });

      return result || null;
    },

    async getInvoicesByCustomer(customerId, tenantId) {
      const db = getDatabase() as any;
      if (!db) {
        return [];
      }

      const results = await db.query.invoices.findMany({
        where: and(eq(invoices.customerId, customerId), eq(invoices.tenantId, tenantId)),
      });

      return results;
    },
  };
}
