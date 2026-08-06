import { NextRequest, NextResponse } from "next/server";
import { getProductByKey } from "@/lib/catalog/products";
import { createCheckoutToken } from "@/lib/billing/checkout-session";
import { createCheckoutSession } from "@/lib/billing/stripe";
import { getSession as getRequestSession } from "@/lib/auth/get-session";
import { resolveTenantContextFromRequest, TenantContextError } from "@/lib/auth/tenant-context";
import { getTenantProductBranding, BrandingNotFoundError } from "../../../../src/tenants/get-tenant-branding";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const productKey = typeof body?.productKey === "string" ? body.productKey.trim() : "";

    if (!productKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const authSession = await getRequestSession();
    if (!authSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let context;
    try {
      context = await resolveTenantContextFromRequest();
    } catch (error) {
      if (error instanceof TenantContextError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      throw error;
    }

    const product = getProductByKey(productKey);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    let branding;
    try {
      branding = await getTenantProductBranding(context.organizationId, productKey);
    } catch (error) {
      if (error instanceof BrandingNotFoundError) {
        return NextResponse.json(
          { error: "Product not available for this organization" },
          { status: 404 }
        );
      }
      throw error;
    }

    const checkoutToken = createCheckoutToken({
      userId: context.actorUserId,
      tenantId: context.organizationId,
      customerEmail: authSession.userEmail,
      customerName: context.organizationName,
      productKey,
      priceCents: product.priceCents,
      currency: product.currency,
      productName: branding.displayName,
      clientRevenueCents: product.priceCents,
      platformServicesCents: Math.round(product.priceCents * 0.02),
      checkoutLicenseFeeCents: 0,
      paymentMethodDefault: "card",
      totalCardCents: product.priceCents + Math.round(product.priceCents * 0.02),
      metadata: {
        tenantId: context.organizationId,
        tenantSlug: context.organizationSlug,
        organizationName: context.organizationName,
      },
    });

    const portalUrl = process.env.NEXT_PUBLIC_VANTYX_PORTAL_URL;
    if (!portalUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_VANTYX_PORTAL_URL is not set" },
        { status: 500 }
      );
    }

    const encodedCheckoutToken = encodeURIComponent(checkoutToken);
    const successUrl = `${portalUrl}/checkout/${encodedCheckoutToken}/confirmation?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${portalUrl}/checkout/${encodedCheckoutToken}`;

    const stripeSession = await createCheckoutSession(
      authSession.userEmail,
      productKey,
      product.priceCents,
      successUrl,
      cancelUrl,
      {
        checkoutToken,
        tenantId: context.organizationId,
        userId: context.actorUserId,
        productKey,
      }
    );

    if (!stripeSession.url) {
      return NextResponse.json(
        { error: "Stripe checkout session did not return a URL" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      checkoutUrl: stripeSession.url,
      checkoutToken,
      pricing: {
        productKey: product.productKey,
        displayName: branding.displayName,
        priceCents: product.priceCents,
        currency: product.currency,
        interval: product.interval,
      },
      stripeSessionId: stripeSession.id,
      successUrl,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
