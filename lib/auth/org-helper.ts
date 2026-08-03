
import { v4 as uuid } from "uuid";
import { getDatabase, clients, tenants } from "@/lib/db-compat";
import { eq } from "drizzle-orm";

export type OrgInfo = {
  uuid: string;
  slug: string;
  name: string;
  avatar?: string;
};

/**
 * Get or create a personal organization for a user.
 * Generates org slug from email and uses provided name.
 */
export async function getOrCreatePersonalOrg(
  email: string,
  companyName?: string
): Promise<OrgInfo> {
  const db = getDatabase();

  // Generate slug from email (everything before @, sanitized)
  const emailPrefix = email.split("@")[0];
  const slug = emailPrefix
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  // Use provided name or generate one
  const orgName = companyName || emailPrefix;

  // Check if org already exists with this slug
  const existing = await db.query.clients.findFirst({
    where: eq(clients.clientSlug, slug),
  });

  if (existing) {
    return {
      uuid: existing.id,
      slug: existing.clientSlug,
      name: existing.publicName,
    };
  }

  // Create a tenant (top-level organization)
  const [tenant] = await db
    .insert(tenants)
    .values({
      clientKey: `vk_${slug}_${uuid().slice(0, 8)}`,
      publicName: orgName,
      supportEmail: email,
      supportUrl: "https://support.vantyxledger.com",
    })
    .returning();

  // Create a client under the tenant
  const [client] = await db
    .insert(clients)
    .values({
      tenantId: tenant.id,
      clientName: orgName,
      clientSlug: slug,
      publicName: orgName,
      supportEmail: email,
    })
    .returning();

  return {
    uuid: client.id,
    slug: client.clientSlug,
    name: client.publicName,
  };
}