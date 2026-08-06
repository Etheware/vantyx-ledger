import React from "react";
import Link from "next/link";
import type { ReactNode } from "react";

export default function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{
        width: "250px",
        backgroundColor: "#1f2937",
        color: "white",
        padding: "1.5rem",
        overflowY: "auto",
      }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Vantyx Ledger</h1>
          <p style={{ fontSize: "0.875rem", opacity: 0.7 }}>Ledger Platform</p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Link href="/dashboard" style={{
            padding: "0.75rem",
            borderRadius: "4px",
            textDecoration: "none",
            color: "inherit",
            transition: "background-color 0.2s",
          }}>Dashboard</Link>
          <Link href="/learning-center" style={{
            padding: "0.75rem",
            borderRadius: "4px",
            textDecoration: "none",
            color: "inherit",
            transition: "background-color 0.2s",
          }}>Learning Center</Link>
          <Link href="/billing" style={{
            padding: "0.75rem",
            borderRadius: "4px",
            textDecoration: "none",
            color: "inherit",
            transition: "background-color 0.2s",
          }}>Billing</Link>
          <Link href="/settings" style={{
            padding: "0.75rem",
            borderRadius: "4px",
            textDecoration: "none",
            color: "inherit",
            transition: "background-color 0.2s",
          }}>Settings</Link>
        </nav>
      </aside>

      <main style={{ flex: 1, overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}
