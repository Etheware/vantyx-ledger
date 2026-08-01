"use client";

import Link from "next/link";

const PLANS = [
  {
    key: "weekly-license",
    name: "Weekly License",
    price: "$9.99",
    interval: "per week",
    features: ["Learning access", "7-day validity"],
  },
  {
    key: "monthly-license",
    name: "Monthly License",
    price: "$29.99",
    interval: "per month",
    features: ["Learning access", "Practicum labs", "30-day validity"],
    highlighted: true,
  },
  {
    key: "annual-license",
    name: "Annual License",
    price: "$299.99",
    interval: "per year",
    features: ["Learning access", "Practicum labs", "Certification", "Analytics", "365-day validity"],
  },
];

export default function BillingPage() {
  return (
    <div>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Pricing & Billing
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "3rem" }}>
        Choose a plan that works for you
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "2rem",
      }}>
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            style={{
              padding: "2rem",
              border: plan.highlighted ? "2px solid #3b82f6" : "1px solid #e5e7eb",
              borderRadius: "8px",
              backgroundColor: plan.highlighted ? "#f0f9ff" : "white",
              position: "relative",
            }}
          >
            {plan.highlighted && (
              <div style={{
                position: "absolute",
                top: "-12px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "0.25rem 0.75rem",
                borderRadius: "4px",
                fontSize: "0.75rem",
                fontWeight: "bold",
              }}>
                POPULAR
              </div>
            )}

            <h3 style={{ fontWeight: "bold", fontSize: "1.25rem", marginBottom: "0.5rem" }}>
              {plan.name}
            </h3>

            <div style={{ marginBottom: "2rem" }}>
              <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{plan.price}</p>
              <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>{plan.interval}</p>
            </div>

            <ul style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {plan.features.map((feature) => (
                <li key={feature} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ color: "#10b981" }}>✓</span>
                  <span style={{ fontSize: "0.875rem" }}>{feature}</span>
                </li>
              ))}
            </ul>

            <button style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: plan.highlighted ? "#3b82f6" : "#f3f4f6",
              color: plan.highlighted ? "white" : "#1f2937",
              border: "none",
              borderRadius: "4px",
              fontWeight: "500",
              cursor: "pointer",
            }}>
              {plan.highlighted ? "Get Started" : "Choose Plan"}
            </button>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: "4rem",
        padding: "2rem",
        backgroundColor: "#f9fafb",
        borderRadius: "8px",
      }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "1rem" }}>Billing History</h2>
        <p style={{ color: "#6b7280" }}>No billing history yet</p>
      </div>
    </div>
  );
}
