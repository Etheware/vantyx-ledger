import crypto from "crypto";

export interface CheckoutSessionPayload {
  userId: string;
  productKey: string;
  priceCents: number;
  currency: string;
}

const SECRET = process.env.CHECKOUT_SESSION_SECRET || "default-secret-change-in-production";

export function createCheckoutToken(payload: CheckoutSessionPayload): string {
  const json = JSON.stringify(payload);
  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(json);
  const signature = hmac.digest("hex");
  const tokenData = `${Buffer.from(json).toString("base64")}.${signature}`;
  return tokenData;
}

export function verifyCheckoutToken(token: string): CheckoutSessionPayload | null {
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

    return JSON.parse(json);
  } catch {
    return null;
  }
}