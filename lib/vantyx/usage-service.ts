import { eq } from "drizzle-orm";
import { getDatabase } from "@/lib/db-compat";
import { v4 as uuid } from "uuid";

export type UsageMeterType = "api_calls" | "data_transfer" | "storage" | "compute_hours" | "custom";

export interface RecordUsageInput {
  tenantId: string;
  subscriptionId: string;
  meterId: string;
  meterType: UsageMeterType;
  quantity: number;
  unitPrice?: number;
  period?: { startAt: Date; endAt: Date };
}

export interface UsageAggregation {
  meterId: string;
  meterType: UsageMeterType;
  totalQuantity: number;
  billingAmountCents: number;
  period: { startAt: Date; endAt: Date };
}

/* Interface parameters are part of the service contract even when an implementation is a stub. */
/* eslint-disable no-unused-vars */
export interface UsageService {
  recordUsage(input: RecordUsageInput): Promise<void>;
  getUsageForPeriod(subscriptionId: string, startAt: Date, endAt: Date): Promise<UsageAggregation[]>;
  aggregateUsageForBilling(subscriptionId: string, periodStartAt: Date, periodEndAt: Date): Promise<number>;
}
/* eslint-enable no-unused-vars */

export function createUsageService(): UsageService {
  return {
    async recordUsage(input) {
      const db = getDatabase() as any;
      if (!db) {
        throw new Error("Database unavailable");
      }

      // In production, create usageEvents table with:
      // id, tenantId, subscriptionId, meterId, meterType, quantity, recordedAt, period metadata
      // For now, log to console as stub
      const eventId = uuid();
      console.log(`[Usage Event] ${eventId}: ${input.meterType} +${input.quantity} for subscription ${input.subscriptionId}`);

      // TODO: Insert into usageEvents table
      // TODO: Emit event to metering pipeline for real-time aggregation
      // TODO: Trigger usage threshold alerts if configured
    },

    async getUsageForPeriod(subscriptionId, startAt, endAt) {
      const db = getDatabase() as any;
      if (!db) {
        return [];
      }

      // Query parameters are reserved for the usageEvents-backed implementation.
      void subscriptionId;
      void startAt;
      void endAt;

      // TODO: Query usageEvents table filtered by:
      // - subscriptionId
      // - recordedAt between startAt and endAt
      // - Group by meterId and meterType
      // - Sum quantities and calculate billing amount

      // Stub: return empty
      return [];
    },

    async aggregateUsageForBilling(subscriptionId, periodStartAt, periodEndAt) {
      void periodStartAt;
      void periodEndAt;
      const db = getDatabase() as any;
      if (!db) {
        return 0;
      }

      // Get subscription to fetch meter configuration
      const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.id, subscriptionId),
      });

      if (!subscription) {
        return 0;
      }

      // Aggregate all usage events for this period
      const usageAggregations = await this.getUsageForPeriod(subscriptionId, periodStartAt, periodEndAt);

      // Sum billing amounts from all meters
      const totalBillingCents = usageAggregations.reduce((sum, agg) => sum + agg.billingAmountCents, 0);

      return totalBillingCents;
    },
  };
}

// Re-export for convenience
import { subscriptions } from "@/lib/db-compat";
