
export type BillingInvoice = {
  id: string;
  date: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
  description: string;
};

export type PaymentMethod = {
  id: string;
  brand: string;
  label: string;
  expires: string;
  badge?: string;
};

export const workspaceOptions = ["Acme Corporation", "Nexora Holdings", "Orion Labs"];

export const billingInvoices: BillingInvoice[] = [
  { id: "INV-2025-0017", date: "May 1, 2025", amount: "$99.00", status: "Paid", description: "Professional Plan - Monthly" },
  { id: "INV-2025-0016", date: "Apr 1, 2025", amount: "$99.00", status: "Paid", description: "Professional Plan - Monthly" },
  { id: "INV-2025-0015", date: "Mar 1, 2025", amount: "$99.00", status: "Paid", description: "Professional Plan - Monthly" },
  { id: "INV-2025-0014", date: "Feb 1, 2025", amount: "$99.00", status: "Paid", description: "Professional Plan - Monthly" },
  { id: "INV-2025-0013", date: "Jan 1, 2025", amount: "$99.00", status: "Paid", description: "Professional Plan - Monthly" },
  { id: "INV-2024-0012", date: "Dec 1, 2024", amount: "$99.00", status: "Paid", description: "Professional Plan - Monthly" },
];

export const paymentMethods: PaymentMethod[] = [
  { id: "visa-4242", brand: "Visa", label: "Visa ending in 4242", expires: "04 / 2028", badge: "Default" },
  { id: "mc-5555", brand: "Mastercard", label: "Mastercard ending in 5555", expires: "03 / 2027" },
  { id: "amex-1005", brand: "American Express ending in 1005", label: "American Express ending in 1005", expires: "07 / 2026" },
];

export const bankAccounts = [
  { id: "chase-6789", name: "Chase Business Checking", last4: "6789", badge: "Business checking" },
  { id: "wells-1234", name: "Wells Fargo Business Checking", last4: "1234", badge: "Business checking" },
];

export const billingActivity = [
  ["May 1, 2025", "Payment - INV-2025-0017", "$99.00", "Paid"],
  ["Apr 26, 2025", "Subscription renewed - Professional Plan", "$99.00", "Paid"],
  ["Apr 12, 2025", "Payment - INV-2025-0015", "$99.00", "Paid"],
  ["Mar 26, 2025", "Subscription renewed - Professional Plan", "$99.00", "Paid"],
  ["Mar 1, 2025", "Payment - INV-2025-0013", "$99.00", "Paid"],
] as const;

export const subscriptionPlans = [
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    description: "Essential tools for individuals getting started.",
    features: ["Up to 1 user", "5 invoices / month", "Basic reporting", "Email support", "Standard integrations"],
    cta: "Choose plan",
  },
  {
    id: "professional",
    name: "Professional",
    price: "$99",
    description: "Advanced features for growing businesses.",
    features: ["Up to 5 users", "50 invoices / month", "Advanced reporting", "Priority support", "Custom integrations", "API access"],
    cta: "Current plan",
    current: true,
  },
  {
    id: "business",
    name: "Business",
    price: "$199",
    description: "Powerful tools for scaling organizations.",
    features: ["Up to 20 users", "200 invoices / month", "Advanced analytics", "Priority support", "Custom integrations", "API access", "Role-based permissions", "Audit logs"],
    cta: "Choose plan",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    description: "Tailored solutions for large enterprises.",
    features: ["Unlimited users", "Unlimited invoices", "Advanced analytics", "Dedicated support", "Custom integrations", "API access", "SSO & SAML", "Custom compliance"],
    cta: "Contact sales",
  },
];

export function getInvoiceById(id: string) {
  return billingInvoices.find((invoice) => invoice.id === id) ?? billingInvoices[0];
}

export function getPaymentMethodById(id: string) {
  return paymentMethods.find((method) => method.id === id) ?? paymentMethods[0];
}

export type PortalLicense = {
  id: string;
  licenseKey: string;
  productName: string;
  purchaserEmail: string;
  status: "active" | "pending" | "expired" | "revoked";
  billingModel: "one_time" | "subscription";
  activatedAt: string;
  expiresAt: string | null;
};

export const portalLicenses: PortalLicense[] = [
  { id: "lic-0001", licenseKey: "VL-9F2K-7QWX-1DME", productName: "Professional Plan - Simulator Access", purchaserEmail: "james@acme.test", status: "active", billingModel: "subscription", activatedAt: "May 1, 2025", expiresAt: null },
  { id: "lic-0002", licenseKey: "VL-3H8P-2LRT-9BXA", productName: "Exam Prep Bundle", purchaserEmail: "morgan@acme.test", status: "active", billingModel: "one_time", activatedAt: "Apr 18, 2025", expiresAt: "Apr 18, 2026" },
  { id: "lic-0003", licenseKey: "VL-6D1N-4KYV-5CPZ", productName: "Team Seat - Compliance Track", purchaserEmail: "priya@acme.test", status: "pending", billingModel: "subscription", activatedAt: "May 20, 2025", expiresAt: null },
  { id: "lic-0004", licenseKey: "VL-1A9M-8WQE-3TFL", productName: "Exam Prep Bundle", purchaserEmail: "diego@acme.test", status: "expired", billingModel: "one_time", activatedAt: "Jan 4, 2024", expiresAt: "Jan 4, 2025" },
  { id: "lic-0005", licenseKey: "VL-7Q4X-0ZDN-6VJH", productName: "Team Seat - Compliance Track", purchaserEmail: "lena@acme.test", status: "revoked", billingModel: "subscription", activatedAt: "Nov 2, 2024", expiresAt: null },
];

export type PortalTransaction = {
  id: string;
  provider: "plaid" | "stripe";
  paymentRail: "bank_transfer" | "card";
  status: "settled" | "processing" | "failed" | "refunded";
  amount: string;
  processedAt: string;
};

export const portalTransactions: PortalTransaction[] = [
  { id: "txn-8841", provider: "plaid", paymentRail: "bank_transfer", status: "settled", amount: "$99.00", processedAt: "May 1, 2025" },
  { id: "txn-8790", provider: "plaid", paymentRail: "bank_transfer", status: "settled", amount: "$99.00", processedAt: "Apr 1, 2025" },
  { id: "txn-8712", provider: "stripe", paymentRail: "card", status: "processing", amount: "$249.00", processedAt: "Mar 22, 2025" },
  { id: "txn-8654", provider: "plaid", paymentRail: "bank_transfer", status: "settled", amount: "$99.00", processedAt: "Mar 1, 2025" },
  { id: "txn-8599", provider: "stripe", paymentRail: "card", status: "refunded", amount: "$249.00", processedAt: "Feb 14, 2025" },
  { id: "txn-8542", provider: "plaid", paymentRail: "bank_transfer", status: "failed", amount: "$99.00", processedAt: "Feb 1, 2025" },
];