
/**
 * Checkout Configuration System
 *
 * Tenants customize Vantyx checkout via CSS variables and configuration.
 * This system manages the white-label theming boundaries (customizable vs. fixed).
 */

export interface CheckoutConfig {
  // Required
  tenantSlug: string;
  checkoutId: string;

  // Optional: Branding (customizable by tenant)
  logoUrl?: string;
  logoDarkUrl?: string;
  primaryColor?: string;
  primaryColorHover?: string;
  companyName?: string;

  // Callbacks
  onSuccess?: (result: CheckoutSuccessResult) => void;
  onCancel?: () => void;
  onError?: (error: CheckoutError) => void;
}

export interface CheckoutSuccessResult {
  checkoutId: string;
  transactionId: string;
  receiptUrl: string;
  amount: number;
  currency: string;
}

export interface CheckoutError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Inject CSS variables into the document for white-label customization
 */
export function injectCheckoutTheme(config: CheckoutConfig): void {
  const style = document.createElement("style");
  const primaryColor = config.primaryColor || "#3B82F6";
  const primaryColorHover = config.primaryColorHover || "#2563EB";

  style.textContent = `
    :root {
      --tenant-logo-url: ${config.logoUrl ? `url("${config.logoUrl}")` : "none"};
      --tenant-logo-dark-url: ${config.logoDarkUrl ? `url("${config.logoDarkUrl}")` : "none"};
      --tenant-color-primary: ${primaryColor};
      --tenant-color-primary-hover: ${primaryColorHover};
      --tenant-company-name: "${config.companyName || "Vantyx Ledger"}";
    }

    /* White-label customization (safe overrides) */
    .vantyx-checkout-header-logo {
      background-image: var(--tenant-logo-url);
    }

    .vantyx-checkout-button-primary {
      background-color: var(--tenant-color-primary, var(--color-accent-base));
    }

    .vantyx-checkout-button-primary:hover {
      background-color: var(--tenant-color-primary-hover, var(--color-accent-hover));
    }
  `;

  document.head.appendChild(style);
}

/**
 * Parse checkout config from HTML data attributes or window object
 */
export function getCheckoutConfigFromWindow(): CheckoutConfig | null {
  // Priority 1: window.VantyxCheckoutConfig (set by tenant script)
  if (typeof window !== "undefined" && (window as any).VantyxCheckoutConfig) {
    return (window as any).VantyxCheckoutConfig;
  }

  // Priority 2: data attributes on mount element
  const mountEl = document.getElementById("vantyx-checkout");
  if (mountEl) {
    const dataset = mountEl.dataset;
    if (dataset.tenantSlug && dataset.checkoutId) {
      return {
        tenantSlug: dataset.tenantSlug,
        checkoutId: dataset.checkoutId,
        logoUrl: dataset.logoUrl,
        logoDarkUrl: dataset.logoDarkUrl,
        primaryColor: dataset.primaryColor,
        primaryColorHover: dataset.primaryColorHover,
        companyName: dataset.companyName,
      };
    }
  }

  return null;
}

/**
 * Validate checkout configuration
 */
export function validateCheckoutConfig(config: CheckoutConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.tenantSlug) {
    errors.push("tenantSlug is required");
  }

  if (!config.checkoutId) {
    errors.push("checkoutId is required");
  }

  if (config.primaryColor && !isValidHexColor(config.primaryColor)) {
    errors.push("primaryColor must be a valid hex color");
  }

  if (config.primaryColorHover && !isValidHexColor(config.primaryColorHover)) {
    errors.push("primaryColorHover must be a valid hex color");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}