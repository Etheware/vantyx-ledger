"use client";

import React, { useState, useEffect } from "react";

export const dynamic = "force-dynamic";

interface Payout {
  id: string;
  amount: number;
  status: "pending" | "in_transit" | "paid" | "failed";
  arrivalDate?: string;
  issuedAt: string;
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([
    {
      id: "po_1",
      amount: 5000,
      status: "paid",
      arrivalDate: "2026-08-05",
      issuedAt: "2026-07-31",
    },
    {
      id: "po_2",
      amount: 3500,
      status: "in_transit",
      issuedAt: "2026-08-04",
    },
  ]);

  const [showInitiate, setShowInitiate] = useState(false);
  const [amount, setAmount] = useState("");

  const handleInitiatePayout = async () => {
    if (!amount || isNaN(Number(amount))) return;

    try {
      const response = await fetch("/api/payouts/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: Math.round(Number(amount) * 100),
          method: "bank_account",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPayouts((prev) => [
          {
            id: data.payoutId,
            amount: data.amount / 100,
            status: "pending",
            issuedAt: new Date().toISOString().split("T")[0],
          },
          ...prev,
        ]);
        setAmount("");
        setShowInitiate(false);
      }
    } catch (error) {
      console.error("Failed to initiate payout:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Payouts</h1>
        <p className="text-slate-600">Manage payouts to your connected account</p>
      </div>

      {showInitiate ? (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Initiate Payout</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Amount (USD)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowInitiate(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleInitiatePayout}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Initiate Payout
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowInitiate(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
        >
          + Initiate Payout
        </button>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Recent Payouts</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Issued
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Arrival
                </th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900">{payout.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    ${(payout.amount / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <StatusBadge status={payout.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {payout.issuedAt}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {payout.arrivalDate || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Payout["status"] }) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    in_transit: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };

  const labels = {
    pending: "Pending",
    in_transit: "In Transit",
    paid: "Paid",
    failed: "Failed",
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}
