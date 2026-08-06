"use client";

import React, { useState, useEffect } from "react";

interface DashboardMetrics {
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  churnRate: number;
  revenue30Days: number;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/billing/dashboard?tenantId=current", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setMetrics({
            mrr: data.mrr || 0,
            arr: data.arr || 0,
            activeSubscriptions: data.activeSubscriptions || 0,
            churnRate: data.churnRate || 0,
            revenue30Days: data.revenue30Days || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="MRR"
          value={`$${(metrics?.mrr || 0).toLocaleString()}`}
          change="+5.2%"
        />
        <MetricCard
          label="ARR"
          value={`$${(metrics?.arr || 0).toLocaleString()}`}
          change="+5.2%"
        />
        <MetricCard
          label="Active Subscriptions"
          value={metrics?.activeSubscriptions || 0}
          change="+3"
        />
        <MetricCard
          label="Churn Rate"
          value={`${((metrics?.churnRate || 0) * 100).toFixed(1)}%`}
          change="-0.5%"
          isNegative
        />
        <MetricCard
          label="30-Day Revenue"
          value={`$${(metrics?.revenue30Days || 0).toLocaleString()}`}
          change="+12%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Quick Actions</Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
                Add Payment Method
              </button>
              <button className="w-full px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition">
                View Transactions
              </button>
              <button className="w-full px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition">
                Manage Payouts
              </button>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Status</Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="space-y-3">
              <StatusItem
                label="Account Status"
                value="Active"
                status="success"
              />
              <StatusItem
                label="Payment Methods"
                value="1 card + 1 bank"
                status="success"
              />
              <StatusItem
                label="Payout Account"
                value="Connected"
                status="success"
              />
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  change,
  isNegative,
}: {
  label: string;
  value: string | number;
  change: string;
  isNegative?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <p className="text-xs font-medium text-slate-600 uppercase">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
      <p
        className={`text-xs font-medium mt-2 ${
          isNegative ? "text-green-600" : "text-green-600"
        }`}
      >
        {change}
      </p>
    </div>
  );
}

function Card({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-white rounded-lg border border-slate-200">{children}</div>;
}

Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="border-b border-slate-200 px-6 py-4">{children}</div>;
};

Card.Title = function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-slate-900">{children}</h3>;
};

Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4">{children}</div>;
};

function StatusItem({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "success" | "warning" | "error";
}) {
  const statusColors = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  };

  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-sm text-slate-700">{label}</p>
      <span className={`text-xs font-medium px-2 py-1 rounded ${statusColors[status]}`}>
        {value}
      </span>
    </div>
  );
}
