import { eq, and, gte, isNull, or } from "drizzle-orm";
import { getDatabase, licenses } from "@/lib/db-compat";
import { v4 as uuid } from "uuid";

export type LicenseStatus = "pending" | "active" | "suspended" | "expired" | "revoked";

export interface IssueLicenseInput {
  tenantId: string;
  clientId: string;
  productId: string;
  customerId: string;
  customerEmail: string;
  tier: "free" | "pro" | "enterprise";
  seatLimit?: number;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface LicenseService {
  issueLicense(input: IssueLicenseInput): Promise<any>;
  activateLicense(licenseId: string, tenantId: string): Promise<void>;
  validateLicense(licenseKey: string, tenantId: string): Promise<boolean>;
  getLicense(licenseId: string, tenantId: string): Promise<any | null>;
  getLicensesByCustomer(customerId: string, tenantId: string): Promise<any[]>;
  suspendLicense(licenseId: string, tenantId: string): Promise<void>;
  revokeLicense(licenseId: string, tenantId: string): Promise<void>;
  extendLicense(licenseId: string, tenantId: string, newExpiresAt: Date): Promise<void>;
}

export function createLicenseService(): LicenseService {
  return {
    async issueLicense(input) {
      const db = getDatabase() as any;
      if (!db) {
        throw new Error("Database unavailable");
      }

      const licenseKey = `lic_${uuid().slice(0, 24)}`;

      const license = await db
        .insert(licenses)
        .values({
          id: uuid(),
          tenantId: input.tenantId,
          clientId: input.clientId,
          productId: input.productId,
          customerId: input.customerId,
          customerEmail: input.customerEmail,
          licenseKey,
          tier: input.tier,
          status: "pending",
          seatLimit: input.seatLimit,
          seatUsed: 0,
          expiresAt: input.expiresAt,
          issuedAt: new Date(),
          activatedAt: null,
          metadata: input.metadata || {},
        })
        .returning();

      return license[0];
    },

    async activateLicense(licenseId, tenantId) {
      const db = getDatabase() as any;
      if (!db) {
        throw new Error("Database unavailable");
      }

      const license = await db.query.licenses.findFirst({
        where: and(eq(licenses.id, licenseId), eq(licenses.tenantId, tenantId)),
      });

      if (!license) {
        throw new Error("License not found");
      }

      await db
        .update(licenses)
        .set({
          status: "active",
          activatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(licenses.id, licenseId));
    },

    async validateLicense(licenseKey, tenantId) {
      const db = getDatabase() as any;
      if (!db) {
        return false;
      }

      const now = new Date();
      const license = await db.query.licenses.findFirst({
        where: and(
          eq(licenses.tenantId, tenantId),
          eq(licenses.licenseKey, licenseKey),
          eq(licenses.status, "active"),
          or(isNull(licenses.expiresAt), gte(licenses.expiresAt, now))
        ),
      });

      return !!license;
    },

    async getLicense(licenseId, tenantId) {
      const db = getDatabase() as any;
      if (!db) {
        return null;
      }

      const result = await db.query.licenses.findFirst({
        where: and(eq(licenses.id, licenseId), eq(licenses.tenantId, tenantId)),
      });

      return result || null;
    },

    async getLicensesByCustomer(customerId, tenantId) {
      const db = getDatabase() as any;
      if (!db) {
        return [];
      }

      const results = await db.query.licenses.findMany({
        where: and(
          eq(licenses.tenantId, tenantId),
          eq(licenses.customerId, customerId)
        ),
      });

      return results;
    },

    async suspendLicense(licenseId, tenantId) {
      const db = getDatabase() as any;
      if (!db) {
        throw new Error("Database unavailable");
      }

      const license = await db.query.licenses.findFirst({
        where: and(eq(licenses.id, licenseId), eq(licenses.tenantId, tenantId)),
      });

      if (!license) {
        throw new Error("License not found");
      }

      await db
        .update(licenses)
        .set({
          status: "suspended",
          updatedAt: new Date(),
        })
        .where(eq(licenses.id, licenseId));
    },

    async revokeLicense(licenseId, tenantId) {
      const db = getDatabase() as any;
      if (!db) {
        throw new Error("Database unavailable");
      }

      const license = await db.query.licenses.findFirst({
        where: and(eq(licenses.id, licenseId), eq(licenses.tenantId, tenantId)),
      });

      if (!license) {
        throw new Error("License not found");
      }

      await db
        .update(licenses)
        .set({
          status: "revoked",
          revokedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(licenses.id, licenseId));
    },

    async extendLicense(licenseId, tenantId, newExpiresAt) {
      const db = getDatabase() as any;
      if (!db) {
        throw new Error("Database unavailable");
      }

      const license = await db.query.licenses.findFirst({
        where: and(eq(licenses.id, licenseId), eq(licenses.tenantId, tenantId)),
      });

      if (!license) {
        throw new Error("License not found");
      }

      await db
        .update(licenses)
        .set({
          expiresAt: newExpiresAt,
          updatedAt: new Date(),
        })
        .where(eq(licenses.id, licenseId));
    },
  };
}
