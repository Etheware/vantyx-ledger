
import { notFound } from "next/navigation";
import { verifyCheckoutSessionToken } from "../../../../lib/billing/checkout-session";
import { getTenantProductBranding, BrandingNotFoundError } from "../../../../src/tenants/get-tenant-branding";
import { getProductByKey } from "../../../../src/catalog/products";
import { renderProductCopy } from "../../../../src/tenants/render-product-copy";
import { CheckoutButton, CheckoutShell } from "../../../../components/vantyx-checkout-flow";

function currency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(cents / 100);
}

export default async function CartPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let session;
  try {
    session = verifyCheckoutSessionToken(token);
  } catch {
    notFound();
  }

  const productKey = session.productKey ?? "weekly-learning-license";

  let branding;
  try {
    branding = await getTenantProductBranding(session.tenantId, productKey);
  } catch (error) {
    if (error instanceof BrandingNotFoundError) {
      notFound();
    }
    throw error;
  }

  const product = getProductByKey(productKey);
  const copy = product ? renderProductCopy(product, branding) : null;
  const displayName = copy?.displayName ?? branding.displayName;
  const description = copy?.description ?? branding.description;

  return (
    <CheckoutShell
      token={token}
      step={1}
      title="Your cart"
      subtitle="Review your items before checkout."
      summary={
        <div className="space-y-6">
          <div className="rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.025)] p-6">
            <div className="text-[20px] uppercase tracking-[0.22em] text-white/88">Order summary</div>
            <div className="mt-6 rounded-[18px] border border-white/10 bg-black/20 p-4">
              <div className="text-[14px] uppercase tracking-[0.2em] text-white/82">{displayName}</div>
              <div className="mt-1 text-[13px] text-white/46">Monthly subscription</div>
              <div className="mt-4 text-right text-[20px] text-white/88">{currency(session.totalCardCents)}</div>
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
            <div className="text-[20px] uppercase tracking-[0.22em] text-white/88">Why teams choose Vantyx Ledger</div>
            <div className="mt-6 space-y-4 text-[14px] text-white/60">
              <p>Bank-grade security and transparent billing.</p>
              <p>Enterprise-ready checkout with exact itemization.</p>
              <p>Instant access after payment confirmation.</p>
            </div>
          </div>
        </div>
      }
      footerLeft={<div className="text-[12px] uppercase tracking-[0.2em] text-white/40">Your data is secure and encrypted end-to-end.</div>}
      footerRight={<CheckoutButton href={`/checkout/${encodeURIComponent(token)}/shipping`}>Proceed to shipping</CheckoutButton>}
    >
      <div className="rounded-[22px] border border-white/10 bg-black/20 p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.03] text-blue-400">◈</div>
            <div>
              <div className="text-[20px] uppercase tracking-[0.2em] text-white/90">{displayName}</div>
              <div className="mt-2 text-[15px] text-white/56">{description}</div>
            </div>
          </div>
          <div className="text-[24px] font-light">{currency(session.totalCardCents)}</div>
        </div>

        <div className="mt-8 rounded-[18px] border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-3 text-[13px] uppercase tracking-[0.18em] text-white/70">
            <span>Quantity</span>
            <div className="ml-auto flex items-center rounded-[12px] border border-white/10">
              <span className="px-4 py-2">-</span>
              <span className="border-x border-white/10 px-5 py-2">1</span>
              <span className="px-4 py-2">+</span>
            </div>
            <button type="button" className="ml-2 rounded-full border border-white/10 px-3 py-2 text-white/48">🗑</button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {["10,000 API requests / month", "Advanced analytics", "Priority support", "Custom integrations"].map((item) => (
            <div key={item} className="flex items-center gap-3 text-[15px] text-white/72">
              <span className="text-blue-400">✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-[22px] border border-white/10 bg-black/20 p-6">
        <div className="text-[16px] uppercase tracking-[0.2em] text-white/88">You may also like</div>
        <div className="mt-5 flex items-center justify-between rounded-[16px] border border-white/10 bg-white/[0.02] px-5 py-5">
          <div>
            <div className="text-[14px] uppercase tracking-[0.18em] text-white/82">API add-on pack</div>
            <div className="mt-1 text-[13px] text-white/48">5,000 additional requests · $20.00 / month</div>
          </div>
          <button className="rounded-[14px] border border-blue-500/40 px-5 py-3 text-[12px] uppercase tracking-[0.2em] text-blue-400">Add</button>
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