
"use client";

import React from "react";

interface ScopeSelectorProps {
  label: string;
  items: Array<{ id: string; name: string }>;
  selectedId?: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  placeholder?: string;
  testidPrefix: string;
}

export function ScopeSelector({
  label,
  items,
  selectedId,
  onChange,
  disabled = false,
  placeholder = "Select...",
  testidPrefix,
}: ScopeSelectorProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <select
        value={selectedId || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
        data-testid={`${testidPrefix}-selector`}
      >
        <option value="">{placeholder}</option>
        {items.map((item) => (
          <option key={item.id} value={item.id} data-testid={`${testidPrefix}-option-${item.id}`}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}

interface EnvironmentSelectorProps {
  selectedEnv?: string;
  onChange: (env: "test" | "live") => void;
  testidPrefix?: string;
}

export function EnvironmentSelector({
  selectedEnv = "test",
  onChange,
  testidPrefix = "environment",
}: EnvironmentSelectorProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Environment</label>
      <div className="flex gap-4">
        {["test", "live"].map((env) => (
          <label key={env} className="flex items-center gap-2">
            <input
              type="radio"
              name="environment"
              value={env}
              checked={selectedEnv === env}
              onChange={() => onChange(env as "test" | "live")}
              data-testid={`${testidPrefix}-option-${env}`}
            />
            <span className="text-sm capitalize">{env}</span>
          </label>
        ))}
      </div>
    </div>
  );
}