
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
  tenantId: string;
  providerId: string;
  amountCents: number;
  currency: string;
  status: "succeeded" | "failed";
  timestamp: Date;
  idempotencyKey?: string;
  refundedCents?: number;
}

const mockPayments = new Map<string, MockPaymentRecord>();
const idempotencyCache = new Map<string, MockPaymentResult>();

export interface CreateMockPaymentParams {
  tenantId: string;
  amountCents: number;
  currency: string;
  testCard: string;
  idempotencyKey: string;
  metadata?: Record<string, any>;
}

export class MockAdapter {
  async createPayment(params: CreateMockPaymentParams): Promise<MockPaymentResult> {
    const cacheKey = `${params.tenantId}:${params.idempotencyKey}`;
    if (idempotencyCache.has(cacheKey)) {
      return idempotencyCache.get(cacheKey)!;
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
        tenantId: params.tenantId,
        providerId,
        amountCents: params.amountCents,
        currency: params.currency,
        status: "succeeded",
        timestamp: new Date(),
        idempotencyKey: params.idempotencyKey,
        refundedCents: 0,
      });
    }

    idempotencyCache.set(cacheKey, result);
    return result;
  }

  async retrievePayment(tenantId: string, providerId: string): Promise<MockPaymentRecord | null> {
    const payment = mockPayments.get(providerId);
    return payment && payment.tenantId === tenantId ? payment : null;
  }

  async refundPayment(
    tenantId: string,
    providerId: string,
    amountCents: number,
  ): Promise<{ success: boolean; refundId: string }> {
    const payment = mockPayments.get(providerId);
    if (!payment || payment.tenantId !== tenantId) {
      return { success: false, refundId: "" };
    }

    const alreadyRefunded = payment.refundedCents || 0;
    if (amountCents + alreadyRefunded <= payment.amountCents) {
      payment.refundedCents = alreadyRefunded + amountCents;
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
