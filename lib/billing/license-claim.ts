/* global Buffer */

import crypto from "crypto";

export interface LicenseClaimPayload {
  tenantId: string;
  email: string;
  planName: string;
  accessLabel: string;
  track: string;
}

const SECRET = process.env.LICENSE_CLAIM_SECRET || "default-secret-change-in-production";

export function createLicenseClaimToken(payload: LicenseClaimPayload): { token: string } {
  const json = JSON.stringify(payload);
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(json);
  const signature = hmac.digest("hex");
  return { token: `${Buffer.from(json).toString("base64")}.${signature}` };
}

export function verifyLicenseClaimToken(token: string): LicenseClaimPayload | null {
  try {
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) return null;

    const json = Buffer.from(encoded, "base64").toString("utf-8");
    const hmac = crypto.createHmac("sha256", SECRET);
    hmac.update(json);
    const expectedSignature = hmac.digest("hex");

    if (signature !== expectedSignature) {
      return null;
    }

    return JSON.parse(json) as LicenseClaimPayload;
  } catch {
    return null;
  }
}
