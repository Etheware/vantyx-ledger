
import { eq, and, gte, isNull, or } from "drizzle-orm";
import { getDatabase, entitlements } from "@/lib/db-compat";
import { v4 as uuid } from "uuid";

export type EntitlementStatus = "active" | "expired" | "suspended" | "revoked";

export interface GrantEntitlementInput {
  tenantId: string;
  clientId: string;
  customerId: string;
  feature: string;
  quotaLimit?: number;
  subscriptionId?: string;
  licenseId?: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface EntitlementService {
  grantEntitlement(input: GrantEntitlementInput): Promise<any>;
  checkEntitlement(customerId: string, feature: string): Promise<boolean>;
  getEntitlements(customerId: string, tenantId: string): Promise<any[]>;
  consumeQuota(entitlementId: string, amount: number): Promise<boolean>;
  revokeEntitlement(entitlementId: string): Promise<void>;
  expireEntitlement(entitlementId: string): Promise<void>;
}

export function createEntitlementService(): EntitlementService {
  return {
    async grantEntitlement(input) {
      const db = getDatabase() as any;
      if (!db) {
        throw new Error("Database unavailable");
      }
      const entitlementKey = `ent_${uuid().slice(0, 16)}`;

      const entitlement = await db
        .insert(entitlements)
        .values({
          id: uuid(),
          tenantId: input.tenantId,
          clientId: input.clientId,
          customerId: input.customerId,
          entitlementKey,
          feature: input.feature,
          status: "active",
          quotaLimit: input.quotaLimit,
          subscriptionId: input.subscriptionId,
          licenseId: input.licenseId,
          activatedAt: new Date(),
          expiresAt: input.expiresAt,
          metadata: input.metadata || {},
        })
        .returning();

      return entitlement[0];
    },

    async checkEntitlement(customerId, feature) {
      const db = getDatabase() as any;
      if (!db) {
        return false;
      }
      const now = new Date();

      const entitlement = await db.query.entitlements.findFirst({
        where: and(
          eq(entitlements.customerId, customerId),
          eq(entitlements.feature, feature),
          eq(entitlements.status, "active"),
          or(isNull(entitlements.expiresAt), gte(entitlements.expiresAt, now))
        ),
      });

      return !!entitlement;
    },

    async getEntitlements(customerId, tenantId) {
      const db = getDatabase() as any;
      if (!db) {
        return [];
      }

      const results = await db.query.entitlements.findMany({
        where: (t: any) => eq(t.customerId, customerId) && eq(t.tenantId, tenantId),
      });

      return results;
    },

    async consumeQuota(entitlementId, amount) {
      const db = getDatabase() as any;
      if (!db) {
        throw new Error("Database unavailable");
      }

      const entitlement = await db.query.entitlements.findFirst({
        where: eq(entitlements.id, entitlementId),
      });

      if (!entitlement) {
        throw new Error("Entitlement not found");
      }

      if (entitlement.quotaLimit && entitlement.quotaUsed + amount > entitlement.quotaLimit) {
        return false;
      }

      await db
        .update(entitlements)
        .set({
          quotaUsed: (entitlement.quotaUsed || 0) + amount,
          updatedAt: new Date(),
        })
        .where(eq(entitlements.id, entitlementId));

      return true;
    },

    async revokeEntitlement(entitlementId) {
      const db = getDatabase() as any;
      if (!db) {
        throw new Error("Database unavailable");
      }

      await db
        .update(entitlements)
        .set({
          status: "revoked",
          revokedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(entitlements.id, entitlementId));
    },

    async expireEntitlement(entitlementId) {
      const db = getDatabase() as any;
      if (!db) {
        throw new Error("Database unavailable");
      }

      await db
        .update(entitlements)
        .set({
          status: "expired",
          expiresAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(entitlements.id, entitlementId));
    },
  };
}
