
"use client";

/* global URLSearchParams */

import React, { createContext, useEffect, useState, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Scope, ScopeContextType, Organization, Project } from "./types";
import { getScopeFromStorage, setScopeInStorage, clearScopeStorage } from "./scope-storage";
import { getScopeFromParams } from "./scope-params";
import { validateScope } from "./scope-validator";

export const ScopeContext = createContext<ScopeContextType | undefined>(undefined);

interface ScopeProviderProps {
  children: ReactNode;
  userOrganizations: Organization[];
  userProjects: Project[];
}

export function ScopeProvider({
  children,
  userOrganizations,
  userProjects,
}: ScopeProviderProps) {
  const searchParams = useSearchParams();
  const [currentScope, setCurrentScope] = useState<Scope | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeScope = async () => {
      try {
        let scope = getScopeFromParams(searchParams);

        if (!scope) {
          scope = getScopeFromStorage();
        }

        if (scope) {
          const scoped = scope;
          const validation = validateScope(scoped, userOrganizations, userProjects);
          if (!validation.valid) {
            console.warn("Invalid scope:", validation.error);
            scope = null;
          } else {
            const org = userOrganizations.find((o) => o.id === scoped.organizationId);
            const proj = userProjects.find((p) => p.id === scoped.projectId);

            if (org && proj) {
              scope = {
                ...scoped,
                organizationSlug: org.slug,
                organizationName: org.name,
                projectSlug: proj.slug,
                projectName: proj.name,
              } as Scope;
            }
          }
        }

        setCurrentScope(scope as Scope | null);
      } catch (err) {
        console.error("Failed to initialize scope:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeScope();
  }, [userOrganizations, userProjects, searchParams]);

  useEffect(() => {
    if (currentScope && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("org", currentScope.organizationId);
      params.set("project", currentScope.projectId);
      params.set("environment", currentScope.environment);

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      if (newUrl !== window.location.href) {
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, [currentScope]);

  const handleSetScope = async (scope: Scope) => {
    const validation = validateScope(scope, userOrganizations, userProjects);
    if (!validation.valid) {
      setError(new Error(validation.error || "Invalid scope"));
      return;
    }

    setCurrentScope(scope);
    setScopeInStorage(scope);
    setError(null);
  };

  const handleClearScope = () => {
    setCurrentScope(null);
    clearScopeStorage();
  };

  const hasAccess = (testScope: Scope): boolean => {
    const validation = validateScope(testScope, userOrganizations, userProjects);
    return validation.valid;
  };

  const value: ScopeContextType = {
    currentScope,
    setScope: handleSetScope,
    userOrganizations,
    userProjects,
    isLoading,
    error,
    hasAccess,
    clearScope: handleClearScope,
  };

  return <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>;
}
