
import { Building2, ChevronDown, CreditCard, Search } from "lucide-react";
import { VantyxPanel, VantyxPortalShell, VantyxStatusPill } from "../../../components/vantyx-portal-shell";
import { portalTransactions } from "../../../lib/vantyx-portal-data";

const STATUS_TONE = {
  settled: "success",
  processing: "blue",
  failed: "danger",
  refunded: "neutral",
} as const;

export default function TransactionsPage() {
  return (
    <VantyxPortalShell title="Transactions" description="Every payment event across your payment rails." activePath="/transactions">
      <div className="grid gap-4 lg:grid-cols-[0.95fr_0.95fr_1.6fr]">
        {["All Status", "All Rails"].map((label) => (
          <button
            key={label}
            type="button"
            className="flex h-14 items-center justify-between rounded-[14px] border border-white/10 bg-white/[0.025] px-5 text-[14px] uppercase tracking-[0.16em] text-white/78"
          >
            <span>{label}</span>
            <ChevronDown className="h-4 w-4 text-white/46" />
          </button>
        ))}
        <div className="flex h-14 items-center rounded-[14px] border border-white/10 bg-white/[0.025] px-5 text-white/40">
          <Search className="h-5 w-5" />
          <span className="ml-3 text-[14px]">Search by transaction ID...</span>
        </div>
      </div>

      <VantyxPanel className="mt-6 overflow-hidden">
        <div className="hidden grid-cols-[1.1fr_1fr_1fr_0.9fr_0.9fr] border-b border-white/10 px-6 py-5 text-[13px] uppercase tracking-[0.18em] text-white/42 lg:grid">
          <span>Transaction</span>
          <span>Rail</span>
          <span>Processed</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        {portalTransactions.map((txn) => (
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
        ))}
      </VantyxPanel>
    </VantyxPortalShell>
  );
}