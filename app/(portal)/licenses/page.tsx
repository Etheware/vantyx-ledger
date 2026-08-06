import { KeyRound } from "lucide-react";
import { getSession as getRequestSession } from "@/lib/auth/get-session";
import { getPortalLicenses, type LivePortalLicense } from "../../../lib/vantyx-portal-data";
import { VantyxPanel, VantyxPortalShell, VantyxStatusPill } from "../../../components/vantyx-portal-shell";

const STATUS_TONE = {
  active: "success",
  pending: "blue",
  expired: "neutral",
  revoked: "danger",
} as const;

function formatLicenseStatus(status: LivePortalLicense["status"]) {
  return status === "active" ? "Active" : status === "pending" ? "Pending" : status === "expired" ? "Expired" : "Revoked";
}

export default async function LicensesPage() {
  const session = await getRequestSession();
  const tenantName = session?.orgName || "Acme Corporation";
  const tenantId = session?.activeOrgUuid || session?.orgUuid || null;
  const licenses = await getPortalLicenses(tenantId);

  return (
    <VantyxPortalShell title="Licenses" description="Every license issued to your customers, in one place." activePath="/licenses" organizationName={tenantName}>
      <VantyxPanel className="overflow-hidden">
        <div className="grid grid-cols-[1.3fr_1.1fr_1fr_0.9fr_0.8fr] border-b border-white/10 px-6 py-5 text-[13px] uppercase tracking-[0.18em] text-white/42">
          <span>License</span>
          <span>Product</span>
          <span>Customer</span>
          <span>Activated</span>
          <span>Status</span>
        </div>
        {licenses.length === 0 ? (
          <div className="px-6 py-10 text-[14px] text-white/58">No licenses are available for this tenant yet.</div>
        ) : (
          licenses.map((license) => (
            <div
              key={license.id}
              className="grid grid-cols-1 gap-2 border-b border-white/10 px-6 py-5 text-[15px] text-white/78 last:border-b-0 lg:grid-cols-[1.3fr_1.1fr_1fr_0.9fr_0.8fr] lg:items-center lg:gap-0"
            >
              <div>
                <div className="flex items-center gap-2 font-mono text-[13px] text-blue-400">
                  <KeyRound className="h-3.5 w-3.5" />
                  {license.licenseKey}
                </div>
                <div className="mt-1 text-[13px] text-white/56">{license.expiresAt ? `Expires ${license.expiresAt}` : "No expiry set"}</div>
              </div>
              <span className="text-white/68">{license.productName}</span>
              <span className="text-white/68">{license.customerLabel}</span>
              <span className="text-white/56">{license.activatedAt}</span>
              <span>
                <VantyxStatusPill tone={STATUS_TONE[license.status]}>{formatLicenseStatus(license.status)}</VantyxStatusPill>
              </span>
            </div>
          ))
        )}
      </VantyxPanel>
    </VantyxPortalShell>
  );
}
