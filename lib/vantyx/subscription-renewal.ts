import { eq, and } from "drizzle-orm";
import { getDatabase, subscriptions } from "@/lib/db-compat";
import { createInvoiceService } from "./invoice-service";
import { createLedgerService } from "./ledger-service";
import { createPaymentService } from "./payment-service";
import { createUsageService } from "./usage-service";

export interface SubscriptionRenewalInput {
  subscriptionId: string;
  tenantId: string;
  clientId: string;
  paymentRail: "stripe_card" | "stripe_bank" | "plaid_ach" | "solana_usdc" | "manual";
  includeUsageCharges?: boolean;
}

export interface SubscriptionRenewalResult {
  success: boolean;
  invoiceId: string;
  paymentId?: string;
  amountCents: number;
  error?: string;
}

export async function renewSubscription(
  input: SubscriptionRenewalInput
): Promise<SubscriptionRenewalResult> {
  const db = getDatabase() as any;
  if (!db) {
    throw new Error("Database unavailable");
  }

  try {
    // 1. Fetch subscription
    const subscription = await db.query.subscriptions.findFirst({
      where: and(eq(subscriptions.id, input.subscriptionId), eq(subscriptions.tenantId, input.tenantId)),
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.status !== "active") {
      throw new Error(`Cannot renew ${subscription.status} subscription`);
    }

    // 2. Calculate charges
    const invoiceService = createInvoiceService();
    const usageService = createUsageService();
    const ledgerService = createLedgerService();
    const paymentService = createPaymentService();

    // Base subscription amount
    let totalCents = subscription.amountCents;

    // Add usage charges if applicable
    if (input.includeUsageCharges) {
      const currentPeriodStart = subscription.currentPeriodStartAt;
      const currentPeriodEnd = subscription.currentPeriodEndAt;
      const usageChargesCents = await usageService.aggregateUsageForBilling(
        input.subscriptionId,
        currentPeriodStart,
        currentPeriodEnd
      );
      totalCents += usageChargesCents;
    }

    // 3. Create invoice
    const invoice = await invoiceService.createInvoice({
      tenantId: input.tenantId,
      clientId: input.clientId,
      subscriptionId: input.subscriptionId,
      customerId: subscription.customerId,
      customerEmail: subscription.customerEmail,
      subtotalCents: subscription.amountCents,
      taxCents: 0, // TODO: Calculate tax based on customer location
      currency: subscription.currency,
      description: `${subscription.billingCycleDays}-day subscription renewal`,
      dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      metadata: {
        billingCycle: subscription.billingCycleDays,
        usageCharges: input.includeUsageCharges ? true : false,
      },
    });

    // 4. Issue invoice
    await invoiceService.issueInvoice(invoice.id, input.tenantId);

    // 5. Record payment (attempt auto-billing)
    const payment = await paymentService.createPayment({
      tenantId: input.tenantId,
      clientId: input.clientId,
      invoiceId: invoice.id,
      customerId: subscription.customerId,
      customerEmail: subscription.customerEmail,
      paymentRail: input.paymentRail,
      amountCents: totalCents,
      description: `Subscription renewal for ${subscription.subscriptionKey}`,
      metadata: {
        subscriptionId: input.subscriptionId,
      },
    });

    // 6. Post ledger entries
    await ledgerService.postEntries({
      tenantId: input.tenantId,
      clientId: input.clientId,
      invoiceId: invoice.id,
      paymentId: payment.id,
      entries: [
        {
          account: "assets:cash",
          debitCents: totalCents,
          description: "Cash received from subscription renewal",
        },
        {
          account: "revenue:subscription",
          creditCents: subscription.amountCents,
          description: "Subscription revenue",
        },
        ...(input.includeUsageCharges
          ? [
              {
                account: "revenue:usage_charges",
                creditCents: totalCents - subscription.amountCents,
                description: "Usage-based charges",
              },
            ]
          : []),
      ],
    });

    // 7. Update subscription period
    const nextPeriodStart = subscription.currentPeriodEndAt;
    const nextPeriodEnd = new Date(
      nextPeriodStart.getTime() + subscription.billingCycleDays * 24 * 60 * 60 * 1000
    );

    await db
      .update(subscriptions)
      .set({
        currentPeriodStartAt: nextPeriodStart,
        currentPeriodEndAt: nextPeriodEnd,
        nextBillingAt: nextPeriodEnd,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, input.subscriptionId));

    return {
      success: true,
      invoiceId: invoice.id,
      paymentId: payment.id,
      amountCents: totalCents,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Subscription renewal failed";
    return {
      success: false,
      invoiceId: "",
      amountCents: 0,
      error: errorMessage,
    };
  }
}

export async function processSubscriptionRenewals(
  tenantId?: string
): Promise<{ processed: number; failed: number; errors: string[] }> {
  const db = getDatabase() as any;
  if (!db) {
    throw new Error("Database unavailable");
  }

  const now = new Date();
  const renewalWindow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours ahead

  // Find subscriptions due for billing
  let query = db.query.subscriptions.findMany({
    where: and(
      eq(subscriptions.status, "active"),
      lte(subscriptions.nextBillingAt, renewalWindow)
    ),
  });

  if (tenantId) {
    query = db.query.subscriptions.findMany({
      where: and(
        eq(subscriptions.tenantId, tenantId),
        eq(subscriptions.status, "active"),
        lte(subscriptions.nextBillingAt, renewalWindow)
      ),
    });
  }

  const dueSubscriptions = await query;

  let processed = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const sub of dueSubscriptions) {
    try {
      // TODO: Determine payment rail from subscription preferences or tenant config
      const result = await renewSubscription({
        subscriptionId: sub.id,
        tenantId: sub.tenantId,
        clientId: sub.clientId,
        paymentRail: "stripe_card", // Default, should be configurable
        includeUsageCharges: true,
      });

      if (result.success) {
        processed++;
      } else {
        failed++;
        errors.push(`${sub.id}: ${result.error}`);
      }
    } catch (error) {
      failed++;
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push(`${sub.id}: ${message}`);
    }
  }

  return { processed, failed, errors };
}

// Re-export for convenience
import { lte } from "drizzle-orm";
