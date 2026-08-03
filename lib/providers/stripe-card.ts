import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY || "", {
  apiVersion: "2023-10-16" as any,
  typescript: true,
});

export interface StripeCardPaymentInput {
  tenantId: string;
  customerId: string;
  customerEmail: string;
  amountCents: number;
  currency: string;
  description?: string;
  idempotencyKey: string;
  metadata?: Record<string, string>;
}

export interface StripeCardPaymentResult {
  success: boolean;
  paymentIntentId: string;
  status: "succeeded" | "requires_action" | "requires_payment_method" | "failed";
  clientSecret?: string;
  error?: string;
}

export async function createStripeCardPayment(
  input: StripeCardPaymentInput
): Promise<StripeCardPaymentResult> {
  try {
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: input.amountCents,
        currency: input.currency.toLowerCase(),
        description: input.description,
        metadata: {
          tenantId: input.tenantId,
          customerId: input.customerId,
          ...input.metadata,
        },
        receipt_email: input.customerEmail,
      },
      {
        idempotencyKey: input.idempotencyKey,
      }
    );

    return {
      success: paymentIntent.status === "succeeded" || paymentIntent.status === "requires_action",
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status as any,
      clientSecret: paymentIntent.client_secret || undefined,
    };
  } catch (error) {
    const message = error instanceof Stripe.errors.StripeError ? error.message : "Payment creation failed";
    return {
      success: false,
      paymentIntentId: "",
      status: "failed",
      error: message,
    };
  }
}

export async function confirmStripeCardPayment(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<StripeCardPaymentResult> {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    return {
      success: paymentIntent.status === "succeeded",
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status as any,
    };
  } catch (error) {
    const message = error instanceof Stripe.errors.StripeError ? error.message : "Payment confirmation failed";
    return {
      success: false,
      paymentIntentId,
      status: "failed",
      error: message,
    };
  }
}

export async function getStripePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch {
    return null;
  }
}
