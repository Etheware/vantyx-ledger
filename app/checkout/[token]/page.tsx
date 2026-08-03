"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CheckoutPage({
  params,
}: {
  params: { token: string };
}) {
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCheckout() {
      try {
        const res = await fetch(`/api/billing/checkout/${params.token}`);
        if (!res.ok) throw new Error("Failed to load checkout");
        const data = await res.json();
        setCheckoutData(data);
      } catch (error) {
        console.error("Checkout error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCheckout();
  }, [params.token]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (!checkoutData) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
          Checkout Expired
        </h1>
        <Link href="/billing">
          <button style={{
            padding: "0.75rem 1rem",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}>
            Back to Billing
          </button>
        </Link>
      </div>
    );
  }

  const { product } = checkoutData;

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
        maxWidth: "600px",
        width: "100%",
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
          Complete Your Purchase
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
          Secure checkout powered by Stripe
        </p>

        <div style={{
          padding: "1.5rem",
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
          marginBottom: "2rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span>{product.displayName}</span>
            <span style={{ fontWeight: "bold" }}>
              ${(product.priceCents / 100).toFixed(2)}
            </span>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            {product.displayDescription}
          </p>
        </div>

        <div style={{
          marginBottom: "2rem",
          paddingBottom: "2rem",
          borderBottom: "1px solid #e5e7eb",
        }}>
          <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Payment Method</p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}>
            <Link href={`/checkout/${params.token}/card`}>
              <div style={{
                padding: "1rem",
                border: "2px solid #3b82f6",
                borderRadius: "4px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: "#f0f9ff",
              }}>
                <p style={{ fontWeight: "bold" }}>💳 Credit Card</p>
              </div>
            </Link>

            <Link href={`/checkout/${params.token}/bank-connect`}>
              <div style={{
                padding: "1rem",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                textAlign: "center",
                cursor: "pointer",
              }}>
                <p style={{ fontWeight: "bold" }}>🏦 Bank Transfer</p>
              </div>
            </Link>
          </div>
        </div>

        <div style={{
          padding: "1rem",
          backgroundColor: "#eff6ff",
          borderRadius: "4px",
          border: "1px solid #93c5fd",
          marginBottom: "2rem",
          fontSize: "0.875rem",
          color: "#0c4a6e",
        }}>
          <p style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>🔒 Secure Payment</p>
          Your payment information is encrypted and secure.
        </div>

        <Link href="/billing">
          <button style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#f3f4f6",
            color: "#1f2937",
            border: "1px solid #e5e7eb",
            borderRadius: "4px",
            cursor: "pointer",
          }}>
            Back to Billing
          </button>
        </Link>
      </div>
    </div>
  );
}