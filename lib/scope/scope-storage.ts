
import { Scope } from "./types";

const STORAGE_KEY = "vantyx.portal.scope";

export function getScopeFromStorage(): Scope | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to read scope from storage:", error);
    return null;
  }
}

export function setScopeInStorage(scope: Scope): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scope));
  } catch (error) {
    console.error("Failed to write scope to storage:", error);
  }
}

export function clearScopeStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear scope from storage:", error);
  }
}