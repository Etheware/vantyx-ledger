/* global require */

export {};

const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  canActivateLicenseClaim,
  deriveOwnedDomains,
} = require("../lib/billing/license-fulfillment");

test("license activation requires a confirmed payment", () => {
  const result = canActivateLicenseClaim({
    paymentConfirmed: false,
    tenantOwnedDomains: [],
    claimantEmail: "buyer@backflowexamprep.com",
  });

  assert.strictEqual(result.allowed, false);
  assert.strictEqual(result.reason, "payment_not_confirmed");
});

test("license activation requires the claimant email to match an owned tenant domain", () => {
  const result = canActivateLicenseClaim({
    paymentConfirmed: true,
    tenantOwnedDomains: ["backflowexamprep.com"],
    claimantEmail: "buyer@otherdomain.com",
  });

  assert.strictEqual(result.allowed, false);
  assert.strictEqual(result.reason, "domain_not_verified");
});

test("owned tenant domains are derived from email and branded URLs", () => {
  const domains = deriveOwnedDomains({
    supportEmail: "support@backflowexamprep.com",
    returnUrls: {
      successUrl: "https://backflowexamprep.com/billing/success",
      cancelUrl: "https://backflowexamprep.com/billing/cancel",
      claimUrl: "https://backflowexamprep.com/claim",
      billingUrl: "https://backflowexamprep.com/billing",
      learningUrl: "https://backflowexamprep.com/learning-center",
    },
    ownedDomains: [],
  });

  assert.deepStrictEqual(domains, ["backflowexamprep.com"]);
});
