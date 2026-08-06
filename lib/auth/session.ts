
import crypto from "crypto";
/**
 * Vantyx AuthSession — Server-Side, Opaque Token Session Management
 *
 * Sessions are NOT JWTs. All session state lives server-side; only an opaque
 * sessionId is sent to the client in an HttpOnly cookie. The server maintains
 * a revocable session store, allowing instant logout and token invalidation.
 */

export type UserRole =
  | "owner"
  | "admin"
  | "billing"
  | "member"
  | "viewer"
  | "api_user";

export type BillingStatus = "active" | "trial" | "overdue" | "suspended" | "paused";

export type ComplianceStatus = {
  pci: "passed" | "pending" | "failed";
  kyc: "passed" | "pending" | "failed" | "not_required";
  sanctions: "clear" | "pending" | "flagged";
};

export type AuthSession = {
  userId: string;                    // UUID
  userEmail: string;                 // user@org.com
  orgSlug: string;                   // "acme", "etheware", "bep", etc.
  orgUuid: string;                   // UUID of org record
  orgName: string;                   // Display name
  orgAvatarUrl?: string;             // Org logo URL
  userAvatarUrl?: string;            // User avatar URL
  activeOrgUuid: string | null;      // Can switch between orgs user is member of
  memberOfOrgs: Array<{ uuid: string; slug: string; name: string }>; // Orgs user has access to
  role: UserRole;                    // "owner" | "admin" | "billing" | "member" | "viewer" | "api_user"
  capabilities: string[];            // Resolved from role + org state below
  billingStatus: BillingStatus;      // "active" | "trial" | "overdue" | "suspended" | "paused"
  complianceStatus: ComplianceStatus;
  environment: "prod" | "staging" | "sandbox" | "dev";
  tokenIssuedAt: number;             // Unix timestamp (ms)
  tokenExpiresAt: number;            // Unix timestamp (ms)
  sessionId: string;                 // Opaque, server-side revocable
  consentedToTerms: boolean;
  emailVerified: boolean;
  mfaEnabled: boolean;
};

/**
 * In-memory session store (replace with Redis in production).
 * Key: sessionId, Value: AuthSession
 */
const SESSION_STORE = new Map<string, AuthSession>();

/**
 * Revoked session IDs (set to prevent replay after logout).
 * In production, use Redis with TTL = tokenExpiresAt.
 */
const REVOKED_SESSIONS = new Set<string>();

/**
 * Create a new session after successful authentication.
 */
export async function createSession(
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    mfaEnabled: boolean;
  },
  org: {
    uuid: string;
    slug: string;
    name: string;
    avatar?: string;
  },
  role: UserRole,
  options?: {
    expiresIn?: number; // milliseconds, default 7 days
    environment?: "prod" | "staging" | "sandbox" | "dev";
  }
): Promise<AuthSession> {
  const sessionId = generateSessionId();
  const now = Date.now();
  const expiresIn = options?.expiresIn || 7 * 24 * 60 * 60 * 1000; // 7 days
  const tokenExpiresAt = now + expiresIn;

  // Resolve capabilities from role + org state
  const capabilities = resolveCapabilities(role, org, "active", "prod");

  const session: AuthSession = {
    userId: user.id,
    userEmail: user.email,
    orgSlug: org.slug,
    orgUuid: org.uuid,
    orgName: org.name,
    orgAvatarUrl: org.avatar,
    activeOrgUuid: org.uuid,
    memberOfOrgs: [{ uuid: org.uuid, slug: org.slug, name: org.name }],
    role,
    capabilities,
    billingStatus: "active",
    complianceStatus: {
      pci: "passed",
      kyc: "passed",
      sanctions: "clear",
    },
    environment: options?.environment || "prod",
    tokenIssuedAt: now,
    tokenExpiresAt,
    sessionId,
    consentedToTerms: true,
    emailVerified: user.emailVerified,
    mfaEnabled: user.mfaEnabled,
  };

  // Store session server-side
  SESSION_STORE.set(sessionId, session);

  return session;
}

/**
 * Verify a session token from the request cookie.
 * Returns the AuthSession or null if invalid/expired/revoked.
 */
export async function verifySessionToken(sessionId: string): Promise<AuthSession | null> {
  // Check if revoked
  if (REVOKED_SESSIONS.has(sessionId)) {
    return null;
  }

  // Retrieve from store
  const session = SESSION_STORE.get(sessionId);
  if (!session) {
    return null;
  }

  // Check expiration
  if (session.tokenExpiresAt < Date.now()) {
    SESSION_STORE.delete(sessionId);
    return null;
  }

  // TODO: In production, re-derive capabilities in case org state changed
  // (e.g., billing became overdue, KYC completed, etc.)

  return session;
}

/**
 * Invalidate a session (logout).
 */
export async function revokeSession(sessionId: string): Promise<void> {
  REVOKED_SESSIONS.add(sessionId);
  SESSION_STORE.delete(sessionId);
}

/**
 * Resolve capabilities based on role + org state.
 */
export function resolveCapabilities(
  role: UserRole,
  org: { uuid: string; slug: string; name: string },
  billingStatus: BillingStatus,
  environment: "prod" | "staging" | "sandbox" | "dev"
): string[] {
  const capabilities: Set<string> = new Set();

  // Role-based baseline
  const roleCapabilities: Record<UserRole, string[]> = {
    owner: [
      "org:read",
      "org:write",
      "org:delete",
      "members:manage",
      "billing:edit",
      "billing:admin",
      "invoices:read",
      "invoices:export",
      "subscriptions:manage",
      "licenses:manage",
      "ledger:audit",
      "webhooks:admin",
      "api-keys:admin",
      "team:invite",
      "reports:view",
      "dashboard:admin",
    ],
    admin: [
      "org:read",
      "members:manage",
      "billing:view",
      "invoices:read",
      "invoices:export",
      "subscriptions:view",
      "licenses:manage",
      "webhooks:admin",
      "api-keys:view",
      "team:invite",
      "reports:view",
      "dashboard:view",
    ],
    billing: [
      "billing:view",
      "invoices:read",
      "invoices:export",
      "subscriptions:view",
      "reports:view",
      "dashboard:view",
    ],
    member: [
      "subscriptions:view",
      "licenses:read",
      "invoices:read",
      "dashboard:view",
    ],
    viewer: ["invoices:read", "subscriptions:view", "dashboard:view"],
    api_user: [], // API key scopes determine capabilities, not role
  };

  roleCapabilities[role]?.forEach((cap) => capabilities.add(cap));

  // Billing status modifiers
  if (billingStatus === "trial") {
    capabilities.add("trial:active");
    capabilities.delete("billing:edit"); // Prevent plan changes mid-trial
  }

  if (billingStatus === "overdue") {
    capabilities.add("billing:overdue");
    capabilities.delete("subscriptions:manage");
    capabilities.delete("licenses:manage");
    // Read-only mode
  }

  if (billingStatus === "suspended") {
    capabilities.add("billing:suspended");
    // Remove all write capabilities
    capabilities.forEach((cap) => {
      if (cap.includes(":edit") || cap.includes(":manage") || cap.includes(":admin")) {
        capabilities.delete(cap);
      }
    });
  }

  // Environment modifiers
  if (environment !== "prod") {
    capabilities.add(`env:${environment}`);
    capabilities.add("testdata:create");
  }

  return Array.from(capabilities).sort();
}

/**
 * Generate a cryptographically secure session ID.
 */
function generateSessionId(): string {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  const b64 = Buffer.from(bytes).toString("base64");
  const urlSafe = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return `sess_${urlSafe}`;
}

/**
 * Get the current session from the request context.
 * Used in Server Components and API routes.
 */
export async function getSession(): Promise<AuthSession | null> {
  // TODO: Extract sessionId from incoming request cookie
  // This will be called from middleware with the request context attached
  return null;
}
