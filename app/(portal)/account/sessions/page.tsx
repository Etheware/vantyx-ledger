
import { Laptop, Smartphone, TabletSmartphone, ShieldCheck, LogOut } from "lucide-react";
import { VantyxBlueButton, VantyxGhostButton, VantyxPanel, VantyxPortalShell, VantyxStatusPill } from "../../../../components/vantyx-portal-shell";

const sessions = [
  ["MacBook Pro", "Chrome 124", "Austin, Texas, USA", "Just now", true, Laptop],
  ["iPhone 15 Pro", "Safari Mobile", "Austin, Texas, USA", "12 min ago", false, Smartphone],
  ["Windows Desktop", "Edge 124", "Dallas, Texas, USA", "2 hours ago", false, Laptop],
  ["iPad Air", "Safari", "Houston, Texas, USA", "1 day ago", false, TabletSmartphone],
] as const;

export default function SessionsPage() {
  return (
    <VantyxPortalShell
      activePath="/settings/general"
      title="Sessions"
      description="Manage your active sessions and devices."
      actions={
        <div className="flex flex-wrap gap-3">
          <VantyxGhostButton href="/account/security/2fa">Security settings</VantyxGhostButton>
          <VantyxBlueButton href="/account/connected-accounts">Connected accounts</VantyxBlueButton>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.14fr_0.86fr]">
        <VantyxPanel className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.38em] text-white/34">Session activity</div>
              <div className="mt-3 text-[28px] font-light uppercase tracking-[0.16em] text-white">Active devices</div>
            </div>
            <VantyxStatusPill tone="blue">Current session</VantyxStatusPill>
          </div>
          <div className="mt-6 overflow-hidden rounded-[18px] border border-white/10">
            <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_0.7fr_0.5fr] border-b border-white/10 bg-white/[0.02] px-5 py-4 text-[12px] uppercase tracking-[0.18em] text-white/46">
              <span>Device</span>
              <span>Browser</span>
              <span>Location</span>
              <span>Last active</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {sessions.map(([device, browser, location, lastActive, current, Icon]) => (
              <div key={`${device}-${browser}`} className="grid grid-cols-[1.2fr_1fr_1fr_1fr_0.7fr_0.5fr] items-center border-b border-white/10 px-5 py-4 text-[14px] last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.03] text-blue-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[15px] uppercase tracking-[0.16em] text-white/82">{device}</div>
                    <div className="text-[12px] text-white/40">macOS 14.4</div>
                  </div>
                </div>
                <div className="text-white/64">{browser}</div>
                <div className="text-white/64">{location}</div>
                <div className="text-white/64">{lastActive}</div>
                <div>{current ? <VantyxStatusPill tone="blue">Current session</VantyxStatusPill> : <VantyxStatusPill tone="success">Active</VantyxStatusPill>}</div>
                <div>{current ? "—" : <button className="rounded-[12px] border border-white/10 px-3 py-2 text-[12px] uppercase tracking-[0.18em] text-white/72">Revoke</button>}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-[18px] border border-white/10 bg-black/20 px-5 py-4">
            <div className="flex items-center gap-3 text-[14px] uppercase tracking-[0.18em] text-white/52">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
              If you don&apos;t recognize a session, revoke it to secure your account.
            </div>
            <VantyxBlueButton href="/auth/login" className="!min-h-[48px]">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out of all sessions
            </VantyxBlueButton>
          </div>
        </VantyxPanel>

        <div className="grid gap-6 self-start">
          <VantyxPanel className="p-6">
            <div className="text-[11px] uppercase tracking-[0.38em] text-white/34">Protection</div>
            <div className="mt-3 text-[28px] font-light uppercase tracking-[0.16em] text-white">Session controls</div>
            <div className="mt-4 space-y-3 text-[14px] leading-7 text-white/58">
              <p>Monitor signed-in devices and browsers.</p>
              <p>Revoke sessions if a device is lost or shared.</p>
              <p>Use 2FA to keep account access locked down.</p>
            </div>
          </VantyxPanel>
          <VantyxPanel className="p-6">
            <div className="text-[11px] uppercase tracking-[0.38em] text-white/34">Next steps</div>
            <div className="mt-3 text-[18px] uppercase tracking-[0.18em] text-white/78">Update security</div>
            <div className="mt-5 space-y-3">
              <a href="/account/security/2fa" className="block rounded-[14px] border border-white/10 bg-white/[0.02] px-4 py-4 text-[13px] uppercase tracking-[0.18em] text-white/76">Two-factor authentication</a>
              <a href="/account/connected-accounts" className="block rounded-[14px] border border-white/10 bg-white/[0.02] px-4 py-4 text-[13px] uppercase tracking-[0.18em] text-white/76">Connected accounts</a>
            </div>
          </VantyxPanel>
        </div>
      </div>
    </VantyxPortalShell>
  );
}