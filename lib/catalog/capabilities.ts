export const VANTYX_CAPABILITIES = {
  LEARNING: "learning",
  PRACTICUM: "practicum",
  CERTIFICATION: "certification",
  ANALYTICS: "analytics",
  TEAM_MANAGEMENT: "team_management",
  AUDIT: "audit",
  API_ACCESS: "api_access",
  WEBHOOKS: "webhooks",
  ADVANCED_ANALYTICS: "advanced_analytics",
  CUSTOM_BRANDING: "custom_branding",
  SSO: "sso",
  DEDICATED_SUPPORT: "dedicated_support",
} as const;

export type VantyxCapability = (typeof VANTYX_CAPABILITIES)[keyof typeof VANTYX_CAPABILITIES];

export function capabilityLabel(capability: VantyxCapability): string {
  const labels: Record<VantyxCapability, string> = {
    learning: "Learning Platform Access",
    practicum: "Hands-on Labs",
    certification: "Certification",
    analytics: "Basic Analytics",
    team_management: "Team Management",
    audit: "Audit Logs",
    api_access: "API Access",
    webhooks: "Webhooks",
    advanced_analytics: "Advanced Analytics",
    custom_branding: "Custom Branding",
    sso: "Single Sign-On",
    dedicated_support: "Dedicated Support",
  };
  return labels[capability];
}