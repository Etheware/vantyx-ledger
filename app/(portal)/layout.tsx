import Link from "next/link";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
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
          <p style={{ fontSize: "0.875rem", opacity: 0.7 }}>Ledger</p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/learning-center">Learning</Link>
          <Link href="/billing">Billing</Link>
          <Link href="/settings">Settings</Link>
        </nav>
      </aside>

      <main style={{ flex: 1, overflow: "auto", padding: "2rem" }}>
        {children}
      </main>
    </div>
  );
}