import { getDatabase } from "@/lib/db-compat";
import { v4 as uuid } from "uuid";

export type ConnectAccountStatus = "pending" | "active" | "restricted" | "disconnected";

export interface StripeConnect {
  id: string;
  tenantId: string;
  stripeConnectId: string;
  status: ConnectAccountStatus;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  defaultPayoutMethod: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConnectService {
  createConnectAccount(tenantId: string, email: string): Promise<StripeConnect>;
  getConnectAccount(tenantId: string): Promise<StripeConnect | null>;
  updateConnectStatus(tenantId: string, stripeConnectId: string, status: ConnectAccountStatus): Promise<void>;
  setDefaultPayoutMethod(tenantId: string, method: string): Promise<void>;
  isPayoutEnabled(tenantId: string): Promise<boolean>;
}

export function createConnectService(): ConnectService {
  const store = new Map<string, StripeConnect>();

  return {
    async createConnectAccount(tenantId, email) {
      const db = getDatabase() as any;
      const account: StripeConnect = {
        id: uuid(),
        tenantId,
        stripeConnectId: `acct_${uuid().slice(0, 20)}`,
        status: "pending",
        chargesEnabled: false,
        payoutsEnabled: false,
        defaultPayoutMethod: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      store.set(tenantId, account);

      if (db?.insert && db?.stripeConnectAccounts) {
        try {
          await db
            .insert(db.stripeConnectAccounts)
            .values({
              id: account.id,
              tenantId: account.tenantId,
              stripeConnectId: account.stripeConnectId,
              status: account.status,
              chargesEnabled: account.chargesEnabled,
              payoutsEnabled: account.payoutsEnabled,
              defaultPayoutMethod: account.defaultPayoutMethod,
              createdAt: account.createdAt,
              updatedAt: account.updatedAt,
            });
        } catch {
          // Fallback to in-memory if DB insert fails
        }
      }

      return account;
    },

    async getConnectAccount(tenantId) {
      const db = getDatabase() as any;

      if (db?.query?.stripeConnectAccounts) {
        try {
          const account = await db.query.stripeConnectAccounts.findFirst({
            where: (t: any) => t.tenantId === tenantId,
          });
          if (account) {
            store.set(tenantId, account);
            return account;
          }
        } catch {
          // Fall through to memory store
        }
      }

      return store.get(tenantId) || null;
    },

    async updateConnectStatus(tenantId, stripeConnectId, status) {
      const db = getDatabase() as any;
      const existing = store.get(tenantId);

      if (existing) {
        existing.status = status;
        existing.updatedAt = new Date();

        if (status === "active") {
          existing.chargesEnabled = true;
          existing.payoutsEnabled = true;
        }

        store.set(tenantId, existing);

        if (db?.update && db?.stripeConnectAccounts) {
          try {
            await db
              .update(db.stripeConnectAccounts)
              .set({
                status: existing.status,
                chargesEnabled: existing.chargesEnabled,
                payoutsEnabled: existing.payoutsEnabled,
                updatedAt: existing.updatedAt,
              })
              .where((t: any) => t.tenantId === tenantId);
          } catch {
            // Fallback to in-memory
          }
        }
      }
    },

    async setDefaultPayoutMethod(tenantId, method) {
      const db = getDatabase() as any;
      const existing = store.get(tenantId);

      if (existing) {
        existing.defaultPayoutMethod = method;
        existing.updatedAt = new Date();

        store.set(tenantId, existing);

        if (db?.update && db?.stripeConnectAccounts) {
          try {
            await db
              .update(db.stripeConnectAccounts)
              .set({
                defaultPayoutMethod: method,
                updatedAt: existing.updatedAt,
              })
              .where((t: any) => t.tenantId === tenantId);
          } catch {
            // Fallback to in-memory
          }
        }
      }
    },

    async isPayoutEnabled(tenantId) {
      const account = await this.getConnectAccount(tenantId);
      return Boolean(account && account.payoutsEnabled && account.status === "active");
    },
  };
}
