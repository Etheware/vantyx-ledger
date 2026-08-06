import crypto from "crypto";

export type WebhookEventType =
  | "payment.succeeded"
  | "payment.failed"
  | "payout.paid"
  | "payout.failed"
  | "invoice.created"
  | "subscription.activated"
  | "subscription.cancelled";

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  createdAt: number;
  data: any;
}

export interface WebhookConfig {
  secret: string;
}

export class WebhookHandler {
  private secret: string;

  constructor(config: WebhookConfig) {
    this.secret = config.secret;
  }

  verify(payload: string, signature: string): boolean {
    const parts = signature.split(",").reduce((acc: Record<string, string>, part: string) => {
      const [key, value] = part.split("=");
      acc[key] = value;
      return acc;
    }, {});

    const timestamp = parts.t;
    const v1Signature = parts.v1;

    if (!timestamp || !v1Signature) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp)) > 300) {
      return false;
    }

    const signedContent = `${timestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac("sha256", this.secret)
      .update(signedContent)
      .digest("hex");

    try {
      return crypto.timingSafeEqual(
        Buffer.from(v1Signature),
        Buffer.from(expectedSignature)
      );
    } catch {
      return false;
    }
  }

  parse(payload: string): WebhookEvent {
    return JSON.parse(payload) as WebhookEvent;
  }

  async handleEvent(event: WebhookEvent, handler: (event: WebhookEvent) => Promise<void>) {
    try {
      await handler(event);
    } catch (error) {
      console.error(`Failed to handle webhook event ${event.type}:`, error);
      throw error;
    }
  }
}

export function createWebhookHandler(secret: string) {
  return new WebhookHandler({ secret });
}
