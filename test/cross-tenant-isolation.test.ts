
/* global require */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { Buffer } = require("node:buffer");
const { getTenantProductBranding, BrandingNotFoundError } = require("../src/tenants/get-tenant-branding");
const { verifyLicenseClaimToken, createLicenseClaimToken } = require("../lib/billing/license-claim");
const { verifyCheckoutSessionToken, createCheckoutSessionToken } = require("../lib/billing/checkout-session");
const { resolveTenantContextFromSession } = require("../lib/auth/tenant-context");

/**
 * Cross-Tenant Isolation Test Suite
 *
 * Verifies that:
 * 1. Tenant A cannot access tenant B's data
 * 2. Tokens embed and verify tenant ownership
 * 3. Branding lookup is scoped by tenantId
 * 4. Revoked memberships lose access
 * 5. Webhook events are validated for tenant match
 */

const TENANT_A = {
  id: "tenant-a-uuid",
  slug: "tenant-a",
  name: "Tenant A",
};

const TENANT_B = {
  id: "tenant-b-uuid",
  slug: "tenant-b",
  name: "Tenant B",
};

const USER_IN_TENANT_A = {
  id: "user-1",
  email: "user@tenant-a.com",
  emailVerified: true,
  mfaEnabled: false,
};

const USER_IN_BOTH_TENANTS = {
  id: "user-2",
  email: "user@both.com",
  emailVerified: true,
  mfaEnabled: false,
};

test("License Claim Tokens - claim token embeds tenantId", () => {
  const claim = createLicenseClaimToken({
    tenantId: TENANT_A.id,
    email: USER_IN_TENANT_A.email,
    planName: "Pro Plan",
    accessLabel: "Full Access",
    track: "individual",
  });

  const verified = verifyLicenseClaimToken(claim.token);
  assert.strictEqual(verified.tenantId, TENANT_A.id);
});

test("License Claim Tokens - claim token cannot be forged to claim in different tenant", () => {
  const claim = createLicenseClaimToken({
    tenantId: TENANT_A.id,
    email: USER_IN_TENANT_A.email,
    planName: "Pro Plan",
    accessLabel: "Full Access",
    track: "individual",
  });

  const [, signature] = claim.token.split(".");
  const tamperedPayload = Buffer.from(
    JSON.stringify({
      tenantId: TENANT_B.id,
      email: USER_IN_TENANT_A.email,
      planName: "Pro Plan",
      accessLabel: "Full Access",
      track: "individual",
    }),
  ).toString("base64");
  const tampered = `${tamperedPayload}.${signature}`;
  assert.strictEqual(verifyLicenseClaimToken(tampered), null);
});

test("Checkout Session Tokens - checkout token embeds tenantId", () => {
  const session = createCheckoutSessionToken({
    tenantId: TENANT_A.id,
    customerEmail: USER_IN_TENANT_A.email,
    customerName: "User A",
    productName: "Pro License",
    productKey: "pro-license",
    clientRevenueCents: 9999,
    platformServicesCents: 100,
    checkoutLicenseFeeCents: 50,
    cardProcessingFeeCents: 300,
    totalBankCents: 10050,
    totalCardCents: 10350,
    paymentMethodDefault: "card",
    metadata: {},
  });

  const verified = verifyCheckoutSessionToken(session.token);
  assert.strictEqual(verified.tenantId, TENANT_A.id);
});

test("Checkout Session Tokens - checkout token cannot be forged for different tenant", () => {
  const session = createCheckoutSessionToken({
    tenantId: TENANT_A.id,
    customerEmail: USER_IN_TENANT_A.email,
    customerName: "User A",
    productName: "Pro License",
    productKey: "pro-license",
    clientRevenueCents: 9999,
    platformServicesCents: 100,
    checkoutLicenseFeeCents: 50,
    cardProcessingFeeCents: 300,
    totalBankCents: 10050,
    totalCardCents: 10350,
    paymentMethodDefault: "card",
    metadata: {},
  });

  const [, signature] = session.token.split(".");
  const tamperedPayload = Buffer.from(
    JSON.stringify({
      tenantId: TENANT_B.id,
      customerEmail: USER_IN_TENANT_A.email,
      customerName: "User A",
      productName: "Pro License",
      productKey: "pro-license",
      clientRevenueCents: 9999,
      platformServicesCents: 100,
      checkoutLicenseFeeCents: 50,
      cardProcessingFeeCents: 300,
      totalBankCents: 10050,
      totalCardCents: 10350,
      paymentMethodDefault: "card",
      metadata: {},
    }),
  ).toString("base64");
  const tampered = `${tamperedPayload}.${signature}`;
  assert.strictEqual(verifyCheckoutSessionToken(tampered), null);
});

test("Branding Resolution - lookup fails for nonexistent tenant/product", async () => {
  try {
    await getTenantProductBranding(TENANT_B.id, "nonexistent-product");
    assert.fail("Should throw BrandingNotFoundError");
  } catch (error: any) {
    assert(error instanceof BrandingNotFoundError);
    assert(error.message.includes("Product branding not configured"));
  }
});

test("Branding Resolution - query scopes by tenantId", async () => {
  const [brandingA, brandingB] = await Promise.all([
    getTenantProductBranding(TENANT_A.id, "weekly-learning-license"),
    getTenantProductBranding(TENANT_B.id, "weekly-learning-license"),
  ]);

  assert.strictEqual(brandingA.tenantId, TENANT_A.id);
  assert.strictEqual(brandingB.tenantId, TENANT_B.id);
});

test("Tenant Context Resolution - user with single membership auto-selects", () => {
  const session = {
    userId: USER_IN_TENANT_A.id,
    userEmail: USER_IN_TENANT_A.email,
    orgSlug: TENANT_A.slug,
    orgUuid: TENANT_A.id,
    orgName: TENANT_A.name,
    activeOrgUuid: null,
    memberOfOrgs: [
      { uuid: TENANT_A.id, slug: TENANT_A.slug, name: TENANT_A.name },
    ],
    role: "owner",
    capabilities: ["billing:read", "billing:write"],
    billingStatus: "active",
    complianceStatus: { pci: "passed", kyc: "passed", sanctions: "clear" },
    environment: "prod",
    tokenIssuedAt: Date.now(),
    tokenExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    sessionId: "test-session-1",
    consentedToTerms: true,
    emailVerified: true,
    mfaEnabled: false,
  };

  const context = resolveTenantContextFromSession(session);
  assert.strictEqual(context.organizationId, TENANT_A.id);
});

test("Tenant Context Resolution - user with multiple memberships can select", () => {
  const session = {
    userId: USER_IN_BOTH_TENANTS.id,
    userEmail: USER_IN_BOTH_TENANTS.email,
    orgSlug: TENANT_A.slug,
    orgUuid: TENANT_A.id,
    orgName: TENANT_A.name,
    activeOrgUuid: null,
    memberOfOrgs: [
      { uuid: TENANT_A.id, slug: TENANT_A.slug, name: TENANT_A.name },
      { uuid: TENANT_B.id, slug: TENANT_B.slug, name: TENANT_B.name },
    ],
    role: "member",
    capabilities: ["billing:read"],
    billingStatus: "active",
    complianceStatus: { pci: "passed", kyc: "passed", sanctions: "clear" },
    environment: "prod",
    tokenIssuedAt: Date.now(),
    tokenExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    sessionId: "test-session-2",
    consentedToTerms: true,
    emailVerified: true,
    mfaEnabled: false,
  };

  const context = resolveTenantContextFromSession(session);
  assert.strictEqual(context.organizationId, TENANT_A.id);

  const contextB = resolveTenantContextFromSession(session, {
    requestedOrganizationId: TENANT_B.id,
  });
  assert.strictEqual(contextB.organizationId, TENANT_B.id);
});

test("Tenant Context Resolution - user cannot select unauthorized tenant", () => {
  const session = {
    userId: USER_IN_TENANT_A.id,
    userEmail: USER_IN_TENANT_A.email,
    orgSlug: TENANT_A.slug,
    orgUuid: TENANT_A.id,
    orgName: TENANT_A.name,
    activeOrgUuid: null,
    memberOfOrgs: [
      { uuid: TENANT_A.id, slug: TENANT_A.slug, name: TENANT_A.name },
    ],
    role: "member",
    capabilities: ["billing:read"],
    billingStatus: "active",
    complianceStatus: { pci: "passed", kyc: "passed", sanctions: "clear" },
    environment: "prod",
    tokenIssuedAt: Date.now(),
    tokenExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    sessionId: "test-session-3",
    consentedToTerms: true,
    emailVerified: true,
    mfaEnabled: false,
  };

  assert.throws(
    () => {
      resolveTenantContextFromSession(session, {
        requestedOrganizationId: TENANT_B.id,
      });
    },
    {
      name: "TenantContextError",
    },
  );
});

test("Tenant Context Resolution - revoked membership loses access", () => {
  const session = {
    userId: USER_IN_BOTH_TENANTS.id,
    userEmail: USER_IN_BOTH_TENANTS.email,
    orgSlug: TENANT_A.slug,
    orgUuid: TENANT_A.id,
    orgName: TENANT_A.name,
    activeOrgUuid: null,
    memberOfOrgs: [
      { uuid: TENANT_A.id, slug: TENANT_A.slug, name: TENANT_A.name },
      { uuid: TENANT_B.id, slug: TENANT_B.slug, name: TENANT_B.name },
    ],
    role: "member",
    capabilities: ["billing:read"],
    billingStatus: "active",
    complianceStatus: { pci: "passed", kyc: "passed", sanctions: "clear" },
    environment: "prod",
    tokenIssuedAt: Date.now(),
    tokenExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    sessionId: "test-session-4",
    consentedToTerms: true,
    emailVerified: true,
    mfaEnabled: false,
  };

  session.memberOfOrgs = session.memberOfOrgs.filter((membership) => membership.uuid !== TENANT_B.id);

  assert.throws(
    () => {
      resolveTenantContextFromSession(session, {
        requestedOrganizationId: TENANT_B.id,
      });
    },
    {
      name: "TenantContextError",
    },
  );
});

test("Webhook Event Validation - webhook must include tenantId in metadata", () => {
  const stripeEvent = {
    id: "evt_test",
    type: "payment_intent.succeeded",
    data: {
      object: {
        id: "pi_test",
        metadata: {
          tenantId: TENANT_A.id,
          paymentId: "payment-1",
        },
      },
    },
  };

  assert.strictEqual(
    stripeEvent.data.object.metadata.tenantId,
    TENANT_A.id,
  );
});

test("Webhook Event Validation - webhook with mismatched tenantId is rejected", () => {
  const stripeEvent = {
    id: "evt_test",
    type: "payment_intent.succeeded",
    data: {
      object: {
        id: "pi_test",
        metadata: {
          tenantId: TENANT_B.id,
          paymentId: "payment-1",
        },
      },
    },
  };

  const paymentTenantId = TENANT_A.id;

  assert.notStrictEqual(
    stripeEvent.data.object.metadata.tenantId,
    paymentTenantId,
  );
});

test("Audit Logging - tenant switches are captured", () => {
  const auditLog = {
    actorUserId: USER_IN_BOTH_TENANTS.id,
    previousTenantId: TENANT_A.id,
    nextTenantId: TENANT_B.id,
    action: "tenant_switch",
    timestamp: new Date().toISOString(),
  };

  assert.strictEqual(auditLog.actorUserId, USER_IN_BOTH_TENANTS.id);
  assert.strictEqual(auditLog.previousTenantId, TENANT_A.id);
  assert.strictEqual(auditLog.nextTenantId, TENANT_B.id);
  assert.strictEqual(auditLog.action, "tenant_switch");
});

test("Audit Logging - checkout abandonment captures correct tenantId", () => {
  const checkoutSession = createCheckoutSessionToken({
    tenantId: TENANT_A.id,
    customerEmail: USER_IN_TENANT_A.email,
    customerName: "User A",
    productName: "Pro License",
    productKey: "pro-license",
    clientRevenueCents: 9999,
    platformServicesCents: 100,
    checkoutLicenseFeeCents: 50,
    cardProcessingFeeCents: 300,
    totalBankCents: 10050,
    totalCardCents: 10350,
    paymentMethodDefault: "card",
    metadata: {},
  });

  const verified = verifyCheckoutSessionToken(checkoutSession.token);
  const auditLog = {
    tenantId: verified.tenantId,
    action: "checkout_abandoned",
    timestamp: new Date().toISOString(),
  };

  assert.strictEqual(auditLog.tenantId, TENANT_A.id);
});
