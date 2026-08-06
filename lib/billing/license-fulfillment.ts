import { and, eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getDatabase, entitlements, licenses } from "@/lib/db-compat";
import { createEntitlementService } from "@/lib/vantyx/entitlement-service";
import { createInvoiceService } from "@/lib/vantyx/invoice-service";
import { createPaymentService } from "@/lib/vantyx/payment-service";
import { getTenantProductBranding } from "@/src/tenants/get-tenant-branding";

export type LicenseClaimReview = {
  allowed: boolean;
  reason?: "payment_not_confirmed" | "domain_not_verified" | "invalid_email";
};

export type LicenseClaimReviewInput = {
  paymentConfirmed: boolean;
  tenantOwnedDomains: string[];
  claimantEmail: string;
};

export type LicenseActivationInput = {
  tenantId: string;
  clientId: string;
  customerId: string;
  customerEmail: string;
  productKey: string;
  paymentConfirmed: boolean;
  checkoutSessionId?: string;
  invoiceId?: string;
  paymentId?: string;
  licenseId?: string;
};

export type LicenseActivationResult = {
  activated: boolean;
  reason?: LicenseClaimReview["reason"];
  licenseId?: string;
  entitlementId?: string;
};

export function extractEmailDomain(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const parts = trimmed.split("@");
  if (parts.length !== 2 || !parts[1]) {
    return null;
  }

  return parts[1];
}

export function deriveOwnedDomains(input: {
  supportEmail?: string | null;
  returnUrls?: {
    successUrl?: string | null;
    cancelUrl?: string | null;
    claimUrl?: string | null;
    billingUrl?: string | null;
    learningUrl?: string | null;
  };
  ownedDomains?: string[] | null;
}): string[] {
  const inferredDomains = [
    ...(input.ownedDomains || []),
    extractEmailDomain(input.supportEmail || ""),
    extractHostname(input.returnUrls?.successUrl),
    extractHostname(input.returnUrls?.cancelUrl),
    extractHostname(input.returnUrls?.claimUrl),
    extractHostname(input.returnUrls?.billingUrl),
    extractHostname(input.returnUrls?.learningUrl),
  ];

  return Array.from(
    new Set(
      inferredDomains
        .map((domain) => (domain ? domain.trim().toLowerCase() : ""))
        .filter((domain) => domain.length > 0),
    ),
  );
}

export function canActivateLicenseClaim(input: LicenseClaimReviewInput): LicenseClaimReview {
  if (!input.paymentConfirmed) {
    return { allowed: false, reason: "payment_not_confirmed" };
  }

  const claimantDomain = extractEmailDomain(input.claimantEmail);
  if (!claimantDomain) {
    return { allowed: false, reason: "invalid_email" };
  }

  if (input.tenantOwnedDomains.length === 0) {
    return { allowed: true };
  }

  const normalizedDomains = input.tenantOwnedDomains.map((domain) => domain.trim().toLowerCase());
  if (normalizedDomains.includes(claimantDomain)) {
    return { allowed: true };
  }

  return { allowed: false, reason: "domain_not_verified" };
}

export async function activateLicenseAfterPayment(
  input: LicenseActivationInput,
): Promise<LicenseActivationResult> {
  const branding = await getTenantProductBranding(input.tenantId, input.productKey);
  const review = canActivateLicenseClaim({
    paymentConfirmed: input.paymentConfirmed,
    tenantOwnedDomains: branding.ownedDomains,
    claimantEmail: input.customerEmail,
  });

  if (!review.allowed) {
    return { activated: false, reason: review.reason };
  }

  const db = getDatabase() as any;
  if (!db) {
    throw new Error("Database unavailable");
  }

  const invoiceService = createInvoiceService();
  const paymentService = createPaymentService();
  const entitlementService = createEntitlementService();

  if (input.invoiceId) {
    await invoiceService.markAsPaid(input.invoiceId, input.tenantId).catch(() => undefined);
  }

  if (input.paymentId) {
    await paymentService.updatePaymentStatus(input.paymentId, input.tenantId, "completed").catch(() => undefined);
  }

  let licenseRecord = null;
  if (input.licenseId) {
    const existing = await db.query.licenses.findFirst({
      where: and(eq(licenses.id, input.licenseId), eq(licenses.tenantId, input.tenantId)),
    });

    if (existing) {
      await db
        .update(licenses)
        .set({
          status: "active",
        })
        .where(and(eq(licenses.id, existing.id), eq(licenses.tenantId, input.tenantId)));
      licenseRecord = existing;
    }
  }

  if (!licenseRecord) {
    const inserted = await db
      .insert(licenses)
      .values({
        id: input.licenseId || uuid(),
        tenantId: input.tenantId,
        key: `lic_${uuid().slice(0, 20)}`,
        status: "active",
        expiresAt: null,
      })
      .returning();
    licenseRecord = inserted[0] || null;
  }

  if (!licenseRecord) {
    throw new Error("Failed to activate license");
  }

  const existingEntitlement = await db.query.entitlements.findFirst({
    where: and(
      eq(entitlements.tenantId, input.tenantId),
      eq(entitlements.customerId, input.customerId),
      eq(entitlements.licenseId, licenseRecord.id),
    ),
  });

  const entitlement =
    existingEntitlement ||
    (await entitlementService.grantEntitlement({
      tenantId: input.tenantId,
      clientId: input.clientId,
      customerId: input.customerId,
      feature: input.productKey,
      licenseId: licenseRecord.id,
      metadata: {
        checkoutSessionId: input.checkoutSessionId,
        paymentId: input.paymentId,
        invoiceId: input.invoiceId,
      },
    }));

  return {
    activated: true,
    licenseId: licenseRecord.id,
    entitlementId: entitlement?.id,
  };
}

function extractHostname(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
