
import Link from "next/link";

export const metadata = {
  title: "Legal | Vantyx Ledger",
  description: "Privacy Policy, Terms of Service, and legal information for Vantyx Ledger.",
};

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#0a0e27_0%,#1a1f3a_100%)] text-white">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-[1200px] px-6 py-20">
          <h1 className="text-5xl font-bold tracking-tight">Legal</h1>
          <p className="mt-4 max-w-2xl text-xl text-white/70">
            Privacy, terms, and legal policies for Vantyx Ledger.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-white/10 bg-white/5">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="flex flex-wrap gap-8 py-6">
            <a href="#privacy" className="text-blue-300 hover:text-blue-200">
              Privacy Policy
            </a>
            <a href="#terms" className="text-blue-300 hover:text-blue-200">
              Terms of Service
            </a>
            <a href="#cookies" className="text-blue-300 hover:text-blue-200">
              Cookie Policy
            </a>
            <a href="#dpa" className="text-blue-300 hover:text-blue-200">
              Data Processing
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[900px] px-6 py-20">
        {/* Privacy Policy */}
        <section id="privacy" className="mb-20 scroll-mt-8">
          <h2 className="text-3xl font-bold">Privacy Policy</h2>
          <div className="mt-8 space-y-6 text-white/70">
            <p>
              <strong className="text-white">Last Updated: July 2026</strong>
            </p>

            <div>
              <h3 className="text-xl font-semibold text-white">1. Introduction</h3>
              <p className="mt-3">
                Vantyx Ledger ("we", "us", "our", or "Company") operates the vantyxledger.com website and related services. This Privacy Policy explains our practices regarding the collection, use, and protection of your information.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">2. Information We Collect</h3>
              <p className="mt-3">We collect information you provide directly, including:</p>
              <ul className="mt-2 space-y-2 pl-6">
                <li className="list-disc">Account information (name, email, password)</li>
                <li className="list-disc">Payment and billing information</li>
                <li className="list-disc">Transaction data</li>
                <li className="list-disc">Communications with our support team</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">3. How We Use Your Information</h3>
              <p className="mt-3">We use collected information to:</p>
              <ul className="mt-2 space-y-2 pl-6">
                <li className="list-disc">Provide and maintain our services</li>
                <li className="list-disc">Process transactions and billing</li>
                <li className="list-disc">Send transactional and promotional communications</li>
                <li className="list-disc">Improve our services</li>
                <li className="list-disc">Comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">4. Data Protection & Security</h3>
              <p className="mt-3">
                We implement industry-standard security measures including encryption, access controls, and regular security audits. However, no transmission over the internet is completely secure.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">5. Your Rights</h3>
              <p className="mt-3">Depending on your location, you may have the right to:</p>
              <ul className="mt-2 space-y-2 pl-6">
                <li className="list-disc">Access your personal data</li>
                <li className="list-disc">Correct inaccurate data</li>
                <li className="list-disc">Request data deletion</li>
                <li className="list-disc">Opt-out of marketing communications</li>
                <li className="list-disc">Data portability</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">6. Retention</h3>
              <p className="mt-3">
                We retain personal data for as long as necessary to provide our services and comply with legal obligations. Financial records are retained per applicable law.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">7. Third-Party Services</h3>
              <p className="mt-3">
                We may share data with third-party service providers (payment processors, cloud hosting) who are contractually obligated to protect your information.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">8. GDPR Compliance</h3>
              <p className="mt-3">
                For EU residents: We comply with GDPR. Our legal basis for processing is either contractual necessity or legitimate business interests. You can contact our DPO at dpo@vantyxledger.com.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">9. Contact Us</h3>
              <p className="mt-3">
                For privacy questions, contact us at privacy@vantyxledger.com or through our{" "}
                <Link href="/contact" className="text-blue-300 hover:text-blue-200">
                  contact form
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Terms of Service */}
        <section id="terms" className="mb-20 scroll-mt-8">
          <h2 className="text-3xl font-bold">Terms of Service</h2>
          <div className="mt-8 space-y-6 text-white/70">
            <p>
              <strong className="text-white">Last Updated: July 2026</strong>
            </p>

            <div>
              <h3 className="text-xl font-semibold text-white">1. Acceptance of Terms</h3>
              <p className="mt-3">
                By accessing and using Vantyx Ledger, you accept and agree to be bound by these Terms of Service. If you do not agree, you must stop using our services.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">2. Use License</h3>
              <p className="mt-3">
                We grant you a limited, non-exclusive, non-transferable license to use our services for your personal or business purposes, subject to these Terms.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">3. Prohibited Activities</h3>
              <p className="mt-3">You agree not to:</p>
              <ul className="mt-2 space-y-2 pl-6">
                <li className="list-disc">Violate any laws or regulations</li>
                <li className="list-disc">Infringe on intellectual property rights</li>
                <li className="list-disc">Engage in fraudulent or deceptive practices</li>
                <li className="list-disc">Attempt to gain unauthorized system access</li>
                <li className="list-disc">Interfere with service availability</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">4. Limitation of Liability</h3>
              <p className="mt-3">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, VANTYX LEDGER IS PROVIDED "AS IS" AND WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED. WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">5. Indemnification</h3>
              <p className="mt-3">
                You agree to indemnify and hold harmless Vantyx Ledger from any claims arising from your use of our services or breach of these Terms.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">6. Modifications</h3>
              <p className="mt-3">
                We reserve the right to modify these Terms at any time. Continued use of our services constitutes acceptance of modified Terms.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">7. Termination</h3>
              <p className="mt-3">
                We may terminate or suspend your account immediately for any violation of these Terms or for any reason at our sole discretion.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">8. Governing Law</h3>
              <p className="mt-3">
                These Terms are governed by and construed in accordance with the laws of California, without regard to conflicts of law.
              </p>
            </div>
          </div>
        </section>

        {/* Cookie Policy */}
        <section id="cookies" className="mb-20 scroll-mt-8">
          <h2 className="text-3xl font-bold">Cookie Policy</h2>
          <div className="mt-8 space-y-6 text-white/70">
            <p>
              We use cookies to enhance your experience. Cookies are small files stored on your device. You can control cookie settings through your browser.
            </p>
            <div>
              <h3 className="text-xl font-semibold text-white">Types of Cookies We Use:</h3>
              <ul className="mt-3 space-y-2 pl-6">
                <li className="list-disc">
                  <strong className="text-white">Essential:</strong> Required for basic functionality
                </li>
                <li className="list-disc">
                  <strong className="text-white">Analytics:</strong> Help us understand usage patterns
                </li>
                <li className="list-disc">
                  <strong className="text-white">Preference:</strong> Remember your settings
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Processing */}
        <section id="dpa" className="mb-20 scroll-mt-8">
          <h2 className="text-3xl font-bold">Data Processing Agreement</h2>
          <div className="mt-8 space-y-6 text-white/70">
            <p>
              For customers subject to GDPR or similar regulations, we offer a Data Processing Agreement (DPA). The DPA is automatically executed upon account creation and governs our processing of personal data on your behalf.
            </p>
            <p>
              If you need a signed DPA, please contact us at dpo@vantyxledger.com and we will provide one within 5 business days.
            </p>
          </div>
        </section>

        {/* Support */}
        <div className="mt-20 rounded-lg border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-white/70">
            Have questions about our legal policies? Contact us at{" "}
            <a href="mailto:legal@vantyxledger.com" className="text-blue-300 hover:text-blue-200">
              legal@vantyxledger.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
