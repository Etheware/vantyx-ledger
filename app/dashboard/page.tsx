"use client";

export default function DashboardPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem" }}>Dashboard</h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1.5rem",
        marginBottom: "2rem",
      }}>
        {[
          { title: "Total Revenue", value: "$0.00", color: "#3b82f6" },
          { title: "Active Subscriptions", value: "0", color: "#10b981" },
          { title: "Pending Transactions", value: "0", color: "#f59e0b" },
          { title: "Failed Payments", value: "0", color: "#ef4444" },
        ].map((card) => (
          <div key={card.title} style={{
            padding: "1.5rem",
            borderRadius: "8px",
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
          }}>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>{card.title}</p>
            <p style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: card.color,
              marginTop: "0.5rem",
            }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{
        padding: "2rem",
        borderRadius: "8px",
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>
          Recent Transactions
        </h2>
        <p style={{ color: "#6b7280", textAlign: "center", padding: "2rem 0" }}>
          No transactions yet
        </p>
      </div>
    </div>
  );
}
