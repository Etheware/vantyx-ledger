"use client";

import React, { useState } from "react";

export const dynamic = "force-dynamic";

interface PaymentMethod {
  id: string;
  type: "card" | "bank";
  last4: string;
  brand?: string;
  expiresAt?: string;
  default: boolean;
}

export default function PaymentsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "pm_1",
      type: "card",
      last4: "4242",
      brand: "Visa",
      expiresAt: "12/26",
      default: true,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Methods</h1>
        <p className="text-slate-600">Manage cards and bank accounts for charging customers</p>
      </div>

      {showAddForm ? (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Payment Method</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type
              </label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="card">Credit Card</option>
                <option value="bank">Bank Account</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Add Method
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Add Payment Method
        </button>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Current Methods</h2>
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                {method.type === "card" ? "💳" : "🏦"}
              </div>
              <div>
                <p className="font-medium text-slate-900">
                  {method.type === "card"
                    ? `${method.brand} ending in ${method.last4}`
                    : `Bank account ending in ${method.last4}`}
                </p>
                <p className="text-sm text-slate-500">
                  {method.type === "card" ? `Expires ${method.expiresAt}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {method.default && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  Default
                </span>
              )}
              <button className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
