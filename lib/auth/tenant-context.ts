
import { eq } from "drizzle-orm";
import { getSession } from "./get-session";
import type { AuthSession } from "./session";
import { getDatabase, tenants } from "../../src/db";
import type { TenantContext, TenantMembership, TenantSupportAccess } from "../../src/contracts/tenant-context";

export type TenantContextResolutionOptions = {
  requestedOrganizationId?: string | null;
  supportAccess?: TenantSupportAccess;
};

export class TenantContextError extends Error {
  readonly code: "missing_tenant_context" | "forbidden_tenant" | "unknown_tenant";
  readonly status: number;

  constructor(message: string, code: TenantContextError["code"], status: number) {
    super(message);
    this.name = "TenantContextError";
    this.code = code;
    this.status = status;
  }
}

function normalizeMemberships(session: AuthSession): TenantMembership[] {
  if (Array.isArray(session.memberOfOrgs) && session.memberOfOrgs.length > 0) {
    return session.memberOfOrgs;
  }

  if (session.orgUuid && session.orgSlug && session.orgName) {
    return [{ uuid: session.orgUuid, slug: session.orgSlug, name: session.orgName }];
  }

  return [];
}

export function resolveTenantContextFromSession(
  session: AuthSession | null,
  options: TenantContextResolutionOptions = {},
): TenantContext {
  if (!session) {
    throw new TenantContextError("Tenant context is required.", "missing_tenant_context", 401);
  }

  const memberships = normalizeMemberships(session);
  if (memberships.length === 0) {
    throw new TenantContextError("Tenant context is required.", "missing_tenant_context", 400);
  }

  const requested = options.requestedOrganizationId?.trim();
  const selectedOrganizationId = requested || session.activeOrgUuid || session.orgUuid;
  if (!selectedOrganizationId) {
    throw new TenantContextError("Tenant context is required.", "missing_tenant_context", 400);
  }

  const selectedMembership = memberships.find(
    (membership) => membership.uuid === selectedOrganizationId || membership.slug === selectedOrganizationId,
  );

  if (!selectedMembership) {
    throw new TenantContextError(
      "You do not have access to the selected organization.",
      "forbidden_tenant",
      403,
    );
  }

  return {
    actorUserId: session.userId,
    organizationId: selectedMembership.uuid,
    organizationSlug: selectedMembership.slug,
    organizationName: selectedMembership.name,
    role: session.role,
    capabilities: [...session.capabilities],
    supportAccess: options.supportAccess,
  };
}

export async function assertTenantExists(organizationId: string) {
  const db = getDatabase();
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, organizationId),
  });

  if (!tenant) {
    throw new TenantContextError("The selected organization no longer exists.", "unknown_tenant", 404);
  }

  return tenant;
}

export async function resolveTenantContextFromRequest(options: TenantContextResolutionOptions = {}) {
  const session = await getSession();
  const context = resolveTenantContextFromSession(session, options);
  await assertTenantExists(context.organizationId);
  return context;
}