import React from "react";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white">
        <div className="p-6">
          <h1 className="text-xl font-bold text-slate-900">Vantyx</h1>
          <p className="text-sm text-slate-500 mt-1">Ledger</p>
        </div>

        <nav className="space-y-1 px-3">
          {[
            { href: "/dashboard", label: "Overview", icon: "📊" },
            { href: "/dashboard/payments", label: "Payments", icon: "💳" },
            { href: "/dashboard/payouts", label: "Payouts", icon: "💰" },
            { href: "/dashboard/billing", label: "Billing", icon: "📄" },
            { href: "/dashboard/connect", label: "Connect", icon: "🔗" },
            { href: "/dashboard/members", label: "Members", icon: "👥" },
            { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Dashboard</h2>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition">
                Help
              </button>
              <button className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition">
                Account
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
