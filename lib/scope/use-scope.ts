
"use client";

import { useContext } from "react";
import { ScopeContext } from "./scope-provider";
import { ScopeContextType } from "./types";

export function useScope(): ScopeContextType {
  const context = useContext(ScopeContext);

  if (!context) {
    throw new Error(
      "useScope must be used within <ScopeProvider>. " +
        "Make sure your component is wrapped with ScopeProvider."
    );
  }

  return context;
}

export function useScopeRequireValidation(): ScopeContextType {
  const scope = useScope();

  if (!scope.currentScope) {
    throw new Error(
      "No scope selected. User must select organization/project/environment first."
    );
  }

  return scope;
}