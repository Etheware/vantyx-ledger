
import { ChevronDown, KeyRound, Search } from "lucide-react";
import { VantyxPanel, VantyxPortalShell, VantyxStatusPill } from "../../../components/vantyx-portal-shell";
import { portalLicenses } from "../../../lib/vantyx-portal-data";

const STATUS_TONE = {
  active: "success",
  pending: "blue",
  expired: "neutral",
  revoked: "danger",
} as const;

export default function LicensesPage() {
  return (
    <VantyxPortalShell title="Licenses" description="Every license issued to your customers, in one place." activePath="/licenses">
      <div className="grid gap-4 lg:grid-cols-[0.95fr_0.95fr_1.6fr]">
        {["All Status", "All Products"].map((label) => (
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
          <span className="ml-3 text-[14px]">Search by license key or email...</span>
        </div>
      </div>

      <VantyxPanel className="mt-6 overflow-hidden">
        <div className="hidden grid-cols-[1.4fr_1.3fr_0.9fr_0.9fr_0.9fr] border-b border-white/10 px-6 py-5 text-[13px] uppercase tracking-[0.18em] text-white/42 lg:grid">
          <span>License</span>
          <span>Purchaser</span>
          <span>Billing</span>
          <span>Activated</span>
          <span>Status</span>
        </div>
        {portalLicenses.map((license) => (
          <div
            key={license.id}
            className="grid grid-cols-1 gap-2 border-b border-white/10 px-6 py-5 text-[15px] text-white/78 last:border-b-0 lg:grid-cols-[1.4fr_1.3fr_0.9fr_0.9fr_0.9fr] lg:items-center lg:gap-0"
          >
            <div>
              <div className="flex items-center gap-2 font-mono text-[13px] text-blue-400">
                <KeyRound className="h-3.5 w-3.5" />
                {license.licenseKey}
              </div>
              <div className="mt-1 text-[13px] text-white/56">{license.productName}</div>
            </div>
            <span className="text-white/68">{license.purchaserEmail}</span>
            <span className="text-white/56">{license.billingModel === "subscription" ? "Subscription" : "One-time"}</span>
            <span className="text-white/56">{license.activatedAt}</span>
            <span>
              <VantyxStatusPill tone={STATUS_TONE[license.status]}>{license.status}</VantyxStatusPill>
            </span>
          </div>
        ))}
      </VantyxPanel>
    </VantyxPortalShell>
  );
}