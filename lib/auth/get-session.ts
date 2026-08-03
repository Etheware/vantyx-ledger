
import { headers } from "next/headers";
import type { AuthSession } from "./session";

/**
 * getSession — Server-side helper to retrieve session from request headers
 *
 * Called in Server Components (like layout.tsx) to hydrate SessionProvider.
 * Middleware attaches session context headers; this function reconstructs it.
 *
 * Note: This parses headers attached by middleware. If called outside request context,
 * returns null.
 */
export async function getSession(): Promise<AuthSession | null> {
  try {
    const headersList = headers();
    const sessionId = headersList.get("x-session-id");
    const userId = headersList.get("x-user-id");
    const userEmail = headersList.get("x-user-email");
    const orgSlug = headersList.get("x-org-slug");
    const orgUuid = headersList.get("x-org-uuid");
    const capabilities = headersList.get("x-capabilities");

    // If any required header is missing, session is not available
    if (!sessionId || !userId || !userEmail || !orgSlug || !orgUuid || !capabilities) {
      return null;
    }

    // Reconstruct AuthSession from headers
    // Note: Some fields (tokenExpiresAt, orgName, etc.) are not in headers
    // For a real implementation, you'd query the session store or Redis using sessionId
    const session: AuthSession = {
      userId,
      userEmail,
      orgSlug,
      orgUuid,
      orgName: orgSlug, // TODO: derive from org record
      activeOrgUuid: orgUuid,
      memberOfOrgs: [{ uuid: orgUuid, slug: orgSlug, name: orgSlug }],
      role: "member", // TODO: derive from session store
      capabilities: capabilities ? JSON.parse(capabilities) : [],
      billingStatus: "active",
      complianceStatus: {
        pci: "passed",
        kyc: "passed",
        sanctions: "clear",
      },
      environment: "prod",
      tokenIssuedAt: Date.now(),
      tokenExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      sessionId,
      consentedToTerms: true,
      emailVerified: true,
      mfaEnabled: false,
    };

    return session;
  } catch (error) {
    console.error("Failed to get session from headers:", error);
    return null;
  }
}