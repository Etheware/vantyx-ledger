import { VantyxCatalogProduct } from "@/lib/catalog/products";
import { TenantBranding } from "./branding";

export interface RenderedProduct extends VantyxCatalogProduct {
  displayName: string;
  displayDescription: string;
  ctaText: string;
  supportContact: string;
}

export function renderProductCopy(
  product: VantyxCatalogProduct,
  branding: TenantBranding
): RenderedProduct {
  let displayName = product.neutralName;
  let displayDescription = product.neutralDescription;

  if (branding.displayCopy.productName) {
    displayName = branding.displayCopy.productName;
  }

  if (branding.displayCopy.checkoutDescription) {
    displayDescription = branding.displayCopy.checkoutDescription;
  }

  return {
    ...product,
    displayName,
    displayDescription,
    ctaText: branding.displayCopy.claimButton || "Proceed to Checkout",
    supportContact: branding.supportEmail,
  };
}

export function renderCheckoutCopy(branding: TenantBranding): Record<string, string> {
  return {
    heading: branding.displayCopy.checkoutHeading || "Complete Your Purchase",
    description: branding.displayCopy.checkoutDescription || "Proceed with checkout",
    supportEmail: branding.supportEmail,
  };
}

export function renderClaimCopy(branding: TenantBranding): Record<string, string> {
  return {
    heading: branding.claimCopy.heading || "Claim Your License",
    instruction: branding.claimCopy.instruction || "Enter your details",
  };
}