
import Link from "next/link";
import { CheckCircle2, Lock, Eye, AlertCircle, Shield, Zap } from "lucide-react";

export const metadata = {
  title: "Security & Compliance | Vantyx Ledger",
  description: "Enterprise-grade security and compliance certifications for Vantyx Ledger.",
};

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#0a0e27_0%,#1a1f3a_100%)] text-white">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-[1200px] px-6 py-20">
          <h1 className="text-5xl font-bold tracking-tight">Security & Compliance</h1>
          <p className="mt-4 max-w-2xl text-xl text-white/70">
            Enterprise-grade security protecting your financial data with industry-leading compliance standards.
          </p>
        </div>
      </div>

      {/* Security Principles */}
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <Lock className="h-8 w-8 text-blue-400" />
            <h3 className="mt-4 text-xl font-semibold">Data Encryption</h3>
            <p className="mt-2 text-white/70">
              256-bit AES encryption in transit and at rest. TLS 1.3 for all network communication.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <Eye className="h-8 w-8 text-blue-400" />
            <h3 className="mt-4 text-xl font-semibold">Audit Logging</h3>
            <p className="mt-2 text-white/70">
              Comprehensive audit trails for all operations. Tamper-proof logs retained for 7 years.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <Shield className="h-8 w-8 text-blue-400" />
            <h3 className="mt-4 text-xl font-semibold">Multi-Tenant Isolation</h3>
            <p className="mt-2 text-white/70">
              Complete data isolation between organizations. Row-level security on all tables.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <AlertCircle className="h-8 w-8 text-blue-400" />
            <h3 className="mt-4 text-xl font-semibold">Incident Response</h3>
            <p className="mt-2 text-white/70">
              24/7 security monitoring. Rapid incident response procedures. Annual penetration testing.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <Zap className="h-8 w-8 text-blue-400" />
            <h3 className="mt-4 text-xl font-semibold">Threat Detection</h3>
            <p className="mt-2 text-white/70">
              Real-time anomaly detection. Rate limiting and bot protection. DDoS mitigation.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <CheckCircle2 className="h-8 w-8 text-blue-400" />
            <h3 className="mt-4 text-xl font-semibold">Regular Updates</h3>
            <p className="mt-2 text-white/70">
              Security patches deployed within 48 hours. Automated dependency scanning.
            </p>
          </div>
        </div>
      </div>

      {/* Compliance Certifications */}
      <div className="border-y border-white/10 bg-white/5">
        <div className="mx-auto max-w-[1200px] px-6 py-20">
          <h2 className="text-3xl font-bold">Compliance Certifications</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
              <div>
                <h3 className="font-semibold">SOC 2 Type II</h3>
                <p className="mt-1 text-white/70">
                  Independent audits confirming security, availability, and confidentiality controls.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
              <div>
                <h3 className="font-semibold">GDPR Compliant</h3>
                <p className="mt-1 text-white/70">
                  Full compliance with EU data protection regulations. Data residency options available.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
              <div>
                <h3 className="font-semibold">PCI DSS Level 1</h3>
                <p className="mt-1 text-white/70">
                  Highest level of payment card industry compliance. Annual verification.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
              <div>
                <h3 className="font-semibold">HIPAA Ready</h3>
                <p className="mt-1 text-white/70">
                  Healthcare data handling capabilities with business associate agreements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Data Protection */}
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <h2 className="text-3xl font-bold">Privacy & Data Protection</h2>
        <div className="mt-8 space-y-6 text-white/70">
          <p>
            We take privacy seriously. Your data belongs to you, and we implement strict policies to protect it:
          </p>
          <ul className="space-y-3 pl-6">
            <li className="list-disc">We limit data sharing to service providers that help us operate payments, hosting, and support</li>
            <li className="list-disc">You maintain full ownership and control of your data</li>
            <li className="list-disc">Data deletion requests are processed within 30 days</li>
            <li className="list-disc">Encrypted backups stored in geographically distributed locations</li>
            <li className="list-disc">Disaster recovery tested quarterly</li>
          </ul>
        </div>
      </div>

      {/* Contact Security Team */}
      <div className="border-t border-white/10 bg-gradient-to-b from-white/5 to-white/0">
        <div className="mx-auto max-w-[1200px] px-6 py-20 text-center">
          <h2 className="text-3xl font-bold">Security Concerns?</h2>
          <p className="mt-4 text-white/70">
            Report security vulnerabilities responsibly to our security team.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="mailto:security@vantyxledger.com"
              className="inline-flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/10 px-6 py-3 font-semibold text-blue-300 transition hover:bg-blue-500/20"
            >
              security@vantyxledger.com
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
