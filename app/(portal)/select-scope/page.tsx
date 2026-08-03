
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useScope } from "@/lib/scope/use-scope";
import { ScopeSelector, EnvironmentSelector } from "@/components/portal/scope-selector";
import { Scope } from "@/lib/scope/types";

export default function SelectScopePage() {
  const router = useRouter();
  const { setScope, userOrganizations, userProjects } = useScope();

  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedEnv, setSelectedEnv] = useState<"test" | "live">("test");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const orgProjects = userProjects.filter((p) => p.organizationId === selectedOrg);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrg || !selectedProject) {
      setError("Please select an organization and project");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const org = userOrganizations.find((o) => o.id === selectedOrg);
      const proj = userProjects.find((p) => p.id === selectedProject);

      if (!org || !proj) {
        throw new Error("Invalid selection");
      }

      const scope: Scope = {
        organizationId: org.id,
        organizationSlug: org.slug,
        organizationName: org.name,
        projectId: proj.id,
        projectSlug: proj.slug,
        projectName: proj.name,
        environment: selectedEnv,
      };

      await setScope(scope);
      router.push("/portal/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select scope");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Select Your Workspace</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <ScopeSelector
            label="Organization"
            items={userOrganizations}
            selectedId={selectedOrg}
            onChange={setSelectedOrg}
            placeholder="Select organization..."
            testidPrefix="org"
          />

          <ScopeSelector
            label="Project"
            items={orgProjects}
            selectedId={selectedProject}
            onChange={setSelectedProject}
            placeholder="Select project..."
            testidPrefix="project"
            disabled={!selectedOrg}
          />

          <EnvironmentSelector
            selectedEnv={selectedEnv}
            onChange={setSelectedEnv}
            testidPrefix="environment"
          />

          <button
            type="submit"
            disabled={!selectedOrg || !selectedProject || isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors font-medium"
            data-testid="scope-confirm-button"
          >
            {isLoading ? "Loading..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}