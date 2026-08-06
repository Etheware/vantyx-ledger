export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, any>;
    previous_attributes?: Record<string, any>;
  };
}

/* Interface parameters are part of the provider contract even when a specific adapter does not use them. */
/* eslint-disable no-unused-vars */
export interface StripeAdapter {
  handleWebhook(event: StripeWebhookEvent, tenantId: string, clientId: string): Promise<void>;
  createCheckoutSession(params: StripeCheckoutParams): Promise<string>;
}
/* eslint-enable no-unused-vars */

export interface StripeCheckoutParams {
  tenantId: string;
  customerId: string;
  productId: string;
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export function createStripeAdapter(): StripeAdapter {
  return {
    async handleWebhook(event: StripeWebhookEvent, tenantId: string, clientId: string): Promise<void> {
      void clientId;
      // TODO: Implement Stripe webhook handling
      console.log(`Stripe webhook: ${event.type} for tenant ${tenantId}`);
    },

    async createCheckoutSession(params: StripeCheckoutParams): Promise<string> {
      void params.tenantId;
      void params.customerId;
      void params.amount;
      void params.currency;
      void params.metadata;
      // TODO: Implement Stripe checkout session creation
      console.log(`Creating Stripe checkout for ${params.productId}`);
      return "stripe_checkout_session_stub";
    },
  };
}
