
"use client";

import React from "react";
import Link from "next/link";
import { useScope } from "@/lib/scope/use-scope";

interface ScopeBreadcrumbsProps {
  currentPageName?: string;
}

export function ScopeBreadcrumbs({ currentPageName }: ScopeBreadcrumbsProps) {
  const { currentScope } = useScope();

  if (!currentScope) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600" data-testid="breadcrumbs">
      <Link
        href="/portal/dashboard"
        className="hover:text-gray-900"
        data-testid="breadcrumb-org"
        data-org-id={currentScope.organizationId}
      >
        {currentScope.organizationName}
      </Link>

      <span className="text-gray-400">/</span>

      <Link
        href="/portal/dashboard"
        className="hover:text-gray-900"
        data-testid="breadcrumb-project"
        data-project-id={currentScope.projectId}
      >
        {currentScope.projectName}
      </Link>

      <span className="text-gray-400">/</span>

      <span className="text-gray-900 font-medium" data-testid="breadcrumb-env">
        {currentScope.environment}
      </span>

      {currentPageName && (
        <>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{currentPageName}</span>
        </>
      )}
    </nav>
  );
}