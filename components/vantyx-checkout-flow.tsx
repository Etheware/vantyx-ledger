import React, { ReactNode } from "react";
import Link from "next/link";

export interface CheckoutShellProps {
  children: ReactNode;
  currentStep?: number;
  totalSteps?: number;
  token?: string;
  step?: number;
  title?: string;
  subtitle?: string;
  summary?: ReactNode;
  footerLeft?: ReactNode;
  footerRight?: ReactNode;
}

export function CheckoutShell({
  children,
  currentStep,
  totalSteps,
  token,
  step,
  title,
  subtitle,
  summary,
  footerLeft,
  footerRight,
}: CheckoutShellProps) {
  const activeStep = step ?? currentStep ?? 1;
  const steps = totalSteps || 4;
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {Array.from({ length: steps }, (_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1 mx-1 ${
                    i < activeStep ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Step {activeStep} of {steps}
            </p>
          </div>
          {title ? <h1 className="mb-2 text-2xl font-semibold">{title}</h1> : null}
          {subtitle ? <p className="mb-6 text-sm text-gray-600">{subtitle}</p> : null}
          {summary ? <div className="mb-8">{summary}</div> : null}
          {children}
          {(footerLeft || footerRight) && (
            <div className="mt-8 flex items-center justify-between gap-4">
              <div>{footerLeft}</div>
              <div>{footerRight}</div>
            </div>
          )}
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
  href?: string;
  variant?: string;
}

export function CheckoutButton({ onClick, disabled, loading, children, href, variant }: CheckoutButtonProps) {
  const className =
    variant === "ghost"
      ? "w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg"
      : "w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg";

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? "Processing..." : children}
    </button>
  );
}
