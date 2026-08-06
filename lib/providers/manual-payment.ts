import { v4 as uuid } from "uuid";

export interface ManualPaymentInput {
  tenantId: string;
  customerId: string;
  customerEmail: string;
  amountCents: number;
  currency: string;
  paymentMethod: "wire" | "check" | "cash";
  description?: string;
  metadata?: Record<string, string>;
}

export interface ManualPaymentResult {
  success: boolean;
  paymentId: string;
  status: "pending" | "verified" | "failed";
  instructions?: ManualPaymentInstructions;
  error?: string;
}

export interface ManualPaymentInstructions {
  method: "wire" | "check" | "cash";
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    accountHolder: string;
    reference: string;
  };
  checkDetails?: {
    payableTo: string;
    address: string;
    memo: string;
    reference: string;
  };
  cashDetails?: {
    location: string;
    contact: string;
    reference: string;
  };
}

export async function initializeManualPayment(
  input: ManualPaymentInput
): Promise<ManualPaymentResult> {
  const paymentId = uuid();
  const reference = `MAN-${Date.now()}-${paymentId.substring(0, 8)}`;

  let instructions: ManualPaymentInstructions;

  switch (input.paymentMethod) {
    case "wire":
      instructions = {
        method: "wire",
        bankDetails: {
          bankName: "Vantyx Bank",
          accountNumber: "1234567890",
          routingNumber: "021000021",
          accountHolder: "Vantyx Inc",
          reference,
        },
      };
      break;

    case "check":
      instructions = {
        method: "check",
        checkDetails: {
          payableTo: "Vantyx Inc",
          address: "123 Crypto Lane, San Francisco, CA 94105",
          memo: `Payment for ${input.description || "services"}`,
          reference,
        },
      };
      break;

    case "cash":
      instructions = {
        method: "cash",
        cashDetails: {
          location: "123 Crypto Lane, San Francisco, CA 94105",
          contact: "payments@vantyx.io",
          reference,
        },
      };
      break;
  }

  return {
    success: true,
    paymentId,
    status: "pending",
    instructions,
  };
}

export async function verifyManualPayment(
  paymentId: string,
  tenantId: string,
  verificationCode: string
): Promise<ManualPaymentResult> {
  // In production, this would:
  // 1. Look up payment by ID and verify it belongs to tenantId
  // 2. Verify the provided code matches a code sent to the customer
  // 3. Mark payment as verified in database
  // 4. Trigger ledger entries and invoice issuance

  // Verification is intentionally a stub; these values belong to the future provider flow.
  void tenantId;
  void verificationCode;

  return {
    success: true,
    paymentId,
    status: "verified",
  };
}

export async function getManualPaymentInstructions(
  paymentId: string
): Promise<ManualPaymentInstructions | null> {
  void paymentId;
  // In production, look up from database
  // For now, return null to indicate not found
  return null;
}
