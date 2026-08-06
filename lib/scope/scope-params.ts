
/* global URLSearchParams */

import { Scope } from "./types";

export function getScopeFromParams(searchParams: URLSearchParams): Partial<Scope> | null {
  const org = searchParams.get("org");
  const project = searchParams.get("project");
  const environment = searchParams.get("environment");

  if (!org || !project || !environment) {
    return null;
  }

  if (environment !== "test" && environment !== "live") {
    return null;
  }

  return {
    organizationId: org,
    projectId: project,
    environment: environment as "test" | "live",
  };
}

export function scopeToParams(scope: Scope): URLSearchParams {
  const params = new URLSearchParams();
  params.set("org", scope.organizationId);
  params.set("project", scope.projectId);
  params.set("environment", scope.environment);
  return params;
}

export function appendScopeToUrl(url: string, scope: Scope): string {
  const urlObj = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost");
  const params = scopeToParams(scope);

  urlObj.searchParams.delete("org");
  urlObj.searchParams.delete("project");
  urlObj.searchParams.delete("environment");

  params.forEach((value, key) => {
    urlObj.searchParams.set(key, value);
  });

  return urlObj.toString();
}
