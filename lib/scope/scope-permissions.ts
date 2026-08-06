
import { Scope } from "./types";

export interface UserPermissions {
  userId: string;
  role: "owner" | "admin" | "developer" | "viewer";
  organizationId: string;
  capabilities: string[];
}

export function hasOrgAccess(userPerms: UserPermissions[], orgId: string): boolean {
  return userPerms.some((p) => p.organizationId === orgId);
}

export function hasProjectAccess(
  userPerms: UserPermissions[],
  orgId: string,
  // eslint-disable-next-line no-unused-vars
  _projectId: string
): boolean {
  return hasOrgAccess(userPerms, orgId);
}

export function canSwitchOrg(
  currentScope: Scope,
  newOrgId: string,
  userPerms: UserPermissions[]
): boolean {
  return hasOrgAccess(userPerms, newOrgId);
}

export function canSwitchProject(
  currentScope: Scope,
  newProjectId: string,
  userPerms: UserPermissions[]
): boolean {
  return hasProjectAccess(userPerms, currentScope.organizationId, newProjectId);
}

export function hasCapability(
  userPerms: UserPermissions[],
  orgId: string,
  capability: string
): boolean {
  const perms = userPerms.find((p) => p.organizationId === orgId);
  if (!perms) {
    return false;
  }

  if (perms.role === "owner") {
    return true;
  }

  return perms.capabilities.includes(capability);
}
