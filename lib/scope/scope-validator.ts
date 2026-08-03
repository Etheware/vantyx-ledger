
import { Scope, ScopeValidationResult, Organization, Project } from "./types";

export function validateEnvironment(environment: string): boolean {
  return environment === "test" || environment === "live";
}

export function validateOrganization(
  org: Partial<Scope>,
  userOrganizations: Organization[]
): boolean {
  return userOrganizations.some((o) => o.id === org.organizationId);
}

export function validateProject(
  scope: Partial<Scope>,
  projects: Project[]
): boolean {
  return projects.some((p) => p.id === scope.projectId);
}

export function validateScope(
  scope: Partial<Scope>,
  userOrganizations: Organization[],
  userProjects: Project[]
): ScopeValidationResult {
  if (!validateEnvironment(scope.environment || "")) {
    return { valid: false, error: "invalid_environment" };
  }

  if (!validateOrganization(scope, userOrganizations)) {
    return { valid: false, error: "unauthorized_organization" };
  }

  if (!validateProject(scope, userProjects)) {
    return { valid: false, error: "unauthorized_project" };
  }

  return { valid: true };
}
