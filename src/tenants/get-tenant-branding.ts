
import { eq } from "drizzle-orm";
import { getDatabase, tenantProductBranding, catalogProducts, tenants } from "../db";

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
    claim: string;
    billing: string;
    learning: string;
  };
}

export interface TenantBrandingWithOrgInfo extends TenantProductBranding {
  tenantName: string;
  supportEmail: string;
  brandColor: string | null;
}

/**
 * Get product branding for a specific tenant and product.
 * Fails with BrandingNotFoundError if tenant or product branding not configured.
 */
export async function getTenantProductBranding(
  tenantId: string,
  productKey: string,
): Promise<TenantBrandingWithOrgInfo> {
  const db = getDatabase();

  const rows = await db
    .select({
      tenantId: tenantProductBranding.tenantId,
      productKey: catalogProducts.productKey,
      displayName: tenantProductBranding.displayName,
      description: tenantProductBranding.description,
      receiptCopy: tenantProductBranding.receiptCopy,
      claimCopy: tenantProductBranding.claimCopy,
      onboardingCopy: tenantProductBranding.onboardingCopy,
      invoiceFooter: tenantProductBranding.invoiceFooter,
      supportUrl: tenantProductBranding.supportUrl,
      returnUrls: tenantProductBranding.returnUrls,
      tenantName: tenants.publicName,
      supportEmail: tenants.supportEmail,
      brandColor: tenants.brandColor,
    })
    .from(tenantProductBranding)
    .innerJoin(
      catalogProducts,
      eq(tenantProductBranding.productId, catalogProducts.id),
    )
    .innerJoin(tenants, eq(tenantProductBranding.tenantId, tenants.id))
    .where(
      eq(catalogProducts.productKey, productKey),
    )
    .limit(1);

  if (!rows.length) {
    throw new BrandingNotFoundError(
      `Product branding not configured: tenant=${tenantId}, product=${productKey}`,
    );
  }

  const result = rows[0];
  return {
    ...result,
    returnUrls: result.returnUrls as { success: string; claim: string; billing: string; learning: string },
  };
}

/**
 * Get all product branding for a specific tenant.
 * Returns empty array if tenant has no branding configured.
 */
export async function getTenantBrandingByTenantId(
  tenantId: string,
): Promise<TenantBrandingWithOrgInfo[]> {
  const db = getDatabase();

  const rows = await db
    .select({
      tenantId: tenantProductBranding.tenantId,
      productKey: catalogProducts.productKey,
      displayName: tenantProductBranding.displayName,
      description: tenantProductBranding.description,
      receiptCopy: tenantProductBranding.receiptCopy,
      claimCopy: tenantProductBranding.claimCopy,
      onboardingCopy: tenantProductBranding.onboardingCopy,
      invoiceFooter: tenantProductBranding.invoiceFooter,
      supportUrl: tenantProductBranding.supportUrl,
      returnUrls: tenantProductBranding.returnUrls,
      tenantName: tenants.publicName,
      supportEmail: tenants.supportEmail,
      brandColor: tenants.brandColor,
    })
    .from(tenantProductBranding)
    .innerJoin(
      catalogProducts,
      eq(tenantProductBranding.productId, catalogProducts.id),
    )
    .innerJoin(tenants, eq(tenantProductBranding.tenantId, tenants.id))
    .where(eq(tenantProductBranding.tenantId, tenantId));

  return rows.map((row) => ({
    ...row,
    returnUrls: row.returnUrls as { success: string; claim: string; billing: string; learning: string },
  }));
}