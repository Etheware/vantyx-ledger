import { NextRequest, NextResponse } from "next/server";
import { verifyCheckoutToken } from "@/lib/billing/checkout-session";
import { getProductByKey } from "@/lib/catalog/products";
import { getTenantProductBranding, BrandingNotFoundError } from "../../../../../src/tenants/get-tenant-branding";
import { getCheckoutSession } from "@/lib/billing/stripe";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const payload = verifyCheckoutToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired checkout token" },
        { status: 400 }
      );
    }

    const product = getProductByKey(payload.productKey);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const tenantId = payload.tenantId;
    if (!tenantId) {
      return NextResponse.json(
        { error: "Checkout token is missing tenant context" },
        { status: 400 }
      );
    }

    let branding;
    try {
      branding = await getTenantProductBranding(tenantId, payload.productKey);
    } catch (error) {
      if (error instanceof BrandingNotFoundError) {
        return NextResponse.json(
          { error: "Product not available for this organization" },
          { status: 404 }
        );
      }
      throw error;
    }

    const sessionId = request.nextUrl.searchParams.get("session_id") || "";
    let stripeSession: Awaited<ReturnType<typeof getCheckoutSession>> | null = null;

    if (sessionId) {
      stripeSession = await getCheckoutSession(sessionId);
      if (
        !stripeSession ||
        stripeSession.client_reference_id !== token ||
        stripeSession.metadata?.checkoutToken !== token
      ) {
        return NextResponse.json(
          { error: "Stripe session does not match this checkout token" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      payload,
      product,
      branding,
      stripe: stripeSession
        ? {
            sessionId: stripeSession.id,
            status: stripeSession.status,
            paymentStatus: stripeSession.payment_status,
            amountTotal: stripeSession.amount_total,
            currency: stripeSession.currency,
            confirmed: stripeSession.payment_status === "paid",
          }
        : null,
    });
  } catch (error) {
    console.error("Checkout introspection error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
