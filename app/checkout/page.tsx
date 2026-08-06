/* global HTMLButtonElement */

import Link from "next/link";
import { redirect } from "next/navigation";

/**
 * Checkout Entry Point — Hosted Checkout Mode
 *
 * Tenant redirects user to:
 *   https://checkout.vantyxledger.com/checkout?checkoutId=chk_xyz&tenant=acme-corp
 *
 * This page validates the checkout session and renders the payment form.
 */

export default async function CheckoutPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const checkoutId = searchParams.checkoutId as string | undefined;
  const tenant = searchParams.tenant as string | undefined;

  // Validate required parameters
  if (!checkoutId || !tenant) {
    redirect("/checkout/error?code=missing_params");
  }

  // TODO: Validate checkout session exists and belongs to tenant
  // TODO: Fetch checkout session details (amount, currency, items, etc.)
  // TODO: Check if already paid (redirect to success if so)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Checkout Form Component */}
        <HostedCheckoutForm checkoutId={checkoutId} tenantSlug={tenant} />
      </div>
    </div>
  );
}

interface HostedCheckoutFormProps {
  checkoutId: string;
  tenantSlug: string;
}

function HostedCheckoutForm({ checkoutId, tenantSlug }: HostedCheckoutFormProps) {
  return (
    <div className="bg-surface rounded-lg border border-border p-6 space-y-6">
      {/* Header with tenant logo */}
      <div className="space-y-2">
        <div
          className="w-24 h-8 bg-center bg-contain bg-no-repeat"
          style={{ backgroundImage: "var(--tenant-logo-url)" }}
        />
        <h1 className="text-2xl font-bold text-text-primary">Complete Your Payment</h1>
        <p className="text-sm text-text-secondary">
          Secure payment powered by Vantyx Ledger
        </p>
      </div>

      {/* Checkout details placeholder */}
      <div className="bg-surface-raised p-4 rounded border border-border">
        <div className="flex justify-between mb-2">
          <span className="text-text-secondary">Checkout ID</span>
          <span className="text-mono text-text-muted text-sm">{checkoutId}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-text-secondary">Tenant</span>
          <span className="text-text-primary">{tenantSlug}</span>
        </div>
        {/* TODO: Display line items, amount, currency, etc. */}
      </div>

      {/* Payment method selection (placeholder) */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-text-primary">Payment Method</label>
        <div className="space-y-2">
          <button className="w-full px-4 py-3 rounded-lg border border-border bg-surface hover:bg-surface-raised text-text-primary text-sm font-medium transition-colors">
            💳 Card Payment
          </button>
          <button className="w-full px-4 py-3 rounded-lg border border-border bg-surface hover:bg-surface-raised text-text-primary text-sm font-medium transition-colors">
            🏦 Bank Transfer (ACH)
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <button
          className="w-full px-4 py-3 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
          style={{
            backgroundColor: "var(--tenant-color-primary, var(--color-accent-base))",
          }}
          onMouseOver={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor =
              "var(--tenant-color-primary-hover, var(--color-accent-hover))";
          }}
        >
          Pay Now
        </button>
        <Link
          href="/checkout/error?code=cancelled"
          className="block text-center px-4 py-3 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors text-sm"
        >
          Cancel
        </Link>
      </div>

      {/* Trust badges */}
      <div className="text-center text-xs text-text-muted space-y-1">
        <p>🔒 Your payment is secure and encrypted</p>
        <p>Processed by Vantyx Ledger • PCI Level 1 Certified</p>
      </div>
    </div>
  );
}
