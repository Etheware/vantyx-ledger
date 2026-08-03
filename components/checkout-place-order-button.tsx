
"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { CheckoutSessionPayload } from "../lib/billing/checkout-session";

/**
 * Replaces a plain <Link href=".../confirmation"> that used to navigate straight
 * to a page unconditionally declaring "Payment successful." This calls the real
 * POST /api/billing/checkout route (same one BillingCheckoutButton already uses
 * elsewhere) and only ever redirects the browser once that call has actually
 * succeeded and returned a real hosted-checkout URL -- never before, never on
 * assumption. On any failure this stays on the review page with an inline error;
 * it never creates a fake transaction or order number.
 *
 * The fields sent here come from the already-HMAC-verified checkout session
 * token (decoded server-side before this component is rendered), not from
 * anything the browser could edit -- this is a safe round-trip of
 * server-signed data, not client-submitted pricing.
 */
export function CheckoutPlaceOrderButton({
  session,
}: {
  session: Pick<
    CheckoutSessionPayload,
    | "tenantId"
    | "customerEmail"
    | "customerName"
    | "productKey"
    | "productName"
    | "clientRevenueCents"
    | "platformServicesCents"
    | "checkoutLicenseFeeCents"
    | "paymentMethodDefault"
    | "metadata"
  >;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const placeOrder = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: session.tenantId,
          customerEmail: session.customerEmail,
          customerName: session.customerName,
          productKey: session.productKey,
          productName: session.productName,
          clientRevenueCents: session.clientRevenueCents,
          platformServicesCents: session.platformServicesCents,
          checkoutLicenseFeeCents: session.checkoutLicenseFeeCents,
          paymentMethodDefault: session.paymentMethodDefault,
          metadata: session.metadata,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; url?: string; checkoutUrl?: string; error?: string }
        | null;

      const target = data?.url ?? data?.checkoutUrl;
      if (!response.ok || !data?.ok || !target) {
        throw new Error(typeof data?.error === "string" ? data.error : "checkout_failed");
      }

      window.location.assign(target);
    } catch {
      setError("We could not place your order right now. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-3">
      <button
        type="button"
        onClick={() => void placeOrder()}
        disabled={loading}
        className={`inline-flex min-h-[64px] items-center justify-center gap-3 rounded-[14px] border border-blue-500/70 bg-[linear-gradient(180deg,#1677ff,#0f5de2)] px-7 text-[14px] uppercase tracking-[0.24em] text-white shadow-[0_0_28px_rgba(37,99,235,0.22)] transition hover:brightness-110 ${loading ? "pointer-events-none opacity-70" : ""}`}
      >
        {loading ? "Placing order..." : "Place order"}
        {loading ? null : <ArrowRight className="h-4 w-4" />}
      </button>
      {error ? <div className="max-w-xs text-right text-[13px] leading-6 text-red-300">{error}</div> : null}
    </div>
  );
}