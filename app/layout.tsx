import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vantyx Ledger Wallet",
  description: "Manage your Vantyx Ledger wallet and finances",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}