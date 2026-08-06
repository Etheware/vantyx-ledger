
/**
 * Provider-neutral payment types.
 *
 * NOT WIRED IN. No existing route imports this file. It exists so that a
 * future pass can wrap the real Stripe/Plaid call sites documented in
 * docs/STRIPE_AND_PLAID_TOUCHPOINT_AUDIT.md behind one interface, one route
 * at a time, with review at each step — rather than a single unattended
 * rewrite of live checkout/refund/webhook code.
 */

export type PaymentRail = "bank_transfer" | "card";

export type CheckoutStatus =
  | "created"
  | "processing"
  | "settled"
  | "failed"
  | "refunded"
  | "expired";

export type CreateCheckoutInput = {
  tenantId: string;
  clientId: string;
  productId: string;
  purchaserEmail: string;
  amountCents: number;
  currency: string;
  preferredRail?: PaymentRail;
};

export type CheckoutResult = {
  checkoutId: string;
  url: string;
  status: CheckoutStatus;
};

export type CustomerRecord = {
  id: string;
  email: string;
  createdAt: string;
};

export type PaymentMethodRecord = {
  id: string;
  rail: PaymentRail;
  label: string;
  isDefault: boolean;
};

export type RefundInput = {
  paymentId: string;
  amountCents?: number;
  reason?: string;
};

export type RefundResult = {
  refundId: string;
  status: "pending" | "succeeded" | "failed";
};

export type RawWebhookInput = {
  rawBody: string;
  headers: Record<string, string>;
};

export type ProcessedEvent = {
  eventId: string;
  eventType: string;
  paymentId?: string;
};

/**
 * Mirrors the touchpoints already covered by the real Stripe/Plaid code
 * documented in the audit — this is a description of what exists, not an
 * aspirational superset.
 */
/* Interface parameters are part of the provider contract even when a specific adapter does not use them. */
/* eslint-disable no-unused-vars */
export interface PaymentProvider {
  readonly name: "stripe" | "plaid" | "mock-vantyx";

  createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult>;
  getCheckoutStatus(checkoutId: string): Promise<CheckoutStatus>;
  getOrCreateCustomer(email: string): Promise<CustomerRecord>;
  listPaymentMethods(customerId: string): Promise<PaymentMethodRecord[]>;
  refundPayment(input: RefundInput): Promise<RefundResult>;
  verifyWebhookSignature(input: RawWebhookInput): boolean;
  handleWebhook(input: RawWebhookInput): Promise<ProcessedEvent>;
}
/* eslint-enable no-unused-vars */
