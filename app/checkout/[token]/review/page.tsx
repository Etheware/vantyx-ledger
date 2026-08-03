
import { notFound } from "next/navigation";
import { verifyCheckoutSessionToken } from "../../../../lib/billing/checkout-session";
import { CheckoutButton, CheckoutShell } from "../../../../components/vantyx-checkout-flow";
import { CheckoutPlaceOrderButton } from "../../../../components/checkout-place-order-button";

function currency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(cents / 100);
}

export default async function ReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let session;
  try {
    session = verifyCheckoutSessionToken(token);
  } catch {
    notFound();
  }
  if (!session) notFound();

  return (
    <CheckoutShell
      token={token}
      step={4}
      title="Review your order"
      subtitle="Please review your order details before placing it."
      summary={
        <div className="space-y-6">
          <div className="rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.025)] p-6">
            <div className="text-[20px] uppercase tracking-[0.22em] text-white/88">Order summary</div>
            <div className="mt-6 rounded-[18px] border border-white/10 bg-black/20 p-4">
              <div className="text-[14px] uppercase tracking-[0.2em] text-white/82">{session.productName ?? "Order"}</div>
              <div className="mt-4 text-right text-[20px]">{currency(session.totalCardCents ?? 0)}</div>
            </div>
            <div className="mt-6 space-y-4 text-[15px]">
              <Line label="Subtotal" value={currency(session.clientRevenueCents ?? 0)} />
              <Line label="Tax (0%)" value="$0.00" />
              <div className="border-t border-white/10 pt-5">
                <Line label="Total" value={currency(session.totalCardCents ?? 0)} total />
              </div>
            </div>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.025)] p-6 text-white/72">
            <div className="text-[16px] uppercase tracking-[0.2em] text-white/88">What happens next?</div>
            <div className="mt-4 space-y-4 text-[15px] leading-7">
              <p>We’ll confirm payment, activate access, and send the receipt.</p>
              <p>Your confirmation email and invoice will be available immediately after checkout.</p>
            </div>
          </div>
        </div>
      }
      footerLeft={<CheckoutButton href={`/checkout/${encodeURIComponent(token)}/payment`} variant="ghost">Return to payment</CheckoutButton>}
      footerRight={
        <CheckoutPlaceOrderButton
          session={{
            tenantId: session.tenantId ?? "",
            customerEmail: session.customerEmail ?? "",
            customerName: session.customerName ?? "",
            productKey: session.productKey,
            productName: session.productName ?? "",
            clientRevenueCents: session.clientRevenueCents ?? 0,
            platformServicesCents: session.platformServicesCents ?? 0,
            checkoutLicenseFeeCents: session.checkoutLicenseFeeCents ?? 0,
            paymentMethodDefault: session.paymentMethodDefault ?? "",
            metadata: session.metadata ?? {},
          }}
        />
      }
    >
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[22px] border border-white/10 bg-black/20 p-6">
          <div className="text-[20px] uppercase tracking-[0.2em] text-white/88">Order items</div>
          <div className="mt-6 flex items-center justify-between rounded-[18px] border border-white/10 bg-white/[0.02] px-4 py-4">
            <div>
              <div className="text-[14px] uppercase tracking-[0.18em] text-white/82">{session.productName ?? "Order"}</div>
            </div>
            <div className="text-[20px]">{currency(session.totalCardCents ?? 0)}</div>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-[22px] border border-white/10 bg-black/20 p-6 text-white/66">
            <div className="text-[20px] uppercase tracking-[0.2em] text-white/88">Payment</div>
            <p className="mt-5 text-[15px] leading-7">
              Card details are entered on Stripe&apos;s secure hosted payment page after you place your order — nothing is
              collected or stored here.
            </p>
          </div>
        </div>
      </div>
    </CheckoutShell>
  );
}

function Line({ label, value, total = false }: { label: string; value: string; total?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${total ? "text-[22px]" : ""}`}>
      <span className="text-white/54">{label}</span>
      <span className={total ? "text-white" : "text-white/86"}>{value}</span>
    </div>
  );
}
