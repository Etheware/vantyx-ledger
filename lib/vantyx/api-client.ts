import crypto from "crypto";

export interface ApiClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  status: number;
}

export class VantyxApiClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: ApiClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.vantyx.io";
    this.timeout = config.timeout || 30000;
  }

  async request<T>(
    method: string,
    path: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers: Record<string, string> = {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "vantyx-sdk/1.0.0",
      };

      if (data) {
        headers["X-Idempotency-Key"] = this.generateIdempotencyKey();
      }

      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      const contentType = response.headers.get("content-type");
      let responseData;

      if (contentType?.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      return {
        ok: response.ok,
        data: response.ok ? responseData : undefined,
        error: response.ok ? undefined : responseData.error || "Unknown error",
        status: response.status,
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          ok: false,
          error: error.message,
          status: 0,
        };
      }
      return {
        ok: false,
        error: "Unknown error",
        status: 0,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async createPayment(data: {
    amount: number;
    currency: string;
    method: string;
    description?: string;
  }) {
    return this.request("POST", "/v1/payments", data);
  }

  async getPayment(paymentId: string) {
    return this.request("GET", `/v1/payments/${paymentId}`);
  }

  async listPayments(limit = 10) {
    return this.request("GET", `/v1/payments?limit=${limit}`);
  }

  async initiatePayout(data: { amount: number; method: "bank_account" | "debit_card" }) {
    return this.request("POST", "/v1/payouts", data);
  }

  async getPayout(payoutId: string) {
    return this.request("GET", `/v1/payouts/${payoutId}`);
  }

  async listPayouts(limit = 10) {
    return this.request("GET", `/v1/payouts?limit=${limit}`);
  }

  private generateIdempotencyKey(): string {
    return crypto.randomUUID();
  }
}

export function createVantyxClient(apiKey: string, baseUrl?: string) {
  return new VantyxApiClient({ apiKey, baseUrl });
}
