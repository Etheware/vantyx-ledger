
import { eq, and, lte } from "drizzle-orm";
import { getDatabase, subscriptions } from "@/lib/db-compat";
import { v4 as uuid } from "uuid";

export type SubscriptionStatus = "active" | "paused" | "cancelled" | "expired";

export interface CreateSubscriptionInput {
  tenantId: string;
  clientId: string;
  productId: string;
  customerId: string;
  customerEmail: string;
  billingCycleDays: number;
  amountCents: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionService {
  createSubscription(input: CreateSubscriptionInput): Promise<any>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  pauseSubscription(subscriptionId: string): Promise<void>;
  resumeSubscription(subscriptionId: string): Promise<void>;
  getSubscription(subscriptionId: string): Promise<any | null>;
  getSubscriptionsByCustomer(customerId: string, tenantId: string): Promise<any[]>;
  getDueForBilling(daysAhead?: number): Promise<any[]>;
}

export function createSubscriptionService(): SubscriptionService {
  return {
    async createSubscription(input) {
      const db = getDatabase();
      const subscriptionKey = `sub_${uuid().slice(0, 16)}`;
      const now = new Date();
      const currentPeriodEndAt = new Date(now.getTime() + input.billingCycleDays * 24 * 60 * 60 * 1000);

      const subscription = await db
        .insert(subscriptions)
        .values({
          id: uuid(),
          tenantId: input.tenantId,
          clientId: input.clientId,
          productId: input.productId,
          subscriptionKey,
          customerId: input.customerId,
          customerEmail: input.customerEmail,
          status: "active",
          billingCycleDays: input.billingCycleDays,
          amountCents: input.amountCents,
          currency: input.currency || "usd",
          currentPeriodStartAt: now,
          currentPeriodEndAt,
          nextBillingAt: currentPeriodEndAt,
          metadata: input.metadata || {},
        })
        .returning();

      return subscription[0];
    },

    async cancelSubscription(subscriptionId) {
      const db = getDatabase();

      await db
        .update(subscriptions)
        .set({
          status: "cancelled",
          cancelledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscriptionId));
    },

    async pauseSubscription(subscriptionId) {
      const db = getDatabase();

      await db
        .update(subscriptions)
        .set({
          status: "paused",
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscriptionId));
    },

    async resumeSubscription(subscriptionId) {
      const db = getDatabase();

      await db
        .update(subscriptions)
        .set({
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscriptionId));
    },

    async getSubscription(subscriptionId) {
      const db = getDatabase();

      const result = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.id, subscriptionId),
      });

      return result || null;
    },

    async getSubscriptionsByCustomer(customerId, tenantId) {
      const db = getDatabase();

      const results = await db.query.subscriptions.findMany({
        where: and(eq(subscriptions.customerId, customerId), eq(subscriptions.tenantId, tenantId)),
      });

      return results;
    },

    async getDueForBilling(daysAhead = 1) {
      const db = getDatabase();
      const now = new Date();
      const billingWindow = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

      const results = await db.query.subscriptions.findMany({
        where: and(eq(subscriptions.status, "active"), lte(subscriptions.nextBillingAt, billingWindow)),
      });

      return results;
    },
  };
}