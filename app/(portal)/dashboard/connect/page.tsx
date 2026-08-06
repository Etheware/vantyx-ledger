"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ConnectPage() {
  const searchParams = useSearchParams();
  const [connectStatus, setConnectStatus] = useState<"disconnected" | "pending" | "active">(
    "disconnected"
  );
  const [loading, setLoading] = useState(false);
  const success = searchParams.get("success");
  const error = searchParams.get("error");

  useEffect(() => {
    if (success) {
      setConnectStatus("active");
    }
    if (error) {
      console.error("Connect error:", error);
    }
  }, [success, error]);

  const handleAuthorize = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/connect/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authorizationUrl;
      }
    } catch (err) {
      console.error("Authorization failed:", err);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Stripe Connect</h1>
        <p className="text-slate-600">Connect your Stripe account to receive payouts</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🔗</span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900">Account Status</h2>
            <p className="text-slate-600 mt-1">
              {connectStatus === "active"
                ? "Your Stripe Connect account is active and ready for payouts"
                : "Connect your Stripe account to start receiving payouts"}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  connectStatus === "active" ? "bg-green-500" : "bg-slate-300"
                }`}
              />
              <span className="text-sm font-medium text-slate-700 capitalize">
                {connectStatus}
              </span>
            </div>
          </div>
        </div>

        {connectStatus !== "active" && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={handleAuthorize}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Redirecting..." : "Connect Stripe Account"}
            </button>
          </div>
        )}
      </div>

      {connectStatus === "active" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Payout Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Default Payout Method
                </label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Bank Account</option>
                  <option>Debit Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Automatic Payout Schedule
                </label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Manual</option>
                </select>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                Save Settings
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Connected Account</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Account ID</span>
                <span className="text-sm font-mono text-slate-900">acct_1234567890</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Email</span>
                <span className="text-sm text-slate-900">stripe@example.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Country</span>
                <span className="text-sm text-slate-900">United States</span>
              </div>
            </div>
            <button className="mt-4 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium">
              Disconnect Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
