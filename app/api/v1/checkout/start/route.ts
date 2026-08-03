
/**
 * POST /api/v1/checkout/start
 *
 * Create a Vantyx checkout session.
 *
 * Server owns:
 * - Tenant identity
 * - Catalog items and prices
 * - Amount calculation
 * - Approved return URLs
 *
 * Client provides:
 * - Tenant identifier (validated server-side)
 * - Price/product identifier (validated server-side)
 * - Customer email (optional, for receipt)
 * - Quantity (optional, default 1)
 * - Success/cancel URLs (validated against approval list)
 */

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getDatabase } from "@/lib/db-compat";
import { tenants, catalogProducts, checkoutSessions } from "../../../../../src/db/schema";
import { getTenantProductBranding, BrandingNotFoundError } from "../../../../../src/tenants/get-tenant-branding";
import { createPaymentIntent } from "../../../../../lib/vantyx/payment-intent";

const APPROVED_RETURN_URLS = {
  success: ["https://backflowexamprep.com/billing/success", "http://localhost:3001/billing/success"],
  cancel: ["https://backflowexamprep.com/billing/cancel", "http://localhost:3001/billing/cancel"],
};

interface CheckoutStartRequest {
  tenantId?: string;
  priceId?: string;
  productKey?: string;
  customerEmail?: string;
  customerName?: string;
  quantity?: number;
  successUrl?: string;
  cancelUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as CheckoutStartRequest | null;
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const db = getDatabase() as any;
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // 1. Resolve and validate tenant
    const tenantId = body.tenantId?.trim();
    if (!tenantId) {
      return NextResponse.json({ error: "tenantId is required" }, { status: 400 });
    }

    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found or inactive" },
        { status: 404 },
      );
    }

    // 2. Resolve and validate product
    const productKey = body.productKey?.trim() ?? "weekly-learning-license";
    const product = await db.query.catalogProducts.findFirst({
      where: eq(catalogProducts.key, productKey),
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 },
      );
    }

    // 3. Get tenant branding (validates product is configured for tenant)
    let branding;
    try {
      branding = await getTenantProductBranding(tenantId, productKey);
    } catch (error) {
      if (error instanceof BrandingNotFoundError) {
        return NextResponse.json(
          { error: "Product not available for this tenant" },
          { status: 404 },
        );
      }
      throw error;
    }

    // 4. Validate quantity
    const MAX_QUANTITY = 100;
    const quantity = Math.min(MAX_QUANTITY, Math.max(1, Math.floor(body.quantity ?? 1)));

    // 5. Calculate amount server-side (never trust browser)
    if (product.priceCents == null) {
      return NextResponse.json(
        { error: "Product pricing not configured" },
        { status: 500 },
      );
    }
    const amountCents = product.priceCents * quantity;
    const platformFee = Math.round(amountCents * 0.02); // 2% platform fee
    const totalCents = amountCents + platformFee;

    // 6. Validate return URLs
    const successUrl = body.successUrl?.trim();
    const cancelUrl = body.cancelUrl?.trim();

    if (!successUrl || !APPROVED_RETURN_URLS.success.includes(successUrl)) {
      return NextResponse.json(
        { error: "Invalid success URL" },
        { status: 400 },
      );
    }

    if (!cancelUrl || !APPROVED_RETURN_URLS.cancel.includes(cancelUrl)) {
      return NextResponse.json(
        { error: "Invalid cancel URL" },
        { status: 400 },
      );
    }

    // 7. Validate customer email
    const customerEmail = body.customerEmail?.trim();
    if (customerEmail && !isValidEmail(customerEmail)) {
      return NextResponse.json(
        { error: "Invalid customer email" },
        { status: 400 },
      );
    }

    // 8. Create Vantyx checkout session
    const checkoutSessionId = uuid();
    const paymentIntentId = uuid();

    const checkoutSession = await db.insert(checkoutSessions).values({
      id: checkoutSessionId,
      token: checkoutSessionId,
      userId: tenant.ownerId,
      productKey,
      priceCents: totalCents,
      currency: "USD",
      status: "pending",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }).returning();

    // 9. Create payment intent
    const paymentIntent = await createPaymentIntent({
      tenantId,
      checkoutSessionId: checkoutSessionId,
      amountCents: totalCents,
      currency: "usd",
      metadata: {
        tenantId,
        productKey,
        quantity,
        customerEmail,
      },
    });

    return NextResponse.json({
      ok: true,
      checkoutSessionId,
      paymentIntentId: paymentIntent.id,
      amountCents: totalCents,
      currency: "usd",
      product: { key: productKey, name: branding.displayName, description: branding.description },
      pricing: { subtotal: amountCents / 100, platformFee: platformFee / 100, total: totalCents / 100 },
      nextAction: {
        type: "provider_action_required",
        provider: "stripe_card",
        description: "Customer must complete payment with Stripe",
      },
    });
  } catch (error) {
    console.error("Checkout start error:", error);
    return NextResponse.json(
      { error: "Checkout initialization failed" },
      { status: 500 },
    );
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
