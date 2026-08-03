
import { createPaymentService } from "./payment-service";
import { createInvoiceService } from "./invoice-service";
import { createLedgerService } from "./ledger-service";
import { createEntitlementService } from "./entitlement-service";
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

export interface CheckoutOrchestrator {
  completeCheckout(input: CheckoutCompletionInput): Promise<{ invoiceId: string; licenseId: string }>;
}

export function createCheckoutOrchestrator(): CheckoutOrchestrator {
  const paymentService = createPaymentService();
  const invoiceService = createInvoiceService();
  const ledgerService = createLedgerService();
  const entitlementService = createEntitlementService();

  return {
    async completeCheckout(input) {
      const db = getDatabase();

      // 1. Fetch checkout session
      const session = await db.query.checkoutSessions.findFirst({
        where: eq(checkoutSessions.checkoutTokenId, input.checkoutTokenId),
      });

      if (!session) {
        throw new Error("Checkout session not found");
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
        amountCents: input.amountCents,
        description: `Payment for ${session.productName}`,
        metadata: {
          checkoutSessionId: session.id,
        },
      });

      // 4. Issue invoice
      await invoiceService.issueInvoice(invoice.id);

      // 5. Create license for digital product
      const license = await db
        .insert(licenses)
        .values({
          id: uuid(),
          tenantId: input.tenantId,
          clientId: input.clientId,
          productId: session.productId!,
          licenseKey: `lic_${uuid().slice(0, 20)}`,
          purchaserEmail: input.customerEmail,
          status: "pending",
          billingModel: "one_time",
          metadata: {
            checkoutSessionId: session.id,
            invoiceId: invoice.id,
            paymentId: payment.id,
          },
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
            debitCents: payment.amountCents,
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

      // 7. Grant entitlement for access to product
      const metadata = session.metadata as Record<string, any>;
      await entitlementService.grantEntitlement({
        tenantId: input.tenantId,
        clientId: input.clientId,
        customerId: input.customerId,
        feature: session.productKey,
        licenseId: license[0].id,
        expiresAt: metadata?.expiresAt ? new Date(metadata.expiresAt) : undefined,
      });

      return {
        invoiceId: invoice.id,
        licenseId: license[0].id,
      };
    },
  };
}