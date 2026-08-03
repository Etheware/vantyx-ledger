
import { NextRequest, NextResponse } from "next/server";
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
  }
): Promise<Response> {
  // Extract scope from URL
  const scope = extractScopeFromRequest(request);
  if (!scope || !scope.organizationId || !scope.projectId || !scope.environment) {
    return createScopeError(
      "Scope parameters required: org, project, environment",
      400
    );
  }

  // Validate environment
  if (scope.environment !== "test" && scope.environment !== "live") {
    return createScopeError("Invalid environment", 400);
  }

  // Extract user ID from request (would come from auth header or session)
  const userId = request.headers.get("x-user-id") || "";
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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