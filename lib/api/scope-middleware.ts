
import { NextRequest } from "next/server";
import { Scope } from "@/lib/scope/types";

export interface ScopeRequestContext {
  scope: Scope;
  userId: string;
}

export function extractScopeFromRequest(request: NextRequest): Partial<Scope> | null {
  const url = new URL(request.url);
  const org = url.searchParams.get("org");
  const project = url.searchParams.get("project");
  const environment = url.searchParams.get("environment");

  if (!org || !project || !environment) {
    return null;
  }

  return {
    organizationId: org,
    projectId: project,
    environment: environment as "test" | "live",
  };
}

export function validateScopeEnvironment(env: string): boolean {
  return env === "test" || env === "live";
}

export function createScopeError(
  message: string,
  statusCode: number = 400
): Response {
  return new Response(
    JSON.stringify({
      error: "ScopeError",
      message,
      code: statusCode,
    }),
    {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    }
  );
}