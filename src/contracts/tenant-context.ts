export type TenantMembership = {
  uuid: string;
  slug: string;
  name: string;
};

export type TenantSupportAccess = {
  supportEmail?: string | null;
  supportRole?: "viewer" | "member" | "admin" | "billing" | "owner";
};

export type TenantContext = {
  actorUserId: string;
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  role: string;
  capabilities: string[];
  supportAccess?: TenantSupportAccess;
};
