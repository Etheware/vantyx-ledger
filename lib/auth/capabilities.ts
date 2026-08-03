
/**
 * Capability Checker Utilities
 *
 * Components and routes use these functions to conditionally render or allow access
 * based on the resolved capabilities from the session.
 */

export type CapabilityCheckFn = {
  /**
   * Check if session has a single capability.
   */
  has: (capability: string | string[]) => boolean;

  /**
   * Check if session has any of the provided capabilities.
   */
  hasAny: (capabilities: string[]) => boolean;

  /**
   * Check if session has all of the provided capabilities.
   */
  hasAll: (capabilities: string[]) => boolean;

  /**
   * Get the flat list of all capabilities.
   */
  getAll: () => string[];
};

/**
 * Create a capability checker from a capabilities array.
 */
export function createCapabilityChecker(capabilities: string[]): CapabilityCheckFn {
  const set = new Set(capabilities);

  return {
    has: (capability: string | string[]) => {
      if (Array.isArray(capability)) {
        return capability.every((c) => set.has(c));
      }
      return set.has(capability);
    },

    hasAny: (capabilities: string[]) => {
      return capabilities.some((c) => set.has(c));
    },

    hasAll: (capabilities: string[]) => {
      return capabilities.every((c) => set.has(c));
    },

    getAll: () => Array.from(set).sort(),
  };
}

/**
 * Route-specific capability requirements.
 * Used by middleware to protect routes before rendering.
 */
export const ROUTE_PROTECTION: Record<string, string[]> = {
  // Dashboard & Overview
  "/dashboard": ["dashboard:view"],

  // Billing & Subscriptions
  "/billing": ["billing:view"],
  "/billing/edit": ["billing:edit"],
  "/subscriptions": ["subscriptions:view"],
  "/subscriptions/create": ["subscriptions:manage"],
  "/subscriptions/[id]/cancel": ["subscriptions:manage"],

  // Invoices
  "/invoices": ["invoices:read"],
  "/invoices/[id]": ["invoices:read"],
  "/invoices/export": ["invoices:export"],

  // Licenses & Entitlements
  "/licenses": ["licenses:manage"],
  "/licenses/[id]": ["licenses:manage"],

  // Team & Members
  "/team": ["members:manage"],
  "/team/invite": ["team:invite"],
  "/team/members": ["members:manage"],

  // Ledger & Accounting (Audit-Only)
  "/ledger": ["ledger:audit"],
  "/ledger/[id]": ["ledger:audit"],

  // Webhooks
  "/webhooks": ["webhooks:admin"],
  "/webhooks/[id]": ["webhooks:admin"],

  // API Keys
  "/api-keys": ["api-keys:view"],
  "/api-keys/create": ["api-keys:admin"],

  // Admin Console
  "/admin": ["org:write"],
  "/admin/org": ["org:write"],
  "/admin/members": ["members:manage"],
  "/admin/billing": ["billing:admin"],
  "/admin/webhooks": ["webhooks:admin"],
  "/admin/api-keys": ["api-keys:admin"],

  // Reports & Analytics
  "/reports": ["reports:view"],
  "/reports/[id]": ["reports:view"],

  // Account & Settings (Not capability-gated, available to all authenticated users)
  "/account/profile": [],
  "/account/security": [],
  "/account/notifications": [],
  "/account/connected": [],
  "/org/settings": ["org:read"],
  "/org/switch": [],
};

/**
 * Check if a route is protected and what capabilities it requires.
 */
export function getRouteCapabilityRequirement(path: string): string[] {
  // Exact match
  if (ROUTE_PROTECTION[path]) {
    return ROUTE_PROTECTION[path];
  }

  // Prefix match (for dynamic routes)
  for (const [route, required] of Object.entries(ROUTE_PROTECTION)) {
    if (route.includes("[")) {
      // Convert "/billing/[id]" to regex "/billing/.*"
      const pattern = route
        .replace(/\[.*?\]/g, "[^/]+")
        .replace(/\//g, "\\/");
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(path)) {
        return required;
      }
    }
  }

  // No protection found
  return [];
}

/**
 * Public routes that don't require authentication.
 */
export const PUBLIC_ROUTES = [
  "/",
  "/pricing",
  "/docs",
  "/status",
  "/auth/signin",
  "/auth/signup",
  "/auth/reset",
  "/auth/verify-email",
  "/api/health",
  "/api/status",
];

export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route === path) return true;
    // Prefix match for dynamic public routes
    if (route.endsWith("*")) {
      return path.startsWith(route.slice(0, -1));
    }
    return false;
  });
}