
/**
 * NOT WIRED IN. Reference implementation only, for future local-only
 * testing of provider-abstracted checkout flows without touching Stripe or
 * Plaid. No route currently imports this.
 */
import { randomUUID } from "crypto";
import type {
  CheckoutResult,
  CheckoutStatus,
  CreateCheckoutInput,
  CustomerRecord,
  PaymentMethodRecord,
  PaymentProvider,
  ProcessedEvent,
  RawWebhookInput,
  RefundInput,
  RefundResult,
} from "../provider-types";

const checkouts = new Map<string, CheckoutStatus>();

export class MockVantyxProvider implements PaymentProvider {
  readonly name = "mock-vantyx" as const;

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
    const checkoutId = `mock_chk_${randomUUID()}`;
    checkouts.set(checkoutId, "created");
    return {
      checkoutId,
      url: `/checkout/${checkoutId}?mock=1&amount=${input.amountCents}`,
      status: "created",
    };
  }

  async getCheckoutStatus(checkoutId: string): Promise<CheckoutStatus> {
    return checkouts.get(checkoutId) ?? "expired";
  }

  async getOrCreateCustomer(email: string): Promise<CustomerRecord> {
    return { id: `mock_cus_${randomUUID()}`, email, createdAt: new Date().toISOString() };
  }

  async listPaymentMethods(_customerId: string): Promise<PaymentMethodRecord[]> {
    void _customerId;
    return [{ id: `mock_pm_${randomUUID()}`, rail: "bank_transfer", label: "Mock bank account", isDefault: true }];
  }

  async refundPayment(_input: RefundInput): Promise<RefundResult> {
    void _input;
    return { refundId: `mock_re_${randomUUID()}`, status: "succeeded" };
  }

  verifyWebhookSignature(_input: RawWebhookInput): boolean {
    void _input;
    return true;
  }

  async handleWebhook(_input: RawWebhookInput): Promise<ProcessedEvent> {
    void _input;
    return { eventId: `mock_evt_${randomUUID()}`, eventType: "mock.event" };
  }
}
