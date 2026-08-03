"use client";

import Link from "next/link";

export default function BankConnectPage({
  params,
}: {
  params: { token: string };
}) {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f3f4f6",
      padding: "2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        maxWidth: "500px",
        width: "100%",
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "2rem" }}>
          Bank Transfer
        </h1>

        <div style={{
          padding: "1.5rem",
          backgroundColor: "#ecfdf5",
          borderRadius: "8px",
          marginBottom: "2rem",
          border: "1px solid #d1fae5",
        }}>
          <p style={{ color: "#065f46", fontWeight: "500", marginBottom: "0.5rem" }}>
            💡 Powered by Plaid
          </p>
          <p style={{ color: "#047857", fontSize: "0.875rem" }}>
            Securely connect your bank account to complete your payment.
          </p>
        </div>

        <form style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <button
            type="button"
            style={{
              padding: "1rem",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Connect Bank Account
          </button>

          <div style={{
            padding: "1rem",
            backgroundColor: "#f3f4f6",
            borderRadius: "4px",
            fontSize: "0.875rem",
            color: "#6b7280",
          }}>
            <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>What's next?</p>
            <ol style={{ paddingLeft: "1.25rem" }}>
              <li>Click above to select your bank</li>
              <li>Securely enter your banking credentials</li>
              <li>Authorize Vantyx Ledger to process the payment</li>
              <li>Receive instant confirmation</li>
            </ol>
          </div>
        </form>

        <Link href={`/checkout/${params.token}`}>
          <button style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#f3f4f6",
            color: "#1f2937",
            border: "1px solid #e5e7eb",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "1rem",
          }}>
            Back
          </button>
        </Link>
      </div>
    </div>
  );
}