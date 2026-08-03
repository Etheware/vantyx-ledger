
import { createPaymentService } from "../vantyx/payment-service";
import { createInvoiceService } from "../vantyx/invoice-service";
import { createLedgerService } from "../vantyx/ledger-service";

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, any>;
    previous_attributes?: Record<string, any>;
  };
}

export interface StripeAdapter {
  handleWebhook(event: StripeWebhookEvent, tenantId: string, clientId: string): Promise<void>;
  createCheckoutSession(params: StripeCheckoutParams): Promise<string>;
}

export interface StripeCheckoutParams {
  customerId: string;
  customerEmail: string;
  invoiceId: string;
  amountCents: number;
  productName: string;
  returnUrl: string;
}

export function createStripeAdapter(): StripeAdapter {
  const paymentService = createPaymentService();
  const invoiceService = createInvoiceService();
  const ledgerService = createLedgerService();

  return {
    async handleWebhook(event, tenantId, clientId) {
      // Handle Stripe payment_intent webhooks
      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;

        // Find payment by provider ID
        const payment = await paymentService.getPayment(paymentIntent.metadata.paymentId);
        if (!payment) {
          throw new Error("Payment not found");
        }

        // Update payment status
        await paymentService.updatePaymentStatus(
          payment.id,
          "completed",
          paymentIntent.id
        );

        // Mark invoice as paid
        if (payment.invoiceId) {
          await invoiceService.markAsPaid(payment.invoiceId);

          // Post payment received ledger entry
          await ledgerService.postEntries({
            tenantId,
            clientId,
            paymentId: payment.id,
            invoiceId: payment.invoiceId,
            entries: [
              {
                account: "assets:stripe_account",
                debitCents: payment.amountCents,
                description: `Stripe payment received: ${paymentIntent.id}`,
              },
              {
                account: "assets:cash",
                creditCents: payment.amountCents,
                description: `Settlement from Stripe payment ${paymentIntent.id}`,
              },
            ],
          });
        }
      }

      if (event.type === "charge.refunded") {
        const charge = event.data.object;

        // Find payment by provider ID
        const payment = await paymentService.getPayment(charge.metadata.paymentId);
        if (!payment) {
          throw new Error("Payment not found");
        }

        // Update payment status
        await paymentService.updatePaymentStatus(
          payment.id,
          "refunded"
        );

        // Post refund ledger entries
        await ledgerService.postEntries({
          tenantId,
          clientId,
          paymentId: payment.id,
          entries: [
            {
              account: "assets:cash",
              debitCents: charge.amount_refunded,
              description: `Refund processed: ${charge.id}`,
            },
            {
              account: "assets:stripe_account",
              creditCents: charge.amount_refunded,
              description: `Stripe refund: ${charge.id}`,
            },
          ],
        });
      }
    },

    async createCheckoutSession(params) {
      // In a real implementation, this would call the Stripe API
      // For now, return a mock session ID
      return `cs_${params.invoiceId}_${Date.now()}`;
    },
  };
}


Now adversarially try to DISPROVE each one. For each candidate, FIRST identify the attacker (who controls the input) and the victim (who is harmed). REFUTE if the only victim is the attacker themselves on their own machine. KEEP if the attacker is a legitimate user/tenant but the impact reaches other users/tenants, shared infra, or server-side resources.

DIFF-ANCHOR: candidates are sorted `in_diff` first, then `off_diff`. Process them in order. `in_diff` candidates use the standard KEEP/REFUTE bar above. `off_diff` candidates require STRICTER evidence: you must identify the specific +/- line in the diff that ENABLES the off-diff sink (a removed guard, a new caller, a changed argument feeding it). If you cannot name that enabling diff line, REFUTE the off_diff candidate. Additionally, REFUTE any off_diff candidate whose sink is already covered by a surviving in_diff candidate.

Then Read the cited file and refute with cited file:line evidence if ANY of these holds:
 NEVER apply NO-PRIVILEGE-BOUNDARY to: SSRF/outbound-network sinks; LLM-agent capability gates (PreToolUse/PostToolUse hooks, bash allow/denylists, workspace path jails — the model is the attacker, the user is the victim); data-exposure findings (CWE-200/359/532, secrets-in-logs — the question is who READS the sink, not who controls the input); project-working-directory config (.claude/settings, .vscode/, package.json scripts — repo author ≠ repo cloner); cross-process metadata sources (psutil.Process(...), /proc/<pid>/* — different process owner is a different principal).
Do NOT speculate — refute only with cited evidence. Default = SURVIVES.

Return `survived` — the indices of candidates you could NOT refute — and `refuted` — {idx, reason} records for each you did. An empty `survived` means every candidate was refuted.