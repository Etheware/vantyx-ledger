import { Building2, CircleDollarSign, CreditCard, ShieldCheck } from "lucide-react";
import { getSession as getRequestSession } from "@/lib/auth/get-session";
import { getPortalLicenses, getPortalTransactions } from "../../../lib/vantyx-portal-data";
import { VantyxGhostButton, VantyxPanel, VantyxPortalShell, VantyxStatusPill } from "../../../components/vantyx-portal-shell";

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default async function ReportsPage() {
  const session = await getRequestSession();
  const tenantName = session?.orgName || "Acme Corporation";
  const tenantId = session?.activeOrgUuid || session?.orgUuid || null;
  const [portalLicenses, portalTransactions] = await Promise.all([
    getPortalLicenses(tenantId),
    getPortalTransactions(tenantId),
  ]);

  const settled = portalTransactions.filter((txn) => txn.status === "settled");
  const settledTotalCents = settled.reduce((sum, txn) => sum + Math.round(Number(txn.amount.replace(/[^0-9.]/g, "")) * 100), 0);
  const bankTransferCount = portalTransactions.filter((txn) => txn.paymentRail === "bank_transfer").length;
  const activeLicenses = portalLicenses.filter((license) => license.status === "active").length;

  const metrics = [
    { label: "Settled revenue", value: formatCents(settledTotalCents), delta: `${settled.length} transactions`, icon: CircleDollarSign },
    { label: "Active licenses", value: String(activeLicenses), delta: `${portalLicenses.length} total issued`, icon: ShieldCheck },
    { label: "Bank transfer share", value: portalTransactions.length ? `${Math.round((bankTransferCount / portalTransactions.length) * 100)}%` : "0%", delta: `${bankTransferCount} of ${portalTransactions.length}`, icon: Building2 },
    { label: "Card fallback share", value: portalTransactions.length ? `${Math.round(((portalTransactions.length - bankTransferCount) / portalTransactions.length) * 100)}%` : "0%", delta: `${portalTransactions.length - bankTransferCount} of ${portalTransactions.length}`, icon: CreditCard },
  ];

  return (
    <VantyxPortalShell title="Reports" description="Revenue and license activity across your account." activePath="/reports" organizationName={tenantName}>
      <div className="grid gap-5 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <VantyxPanel key={metric.label} className="relative overflow-hidden p-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_42%)]" />
              <div className="relative flex items-start justify-between gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/78">
                  <Icon className="h-4 w-4" />
                </span>
                <VantyxStatusPill tone="blue">{metric.delta}</VantyxStatusPill>
              </div>
              <div className="relative mt-4 text-[13px] uppercase tracking-[0.22em] text-white/46">{metric.label}</div>
              <div className="relative mt-4 text-[30px] font-light tracking-[-0.04em] text-white">{metric.value}</div>
            </VantyxPanel>
          );
        })}
      </div>

      <VantyxPanel className="mt-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[16px] font-medium text-white">Recent settlement activity</h2>
            <p className="mt-1 text-[13px] text-white/50">The last {portalTransactions.length} payment events across all rails.</p>
          </div>
          <VantyxGhostButton href="/transactions">View all transactions</VantyxGhostButton>
        </div>
        <div className="mt-5 space-y-2.5">
          {portalTransactions.slice(0, 5).map((txn) => (
            <div key={txn.id} className="flex items-center justify-between rounded-[12px] border border-white/8 bg-white/[0.02] px-4 py-3 text-[14px]">
              <span className="font-mono text-[13px] text-blue-400">{txn.id}</span>
              <span className="text-white/56">{txn.processedAt}</span>
              <span className="text-white/85">{txn.amount}</span>
            </div>
          ))}
        </div>
      </VantyxPanel>
    </VantyxPortalShell>
  );
}
