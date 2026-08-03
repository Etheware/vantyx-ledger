import { getDatabase, paymentEvents } from "@/lib/db-compat";
import { eq, and, gte, lte, sum, desc } from "drizzle-orm";
import { v4 as uuid } from "uuid";

type BillingEvent =
  | { type: "checkout_started"; tenantId: string; checkoutSessionId: string; createdAt: Date }
  | { type: "checkout_abandoned"; tenantId: string; checkoutSessionId: string; createdAt: Date }
  | { type: "invoice_downloaded"; tenantId: string; invoiceId: string; amount: number; createdAt: Date }
  | { type: "invoice_created"; tenantId: string; invoiceId: string; amount: number; createdAt: Date }
  | { type: "receipt_viewed"; tenantId: string; receiptId: string; createdAt: Date };

type BillingTrend = {
  revenue: number;
  transactions: number;
  averageOrderValue: number;
};

type BillingExportRow = {
  id: string;
  invoiceId?: string;
  receiptId?: string;
  description: string;
  amount: string;
  status: string;
  date: string;
  eventType: BillingEvent["type"];
  createdAt: Date;
};

const billingEvents: BillingEvent[] = [];

export async function recordCheckoutStarted(checkoutSessionId: string, tenantId: string) {
  billingEvents.push({ type: "checkout_started", tenantId, checkoutSessionId, createdAt: new Date() });

  // TODO: Persist to database via paymentEvents table
  const db = getDatabase() as any;
  if (db) {
    try {
      await db.insert(paymentEvents).values({
        id: uuid(),
        tenantId,
        eventType: "checkout_started",
        eventData: { checkoutSessionId },
        recordedAt: new Date(),
      });
    } catch {
      // Fail silently; in-memory events still recorded
    }
  }
}

export async function recordInvoiceDownloaded(invoiceId: string, tenantId: string, amount = 0) {
  billingEvents.push({ type: "invoice_downloaded", tenantId, invoiceId, amount, createdAt: new Date() });

  // TODO: Persist to database via paymentEvents table
  const db = getDatabase() as any;
  if (db) {
    try {
      await db.insert(paymentEvents).values({
        id: uuid(),
        tenantId,
        eventType: "invoice_downloaded",
        eventData: { invoiceId, amount },
        recordedAt: new Date(),
      });
    } catch {
      // Fail silently; in-memory events still recorded
    }
  }
}

export async function recordReceiptViewed(receiptId: string, tenantId: string) {
  billingEvents.push({ type: "receipt_viewed", tenantId, receiptId, createdAt: new Date() });

  // TODO: Persist to database via paymentEvents table
  const db = getDatabase() as any;
  if (db) {
    try {
      await db.insert(paymentEvents).values({
        id: uuid(),
        tenantId,
        eventType: "receipt_viewed",
        eventData: { receiptId },
        recordedAt: new Date(),
      });
    } catch {
      // Fail silently; in-memory events still recorded
    }
  }
}

export async function getBillingExportRows(tenantId: string, startDate = new Date(0), endDate = new Date()) {
  return billingEvents
    .filter((event) => event.tenantId === tenantId && event.createdAt >= startDate && event.createdAt <= endDate)
    .filter((event) => event.type === "invoice_downloaded" || event.type === "invoice_created")
    .map<BillingExportRow>((event, index) => ({
      id: `${event.type}-${index}`,
      invoiceId: event.invoiceId,
      description: event.type === "invoice_created" ? "Invoice created" : "Invoice downloaded",
      amount: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(event.amount / 100),
      status: "completed",
      date: event.createdAt.toLocaleDateString("en-US"),
      eventType: event.type,
      createdAt: event.createdAt,
    }));
}

export async function getBillingTrends(tenantId: string, period: "day" | "week" | "month"): Promise<BillingTrend> {
  const now = new Date();
  const start = new Date(now);
  if (period === "day") start.setDate(start.getDate() - 1);
  if (period === "week") start.setDate(start.getDate() - 7);
  if (period === "month") start.setDate(start.getDate() - 30);

  const events = billingEvents.filter((event) => event.tenantId === tenantId && event.createdAt >= start && event.createdAt <= now);
  const completed = events.filter((event) => event.type === "invoice_downloaded" || event.type === "invoice_created");
  const unique = new Map<string, number>();

  for (const event of completed) {
    const key = event.invoiceId;
    if (!unique.has(key)) {
      unique.set(key, event.amount);
    }
  }

  const amounts = [...unique.values()];
  return {
    revenue: amounts.reduce((sum, amount) => sum + amount, 0),
    transactions: amounts.length,
    averageOrderValue: amounts.length > 0 ? Math.round(amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length) : 0,
  };
}

export async function recordCheckoutAbandoned(checkoutSessionId: string, tenantId: string) {
  billingEvents.push({ type: "checkout_abandoned", tenantId, checkoutSessionId, createdAt: new Date() });

  // TODO: Persist to database via paymentEvents table
  const db = getDatabase() as any;
  if (db) {
    try {
      await db.insert(paymentEvents).values({
        id: uuid(),
        tenantId,
        eventType: "checkout_abandoned",
        eventData: { checkoutSessionId },
        recordedAt: new Date(),
      });
    } catch {
      // Fail silently; in-memory events still recorded
    }
  }
}

export async function recordInvoiceCreated(invoiceId: string, tenantId: string, amount: number) {
  billingEvents.push({ type: "invoice_created", tenantId, invoiceId, amount, createdAt: new Date() });

  // TODO: Persist to database via paymentEvents table
  const db = getDatabase() as any;
  if (db) {
    try {
      await db.insert(paymentEvents).values({
        id: uuid(),
        tenantId,
        eventType: "invoice_created",
        eventData: { invoiceId, amount },
        recordedAt: new Date(),
      });
    } catch {
      // Fail silently; in-memory events still recorded
    }
  }
}
