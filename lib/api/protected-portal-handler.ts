
import { NextRequest } from "next/server";
import { extractScopeFromRequest, createScopeError } from "./scope-middleware";

export interface ProtectedPortalRequest {
  request: NextRequest;
  scope: {
    organizationId: string;
    projectId: string;
    environment: "test" | "live";
  };
  userId: string;
}

export async function protectedPortalHandler(
  request: NextRequest,
  handler: (req: ProtectedPortalRequest) => Promise<Response>,
  options?: {
    validateOrganizationAccess?: (userId: string, orgId: string) => Promise<boolean>;
    validateProjectAccess?: (userId: string, orgId: string, projectId: string) => Promise<boolean>;
    resolveUserId?: (request: NextRequest) => Promise<string | null>;
    getSessionId?: (request: NextRequest) => string | null;
  }
): Promise<Response> {
  // Require a server-validated identity source before extracting scope
  const userId = options?.resolveUserId ? await options.resolveUserId(request) : null;
  if (!userId) {
    return createScopeError("Unauthorized", 401);
  }

  // Get session ID for scope validation
  const sessionId = options?.getSessionId ? options.getSessionId(request) : null;

  // Extract and validate scope against session
  const scope = await extractScopeFromRequest(request, sessionId);
  if (!scope || !scope.organizationId || !scope.projectId || !scope.environment) {
    return createScopeError(
      "Invalid or unauthorized scope parameters",
      403
    );
  }

  // Validate environment
  if (scope.environment !== "test" && scope.environment !== "live") {
    return createScopeError("Invalid environment", 400);
  }

  // Optionally validate organization access
  if (options?.validateOrganizationAccess) {
    const hasOrgAccess = await options.validateOrganizationAccess(
      userId,
      scope.organizationId
    );
    if (!hasOrgAccess) {
      return createScopeError("Access denied to this organization", 403);
    }
  }

  // Optionally validate project access
  if (options?.validateProjectAccess) {
    const hasProjectAccess = await options.validateProjectAccess(
      userId,
      scope.organizationId,
      scope.projectId
    );
    if (!hasProjectAccess) {
      return createScopeError("Project not found in this organization", 404);
    }
  }

  // Call handler with scope
  return handler({
    request,
    scope: scope as any,
    userId,
  });
}
