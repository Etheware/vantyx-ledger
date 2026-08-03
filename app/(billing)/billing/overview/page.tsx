
import Link from "next/link";
import { CalendarDays, CircleDollarSign, FileText, Layers3, ShieldCheck } from "lucide-react";
import { VantyxBlueButton, VantyxPanel, VantyxPortalShell, VantyxStatusPill } from "../../../../components/vantyx-portal-shell";
import { billingActivity } from "../../../../lib/vantyx-portal-data";

const metrics = [
  { label: "Current plan", value: "Professional", delta: "Active", icon: Layers3 },
  { label: "Next payment", value: "$99.00", delta: "May 26, 2025", icon: CalendarDays },
  { label: "Billing cycle", value: "Monthly", delta: "Renews monthly", icon: CircleDollarSign },
  { label: "Status", value: "Active", delta: "All systems operational", icon: ShieldCheck },
];

const quickActions = [
  { title: "Open invoices", href: "/billing/invoices" },
  { title: "Manage billing", href: "/billing/subscription" },
  { title: "View payment methods", href: "/billing/payment-methods" },
  { title: "Open support", href: "/support/help-center" },
];

export default function BillingOverviewPage() {
  return (
    <VantyxPortalShell title="Billing Overview" description="Overview of your account and billing." activePath="/billing">
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
                <VantyxStatusPill tone={metric.label === "Status" ? "success" : "blue"}>{metric.delta}</VantyxStatusPill>
              </div>
              <div className="relative mt-4 text-[13px] uppercase tracking-[0.22em] text-white/46">{metric.label}</div>
              <div className="relative mt-4 text-[30px] font-light tracking-[-0.04em] text-white">{metric.value}</div>
            </VantyxPanel>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <VantyxPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[24px] font-light uppercase tracking-[0.14em]">Usage this cycle</div>
              <div className="mt-2 text-[14px] uppercase tracking-[0.18em] text-white/46">API requests</div>
            </div>
            <Link href="/reports" className="text-[14px] text-blue-400">
              View analytics
            </Link>
          </div>
          <div className="mt-8 rounded-[16px] border border-white/10 bg-black/20 px-6 py-6">
            <div className="flex items-end justify-between gap-4">
              <div className="text-[42px] font-light tracking-[-0.06em] text-blue-400">23,450</div>
              <div className="pb-2 text-[14px] text-white/52">/ 100,000</div>
              <div className="ml-auto pb-2 text-[14px] text-white/52">23% used</div>
            </div>
            <div className="mt-5 h-3 rounded-full bg-white/8">
              <div className="h-3 w-[23%] rounded-full bg-[linear-gradient(90deg,#2457ff,#2c8cff)] shadow-[0_0_18px_rgba(37,99,235,0.35)]" />
            </div>
            <div className="mt-5 flex items-center justify-between text-[14px] text-white/46">
              <span>Resets on May 26, 2025</span>
              <span>View all</span>
            </div>
          </div>
        </VantyxPanel>

        <VantyxPanel className="p-6">
          <div className="text-[24px] font-light uppercase tracking-[0.14em]">Recent invoice</div>
          <div className="mt-5 rounded-[16px] border border-white/10 bg-black/20 p-5">
            <div className="text-[13px] uppercase tracking-[0.18em] text-white/46">Invoice number</div>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="text-[30px] font-light tracking-[-0.04em] text-white">INV-2025-0017</div>
              <VantyxStatusPill tone="success">Paid</VantyxStatusPill>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <div className="text-[13px] uppercase tracking-[0.18em] text-white/46">Date</div>
                <div className="mt-3 text-[16px] text-white">May 1, 2025</div>
              </div>
              <div>
                <div className="text-[13px] uppercase tracking-[0.18em] text-white/46">Amount</div>
                <div className="mt-3 text-[16px] text-white">$99.00</div>
              </div>
            </div>
            <div className="mt-6">
              <VantyxBlueButton href="/billing/invoices/INV-2025-0017" className="w-full sm:w-auto">
                View invoice
              </VantyxBlueButton>
            </div>
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
            <div className="grid grid-cols-[160px_1fr_120px_120px] border-b border-white/10 bg-white/[0.02] px-5 py-4 text-[12px] uppercase tracking-[0.18em] text-white/46">
              <span>Date</span>
              <span>Description</span>
              <span>Amount</span>
              <span className="text-right">Status</span>
            </div>
            {billingActivity.map(([date, description, amount, status]) => (
              <div
                key={`${date}-${description}`}
                className="grid grid-cols-[160px_1fr_120px_120px] items-center border-b border-white/10 px-5 py-4 text-[15px] last:border-b-0"
              >
                <span className="text-white/42">{date}</span>
                <span>{description}</span>
                <span>{amount}</span>
                <span className="text-right">
                  <VantyxStatusPill tone="success">{status}</VantyxStatusPill>
                </span>
              </div>
            ))}
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
                <VantyxStatusPill tone="success">Active</VantyxStatusPill>
              </div>
              <div className="flex items-center justify-between rounded-[14px] border border-white/10 bg-black/20 px-4 py-4">
                <span className="text-[14px] uppercase tracking-[0.18em] text-white/54">Plan</span>
                <span className="text-[15px]">Professional</span>
              </div>
              <div className="flex items-center justify-between rounded-[14px] border border-white/10 bg-black/20 px-4 py-4">
                <span className="text-[14px] uppercase tracking-[0.18em] text-white/54">Customers</span>
                <span className="text-[15px]">1,482</span>
              </div>
            </div>
          </VantyxPanel>
        </div>
      </div>
    </VantyxPortalShell>
  );
}