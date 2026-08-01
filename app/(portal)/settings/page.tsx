"use client";

export default function SettingsPage() {
  return (
    <div style={{ maxWidth: "600px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem" }}>
        Settings
      </h1>

      <div style={{
        padding: "2rem",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        backgroundColor: "white",
      }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "1.5rem" }}>Account Settings</h2>

        <form style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Email Address
            </label>
            <input
              type="email"
              defaultValue="user@example.com"
              disabled
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                backgroundColor: "#f3f4f6",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Email Verification
            </label>
            <div style={{
              padding: "0.75rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#ecfdf5",
              borderRadius: "4px",
              border: "1px solid #d1fae5",
            }}>
              <span style={{ color: "#065f46" }}>✓ Verified</span>
              <button style={{
                padding: "0.5rem 1rem",
                backgroundColor: "transparent",
                color: "#065f46",
                border: "1px solid #065f46",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}>
                Reverify
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Two-Factor Authentication
            </label>
            <div style={{
              padding: "0.75rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#fef3c7",
              borderRadius: "4px",
              border: "1px solid #fcd34d",
            }}>
              <span style={{ color: "#92400e" }}>Not Enabled</span>
              <button style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}>
                Enable 2FA
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Password
            </label>
            <button
              type="button"
              style={{
                padding: "0.75rem",
                width: "100%",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Change Password
            </button>
          </div>

          <div style={{
            padding: "1rem",
            backgroundColor: "#fee2e2",
            borderRadius: "4px",
            border: "1px solid #fecaca",
          }}>
            <p style={{ fontWeight: "bold", color: "#991b1b", marginBottom: "0.5rem" }}>
              Danger Zone
            </p>
            <button
              type="button"
              style={{
                padding: "0.75rem",
                width: "100%",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Delete Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
