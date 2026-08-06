import { Building2, CreditCard } from "lucide-react";
import { getSession as getRequestSession } from "@/lib/auth/get-session";
import { getPortalTransactions } from "../../../lib/vantyx-portal-data";
import { VantyxPanel, VantyxPortalShell, VantyxStatusPill } from "../../../components/vantyx-portal-shell";

const STATUS_TONE = {
  settled: "success",
  processing: "blue",
  failed: "danger",
  refunded: "neutral",
} as const;

export default async function TransactionsPage() {
  const session = await getRequestSession();
  const tenantName = session?.orgName || "Acme Corporation";
  const tenantId = session?.activeOrgUuid || session?.orgUuid || null;
  const transactions = await getPortalTransactions(tenantId);

  return (
    <VantyxPortalShell title="Transactions" description="Every payment event across your payment rails." activePath="/transactions" organizationName={tenantName}>
      <VantyxPanel className="overflow-hidden">
        <div className="grid grid-cols-[1.1fr_1fr_1fr_0.9fr_0.9fr] border-b border-white/10 px-6 py-5 text-[13px] uppercase tracking-[0.18em] text-white/42">
          <span>Transaction</span>
          <span>Rail</span>
          <span>Processed</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        {transactions.length === 0 ? (
          <div className="px-6 py-10 text-[14px] text-white/58">No transactions are available for this tenant yet.</div>
        ) : (
          transactions.map((txn) => (
            <div
              key={txn.id}
              className="grid grid-cols-1 gap-2 border-b border-white/10 px-6 py-5 text-[15px] text-white/78 last:border-b-0 lg:grid-cols-[1.1fr_1fr_1fr_0.9fr_0.9fr] lg:items-center lg:gap-0"
            >
              <span className="font-mono text-[13px] text-blue-400">{txn.id}</span>
              <span className="flex items-center gap-2 text-white/68">
                {txn.paymentRail === "bank_transfer" ? <Building2 className="h-4 w-4 text-white/40" /> : <CreditCard className="h-4 w-4 text-white/40" />}
                {txn.paymentRail === "bank_transfer" ? "Bank transfer" : "Card"}
              </span>
              <span className="text-white/56">{txn.processedAt}</span>
              <span>{txn.amount}</span>
              <span>
                <VantyxStatusPill tone={STATUS_TONE[txn.status]}>{txn.status}</VantyxStatusPill>
              </span>
            </div>
          ))
        )}
      </VantyxPanel>
    </VantyxPortalShell>
  );
}
