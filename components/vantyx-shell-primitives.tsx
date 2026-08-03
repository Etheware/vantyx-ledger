
"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { X } from "lucide-react";

export function VantyxWordmark({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return (
    <div className={className}>
      <div className={`font-light text-white/90 ${compact ? "text-[20px] tracking-[0.3em]" : "text-[26px] tracking-[0.34em]"}`}>
        VANTYX
      </div>
      <div className={`mt-1 text-[10px] uppercase text-white/40 ${compact ? "tracking-[0.4em]" : "tracking-[0.5em]"}`}>
        Ledger
      </div>
    </div>
  );
}

export function VantyxShellLink({
  href,
  label,
  icon,
  active,
  mobile = false,
  onClick,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
  mobile?: boolean;
  onClick?: () => void;
}) {
  const Icon = icon;
  const className = mobile
    ? `flex items-center gap-4 rounded-[14px] px-4 py-3.5 text-[13px] uppercase tracking-[0.18em] transition ${
        active
          ? "border border-white/10 bg-white/[0.06] text-blue-400"
          : "text-white/76 hover:bg-white/[0.03] hover:text-white"
      }`
    : `flex items-center gap-4 rounded-[14px] px-4 py-4 text-[14px] uppercase tracking-[0.2em] transition ${
        active
          ? "border border-white/10 bg-white/[0.06] text-blue-400 shadow-[inset_3px_0_0_0_rgba(59,130,246,1)]"
          : "text-white/76 hover:bg-white/[0.03] hover:text-white"
      }`;

  return (
    <Link href={href} onClick={onClick} className={className}>
      <Icon className="h-5 w-5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

export function VantyxSideAction({
  href,
  label,
  icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick?: () => void;
}) {
  const Icon = icon;
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-4 rounded-[14px] px-4 py-3.5 text-[13px] uppercase tracking-[0.18em] text-white/72 hover:bg-white/[0.03] hover:text-white"
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}

export function VantyxOverlayShell({
  title,
  subtitle,
  children,
  footer,
  onClose,
  widthClass = "max-w-[1160px]",
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  widthClass?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/88 px-4 py-6 backdrop-blur-2xl sm:px-6 sm:py-8">
      <div className={`mx-auto flex min-h-full ${widthClass} flex-col rounded-[28px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.62)] sm:p-6`}>
        <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.42em] text-white/35">{title}</div>
            <div className="mt-2 text-[30px] font-light uppercase tracking-[0.26em] text-white">{subtitle}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/65 transition hover:border-white/20 hover:text-white"
          >
            Esc
          </button>
        </div>
        <div className="min-h-0 flex-1 py-5">{children}</div>
        {footer ? <div className="border-t border-white/10 pt-4">{footer}</div> : null}
      </div>
    </div>
  );
}

export function VantyxGlassButton({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      className={`rounded-[12px] border px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition ${
        active ? "border-blue-500/40 bg-blue-500/10 text-blue-400" : "border-white/10 bg-white/[0.02] text-white/62 hover:border-white/20"
      }`}
    >
      {children}
    </button>
  );
}

export function VantyxCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close menu"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 hover:bg-white/5"
    >
      <X className="h-4 w-4" />
    </button>
  );
}