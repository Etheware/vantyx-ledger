
"use client";

import type { ReactNode } from "react";
import { GlassPanel, Viewport } from "./void-glass-ui";

export function VantyxStateShell({
  eyebrow = "Vantyx Ledger",
  title,
  description,
  icon,
  iconClassName = "border border-white/10 bg-white/5 text-white/60",
  children,
  actions,
  footer,
  maxWidth = "max-w-[520px]",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  iconClassName?: string;
  children?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}) {
  return (
    <Viewport>
      <div className="grid min-h-[calc(100dvh-3rem)] place-items-center">
        <GlassPanel className={`w-full ${maxWidth} p-6 text-center sm:p-8`}>
          <div className="text-[13px] uppercase tracking-[0.4em] text-white/35">{eyebrow}</div>
          {icon ? (
            <div className={`mx-auto mt-8 flex h-20 w-20 items-center justify-center rounded-2xl ${iconClassName}`}>
              {icon}
            </div>
          ) : null}
          <h1 className="mt-6 text-[30px] font-light uppercase tracking-[0.28em] text-white">{title}</h1>
          {description ? <div className="mt-4 text-[15px] leading-7 text-white/55">{description}</div> : null}
          {children ? <div className="mt-6 text-left">{children}</div> : null}
          {actions ? <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div> : null}
          {footer ? <div className="mt-6 text-[12px] text-white/35">{footer}</div> : null}
        </GlassPanel>
      </div>
    </Viewport>
  );
}