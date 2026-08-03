
"use client";

import React from "react";
import Link from "next/link";
import { useCapabilities } from "@/hooks/use-capabilities";
import type { AuthSession } from "@/lib/auth/session";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon?: string;
  requiredCapabilities: string[];
  children?: SidebarNavItem[];
  divider?: boolean;
}

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    requiredCapabilities: ["dashboard:view"],
  },
  {
    label: "Subscriptions",
    href: "/subscriptions",
    icon: "RefreshCcw",
    requiredCapabilities: ["subscriptions:view"],
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: "Receipt",
    requiredCapabilities: ["invoices:read"],
  },
  {
    label: "Billing",
    href: "/billing",
    icon: "CreditCard",
    requiredCapabilities: ["billing:view"],
    children: [
      {
        label: "Plans & Pricing",
        href: "/billing/plans",
        requiredCapabilities: ["billing:view"],
      },
      {
        label: "Payment Methods",
        href: "/billing/payment-methods",
        requiredCapabilities: ["billing:edit"],
      },
      {
        label: "Billing Address",
        href: "/billing/address",
        requiredCapabilities: ["billing:edit"],
      },
    ],
  },
  {
    label: "Licenses",
    href: "/licenses",
    icon: "Key",
    requiredCapabilities: ["licenses:manage"],
  },
  {
    label: "Team",
    href: "/team",
    icon: "Users",
    requiredCapabilities: ["members:manage"],
  },
  {
    label: "Ledger",
    href: "/ledger",
    icon: "BookOpen",
    requiredCapabilities: ["ledger:audit"],
  },
  {
    label: "Webhooks",
    href: "/webhooks",
    icon: "Webhook",
    requiredCapabilities: ["webhooks:admin"],
  },
  {
    label: "API Keys",
    href: "/api-keys",
    icon: "Code",
    requiredCapabilities: ["api-keys:view"],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "BarChart3",
    requiredCapabilities: ["reports:view"],
  },
  {
    divider: true,
    label: "",
    href: "",
    requiredCapabilities: [],
  },
  {
    label: "Admin Console",
    href: "/admin",
    icon: "Wrench",
    requiredCapabilities: ["org:write"],
    children: [
      {
        label: "Organization Details",
        href: "/admin/org",
        requiredCapabilities: ["org:write"],
      },
      {
        label: "Members & Roles",
        href: "/admin/members",
        requiredCapabilities: ["members:manage"],
      },
      {
        label: "Billing Administration",
        href: "/admin/billing",
        requiredCapabilities: ["billing:admin"],
      },
      {
        label: "Webhooks Configuration",
        href: "/admin/webhooks",
        requiredCapabilities: ["webhooks:admin"],
      },
      {
        label: "API Key Management",
        href: "/admin/api-keys",
        requiredCapabilities: ["api-keys:admin"],
      },
    ],
  },
];

export function SidebarNav() {
  const capabilities = useCapabilities();

  return (
    <nav className="flex flex-col gap-2">
      {SIDEBAR_ITEMS.map((item, idx) => {
        if (item.divider) {
          return <div key={`divider-${idx}`} className="border-t border-border my-2" />;
        }

        const hasCapability = capabilities.has(item.requiredCapabilities);
        if (!hasCapability) return null;

        return (
          <div key={item.href}>
            <Link
              href={item.href}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
            >
              {item.icon && <span className="text-lg">{item.icon}</span>}
              <span className="text-sm font-medium">{item.label}</span>
            </Link>

            {item.children && (
              <div className="ml-4 flex flex-col gap-1 mt-1">
                {item.children.map((child) => {
                  const hasChildCapability = capabilities.has(child.requiredCapabilities);
                  if (!hasChildCapability) return null;

                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="flex items-center gap-2 px-3 py-1 text-xs text-text-tertiary hover:text-text-secondary rounded transition-colors"
                    >
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}