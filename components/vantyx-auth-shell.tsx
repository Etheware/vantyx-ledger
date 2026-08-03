
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function VantyxAuthViewport({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020304] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(23,37,84,0.28),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(29,78,216,0.18),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[28vw] bg-[radial-gradient(circle_at_left,rgba(29,78,216,0.20),transparent_48%)] opacity-80" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[20vw] bg-[radial-gradient(circle_at_right,rgba(29,78,216,0.14),transparent_38%)] opacity-60" />

      <div className="relative flex min-h-screen flex-col px-5 py-5 sm:px-8 sm:py-8">
        <div className="flex items-center justify-between">
          <Image src="/logo.png" alt="Vantyx Ledger" width={220} height={74} className="h-8 w-auto object-contain opacity-88 sm:h-9" />
          <div className="flex items-center gap-3 text-white/45">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-[12px]">⌂</span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">{children}</div>

        <footer className="pt-4 text-center text-[10px] uppercase tracking-[0.38em] text-white/24">
          Enterprise-grade billing, access, and ledger infrastructure.
          <div className="mt-2 text-[10px] tracking-[0.28em] text-white/18">© 2026 Vantyx Ledger. All rights reserved.</div>
        </footer>
      </div>
    </main>
  );
}

export function VantyxAuthCard({
  icon,
  title,
  description,
  children,
  className = "",
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`w-full max-w-[860px] rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-6 py-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-[24px] sm:px-8 sm:py-10 ${className}`}>
      {icon ? (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-[0_0_32px_rgba(37,99,235,0.25)]">
          {icon}
        </div>
      ) : null}
      <h1 className="mt-6 text-center text-[28px] font-light uppercase tracking-[0.34em] text-white sm:text-[34px]">{title}</h1>
      {description ? (
        <div className="mx-auto mt-4 max-w-[560px] text-center text-[14px] leading-7 text-white/56 sm:text-[15px]">{description}</div>
      ) : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function VantyxProgressLine({ label }: { label?: string }) {
  return (
    <div className="mx-auto w-full max-w-[520px]">
      <div className="relative h-px overflow-hidden rounded-full bg-white/10">
        <div className="absolute inset-y-0 left-1/2 w-24 -translate-x-1/2 rounded-full bg-blue-500 shadow-[0_0_16px_rgba(37,99,235,0.55)] animate-[pulse_1.8s_ease-in-out_infinite]" />
      </div>
      {label ? <div className="mt-6 text-center text-[11px] uppercase tracking-[0.42em] text-white/36">{label}</div> : null}
    </div>
  );
}

export function VantyxButton({
  href,
  children,
  variant = "primary",
  type = "button",
  onClick,
  disabled,
}: {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const className =
    "inline-flex min-h-12 items-center justify-center rounded-[10px] px-5 text-[12px] uppercase tracking-[0.28em] transition";
  const variantClass =
    variant === "primary"
      ? "border border-blue-500/80 bg-blue-600 text-white hover:bg-blue-500"
      : variant === "secondary"
        ? "border border-white/10 bg-white/[0.02] text-white/84 hover:bg-white/[0.05]"
        : "border border-white/10 text-white/64 hover:border-white/18 hover:text-white";

  if (href) {
    return (
      <Link href={href} className={`${className} ${variantClass}`}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${className} ${variantClass} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}>
      {children}
    </button>
  );
}