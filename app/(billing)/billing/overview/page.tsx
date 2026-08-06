import Link from "next/link";
import { CalendarDays, CircleDollarSign, FileText, Layers3, ShieldCheck } from "lucide-react";
import {
  VantyxBlueButton,
  VantyxPanel,
  VantyxPortalShell,
  VantyxStatusPill,
} from "../../../../components/vantyx-portal-shell";
import { getBillingExportRows, getBillingTrends } from "../../../../src/db/billing-admin";
import { resolveTenantContextFromRequest } from "../../../../lib/auth/tenant-context";

export const dynamic = "force-dynamic";

const quickActions = [
  { title: "Open invoices", href: "/billing/invoices" },
  { title: "Manage billing", href: "/billing/subscription" },
  { title: "View payment methods", href: "/billing/payment-methods" },
  { title: "Open support", href: "/support/help-center" },
];

export default async function BillingOverviewPage() {
  let tenantId: string | null = null;
  try {
    const context = await resolveTenantContextFromRequest();
    tenantId = context.organizationId;
  } catch {
    tenantId = null;
  }

  if (!tenantId) {
    return (
      <VantyxPortalShell title="Billing Overview" description="Sign in to view your tenant billing data." activePath="/billing">
        <VantyxPanel className="p-6">
          <p className="text-white/70">No billing context is available for this session.</p>
        </VantyxPanel>
      </VantyxPortalShell>
    );
  }

  const [trends, rows] = await Promise.all([
    getBillingTrends(tenantId, "month"),
    getBillingExportRows(tenantId, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
  ]);

  const latestRow = rows[0] ?? null;
  const hasData = Boolean(latestRow || trends.transactions > 0 || trends.revenue > 0);

  const metrics = hasData
    ? [
        { label: "Current plan", value: latestRow?.description ?? "Tenant plan", delta: "Tenant scoped", icon: Layers3, tone: "blue" as const },
        { label: "Next payment", value: latestRow?.amount ?? "$0.00", delta: latestRow?.date ?? "Unavailable", icon: CalendarDays, tone: "blue" as const },
        { label: "Billing cycle", value: "Monthly", delta: "Tenant scoped", icon: CircleDollarSign, tone: "blue" as const },
        { label: "Status", value: trends.revenue > 0 ? "Active" : "Unavailable", delta: "Tenant billing data", icon: ShieldCheck, tone: trends.revenue > 0 ? ("success" as const) : ("neutral" as const) },
      ]
    : [];

  return (
    <VantyxPortalShell title="Billing Overview" description="Overview of your tenant billing data." activePath="/billing">
      {metrics.length > 0 ? (
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
                  <VantyxStatusPill tone={metric.tone}>{metric.delta}</VantyxStatusPill>
                </div>
                <div className="relative mt-4 text-[13px] uppercase tracking-[0.22em] text-white/46">{metric.label}</div>
                <div className="relative mt-4 text-[30px] font-light tracking-[-0.04em] text-white">{metric.value}</div>
              </VantyxPanel>
            );
          })}
        </div>
      ) : (
        <VantyxPanel className="p-6">
          <p className="text-white/70">No billing records are available for this tenant yet.</p>
        </VantyxPanel>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <VantyxPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[24px] font-light uppercase tracking-[0.14em]">Usage this cycle</div>
              <div className="mt-2 text-[14px] uppercase tracking-[0.18em] text-white/46">Billing trends</div>
            </div>
            <Link href="/reports" className="text-[14px] text-blue-400">
              View analytics
            </Link>
          </div>
          <div className="mt-8 rounded-[16px] border border-white/10 bg-black/20 px-6 py-6">
            {hasData ? (
              <>
                <div className="flex items-end justify-between gap-4">
                  <div className="text-[42px] font-light tracking-[-0.06em] text-blue-400">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(trends.revenue)}
                  </div>
                  <div className="ml-auto pb-2 text-[14px] text-white/52">{trends.transactions} transactions</div>
                </div>
                <div className="mt-5 h-3 rounded-full bg-white/8">
                  <div className="h-3 w-[23%] rounded-full bg-[linear-gradient(90deg,#2457ff,#2c8cff)] shadow-[0_0_18px_rgba(37,99,235,0.35)]" />
                </div>
                <div className="mt-5 flex items-center justify-between text-[14px] text-white/46">
                  <span>Tenant-scoped billing data</span>
                  <span>View all</span>
                </div>
              </>
            ) : (
              <p className="text-white/70">No usage data is available yet.</p>
            )}
          </div>
        </VantyxPanel>

        <VantyxPanel className="p-6">
          <div className="text-[24px] font-light uppercase tracking-[0.14em]">Recent invoice</div>
          <div className="mt-5 rounded-[16px] border border-white/10 bg-black/20 p-5">
            {latestRow ? (
              <>
                <div className="text-[13px] uppercase tracking-[0.18em] text-white/46">Latest billing record</div>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <div className="text-[30px] font-light tracking-[-0.04em] text-white">{latestRow.description}</div>
                  <VantyxStatusPill tone="success">Tenant data</VantyxStatusPill>
                </div>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <div className="text-[13px] uppercase tracking-[0.18em] text-white/46">Date</div>
                    <div className="mt-3 text-[16px] text-white">{latestRow.date}</div>
                  </div>
                  <div>
                    <div className="text-[13px] uppercase tracking-[0.18em] text-white/46">Amount</div>
                    <div className="mt-3 text-[16px] text-white">{latestRow.amount}</div>
                  </div>
                </div>
                <div className="mt-6">
                  <VantyxBlueButton href="/billing/invoices" className="w-full sm:w-auto">
                    View invoice
                  </VantyxBlueButton>
                </div>
              </>
            ) : (
              <p className="text-white/70">No invoice is available for this tenant.</p>
            )}
          </div>
        </VantyxPanel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <VantyxPanel className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-[24px] font-light uppercase tracking-[0.14em]">Recent activity</div>
            <Link href="/billing/invoices" className="text-[14px] text-blue-400">
              View all
            </Link>
          </div>
          <div className="mt-6 overflow-hidden rounded-[16px] border border-white/10">
            {rows.length > 0 ? (
              rows.map((row) => (
                <div key={`${row.id}-${row.date}-${row.description}`} className="grid grid-cols-[160px_1fr_120px_120px] items-center border-b border-white/10 px-5 py-4 text-[15px] last:border-b-0">
                  <span className="text-white/42">{row.date}</span>
                  <span>{row.description}</span>
                  <span>{row.amount}</span>
                  <span className="text-right">
                    <VantyxStatusPill tone="success">Paid</VantyxStatusPill>
                  </span>
                </div>
              ))
            ) : (
              <div className="px-5 py-6 text-white/70">No billing activity available for this tenant.</div>
            )}
          </div>
        </VantyxPanel>

        <div className="grid gap-6">
          <VantyxPanel className="p-6">
            <div className="text-[24px] font-light uppercase tracking-[0.14em]">Quick actions</div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex min-h-[104px] flex-col justify-between rounded-[14px] border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/20 hover:bg-white/[0.04]"
                >
                  <FileText className="h-5 w-5 text-white/75" />
                  <div className="flex items-end justify-between gap-3">
                    <span className="max-w-[128px] text-[12px] uppercase tracking-[0.2em] text-white/70">{action.title}</span>
                    <span className="text-[12px] uppercase tracking-[0.2em] text-blue-400">Open</span>
                  </div>
                </Link>
              ))}
            </div>
          </VantyxPanel>

          <VantyxPanel className="p-6">
            <div className="text-[24px] font-light uppercase tracking-[0.14em]">Status</div>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-[14px] border border-white/10 bg-black/20 px-4 py-4">
                <span className="text-[14px] uppercase tracking-[0.18em] text-white/54">Billing</span>
                <VantyxStatusPill tone="success">{hasData ? "Active" : "Unavailable"}</VantyxStatusPill>
              </div>
              <div className="flex items-center justify-between rounded-[14px] border border-white/10 bg-black/20 px-4 py-4">
                <span className="text-[14px] uppercase tracking-[0.18em] text-white/54">Plan</span>
                <span className="text-[15px]">{latestRow?.description ?? "Unavailable"}</span>
              </div>
              <div className="flex items-center justify-between rounded-[14px] border border-white/10 bg-black/20 px-4 py-4">
                <span className="text-[14px] uppercase tracking-[0.18em] text-white/54">Transactions</span>
                <span className="text-[15px]">{trends.transactions}</span>
              </div>
            </div>
          </VantyxPanel>
        </div>
      </div>
    </VantyxPortalShell>
  );
}
