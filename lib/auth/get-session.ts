
import { headers } from "next/headers";
import { verifySessionToken } from "./session";
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
    const headersList = await headers();
    const sessionId = headersList.get("x-session-id");
    if (!sessionId) {
      return null;
    }

    return await verifySessionToken(sessionId);
  } catch (error) {
    console.error("Failed to get session from headers:", error);
    return null;
  }
}
