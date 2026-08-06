
import { and, eq } from "drizzle-orm";
import { getDatabase, tenantProductBranding, catalogProducts, tenants } from "../db";
import { getClientBranding } from "@/lib/tenants/branding";

export class BrandingNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BrandingNotFoundError";
  }
}

export interface TenantProductBranding {
  tenantId: string;
  productKey: string;
  displayName: string;
  description: string;
  receiptCopy: string;
  claimCopy: string;
  onboardingCopy: string;
  invoiceFooter: string;
  supportUrl: string;
  returnUrls: {
    success: string;
    cancel: string;
    claim: string;
    billing: string;
    learning: string;
  };
}

export interface TenantBrandingWithOrgInfo extends TenantProductBranding {
  tenantName: string;
  supportEmail: string;
  brandColor: string | null;
  ownedDomains: string[];
}

function extractDomain(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  const emailParts = trimmed.split("@");
  if (emailParts.length === 2 && emailParts[1]) {
    return emailParts[1];
  }

  try {
    const url = new URL(trimmed);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function uniqueDomains(domains: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      domains
        .map((domain) => (domain ? domain.trim().toLowerCase() : ""))
        .filter((domain) => domain.length > 0),
    ),
  );
}

/**
 * Get product branding for a specific tenant and product.
 * Fails with BrandingNotFoundError if tenant or product branding not configured.
 */
export async function getTenantProductBranding(
  tenantId: string,
  productKey: string,
): Promise<TenantBrandingWithOrgInfo> {
  const db = getDatabase() as any;
  if (!db) {
    throw new BrandingNotFoundError(`Tenant not found: ${tenantId}`);
  }

  const rows = await db
    .select({
      tenantId: tenantProductBranding.tenantId,
      productKey: catalogProducts.key,
      displayName: catalogProducts.name,
      description: catalogProducts.description,
      receiptCopy: null,
      claimCopy: null,
      onboardingCopy: null,
      invoiceFooter: null,
      supportUrl: null,
      returnUrls: null,
      tenantName: tenants.name,
      supportEmail: tenants.supportEmail,
      brandColor: tenants.brandColor,
      logoUrl: tenantProductBranding.logoUrl,
    })
    .from(tenantProductBranding)
    .innerJoin(
      catalogProducts,
      eq(tenantProductBranding.productId, catalogProducts.id),
    )
    .innerJoin(tenants, eq(tenantProductBranding.tenantId, tenants.id))
    .where(and(eq(tenantProductBranding.tenantId, tenantId), eq(catalogProducts.key, productKey)))
    .limit(1);

  if (!rows.length) {
    throw new BrandingNotFoundError(
      `Product branding not configured: tenant=${tenantId}, product=${productKey}`,
    );
  }

  const result = rows[0];
  const clientBranding = getClientBranding(tenantId);
  const ownedDomains = uniqueDomains([
    ...(clientBranding.ownedDomains || []),
    extractDomain(result.supportEmail),
    extractDomain(clientBranding.supportEmail),
    extractDomain(clientBranding.returnUrls.successUrl),
    extractDomain(clientBranding.returnUrls.cancelUrl),
    extractDomain(clientBranding.returnUrls.claimUrl),
    extractDomain(clientBranding.returnUrls.billingUrl),
    extractDomain(clientBranding.returnUrls.learningUrl),
  ]);
  return {
    tenantId: result.tenantId,
    productKey: result.productKey,
    displayName: result.displayName ?? clientBranding.displayCopy.productName,
    description: result.description ?? clientBranding.displayCopy.checkoutDescription,
    receiptCopy: result.receiptCopy ?? clientBranding.receiptCopy,
    claimCopy: result.claimCopy ?? clientBranding.claimCopy,
    onboardingCopy: result.onboardingCopy ?? clientBranding.onboardingCopy,
    invoiceFooter: result.invoiceFooter ?? clientBranding.invoiceFooter,
    supportUrl: clientBranding.supportUrl,
    returnUrls: {
      success: clientBranding.returnUrls.successUrl,
      cancel: clientBranding.returnUrls.cancelUrl,
      claim: clientBranding.returnUrls.claimUrl ?? clientBranding.returnUrls.successUrl,
      billing: clientBranding.returnUrls.billingUrl ?? clientBranding.returnUrls.successUrl,
      learning: clientBranding.returnUrls.learningUrl ?? clientBranding.returnUrls.successUrl,
    },
    tenantName: result.tenantName ?? clientBranding.publicName,
    supportEmail: result.supportEmail ?? clientBranding.supportEmail,
    brandColor: result.brandColor ?? clientBranding.brandColor,
    ownedDomains,
  };
}

/**
 * Get all product branding for a specific tenant.
 * Returns empty array if tenant has no branding configured.
 */
export async function getTenantBrandingByTenantId(
  tenantId: string,
): Promise<TenantBrandingWithOrgInfo[]> {
  const db = getDatabase() as any;
  if (!db) {
    return [];
  }

  const rows = await db
    .select({
      tenantId: tenantProductBranding.tenantId,
      productKey: catalogProducts.key,
      displayName: catalogProducts.name,
      description: catalogProducts.description,
      receiptCopy: null,
      claimCopy: null,
      onboardingCopy: null,
      invoiceFooter: null,
      supportUrl: null,
      returnUrls: null,
      tenantName: tenants.name,
      supportEmail: tenants.supportEmail,
      brandColor: tenants.brandColor,
      logoUrl: tenantProductBranding.logoUrl,
    })
    .from(tenantProductBranding)
    .innerJoin(
      catalogProducts,
      eq(tenantProductBranding.productId, catalogProducts.id),
    )
    .innerJoin(tenants, eq(tenantProductBranding.tenantId, tenants.id))
    .where(eq(tenantProductBranding.tenantId, tenantId));

  return rows.map((row: any) => ({
    tenantId: row.tenantId,
    productKey: row.productKey,
    displayName: row.displayName ?? getClientBranding(tenantId).displayCopy.productName,
    description: row.description ?? getClientBranding(tenantId).displayCopy.checkoutDescription,
    receiptCopy: row.receiptCopy ?? getClientBranding(tenantId).receiptCopy,
    claimCopy: row.claimCopy ?? getClientBranding(tenantId).claimCopy,
    onboardingCopy: row.onboardingCopy ?? getClientBranding(tenantId).onboardingCopy,
    invoiceFooter: row.invoiceFooter ?? getClientBranding(tenantId).invoiceFooter,
    supportUrl: getClientBranding(tenantId).supportUrl,
    returnUrls: {
      success: getClientBranding(tenantId).returnUrls.successUrl,
      cancel: getClientBranding(tenantId).returnUrls.cancelUrl,
      claim: getClientBranding(tenantId).returnUrls.claimUrl ?? getClientBranding(tenantId).returnUrls.successUrl,
      billing: getClientBranding(tenantId).returnUrls.billingUrl ?? getClientBranding(tenantId).returnUrls.successUrl,
      learning: getClientBranding(tenantId).returnUrls.learningUrl ?? getClientBranding(tenantId).returnUrls.successUrl,
    },
    tenantName: row.tenantName ?? getClientBranding(tenantId).publicName,
    supportEmail: row.supportEmail ?? getClientBranding(tenantId).supportEmail,
    brandColor: row.brandColor ?? getClientBranding(tenantId).brandColor,
    ownedDomains: uniqueDomains([
      ...(getClientBranding(tenantId).ownedDomains || []),
      extractDomain(row.supportEmail),
      extractDomain(getClientBranding(tenantId).supportEmail),
      extractDomain(getClientBranding(tenantId).returnUrls.successUrl),
      extractDomain(getClientBranding(tenantId).returnUrls.cancelUrl),
      extractDomain(getClientBranding(tenantId).returnUrls.claimUrl),
      extractDomain(getClientBranding(tenantId).returnUrls.billingUrl),
      extractDomain(getClientBranding(tenantId).returnUrls.learningUrl),
    ]),
  }));
}
