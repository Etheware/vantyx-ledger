
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useScope } from "@/lib/scope/use-scope";
import { ScopeSelector, EnvironmentSelector } from "./scope-selector";
import { Scope } from "@/lib/scope/types";

export function ScopeSwitcher() {
  const router = useRouter();
  const { currentScope, setScope, userOrganizations, userProjects, isLoading, error } =
    useScope();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(currentScope?.organizationId || "");
  const [selectedProject, setSelectedProject] = useState(currentScope?.projectId || "");
  const [selectedEnv, setSelectedEnv] = useState<"test" | "live">(
    currentScope?.environment || "test"
  );
  const [isSaving, setIsSaving] = useState(false);

  const orgProjects = userProjects.filter((p) => p.organizationId === selectedOrg);

  const handleConfirm = async () => {
    if (!selectedOrg || !selectedProject) {
      return;
    }

    try {
      setIsSaving(true);

      const org = userOrganizations.find((o) => o.id === selectedOrg);
      const proj = userProjects.find((p) => p.id === selectedProject);

      if (!org || !proj) {
        throw new Error("Invalid selection");
      }

      const newScope: Scope = {
        organizationId: org.id,
        organizationSlug: org.slug,
        organizationName: org.name,
        projectId: proj.id,
        projectSlug: proj.slug,
        projectName: proj.name,
        environment: selectedEnv,
      };

      await setScope(newScope);
      setIsOpen(false);

      const params = new URLSearchParams();
      params.set("org", newScope.organizationId);
      params.set("project", newScope.projectId);
      params.set("environment", newScope.environment);
      router.replace(`/portal/dashboard?${params.toString()}`);
    } catch (err) {
      console.error("Failed to switch scope:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!currentScope) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        data-testid="scope-switcher-trigger"
      >
        <span>🏢</span>
        <span data-testid="scope-org-display" data-org-id={currentScope.organizationId}>
          {currentScope.organizationName}
        </span>
        <span className="text-gray-500">›</span>
        <span
          data-testid="scope-project-display"
          data-project-id={currentScope.projectId}
        >
          {currentScope.projectName}
        </span>
        <span className="text-gray-500">›</span>
        <span data-testid="scope-environment-display">
          {currentScope.environment}
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute z-50 top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-4 w-64"
          data-testid="scope-switcher-menu"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error.message}
            </div>
          )}

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

          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={!selectedOrg || !selectedProject || isSaving}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
              data-testid="scope-confirm-button"
            >
              {isSaving ? "Saving..." : "Confirm"}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}