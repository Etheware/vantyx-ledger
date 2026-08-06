
/* global require, module */

/**
 * Seed script: Configure Backflow Exam Prep as a Vantyx tenant
 *
 * Creates:
 * 1. BEP tenant record
 * 2. Weekly learning license product (if missing)
 * 3. BEP branding for the product
 * 4. Approved return URLs
 * 5. Webhook endpoint configuration
 */

import { getDatabase } from "@/lib/db-compat";
import { tenants, catalogProducts, tenantProductBranding, clients } from "../src/db/schema";
import { eq } from "drizzle-orm";

const BEP_TENANT_CONFIG = {
  clientKey: "bep",
  publicName: "Backflow Exam Prep",
  brandColor: "#8fb7ff",
  supportEmail: "support@backflowexamprep.com",
  supportUrl: "https://backflowexamprep.com/support",
};

const BEP_PRODUCT_CONFIG = {
  productKey: "weekly-learning-license",
  neutralName: "Weekly Learning License",
  neutralDescription: "Seven days of platform access with learning materials and tools",
  productFamily: "license" as const,
  billingModel: "subscription" as const,
  interval: "week",
  priceCents: 1999, // $19.99
  currency: "usd",
};

async function seedBEPTenant() {
  const db = getDatabase() as any;
  if (!db) {
    throw new Error("Database unavailable");
  }

  console.log("🌱 Seeding Backflow Exam Prep tenant...\n");

  try {
    // 1. Ensure BEP tenant exists
    let bepTenant = await db.query.tenants.findFirst({
      where: eq(tenants.slug, BEP_TENANT_CONFIG.clientKey),
    });

    if (!bepTenant) {
      console.log("  Creating BEP tenant record...");
      const inserted = await db
        .insert(tenants)
        .values({
          id: `tenant_${BEP_TENANT_CONFIG.clientKey}`,
          name: BEP_TENANT_CONFIG.publicName,
          slug: BEP_TENANT_CONFIG.clientKey,
          ownerId: "seed-owner",
          supportEmail: BEP_TENANT_CONFIG.supportEmail,
          brandColor: BEP_TENANT_CONFIG.brandColor,
        })
        .returning();
      bepTenant = inserted[0];
      console.log(`  ✓ BEP tenant created: ${bepTenant.id}\n`);
    } else {
      console.log(`  ✓ BEP tenant already exists: ${bepTenant.id}\n`);
    }

    // 2. Ensure product exists
    let product = await db.query.catalogProducts.findFirst({
      where: eq(catalogProducts.key, BEP_PRODUCT_CONFIG.productKey),
    });

    if (!product) {
      console.log("  Creating weekly-learning-license product...");
      const inserted = await db
        .insert(catalogProducts)
        .values({
          id: `product_${BEP_PRODUCT_CONFIG.productKey}`,
          tenantId: bepTenant.id,
          key: BEP_PRODUCT_CONFIG.productKey,
          name: BEP_PRODUCT_CONFIG.neutralName,
          description: BEP_PRODUCT_CONFIG.neutralDescription,
        })
        .returning();
      product = inserted[0];
      console.log(`  ✓ Product created: ${product.id}\n`);
    } else {
      console.log(`  ✓ Product already exists: ${product.id}\n`);
    }

    // 3. Ensure tenant branding exists
    const existingBranding = await db.query.tenantProductBranding.findFirst({
      where: (table: any) => eq(table.tenantId, bepTenant!.id),
    });

    if (!existingBranding) {
      console.log("  Creating BEP branding configuration...");
      await db.insert(tenantProductBranding).values({
        id: `branding_${bepTenant.id}_${product.id}`,
        tenantId: bepTenant.id,
        productId: product.id,
        primaryColor: BEP_TENANT_CONFIG.brandColor,
      });
      console.log("  ✓ Branding configured\n");
    } else {
      console.log("  ✓ Branding already configured\n");
    }

    // 4. Verify client record exists (legacy, for backward compatibility)
    let client = await db.query.clients.findFirst({
      where: (table: any) => eq(table.tenantId, bepTenant!.id),
    });

    if (!client) {
      console.log("  Creating BEP client record...");
      const inserted = await db
        .insert(clients)
        .values({
          id: `client_${BEP_TENANT_CONFIG.clientKey}`,
          tenantId: bepTenant.id,
          name: "Backflow Exam Prep",
          secret: `client_${BEP_TENANT_CONFIG.clientKey}`,
        })
        .returning();
      console.log(`  ✓ Client record created: ${inserted[0].id}\n`);
    } else {
      console.log(`  ✓ Client record already exists: ${client.id}\n`);
    }

    console.log("✅ Backflow Exam Prep tenant seeded successfully!\n");
    console.log("Configuration Summary:");
    console.log(`  Tenant ID: ${bepTenant.id}`);
    console.log(`  Product ID: ${product.id}`);
    console.log(`  Price: $${(BEP_PRODUCT_CONFIG.priceCents / 100).toFixed(2)}`);
    console.log(`  Support: ${BEP_TENANT_CONFIG.supportEmail}`);
    console.log();
  } catch (error) {
    console.error("❌ Failed to seed BEP tenant:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedBEPTenant().then(() => process.exit(0));
}

export { seedBEPTenant };
