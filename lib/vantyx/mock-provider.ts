
/**
 * Mock Provider (moved from lib/providers for local imports)
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
    if (idempotencyCache.has(params.idempotencyKey)) {
      return idempotencyCache.get(params.idempotencyKey)!;
    }

    const providerId = `mock_${uuid()}`;
    let result: MockPaymentResult;

    if (params.testCard === "4000-0000-0000-0002") {
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

      mockPayments.set(providerId, {
        providerId,
        amountCents: params.amountCents,
        currency: params.currency,
        status: "succeeded",
        timestamp: new Date(),
        idempotencyKey: params.idempotencyKey,
      });
    }

    idempotencyCache.set(params.idempotencyKey, result);
    return result;
  }

  async retrievePayment(providerId: string): Promise<MockPaymentRecord | null> {
    return mockPayments.get(providerId) || null;
  }

  async refundPayment(
    providerId: string,
    amountCents: number,
  ): Promise<{ success: boolean; refundId: string }> {
    const payment = mockPayments.get(providerId);
    if (!payment) {
      return { success: false, refundId: "" };
    }

    if (amountCents <= payment.amountCents) {
      return { success: true, refundId: `mock_refund_${uuid()}` };
    }

    return { success: false, refundId: "" };
  }

  getAllPayments(): MockPaymentRecord[] {
    return Array.from(mockPayments.values());
  }

  resetState(): void {
    mockPayments.clear();
    idempotencyCache.clear();
  }
}

export function createMockAdapter(): MockAdapter {
  return new MockAdapter();
}