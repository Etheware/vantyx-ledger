
/**
 * Mock Provider Adapter
 *
 * Provides deterministic payment processing for local testing.
 * No external dependencies, full control over success/failure scenarios.
 *
 * Test cards:
 * - "4242-4242-4242-4242" → success
 * - "4000-0000-0000-0002" → failure
 * - "duplicate-token-xyz" → duplicate idempotency test
 */

import { v4 as uuid } from "uuid";

export interface MockPaymentResult {
  success: boolean;
  providerId: string;
  status: "succeeded" | "failed";
  amount: number;
  currency: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

interface MockPaymentRecord {
  providerId: string;
  amountCents: number;
  currency: string;
  status: "succeeded" | "failed";
  timestamp: Date;
  idempotencyKey?: string;
}

// In-memory record of mock payments (simulate provider state)
const mockPayments = new Map<string, MockPaymentRecord>();
const idempotencyCache = new Map<string, MockPaymentResult>();

export interface CreateMockPaymentParams {
  amountCents: number;
  currency: string;
  testCard: string;
  idempotencyKey: string;
  metadata?: Record<string, any>;
}

export class MockAdapter {
  async createPayment(params: CreateMockPaymentParams): Promise<MockPaymentResult> {
    // Check idempotency cache
    if (idempotencyCache.has(params.idempotencyKey)) {
      return idempotencyCache.get(params.idempotencyKey)!;
    }

    const providerId = `mock_${uuid()}`;
    let result: MockPaymentResult;

    // Deterministic routing based on test card
    if (params.testCard === "4000-0000-0000-0002") {
      // Failure card
      result = {
        success: false,
        providerId,
        status: "failed",
        amount: params.amountCents,
        currency: params.currency,
        timestamp: new Date(),
        metadata: {
          ...params.metadata,
          failureReason: "Declined by mock provider",
          testCard: params.testCard,
        },
      };
    } else {
      // Default: success (including 4242-4242-4242-4242)
      result = {
        success: true,
        providerId,
        status: "succeeded",
        amount: params.amountCents,
        currency: params.currency,
        timestamp: new Date(),
        metadata: {
          ...params.metadata,
          testCard: params.testCard,
        },
      };

      // Record in mock payment store
      mockPayments.set(providerId, {
        providerId,
        amountCents: params.amountCents,
        currency: params.currency,
        status: "succeeded",
        timestamp: new Date(),
        idempotencyKey: params.idempotencyKey,
      });
    }

    // Cache for idempotency
    idempotencyCache.set(params.idempotencyKey, result);
    return result;
  }

  async retrievePayment(providerId: string): Promise<MockPaymentRecord | null> {
    return mockPayments.get(providerId) || null;
  }

  async refundPayment(providerId: string, amountCents: number): Promise<{ success: boolean; refundId: string }> {
    const payment = mockPayments.get(providerId);
    if (!payment) {
      return { success: false, refundId: "" };
    }

    // Mock refund succeeds if amount <= original
    if (amountCents <= payment.amountCents) {
      return { success: true, refundId: `mock_refund_${uuid()}` };
    }

    return { success: false, refundId: "" };
  }

  // Simulate a provider webhook callback
  async simulateWebhookCallback(providerId: string, status: "succeeded" | "failed"): Promise<string> {
    const payment = mockPayments.get(providerId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    // Return signed webhook JSON (mock signature)
    const payload = {
      event_id: uuid(),
      event_type: status === "succeeded" ? "payment.succeeded" : "payment.failed",
      timestamp: new Date().toISOString(),
      data: {
        provider_id: providerId,
        amount: payment.amountCents,
        currency: payment.currency,
        status,
      },
      signature: `mock_sig_${Buffer.from(providerId).toString("base64")}`,
    };

    return JSON.stringify(payload);
  }

  // Verify mock webhook signature
  async verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
    try {
      const data = JSON.parse(payload);
      const expectedSig = `mock_sig_${Buffer.from(data.data.provider_id).toString("base64")}`;
      return signature === expectedSig;
    } catch {
      return false;
    }
  }

  // Get all mock payments (for testing)
  getAllPayments(): MockPaymentRecord[] {
    return Array.from(mockPayments.values());
  }

  // Reset mock state (for test cleanup)
  resetState(): void {
    mockPayments.clear();
    idempotencyCache.clear();
  }
}

export function createMockAdapter(): MockAdapter {
  return new MockAdapter();
}