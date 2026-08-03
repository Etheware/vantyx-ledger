
export interface Organization {
  id: string;
  slug: string;
  name: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  organizationId: string;
  slug: string;
  name: string;
  createdAt: Date;
}

export interface Scope {
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  projectId: string;
  projectSlug: string;
  projectName: string;
  environment: "test" | "live";
}

export interface ScopeContextType {
  currentScope: Scope | null;
  setScope: (scope: Scope) => Promise<void>;
  userOrganizations: Organization[];
  userProjects: Project[];
  isLoading: boolean;
  error: Error | null;
  hasAccess: (scope: Scope) => boolean;
  clearScope: () => void;
}

export interface ScopeValidationResult {
  valid: boolean;
  error?: string;
  details?: {
    organizationValid: boolean;
    projectValid: boolean;
    environmentValid: boolean;
  };
}