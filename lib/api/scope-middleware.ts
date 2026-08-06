
/* global Response */

import { NextRequest } from "next/server";
import { Scope } from "@/lib/scope/types";
import { verifySessionToken } from "@/lib/auth/session";

export interface ScopeRequestContext {
  scope: Scope;
  userId: string;
}

export async function extractScopeFromRequest(
  request: NextRequest,
  sessionId: string | null | undefined = undefined
): Promise<Partial<Scope> | null> {
  const url = new URL(request.url);
  const org = url.searchParams.get("org");
  const project = url.searchParams.get("project");
  const environment = url.searchParams.get("environment");

  if (!org || !project || !environment) {
    return null;
  }

  // If session is provided, validate that requested org matches session org
  if (sessionId) {
    const session = await verifySessionToken(sessionId);
    if (!session || session.orgUuid !== org) {
      return null; // Silently reject scope mismatch
    }
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
