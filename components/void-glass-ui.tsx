import type { ReactNode } from "react";

export function Viewport({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-black text-white">{children}</div>;
}

export function GlassPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[24px] border border-white/10 bg-white/[0.03] backdrop-blur-xl ${className}`}>{children}</section>;
}
