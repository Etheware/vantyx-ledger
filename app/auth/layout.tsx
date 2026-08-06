import React from "react";
import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f3f4f6",
      padding: "1rem",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
      }}>
        {children}
      </div>
    </div>
  );
}
