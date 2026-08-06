
import { createPaymentService } from "./payment-service";
import { createInvoiceService } from "./invoice-service";
import { createLedgerService } from "./ledger-service";
import { getDatabase, checkoutSessions, licenses } from "@/lib/db-compat";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export interface CheckoutCompletionInput {
  tenantId: string;
  clientId: string;
  checkoutTokenId: string;
  customerId: string;
  customerEmail: string;
  paymentRail: "stripe_card" | "stripe_bank" | "plaid_ach" | "solana_usdc" | "manual";
  amountCents: number;
}

/* Interface parameters are part of the service contract even when an implementation is a stub. */
/* eslint-disable no-unused-vars */
export interface CheckoutOrchestrator {
  completeCheckout(input: CheckoutCompletionInput): Promise<{ invoiceId: string; licenseId: string }>;
}
/* eslint-enable no-unused-vars */

export function createCheckoutOrchestrator(): CheckoutOrchestrator {
  const paymentService = createPaymentService();
  const invoiceService = createInvoiceService();
  const ledgerService = createLedgerService();

  return {
    async completeCheckout(input) {
      const db = getDatabase() as any;
      if (!db) {
        throw new Error("Database unavailable");
      }

      // 1. Fetch checkout session
      const session = await db.query.checkoutSessions.findFirst({
        where: eq(checkoutSessions.token, input.checkoutTokenId),
      });

      if (!session) {
        throw new Error("Checkout session not found");
      }
      if (session.tenantId !== input.tenantId) {
        throw new Error("Checkout session tenant mismatch");
      }

      // 2. Create invoice from checkout
      const invoice = await invoiceService.createInvoice({
        tenantId: input.tenantId,
        clientId: input.clientId,
        customerId: input.customerId,
        customerEmail: input.customerEmail,
        customerName: session.customerName || undefined,
        subtotalCents: session.clientRevenueCents,
        taxCents: 0,
        description: `Invoice for ${session.productName}`,
        metadata: {
          checkoutSessionId: session.id,
          productKey: session.productKey,
        },
      });

      // 3. Create payment
      const payment = await paymentService.createPayment({
        tenantId: input.tenantId,
        clientId: input.clientId,
        invoiceId: invoice.id,
        customerId: input.customerId,
        customerEmail: input.customerEmail,
        paymentRail: input.paymentRail,
        amountCents: session.clientRevenueCents + session.platformServicesCents + session.checkoutLicenseFeeCents,
        description: `Payment for ${session.productName}`,
        metadata: {
          checkoutSessionId: session.id,
        },
      });

      // 4. Issue invoice
      await invoiceService.issueInvoice(invoice.id, input.tenantId);

      // 5. Create license for digital product
      const license = await db
        .insert(licenses)
        .values({
          id: uuid(),
          tenantId: input.tenantId,
          key: `lic_${uuid().slice(0, 20)}`,
          status: "pending",
          expiresAt: null,
        })
        .returning();

      // 6. Post ledger entries (double-entry bookkeeping)
      await ledgerService.postEntries({
        tenantId: input.tenantId,
        clientId: input.clientId,
        invoiceId: invoice.id,
        paymentId: payment.id,
        entries: [
          {
            account: "assets:cash",
            debitCents: session.clientRevenueCents + session.platformServicesCents + session.checkoutLicenseFeeCents,
            description: "Cash received from payment",
          },
          {
            account: "revenue:product_sales",
            creditCents: session.clientRevenueCents,
            description: `Revenue from ${session.productName}`,
          },
          {
            account: "liability:platform_fees",
            creditCents: session.platformServicesCents + session.checkoutLicenseFeeCents,
            description: "Platform service fees and license fees",
          },
        ],
      });

      return {
        invoiceId: invoice.id,
        licenseId: license[0].id,
      };
    },
  };
}
