"use client";

import Link from "next/link";

export default function CardCheckoutPage({
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
          Card Payment
        </h1>

        <form style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Card Number
            </label>
            <input
              type="text"
              placeholder="4242 4242 4242 4242"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                Expiry Date
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                CVC
              </label>
              <input
                type="text"
                placeholder="123"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Cardholder Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: "0.75rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Complete Payment
          </button>
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