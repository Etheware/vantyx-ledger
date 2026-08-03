
import { createPaymentService } from "../vantyx/payment-service";
import { createLedgerService } from "../vantyx/ledger-service";

export interface PlaidTransaction {
  plaid_transaction_id: string;
  account_id: string;
  amount: number;
  iso_currency_code: string;
  date: string;
  name: string;
  merchant_name?: string;
}

export interface PlaidAdapter {
  syncTransactions(
    accessToken: string,
    tenantId: string,
    clientId: string,
    customerId: string
  ): Promise<void>;
  createACHPayment(params: ACHPaymentParams): Promise<string>;
}

export interface ACHPaymentParams {
  customerId: string;
  customerEmail: string;
  invoiceId: string;
  amountCents: number;
  accountId: string;
  accessToken: string;
}

export function createPlaidAdapter(): PlaidAdapter {
  const paymentService = createPaymentService();
  const ledgerService = createLedgerService();

  return {
    async syncTransactions(accessToken, tenantId, clientId, customerId) {
      // In a real implementation, this would:
      // 1. Call Plaid API to fetch transactions
      // 2. Match them with pending payments
      // 3. Update payment statuses

      // Mock implementation that would be replaced with actual Plaid API calls
      console.log(`Syncing Plaid transactions for customer ${customerId}`);
    },

    async createACHPayment(params) {
      // Create a pending payment for ACH transfer
      const payment = await paymentService.createPayment({
        tenantId: params.customerId.split(":")[0], // Extract tenant ID from customer ID
        clientId: params.customerId.split(":")[1], // Extract client ID
        invoiceId: params.invoiceId,
        customerId: params.customerId,
        customerEmail: params.customerEmail,
        paymentRail: "plaid_ach",
        amountCents: params.amountCents,
        description: "ACH payment via Plaid",
        metadata: {
          accountId: params.accountId,
          accessToken: "***", // Don't store raw token
        },
      });

      // In a real implementation, this would call Plaid API to initiate ACH transfer
      // For now, return the payment ID as the ACH reference
      return payment.id;
    },
  };
}