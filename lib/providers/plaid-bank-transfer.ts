import { PlaidApi, Configuration } from "plaid";

const plaidConfig = new Configuration({
  basePath: "https://production.plaid.com",
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID || "",
      "PLAID-SECRET": process.env.PLAID_SECRET || "",
    },
  },
});

const plaidClient = new PlaidApi(plaidConfig);

export interface PlaidBankTransferInput {
  tenantId: string;
  customerId: string;
  amountCents: number;
  currency: string;
  accountId: string;
  fundingAccountId: string;
  description?: string;
  idempotencyKey: string;
  metadata?: Record<string, string>;
}

export interface PlaidBankTransferResult {
  success: boolean;
  transferId: string;
  status: "pending" | "posted" | "cancelled" | "failed";
  error?: string;
}

export async function initiatePlaidBankTransfer(
  input: PlaidBankTransferInput
): Promise<PlaidBankTransferResult> {
  try {
    const response = await plaidClient.bankTransferCreate({
      access_token: input.fundingAccountId,
      account_id: input.accountId,
      type: "debit",
      network: "ach",
      amount: (input.amountCents / 100).toString(),
      iso_currency_code: input.currency.toUpperCase(),
      description: input.description || "Payment",
      user: {
        legal_name: input.customerId,
      },
    } as any);

    return {
      success: true,
      transferId: response.data.id as string,
      status: "pending",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bank transfer initiation failed";
    return {
      success: false,
      transferId: "",
      status: "failed",
      error: message,
    };
  }
}

export async function getPlaidBankTransferStatus(transferId: string): Promise<PlaidBankTransferResult> {
  try {
    const response = await plaidClient.bankTransferGet({
      bank_transfer_id: transferId,
    });

    const statusMap: Record<string, "pending" | "posted" | "cancelled" | "failed"> = {
      pending: "pending",
      posted: "posted",
      cancelled: "cancelled",
      failed: "failed",
    };

    const status = response.data.status as string;
    return {
      success: status === "posted",
      transferId: response.data.id as string,
      status: statusMap[status] || "pending",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bank transfer status check failed";
    return {
      success: false,
      transferId,
      status: "failed",
      error: message,
    };
  }
}

export async function createPlaidLinkToken(customerId: string): Promise<string | null> {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: customerId },
      client_name: "Vantyx",
      language: "en",
      products: ["auth", "transfer"] as any,
      country_codes: ["US"] as any,
    });

    return response.data.link_token;
  } catch (error) {
    return null;
  }
}

export async function exchangePlaidPublicToken(publicToken: string): Promise<string | null> {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    return response.data.access_token;
  } catch (error) {
    return null;
  }
}
