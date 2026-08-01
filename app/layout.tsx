import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vantyx Wallet",
  description: "Manage your Vantyx wallet and finances",
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
