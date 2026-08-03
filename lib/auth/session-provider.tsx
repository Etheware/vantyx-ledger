
"use client";

import React, { createContext, useContext, ReactNode } from "react";
import type { AuthSession } from "./session";

/**
 * SessionContext — Client-side session state
 *
 * Populated from server-side headers attached by middleware.
 * Used by Client Components to check capabilities and render UI conditionally.
 */

export const SessionContext = createContext<{
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
} | null>(null);

export interface SessionProviderProps {
  session: AuthSession | null;
  children: ReactNode;
}

/**
 * SessionProvider — Wraps the app with session context
 *
 * Used in root layout to hydrate Client Components with session state.
 * Session comes from server (middleware attaches it to headers).
 */
export function SessionProvider({ session, children }: SessionProviderProps) {
  const value = {
    session,
    isLoading: false,
    isAuthenticated: session !== null && session.tokenExpiresAt > Date.now(),
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

/**
 * useSession — Hook to access current session in Client Components
 */
export function useSession() {
  const context = useContext(SessionContext);
  if (context === null) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}