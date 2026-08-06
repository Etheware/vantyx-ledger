
import { v4 as uuid } from "uuid";
import { getDatabase, clients, tenants, users } from "@/lib/db-compat";
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
  const db = getDatabase() as any;
  if (!db) {
    throw new Error("Database unavailable");
  }

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
  const existing = await db.query.tenants.findFirst({
    where: eq(tenants.slug, slug),
  });

  if (existing) {
    return { uuid: existing.id, slug: existing.slug, name: existing.name };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const uniqueSlug = `${slug}-${uuid().slice(0, 8)}`;

  const result = await db.transaction(async (tx: any) => {
    const [tenant] = await tx
      .insert(tenants)
      .values({
        id: uuid(),
        name: orgName,
        slug: uniqueSlug,
        ownerId: user.id,
        supportEmail: email,
      })
      .returning();

    if (!tenant) {
      throw new Error("Failed to create tenant");
    }

    const [client] = await tx
      .insert(clients)
      .values({
        id: uuid(),
        tenantId: tenant.id,
        name: orgName,
        secret: `vk_${uniqueSlug}_${uuid().slice(0, 8)}`,
      })
      .returning();

    if (!client) {
      throw new Error("Failed to create client");
    }

    return client;
  });

  return { uuid: result.tenantId, slug: uniqueSlug, name: result.name };
}
