import React, { ReactNode } from "react";

export interface CheckoutShellProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
}

export function CheckoutShell({ children, currentStep, totalSteps }: CheckoutShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1 mx-1 ${
                    i < currentStep ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export interface CheckoutButtonProps {
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
}

export function CheckoutButton({ onClick, disabled, loading, children }: CheckoutButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg"
    >
      {loading ? "Processing..." : children}
    </button>
  );
}
