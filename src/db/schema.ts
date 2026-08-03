import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  varchar,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  })
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }
);

export const checkoutSessions = pgTable(
  "checkout_sessions",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productKey: varchar("product_key", { length: 255 }).notNull(),
    priceCents: integer("price_cents").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    stripeSessionId: text("stripe_session_id"),
    status: varchar("status", { length: 50 }).default("pending").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);

export const billingExports = pgTable(
  "billing_export_rows",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    invoiceId: text("invoice_id").notNull(),
    amount: integer("amount").notNull(),
    status: varchar("status", { length: 50 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }
);

export const walletAccessGrants = pgTable(
  "wallet_access_grants",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tenantId: text("tenant_id").notNull(),
    role: varchar("role", { length: 50 }).default("viewer").notNull(),
    withdrawalAllowed: boolean("withdrawal_allowed").default(false).notNull(),
    accessStatus: varchar("access_status", { length: 50 }).default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);

export const tenants = pgTable(
  "tenants",
  {
    id: text("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    ownerId: text("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    supportEmail: varchar("support_email", { length: 255 }),
    brandColor: varchar("brand_color", { length: 7 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);

export const catalogProducts = pgTable(
  "catalog_products",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    key: varchar("key", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);

export const tenantProductBranding = pgTable(
  "tenant_product_branding",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull().references(() => catalogProducts.id, { onDelete: "cascade" }),
    primaryColor: varchar("primary_color", { length: 7 }),
    logoUrl: text("logo_url"),
    customCss: text("custom_css"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);

export const licenses = pgTable(
  "licenses",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    key: varchar("key", { length: 255 }).notNull(),
    status: varchar("status", { length: 50 }).default("active").notNull(),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }
);

export const receipts = pgTable(
  "receipts",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    checkoutSessionId: text("checkout_session_id").references(() => checkoutSessions.id, { onDelete: "set null" }),
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    status: varchar("status", { length: 50 }).default("completed").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }
);

export const clients = pgTable(
  "clients",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    secret: text("secret").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }
);

export const authUsers = pgTable("auth_users", {
  id: text("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const authChallenges = pgTable("auth_challenges", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  code: varchar("code", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const authBackupCodes = pgTable("auth_backup_codes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  code: varchar("code", { length: 255 }).notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const authBackupCodeBatches = pgTable("auth_backup_code_batches", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  batchNumber: integer("batch_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentEvents = pgTable("payment_events", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  amount: integer("amount").notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});