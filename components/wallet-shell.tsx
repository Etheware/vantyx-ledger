"use client";

import React from "react";
import Link from "next/link";

export function WalletShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              Vantyx Ledger Wallet
            </Link>
            <ul className="flex gap-6">
              <li><Link href="/overview">Overview</Link></li>
              <li><Link href="/transactions">Transactions</Link></li>
              <li><Link href="/withdraw">Withdraw</Link></li>
              <li><Link href="/settings">Settings</Link></li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}