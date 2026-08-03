
"use client";

import { useState } from "react";
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const products = Array.from(new Set(portalLicenses.map((license) => license.productName)));
  const filteredLicenses = portalLicenses.filter((license) => {
    const matchesStatus = statusFilter === "all" || license.status === statusFilter;
    const matchesProduct = productFilter === "all" || license.productName === productFilter;
    const matchesQuery =
      !query ||
      license.licenseKey.toLowerCase().includes(query.toLowerCase()) ||
      license.purchaserEmail.toLowerCase().includes(query.toLowerCase());
    return matchesStatus && matchesProduct && matchesQuery;
  });

  return (
    <VantyxPortalShell title="Licenses" description="Every license issued to your customers, in one place." activePath="/licenses">
      <div className="grid gap-4 lg:grid-cols-[0.95fr_0.95fr_1.6fr]">
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "active" ? "all" : "active")}
          className="flex h-14 items-center justify-between rounded-[14px] border border-white/10 bg-white/[0.025] px-5 text-[14px] uppercase tracking-[0.16em] text-white/78"
        >
          <span>{statusFilter === "all" ? "All Status" : statusFilter}</span>
          <ChevronDown className="h-4 w-4 text-white/46" />
        </button>
        <button
          type="button"
          onClick={() => setProductFilter(productFilter === "all" ? products[0] ?? "all" : "all")}
          className="flex h-14 items-center justify-between rounded-[14px] border border-white/10 bg-white/[0.025] px-5 text-[14px] uppercase tracking-[0.16em] text-white/78"
        >
          <span>{productFilter === "all" ? "All Products" : productFilter}</span>
          <ChevronDown className="h-4 w-4 text-white/46" />
        </button>
        <label className="flex h-14 items-center rounded-[14px] border border-white/10 bg-white/[0.025] px-5 text-white/40">
          <Search className="h-5 w-5" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="ml-3 w-full bg-transparent text-[14px] outline-none placeholder:text-white/40"
            placeholder="Search by license key or email..."
          />
        </label>
      </div>

      <VantyxPanel className="mt-6 overflow-hidden">
        <div className="hidden grid-cols-[1.4fr_1.3fr_0.9fr_0.9fr_0.9fr] border-b border-white/10 px-6 py-5 text-[13px] uppercase tracking-[0.18em] text-white/42 lg:grid">
          <span>License</span>
          <span>Purchaser</span>
          <span>Billing</span>
          <span>Activated</span>
          <span>Status</span>
        </div>
        {filteredLicenses.map((license) => (
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
