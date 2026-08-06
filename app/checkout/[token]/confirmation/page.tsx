/* global fetch */

import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock3 } from "lucide-react";
import { verifyCheckoutSessionToken } from "../../../../lib/billing/checkout-session";

type CheckoutIntrospection = {
  ok: boolean;
  payload: {
    productName?: string;
    totalCardCents?: number;
  };
  stripe: null | {
    sessionId: string;
    status: string;
    paymentStatus: string | null;
    amountTotal: number | null;
    currency: string | null;
    confirmed: boolean;
  };
};

function currency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

async function loadCheckoutState(token: string, sessionId: string) {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  if (!host) {
    return null;
  }

  const proto = headersList.get("x-forwarded-proto") || "https";
  const query = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : "";
  const response = await fetch(
    `${proto}://${host}/api/billing/checkout/${encodeURIComponent(token)}${query}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as CheckoutIntrospection;
}

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await params;
  const query = await searchParams;

  let session;
  try {
    session = verifyCheckoutSessionToken(token);
  } catch {
    notFound();
  }
  if (!session) notFound();

  const sessionId = typeof query.session_id === "string" ? query.session_id : "";
  const checkoutState = sessionId ? await loadCheckoutState(token, sessionId) : null;
  const confirmed = Boolean(checkoutState?.stripe?.confirmed);
  const amount = checkoutState?.stripe?.amountTotal ?? session.totalCardCents ?? 0;
  const orderName = checkoutState?.payload.productName ?? session.productName ?? "Order";

  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <div className="mx-auto min-h-[100dvh] max-w-[1600px] px-4 py-4 sm:px-6 sm:py-6">
        <div className="min-h-[calc(100dvh-2rem)] rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.7)] sm:p-6">
          <div className="flex items-center justify-between">
            <div className="text-[26px] font-light tracking-[0.34em] text-white/92">
              VANTYX
              <div className="mt-2 text-[12px] uppercase tracking-[0.5em] text-white/40">Ledger</div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-[12px] uppercase tracking-[0.24em] text-white/70">
              Tokenized return
            </div>
          </div>

          <div className="mx-auto mt-20 max-w-3xl text-center">
            <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-white/70 shadow-[0_0_40px_rgba(255,255,255,0.06)]">
              {confirmed ? <CheckCircle2 className="h-20 w-20" /> : <Clock3 className="h-20 w-20" />}
            </div>
            <div className="mt-10 text-[32px] font-light uppercase tracking-[0.24em]">
              {confirmed ? "Payment confirmed" : "Payment confirmation is pending"}
            </div>
            <p className="mt-4 text-[16px] leading-8 text-white/56">
              {confirmed
                ? "Stripe returned a paid session for this token. No license was claimed before server confirmation."
                : "We have not received a paid Stripe session for this token yet. If you just completed checkout, refresh after Stripe finishes redirecting."}
            </p>

            <div className="mt-10 grid gap-4 rounded-[22px] border border-white/10 bg-black/20 p-6 sm:grid-cols-2">
              <Stat label="Order" value={orderName} />
              <Stat label="Amount" value={currency(amount)} />
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/billing" className="inline-flex min-h-[64px] items-center justify-center rounded-[14px] border border-white/12 bg-white/[0.02] px-7 text-[14px] uppercase tracking-[0.24em] text-white/80">
                Back to billing
              </Link>
              <Link href="/dashboard" className="inline-flex min-h-[64px] items-center justify-center rounded-[14px] border border-white/12 bg-white/[0.02] px-7 text-[14px] uppercase tracking-[0.24em] text-white/80">
                Go to dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.02] p-5 text-left">
      <div className="text-[12px] uppercase tracking-[0.18em] text-white/44">{label}</div>
      <div className="mt-3 text-[18px] text-white/88">{value}</div>
    </div>
  );
}
