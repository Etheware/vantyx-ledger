
"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  Bell,
  ChevronDown,
  CreditCard,
  Grid2x2,
  HelpCircle,
  LogOut,
  Receipt,
  Search,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";

type ShellProps = {
  title?: string;
  description?: string;
  activePath?: string;
  children: ReactNode;
  actions?: ReactNode;
  organizationName?: string;
};

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: Grid2x2 },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/licenses", label: "Licenses", icon: ShieldCheck },
  { href: "/transactions", label: "Transactions", icon: CreditCard },
  { href: "/reports", label: "Reports", icon: Receipt },
  { href: "/settings/general", label: "Settings", icon: Settings },
];

function MobilePortalNav({ open, onClose, activePath }: { open: boolean; onClose: () => void; activePath: string }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] lg:hidden">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-y-0 left-0 flex w-[280px] flex-col border-r border-white/10 bg-[rgba(9,9,11,0.98)] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        <div className="flex items-center justify-between px-1 pb-6">
          <div>
            <div className="text-[20px] font-light tracking-[0.3em] text-white/90">VANTYX</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.4em] text-white/40">Ledger</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const active = activePath.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-4 rounded-[14px] px-4 py-3.5 text-[13px] uppercase tracking-[0.18em] transition ${
                  active
                    ? "border border-white/10 bg-white/[0.06] text-blue-400"
                    : "text-white/76 hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 border-t border-white/8 pt-4">
          <Link
            href="/support/help-center"
            onClick={onClose}
            className="flex items-center gap-4 rounded-[14px] px-4 py-3.5 text-[13px] uppercase tracking-[0.18em] text-white/72 hover:bg-white/[0.03] hover:text-white"
          >
            <HelpCircle className="h-5 w-5" />
            <span>Support</span>
          </Link>
          <Link
            href={`${activePath}?overlay=logout`}
            onClick={onClose}
            className="flex items-center gap-4 rounded-[14px] px-4 py-3.5 text-[13px] uppercase tracking-[0.18em] text-white/72 hover:bg-white/[0.03] hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function VantyxPortalShell({ title, description, activePath = "/billing", actions, children, organizationName = "Acme Corporation" }: ShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <MobilePortalNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} activePath={activePath} />
      <div className="relative mx-auto flex min-h-[100dvh] max-w-[1600px] overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_32px_120px_rgba(0,0,0,0.65)]">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[320px] bg-[radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.22),transparent_42%)] opacity-90" />
        <div className="pointer-events-none absolute bottom-[-10rem] left-[-4rem] h-[26rem] w-[26rem] rounded-full bg-blue-600/10 blur-[110px]" />
        <div className="pointer-events-none absolute right-[-6rem] top-[-6rem] h-[20rem] w-[20rem] rounded-full bg-blue-500/10 blur-[110px]" />

        <aside className="relative hidden w-[240px] shrink-0 border-r border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] lg:flex lg:flex-col">
          <div className="px-8 pt-10">
            <div className="text-[26px] font-light tracking-[0.34em] text-white/90">VANTYX</div>
            <div className="mt-2 text-[12px] uppercase tracking-[0.5em] text-white/40">Ledger</div>
          </div>

          <div className="px-5 pt-10">
            <button
              type="button"
              className="flex h-14 w-full items-center justify-between rounded-[14px] border border-white/10 bg-white/[0.03] px-4 text-left text-[14px] text-white/88"
            >
              <span>{organizationName}</span>
              <ChevronDown className="h-4 w-4 text-white/52" />
            </button>
          </div>

          <nav className="mt-8 space-y-2 px-4">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const active = activePath.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 rounded-[14px] px-4 py-4 text-[14px] uppercase tracking-[0.2em] transition ${
                    active
                      ? "border border-white/10 bg-white/[0.06] text-blue-400 shadow-[inset_3px_0_0_0_rgba(59,130,246,1)]"
                      : "text-white/76 hover:bg-white/[0.03] hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2 px-4 pb-8">
            <Link href="/support/help-center" className="flex items-center gap-4 rounded-[14px] px-4 py-4 text-[14px] uppercase tracking-[0.2em] text-white/72 hover:bg-white/[0.03] hover:text-white">
              <HelpCircle className="h-5 w-5" />
              <span>Support</span>
            </Link>
            <Link href={`${activePath}?overlay=logout`} className="flex items-center gap-4 rounded-[14px] px-4 py-4 text-[14px] uppercase tracking-[0.2em] text-white/72 hover:bg-white/[0.03] hover:text-white">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Link>
          </div>
        </aside>

        <section className="relative flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-[108px] items-center gap-4 border-b border-white/10 px-6 py-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white/84 lg:hidden"
            >
              <span className="inline-flex flex-col gap-1">
                <span className="h-0.5 w-4 rounded-full bg-white/80" />
                <span className="h-0.5 w-4 rounded-full bg-white/80" />
                <span className="h-0.5 w-4 rounded-full bg-white/80" />
              </span>
            </button>
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="flex h-14 min-w-0 flex-1 items-center rounded-[14px] border border-white/10 bg-black/20 px-4 text-white/40 lg:max-w-[380px]">
                <Search className="h-5 w-5 shrink-0" />
                <span className="ml-3 truncate text-[14px]">Search...</span>
                <span className="ml-auto hidden rounded-[8px] border border-white/10 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-white/42 sm:inline-flex">
                  ⌘ K
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button type="button" className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white/84">
                <Bell className="h-5 w-5" />
                <span className="absolute right-[11px] top-[10px] h-2.5 w-2.5 rounded-full bg-blue-500" />
              </button>
              <button type="button" className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white/84">
                <HelpCircle className="h-5 w-5" />
              </button>
              <button type="button" className="flex items-center gap-3 rounded-full border border-white/10 bg-black/25 px-3 py-2.5 text-left">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-[18px] text-white/84">{organizationName.slice(0, 2).toUpperCase()}</div>
                <div className="hidden xl:block">
                  <div className="text-[13px] uppercase tracking-[0.18em] text-white">James Park</div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">Admin</div>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-white/42 xl:block" />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-10">
            {(title || description || actions) && (
              <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  {title ? <h1 className="text-[30px] font-light uppercase tracking-[0.18em] text-white">{title}</h1> : null}
                  {description ? <p className="mt-3 text-[15px] text-white/58">{description}</p> : null}
                </div>
                {actions ? <div className="shrink-0">{actions}</div> : null}
              </div>
            )}
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

export function VantyxPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.025)] ${className}`}>{children}</section>;
}

export function VantyxStatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "danger" | "blue" }) {
  const tones = {
    neutral: "border-white/10 bg-white/[0.03] text-white/72",
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    danger: "border-red-500/20 bg-red-500/10 text-red-400",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  };

  return <span className={`inline-flex rounded-full border px-3 py-1 text-[12px] uppercase tracking-[0.18em] ${tones[tone]}`}>{children}</span>;
}

export function VantyxGhostButton({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[56px] items-center justify-center rounded-[14px] border border-white/14 px-6 text-[14px] uppercase tracking-[0.2em] text-white/86 transition hover:border-white/24 hover:bg-white/[0.03] ${className}`}
    >
      {children}
    </Link>
  );
}

export function VantyxBlueButton({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[56px] items-center justify-center rounded-[14px] border border-blue-500/40 bg-[linear-gradient(180deg,#1677ff,#0f5de2)] px-6 text-[14px] uppercase tracking-[0.2em] text-white shadow-[0_0_30px_rgba(37,99,235,0.24)] transition hover:brightness-110 ${className}`}
    >
      {children}
    </Link>
  );
}
