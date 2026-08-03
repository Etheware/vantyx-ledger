/**
 * Vantyx Checkout Embed Script
 *
 * Tenant embeds this script on their page to use Vantyx checkout:
 *   <script src="https://checkout.vantyxledger.com/embed.js"></script>
 *   <script>
 *     window.VantyxCheckout.mount('#checkout-container', {
 *       tenantSlug: 'acme-corp',
 *       checkoutId: 'chk_xyz',
 *       primaryColor: '#FF6B35',
 *       onSuccess: (result) => { ... }
 *     });
 *   </script>
 *
 * Integration modes:
 * - Mode 1: Hosted (redirect to checkout.vantyxledger.com)
 * - Mode 2: Embedded iframe (mount in container)
 * - Mode 3: Modal (full-screen overlay)
 * - Mode 4: Headless (custom UI + Vantyx API)
 */

(function () {
  "use strict";

  // Global Vantyx namespace
  if (!window.VantyxCheckout) {
    window.VantyxCheckout = {};
  }

  const VantyxCheckout = window.VantyxCheckout;

  /**
   * Configuration
   */
  const config = {
    baseUrl: "https://checkout.vantyxledger.com",
    apiUrl: "https://api.vantyxledger.com",
  };

  /**
   * Mode 1: Hosted Checkout (redirect)
   *
   * window.VantyxCheckout.redirect({
   *   tenantSlug: 'acme-corp',
   *   checkoutId: 'chk_xyz',
   *   returnUrl: 'https://acme.com/success'
   * })
   */
  VantyxCheckout.redirect = function (options) {
    if (!options.tenantSlug || !options.checkoutId) {
      console.error("VantyxCheckout.redirect requires tenantSlug and checkoutId");
      return;
    }

    const url = new URL(`${config.baseUrl}/checkout`);
    url.searchParams.set("tenant", options.tenantSlug);
    url.searchParams.set("checkoutId", options.checkoutId);
    if (options.returnUrl) {
      url.searchParams.set("returnUrl", options.returnUrl);
    }

    window.location.href = url.toString();
  };

  /**
   * Mode 2: Embedded Checkout (iframe in container)
   *
   * window.VantyxCheckout.mount('#checkout-container', {
   *   tenantSlug: 'acme-corp',
   *   checkoutId: 'chk_xyz',
   *   primaryColor: '#FF6B35',
   *   onSuccess: (result) => { ... }
   * })
   */
  VantyxCheckout.mount = function (selector, options) {
    if (!options.tenantSlug || !options.checkoutId) {
      console.error("VantyxCheckout.mount requires tenantSlug and checkoutId");
      return;
    }

    const container = document.querySelector(selector);
    if (!container) {
      console.error(`VantyxCheckout.mount: Container not found: ${selector}`);
      return;
    }

    // Inject white-label CSS
    injectTheme(options);

    // Create iframe
    const iframe = document.createElement("iframe");
    const checkoutUrl = new URL(`${config.baseUrl}/embedded`);
    checkoutUrl.searchParams.set("tenant", options.tenantSlug);
    checkoutUrl.searchParams.set("checkoutId", options.checkoutId);

    iframe.src = checkoutUrl.toString();
    iframe.style.width = "100%";
    iframe.style.height = "600px";
    iframe.style.border = "none";
    iframe.style.borderRadius = "8px";
    iframe.setAttribute("title", "Vantyx Checkout");

    container.appendChild(iframe);

    // postMessage communication for cross-origin
    function handleMessage(event) {
      if (event.origin !== config.baseUrl || event.source !== iframe.contentWindow) return;

      if (event.data.type === "VANTYX_CHECKOUT_SUCCESS") {
        if (options.onSuccess) {
          options.onSuccess(event.data.payload);
        }
      } else if (event.data.type === "VANTYX_CHECKOUT_ERROR") {
        if (options.onError) {
          options.onError(event.data.payload);
        }
      }
    }

    window.addEventListener("message", handleMessage);
  };

  /**
   * Mode 3: Modal Checkout (full-screen overlay)
   *
   * window.VantyxCheckout.openModal({
   *   tenantSlug: 'acme-corp',
   *   checkoutId: 'chk_xyz',
   *   onSuccess: (result) => { ... }
   * })
   */
  VantyxCheckout.openModal = function (options) {
    if (!options.tenantSlug || !options.checkoutId) {
      console.error("VantyxCheckout.openModal requires tenantSlug and checkoutId");
      return;
    }

    if (document.getElementById("vantyx-checkout-backdrop")) {
      return;
    }

    // Inject white-label CSS
    injectTheme(options);

    // Create modal backdrop
    const backdrop = document.createElement("div");
    backdrop.id = "vantyx-checkout-backdrop";
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      animation: fadeIn 200ms ease-out;
    `;

    // Create modal container
    const modal = document.createElement("div");
    modal.style.cssText = `
      background: var(--color-bg-surface-raised);
      border: 1px solid var(--color-border-default);
      border-radius: 8px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.7);
      animation: slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1);
    `;

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.style.cssText = `
      position: absolute;
      top: 16px;
      right: 16px;
      width: 32px;
      height: 32px;
      border: 1px solid var(--color-border-default);
      background: var(--color-bg-surface);
      color: var(--color-text-secondary);
      border-radius: 6px;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 150ms;
      z-index: 100000;
    `;
    function cleanup(cancelled) {
      document.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("message", handleMessage);
      backdrop.remove();
      if (cancelled && options.onCancel) options.onCancel();
    }
    closeBtn.addEventListener("click", () => cleanup(true));
    modal.appendChild(closeBtn);

    // Create iframe inside modal
    const iframe = document.createElement("iframe");
    const checkoutUrl = new URL(`${config.baseUrl}/modal`);
    checkoutUrl.searchParams.set("tenant", options.tenantSlug);
    checkoutUrl.searchParams.set("checkoutId", options.checkoutId);

    iframe.src = checkoutUrl.toString();
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.setAttribute("title", "Vantyx Checkout");

    modal.appendChild(iframe);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Close on escape key
    function handleKeydown(e) {
      if (e.key === "Escape") {
        cleanup(true);
      }
    }
    document.addEventListener("keydown", handleKeydown);

    // postMessage for success/error
    function handleMessage(event) {
      if (event.origin !== config.baseUrl || event.source !== iframe.contentWindow) return;

      if (event.data.type === "VANTYX_CHECKOUT_SUCCESS") {
        cleanup(false);
        if (options.onSuccess) {
          options.onSuccess(event.data.payload);
        }
      }
    }
    window.addEventListener("message", handleMessage);
  };

  /**
   * Helper: Inject white-label theme CSS
   */
  function injectTheme(options) {
    if (document.getElementById("vantyx-checkout-theme")) {
      return; // Already injected
    }

    const style = document.createElement("style");
    style.id = "vantyx-checkout-theme";
    const primaryColor = escapeCssValue(options.primaryColor || "#3B82F6");
    const primaryColorHover = escapeCssValue(options.primaryColorHover || "#2563EB");

    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(24px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      :root {
        --tenant-logo-url: ${options.logoUrl ? `url("${escapeCssValue(options.logoUrl)}")` : "none"};
        --tenant-logo-dark-url: ${options.logoDarkUrl ? `url("${escapeCssValue(options.logoDarkUrl)}")` : "none"};
        --tenant-color-primary: ${primaryColor};
        --tenant-color-primary-hover: ${primaryColorHover};
        --tenant-company-name: "${escapeCssValue(options.companyName || "Vantyx Ledger")}";
      }

      .vantyx-checkout-button-primary {
        background-color: var(--tenant-color-primary) !important;
      }

      .vantyx-checkout-button-primary:hover {
        background-color: var(--tenant-color-primary-hover) !important;
      }

      .vantyx-checkout-header-logo {
        background-image: var(--tenant-logo-url);
      }
    `;

    document.head.appendChild(style);
  }

  function escapeCssValue(value) {
    return String(value).replace(/[\\\\"'`;{}]/g, "\\$&");
  }

  /**
   * Expose config for debugging
   */
  VantyxCheckout.config = config;
  VantyxCheckout.version = "1.0.0";
})();
