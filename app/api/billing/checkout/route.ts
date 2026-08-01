import { NextRequest, NextResponse } from "next/server";
import { getProductByKey } from "@/lib/catalog/products";
import { getClientBranding } from "@/lib/tenants/branding";
import { renderProductCopy } from "@/lib/tenants/render-product-copy";
import { createCheckoutToken } from "@/lib/billing/checkout-session";
import { stripe } from "@/lib/billing/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, productKey, clientId = "bep" } = body;

    if (!userId || !email || !productKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = getProductByKey(productKey);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const branding = getClientBranding(clientId);
    const renderedProduct = renderProductCopy(product, branding);

    const checkoutToken = createCheckoutToken({
      userId,
      productKey,
      priceCents: product.priceCents,
      currency: product.currency,
    });

    const successUrl = `${process.env.NEXT_PUBLIC_VANTYX_PORTAL_URL}/billing/success?token=${checkoutToken}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_VANTYX_PORTAL_URL}/billing/cancel`;

    const stripeSession = await stripe.createCheckoutSession(
      email,
      productKey,
      product.priceCents,
      successUrl,
      cancelUrl
    );

    return NextResponse.json({
      ok: true,
      checkoutUrl: `/checkout/${checkoutToken}`,
      checkoutToken,
      pricing: {
        productKey: product.productKey,
        displayName: renderedProduct.displayName,
        priceCents: product.priceCents,
        currency: product.currency,
        interval: product.interval,
      },
      stripeSessionId: stripeSession.id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
