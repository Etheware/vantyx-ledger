import { VantyxCapability } from "./capabilities";

export interface VantyxCatalogProduct {
  productKey: string;
  neutralName: string;
  neutralDescription: string;
  productFamily: "learning" | "organization" | "api" | "enterprise";
  capabilityKeys: VantyxCapability[];
  billingModel: "subscription" | "one-time" | "usage-based";
  interval: "week" | "month" | "quarter" | "year" | null;
  priceCents: number;
  currency: "USD" | "EUR" | "GBP";
  metadata: Record<string, unknown>;
}

export const VANTYX_PRODUCTS: VantyxCatalogProduct[] = [
  {
    productKey: "weekly-license",
    neutralName: "Weekly Learning License",
    neutralDescription: "7-day access to learning platform",
    productFamily: "learning",
    capabilityKeys: ["learning"],
    billingModel: "subscription",
    interval: "week",
    priceCents: 999,
    currency: "USD",
    metadata: {},
  },
  {
    productKey: "monthly-license",
    neutralName: "Monthly Learning License",
    neutralDescription: "30-day access to learning platform",
    productFamily: "learning",
    capabilityKeys: ["learning", "practicum"],
    billingModel: "subscription",
    interval: "month",
    priceCents: 2999,
    currency: "USD",
    metadata: {},
  },
  {
    productKey: "quarterly-license",
    neutralName: "Quarterly Learning License",
    neutralDescription: "90-day access to learning platform",
    productFamily: "learning",
    capabilityKeys: ["learning", "practicum", "certification"],
    billingModel: "subscription",
    interval: "quarter",
    priceCents: 7999,
    currency: "USD",
    metadata: {},
  },
  {
    productKey: "annual-license",
    neutralName: "Annual Learning License",
    neutralDescription: "365-day access to learning platform",
    productFamily: "learning",
    capabilityKeys: ["learning", "practicum", "certification", "analytics"],
    billingModel: "subscription",
    interval: "year",
    priceCents: 29999,
    currency: "USD",
    metadata: {},
  },
  {
    productKey: "org-starter",
    neutralName: "Organization Starter Plan",
    neutralDescription: "Team access for up to 10 members",
    productFamily: "organization",
    capabilityKeys: [
      "learning",
      "practicum",
      "team_management",
      "analytics",
    ],
    billingModel: "subscription",
    interval: "month",
    priceCents: 9999,
    currency: "USD",
    metadata: { maxSeats: 10 },
  },
  {
    productKey: "org-professional",
    neutralName: "Organization Professional Plan",
    neutralDescription: "Team access for up to 50 members",
    productFamily: "organization",
    capabilityKeys: [
      "learning",
      "practicum",
      "team_management",
      "analytics",
      "advanced_analytics",
      "audit",
    ],
    billingModel: "subscription",
    interval: "month",
    priceCents: 29999,
    currency: "USD",
    metadata: { maxSeats: 50 },
  },
  {
    productKey: "api-starter",
    neutralName: "API Starter Plan",
    neutralDescription: "API access with 100k requests/month",
    productFamily: "api",
    capabilityKeys: ["api_access", "webhooks"],
    billingModel: "subscription",
    interval: "month",
    priceCents: 4999,
    currency: "USD",
    metadata: { requestsPerMonth: 100000 },
  },
  {
    productKey: "enterprise",
    neutralName: "Enterprise Plan",
    neutralDescription: "Custom deployment and support",
    productFamily: "enterprise",
    capabilityKeys: [
      "learning",
      "practicum",
      "certification",
      "analytics",
      "team_management",
      "audit",
      "api_access",
      "webhooks",
      "advanced_analytics",
      "custom_branding",
      "sso",
      "dedicated_support",
    ],
    billingModel: "one-time",
    interval: null,
    priceCents: 0,
    currency: "USD",
    metadata: { custom: true },
  },
];

export function getProductByKey(productKey: string): VantyxCatalogProduct | null {
  return VANTYX_PRODUCTS.find((p) => p.productKey === productKey) || null;
}

export function getProductsByFamily(
  family: VantyxCatalogProduct["productFamily"]
): VantyxCatalogProduct[] {
  return VANTYX_PRODUCTS.filter((p) => p.productFamily === family);
}