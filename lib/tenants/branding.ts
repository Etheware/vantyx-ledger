export interface TenantBranding {
  clientId: string;
  clientName: string;
  publicName: string;
  logoUrl: string;
  brandColor: string;
  supportEmail: string;
  supportUrl: string;
  ownedDomains: string[];
  displayCopy: Record<string, string>;
  receiptCopy: Record<string, string>;
  claimCopy: Record<string, string>;
  onboardingCopy: Record<string, string>;
  invoiceFooter: string;
  returnUrls: {
    successUrl: string;
    cancelUrl: string;
    claimUrl?: string;
    billingUrl?: string;
    learningUrl?: string;
  };
}

export const TENANT_BRANDING: Record<string, TenantBranding> = {
  bep: {
    clientId: "bep",
    clientName: "Backflow Exam Prep",
    publicName: "Backflow Exam Prep",
    logoUrl: "/logos/bep-logo.png",
    brandColor: "#0066cc",
    supportEmail: "support@backflowexamprep.com",
    supportUrl: "https://backflowexamprep.com/support",
    ownedDomains: ["backflowexamprep.com"],
    displayCopy: {
      checkoutHeading: "Complete Your Purchase",
      checkoutDescription: "Get instant access to Backflow Exam Prep",
      productName: "Backflow Exam Prep License",
      claimButton: "Activate License",
    },
    receiptCopy: {
      heading: "Your Backflow Exam Prep License",
      thankYou: "Thank you for your purchase!",
      accessInstructions: "Your license is now active. Sign in to get started.",
    },
    claimCopy: {
      heading: "Claim Your Backflow Exam Prep License",
      instruction: "Enter your email to activate your license",
    },
    onboardingCopy: {
      welcome: "Welcome to Backflow Exam Prep",
      getStarted: "Get started with your learning journey",
    },
    invoiceFooter: "Backflow Exam Prep © 2026. All rights reserved.",
    returnUrls: {
      successUrl: "https://backflowexamprep.com/checkout/success",
      cancelUrl: "https://backflowexamprep.com/checkout/cancel",
      claimUrl: "https://backflowexamprep.com/claim",
      billingUrl: "https://backflowexamprep.com/billing",
      learningUrl: "https://backflowexamprep.com/learning-center",
    },
  },
};

export function getClientBranding(clientId: string): TenantBranding {
  return TENANT_BRANDING[clientId] || TENANT_BRANDING.bep;
}
