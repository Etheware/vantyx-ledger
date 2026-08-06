import { createLicenseService } from "./license-service";
import { createEntitlementService } from "./entitlement-service";

export interface LicenseValidationResult {
  valid: boolean;
  license?: {
    id: string;
    key: string;
    tier: string;
    status: string;
    expiresAt?: Date;
    seatLimit?: number;
    seatUsed: number;
  };
  entitlements?: string[];
  error?: string;
}

export async function validateLicenseAccess(
  licenseKey: string,
  tenantId: string,
  feature?: string
): Promise<LicenseValidationResult> {
  const licenseService = createLicenseService();
  const entitlementService = createEntitlementService();

  try {
    // 1. Validate license key exists and is active
    const isValid = await licenseService.validateLicense(licenseKey, tenantId);
    if (!isValid) {
      return {
        valid: false,
        error: "License not found or expired",
      };
    }

    // 2. Get license details
    const licenses = await licenseService.getLicensesByCustomer(licenseKey, tenantId);
    if (!licenses.length) {
      return {
        valid: false,
        error: "License not found",
      };
    }

    const license = licenses[0];

    // 3. Check seat limit if applicable
    if (license.seatLimit && license.seatUsed >= license.seatLimit) {
      return {
        valid: false,
        license: {
          id: license.id,
          key: license.licenseKey,
          tier: license.tier,
          status: license.status,
          expiresAt: license.expiresAt,
          seatLimit: license.seatLimit,
          seatUsed: license.seatUsed,
        },
        error: `Seat limit reached (${license.seatUsed}/${license.seatLimit})`,
      };
    }

    // 4. If feature specified, check entitlement
    let entitlements: string[] = [];
    if (feature) {
      const hasFeature = await entitlementService.checkEntitlement(license.customerId, feature);
      if (!hasFeature) {
        return {
          valid: false,
          license: {
            id: license.id,
            key: license.licenseKey,
            tier: license.tier,
            status: license.status,
            expiresAt: license.expiresAt,
            seatLimit: license.seatLimit,
            seatUsed: license.seatUsed,
          },
          error: `Feature ${feature} not entitled`,
        };
      }
    }

    // 5. Get all entitled features
    const customerEntitlements = await entitlementService.getEntitlements(
      license.customerId,
      tenantId
    );
    entitlements = customerEntitlements.map((e: any) => e.feature);

    return {
      valid: true,
      license: {
        id: license.id,
        key: license.licenseKey,
        tier: license.tier,
        status: license.status,
        expiresAt: license.expiresAt,
        seatLimit: license.seatLimit,
        seatUsed: license.seatUsed,
      },
      entitlements,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation failed";
    return {
      valid: false,
      error: message,
    };
  }
}

export async function checkFeatureAccess(
  customerId: string,
  feature: string,
  tenantId: string
): Promise<boolean> {
  const entitlementService = createEntitlementService();

  try {
    return await entitlementService.checkEntitlement(customerId, feature);
  } catch {
    return false;
  }
}

export async function getAllEntitledFeatures(
  customerId: string,
  tenantId: string
): Promise<string[]> {
  const entitlementService = createEntitlementService();

  try {
    const entitlements = await entitlementService.getEntitlements(customerId, tenantId);
    return entitlements.map((e: any) => e.feature);
  } catch {
    return [];
  }
}
