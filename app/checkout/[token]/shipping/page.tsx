
import { notFound } from "next/navigation";
import { verifyCheckoutSessionToken } from "../../../../lib/billing/checkout-session";
import { CheckoutButton, CheckoutShell } from "../../../../components/vantyx-checkout-flow";

function currency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(cents / 100);
}

export default async function ShippingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let session;
  try {
    session = verifyCheckoutSessionToken(token);
  } catch {
    notFound();
  }

  return (
    <CheckoutShell
      token={token}
      step={2}
      title="Shipping information"
      subtitle="Enter where we should deliver your order."
      summary={
        <div className="space-y-6">
          <div className="rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.025)] p-6">
            <div className="text-[20px] uppercase tracking-[0.22em] text-white/88">Order summary</div>
            <div className="mt-6 rounded-[18px] border border-white/10 bg-black/20 p-4">
              <div className="text-[14px] uppercase tracking-[0.2em] text-white/82">{session.productName}</div>
              <div className="mt-4 text-right text-[20px]">{currency(session.totalCardCents)}</div>
            </div>
            <div className="mt-6 space-y-4 text-[15px]">
              <Line label="Subtotal" value={currency(session.clientRevenueCents)} />
              <Line label="Tax (0%)" value="$0.00" />
              <div className="border-t border-white/10 pt-5">
                <Line label="Total" value={currency(session.totalCardCents)} total />
              </div>
            </div>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.025)] p-6">
            <div className="text-[16px] uppercase tracking-[0.2em] text-white/88">Your privacy is protected</div>
            <p className="mt-4 text-[15px] leading-7 text-white/56">All order data is encrypted and never shared with third parties.</p>
          </div>
        </div>
      }
      footerLeft={<CheckoutButton href={`/checkout/${encodeURIComponent(token)}/cart`} variant="ghost">Return to cart</CheckoutButton>}
      footerRight={<CheckoutButton href={`/checkout/${encodeURIComponent(token)}/payment`}>Continue to payment</CheckoutButton>}
    >
      <div className="rounded-[22px] border border-white/10 bg-black/20 p-6 text-white/66">
        <div className="text-[16px] uppercase tracking-[0.2em] text-white/88">No shipping required</div>
        <p className="mt-4 text-[15px] leading-7">
          This is a digital access product — there&apos;s nothing to ship. You&apos;ll get access immediately once
          payment is confirmed.
        </p>
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