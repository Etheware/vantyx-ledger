
/**
 * Payment Intent Service
 *
 * Manages the payment intent lifecycle:
 * - pending (initial)
 * - processing (provider processing)
 * - completed (provider confirmed)
 * - failed (provider rejected or timeout)
 * - refunded (refund processed)
 */

import { v4 as uuid } from "uuid";

export interface CreatePaymentIntentInput {
  tenantId: string;
  checkoutSessionId: string;
  amountCents: number;
  currency: string;
  metadata?: Record<string, any>;
}

export interface PaymentIntent {
  id: string;
  tenantId: string;
  checkoutSessionId: string;
  amountCents: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  providerId?: string;
  providerName?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory store for MVP (replace with database table in production)
const paymentIntents = new Map<string, PaymentIntent>();

export async function createPaymentIntent(
  input: CreatePaymentIntentInput,
): Promise<PaymentIntent> {
  const intent: PaymentIntent = {
    id: uuid(),
    tenantId: input.tenantId,
    checkoutSessionId: input.checkoutSessionId,
    amountCents: input.amountCents,
    currency: input.currency,
    status: "pending",
    metadata: input.metadata || {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  paymentIntents.set(intent.id, intent);
  return intent;
}

export async function getPaymentIntent(id: string): Promise<PaymentIntent | null> {
  return paymentIntents.get(id) || null;
}

export async function updatePaymentIntent(
  id: string,
  updates: Partial<Omit<PaymentIntent, "id" | "tenantId" | "checkoutSessionId" | "amountCents" | "currency" | "createdAt">>,
): Promise<PaymentIntent | null> {
  const intent = paymentIntents.get(id);
  if (!intent) {
    return null;
  }

  const updated = {
    ...intent,
    ...updates,
    updatedAt: new Date(),
  };

  paymentIntents.set(id, updated);
  return updated;
}

export async function findPaymentIntentByCheckoutSession(
  checkoutSessionId: string,
): Promise<PaymentIntent | null> {
  for (const intent of paymentIntents.values()) {
    if (intent.checkoutSessionId === checkoutSessionId) {
      return intent;
    }
  }
  return null;
}