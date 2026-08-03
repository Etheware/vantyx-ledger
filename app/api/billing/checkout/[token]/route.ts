import { NextRequest, NextResponse } from "next/server";
import { verifyCheckoutToken } from "@/lib/billing/checkout-session";
import { getProductByKey } from "@/lib/catalog/products";
import { getClientBranding } from "@/lib/tenants/branding";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
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

    const branding = getClientBranding("bep");

    return NextResponse.json({
      ok: true,
      payload,
      product,
      branding,
    });
  } catch (error) {
    console.error("Checkout introspection error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}