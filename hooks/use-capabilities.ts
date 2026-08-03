
"use client";

import { useSession } from "@/lib/auth/session-provider";
import { createCapabilityChecker, type CapabilityCheckFn } from "@/lib/auth/capabilities";

/**
 * useCapabilities — React hook for capability checking in Client Components
 *
 * Returns a CapabilityCheckFn that components use to conditionally render UI
 * based on user's resolved capabilities (role + org state + billing + environment).
 */
export function useCapabilities(): CapabilityCheckFn {
  const { session, isAuthenticated } = useSession();

  if (!isAuthenticated || !session) {
    // Return a checker that always returns false (not authenticated)
    return {
      has: () => false,
      hasAny: () => false,
      hasAll: () => false,
      getAll: () => [],
    };
  }

  return createCapabilityChecker(session.capabilities);
}