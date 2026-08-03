// Compatibility re-exports for vantyx-db
// This allows imports from "@/lib/db-compat" to work via local files

import { getDatabase as _getDatabase } from "../src/db";
export { eq, and, desc } from "drizzle-orm";

// Re-export schema tables
export {
  users,
  sessions,
  checkoutSessions,
  billingExports,
  walletAccessGrants,
  tenants,
  catalogProducts,
  tenantProductBranding,
  licenses,
  receipts,
  payments,
  invoices,
  ledgerEntries,
  subscriptions,
  entitlements,
  clients,
  authUsers,
  authChallenges,
  authBackupCodes,
  authBackupCodeBatches,
  paymentEvents
} from "../src/db/schema";

// Compatibility alias for getDatabase
export const getDatabase = _getDatabase;

// Export common auth types
export type Database = ReturnType<typeof _getDatabase>;
