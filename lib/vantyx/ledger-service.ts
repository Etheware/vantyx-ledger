
import { eq, and } from "drizzle-orm";
import { getDatabase, ledgerEntries } from "vantyx-db";
import { v4 as uuid } from "uuid";

export interface LedgerEntry {
  account: string;
  debitCents?: number;
  creditCents?: number;
  description: string;
}

export interface PostLedgerEntriesInput {
  tenantId: string;
  clientId: string;
  invoiceId?: string;
  paymentId?: string;
  entries: LedgerEntry[];
  currency?: string;
  metadata?: Record<string, any>;
}

export interface LedgerService {
  postEntries(input: PostLedgerEntriesInput): Promise<void>;
  getAccountBalance(account: string, tenantId: string): Promise<{ debitTotal: number; creditTotal: number }>;
  getTrialBalance(tenantId: string): Promise<Array<{ account: string; debit: number; credit: number }>>;
}

export function createLedgerService(): LedgerService {
  return {
    async postEntries(input) {
      const db = getDatabase();

      // Validate double-entry: total debits must equal total credits
      const totalDebits = input.entries.reduce((sum, e) => sum + (e.debitCents || 0), 0);
      const totalCredits = input.entries.reduce((sum, e) => sum + (e.creditCents || 0), 0);

      if (totalDebits !== totalCredits) {
        throw new Error(`Unbalanced entry: debits (${totalDebits}) !== credits (${totalCredits})`);
      }

      // Insert entries in order
      const entryIds: string[] = [];
      for (let i = 0; i < input.entries.length; i++) {
        const entry = input.entries[i];
        const entryId = uuid();

        await db.insert(ledgerEntries).values({
          id: entryId,
          tenantId: input.tenantId,
          clientId: input.clientId,
          invoiceId: input.invoiceId,
          paymentId: input.paymentId,
          entrySequence: i + 1,
          account: entry.account,
          debitCents: entry.debitCents,
          creditCents: entry.creditCents,
          currency: input.currency || "usd",
          description: entry.description,
          metadata: input.metadata || {},
        });

        entryIds.push(entryId);
      }
    },

    async getAccountBalance(account, tenantId) {
      const db = getDatabase();

      const results = await db.query.ledgerEntries.findMany({
        where: (table) => and(eq(table.tenantId, tenantId), eq(table.account, account)),
      });

      const debitTotal = results.reduce((sum, e) => sum + (e.debitCents || 0), 0);
      const creditTotal = results.reduce((sum, e) => sum + (e.creditCents || 0), 0);

      return { debitTotal, creditTotal };
    },

    async getTrialBalance(tenantId) {
      const db = getDatabase();

      const entries = await db.query.ledgerEntries.findMany({
        where: (table) => eq(table.tenantId, tenantId),
      });

      const accountMap = new Map<
        string,
        { debit: number; credit: number }
      >();

      for (const entry of entries) {
        const current = accountMap.get(entry.account) || { debit: 0, credit: 0 };
        current.debit += entry.debitCents || 0;
        current.credit += entry.creditCents || 0;
        accountMap.set(entry.account, current);
      }

      return Array.from(accountMap.entries()).map(([account, { debit, credit }]) => ({
        account,
        debit,
        credit,
      }));
    },
  };
}