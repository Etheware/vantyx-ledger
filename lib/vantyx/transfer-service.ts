import { getDatabase, ledgerEntries } from "@/lib/db-compat";
import { v4 as uuid } from "uuid";
import { eq, and } from "drizzle-orm";

export type TransferStatus = "pending" | "completed" | "failed" | "reversed";
export type TransferType = "internal" | "external" | "settlement";

export interface Transfer {
  id: string;
  tenantId: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: string;
  type: TransferType;
  status: TransferStatus;
  metadata?: Record<string, any>;
  createdAt: Date;
  completedAt: Date | null;
}

export interface TransferService {
  transferBetweenAccounts(
    tenantId: string,
    fromAccount: string,
    toAccount: string,
    amount: number,
    type: TransferType,
    metadata?: Record<string, any>
  ): Promise<Transfer>;

  getTransfer(transferId: string, tenantId: string): Promise<Transfer | null>;

  getTransfersByTenant(tenantId: string, limit?: number): Promise<Transfer[]>;

  updateTransferStatus(transferId: string, tenantId: string, status: TransferStatus): Promise<void>;

  recordTransferInLedger(transfer: Transfer): Promise<void>;

  canTransfer(tenantId: string, fromAccount: string, amount: number): Promise<boolean>;
}

export function createTransferService(): TransferService {
  const store = new Map<string, Transfer[]>();

  return {
    async transferBetweenAccounts(tenantId, fromAccount, toAccount, amount, type, metadata) {
      const transfer: Transfer = {
        id: uuid(),
        tenantId,
        fromAccount,
        toAccount,
        amount,
        currency: "USD",
        type,
        status: "pending",
        metadata: metadata || {},
        createdAt: new Date(),
        completedAt: null,
      };

      const existing = store.get(tenantId) || [];
      existing.push(transfer);
      store.set(tenantId, existing);

      await this.recordTransferInLedger(transfer);

      return transfer;
    },

    async getTransfer(transferId, tenantId) {
      const transfers = store.get(tenantId) || [];
      return transfers.find((t) => t.id === transferId) || null;
    },

    async getTransfersByTenant(tenantId, limit = 50) {
      return (store.get(tenantId) || []).slice(-limit);
    },

    async updateTransferStatus(transferId, tenantId, status) {
      const transfers = store.get(tenantId) || [];
      const transfer = transfers.find((t) => t.id === transferId);

      if (transfer) {
        transfer.status = status;
        if (status === "completed") {
          transfer.completedAt = new Date();
        }
      }
    },

    async recordTransferInLedger(transfer) {
      const db = getDatabase() as any;
      if (!db) return;

      try {
        const fromEntry = {
          id: uuid(),
          tenantId: transfer.tenantId,
          entryDate: transfer.createdAt,
          account: transfer.fromAccount,
          debit: 0,
          credit: transfer.amount,
          description: `Transfer to ${transfer.toAccount}`,
          referenceId: transfer.id,
          metadata: transfer.metadata || {},
        };

        const toEntry = {
          id: uuid(),
          tenantId: transfer.tenantId,
          entryDate: transfer.createdAt,
          account: transfer.toAccount,
          debit: transfer.amount,
          credit: 0,
          description: `Transfer from ${transfer.fromAccount}`,
          referenceId: transfer.id,
          metadata: transfer.metadata || {},
        };

        if (db.insert && db.ledgerEntries) {
          await db.insert(ledgerEntries).values(fromEntry);
          await db.insert(ledgerEntries).values(toEntry);
        }
      } catch {
        // Silently fail; transfer still recorded in store
      }
    },

    async canTransfer(tenantId, fromAccount, amount) {
      const db = getDatabase() as any;

      try {
        const entries = await db.query.ledgerEntries?.findMany({
          where: and(
            eq(ledgerEntries.tenantId, tenantId),
            eq(ledgerEntries.account, fromAccount)
          ),
        });

        if (!entries) return false;

        const balance = entries.reduce(
          (sum: number, e: any) => sum + (e.debit || 0) - (e.credit || 0),
          0
        );

        return balance >= amount;
      } catch {
        return false;
      }
    },
  };
}
