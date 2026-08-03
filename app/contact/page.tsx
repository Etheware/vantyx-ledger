
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, MessageCircle, Lock } from "lucide-react";
import { ContactForm } from "./contact-form";

export const metadata = {
  title: "Contact Us | Vantyx Ledger",
  description: "Get in touch with the Vantyx Ledger team. Support, sales, and partnerships.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#0a0e27_0%,#1a1f3a_100%)] text-white">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-[1200px] px-6 py-20">
          <h1 className="text-5xl font-bold tracking-tight">Get in Touch</h1>
          <p className="mt-4 max-w-2xl text-xl text-white/70">
            Have questions about Vantyx Ledger? Our team is here to help.
          </p>
        </div>
      </div>

      {/* Contact Options */}
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Support */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <Mail className="h-8 w-8 text-blue-400" />
            <h3 className="mt-4 text-xl font-semibold">Customer Support</h3>
            <p className="mt-2 text-white/70">
              Get help with your account, billing, or technical questions.
            </p>
            <a
              href="mailto:support@vantyxledger.com"
              className="mt-4 inline-flex items-center gap-2 text-blue-300 hover:text-blue-200"
            >
              support@vantyxledger.com →
            </a>
            <p className="mt-2 text-sm text-white/50">Response time: 2-4 hours</p>
          </div>

          {/* Sales */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <MessageCircle className="h-8 w-8 text-blue-400" />
            <h3 className="mt-4 text-xl font-semibold">Sales & Enterprise</h3>
            <p className="mt-2 text-white/70">
              Discuss pricing, volume discounts, and custom solutions.
            </p>
            <a
              href="mailto:sales@vantyxledger.com"
              className="mt-4 inline-flex items-center gap-2 text-blue-300 hover:text-blue-200"
            >
              sales@vantyxledger.com →
            </a>
            <p className="mt-2 text-sm text-white/50">Response time: 1 business day</p>
          </div>

          {/* Security */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <Lock className="h-8 w-8 text-blue-400" />
            <h3 className="mt-4 text-xl font-semibold">Security Report</h3>
            <p className="mt-2 text-white/70">
              Report security vulnerabilities responsibly.
            </p>
            <a
              href="mailto:security@vantyxledger.com"
              className="mt-4 inline-flex items-center gap-2 text-blue-300 hover:text-blue-200"
            >
              security@vantyxledger.com →
            </a>
            <p className="mt-2 text-sm text-white/50">Response time: 24 hours</p>
          </div>
        </div>
      </div>

      {/* Contact Form & Info */}
      <div className="border-y border-white/10 bg-white/5">
        <div className="mx-auto max-w-[1200px] px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Form */}
            <div>
              <h2 className="text-3xl font-bold">Send us a message</h2>
              <ContactForm />
            </div>

            {/* Info */}
            <div>
              <h2 className="text-3xl font-bold">Other ways to reach us</h2>
              <div className="mt-8 space-y-8">
                <div className="flex gap-4">
                  <Clock className="h-6 w-6 shrink-0 text-blue-400" />
                  <div>
                    <h3 className="font-semibold">Business Hours</h3>
                    <p className="mt-1 text-white/70">Monday – Friday, 8 AM – 6 PM EST</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <MapPin className="h-6 w-6 shrink-0 text-blue-400" />
                  <div>
                    <h3 className="font-semibold">Headquarters</h3>
                    <p className="mt-1 text-white/70">San Francisco, CA</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Phone className="h-6 w-6 shrink-0 text-blue-400" />
                  <div>
                    <h3 className="font-semibold">Phone Support</h3>
                    <p className="mt-1 text-white/70">+1 (555) 123-4567</p>
                    <p className="text-sm text-white/50">Mon-Fri, 9 AM – 5 PM PST</p>
                  </div>
                </div>

                <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-6">
                  <p className="text-white/70">
                    For account-specific issues, please sign in and use the in-app support feature for faster assistance.
                  </p>
                    <Link
                      href="/auth/login"
                      className="mt-4 inline-flex items-center gap-2 text-blue-300 hover:text-blue-200"
                    >
                      Go to Dashboard →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-[1200px] px-6 py-20">
        <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
        <div className="mt-12 space-y-6">
          <details className="group rounded-lg border border-white/10 bg-white/5 p-6">
            <summary className="flex cursor-pointer items-center justify-between font-semibold">
              What is Vantyx Ledger?
              <span className="transition group-open:rotate-180">↓</span>
            </summary>
            <p className="mt-4 text-white/70">
              Vantyx Ledger is a financial infrastructure platform for managing payments, invoices, subscriptions, and more.
            </p>
          </details>

          <details className="group rounded-lg border border-white/10 bg-white/5 p-6">
            <summary className="flex cursor-pointer items-center justify-between font-semibold">
              How do I get started?
              <span className="transition group-open:rotate-180">↓</span>
            </summary>
            <p className="mt-4 text-white/70">
              Sign up for a free account at vantyxledger.com. You'll have access to our full platform with a free tier to get started.
            </p>
          </details>

          <details className="group rounded-lg border border-white/10 bg-white/5 p-6">
            <summary className="flex cursor-pointer items-center justify-between font-semibold">
              Is there a free trial?
              <span className="transition group-open:rotate-180">↓</span>
            </summary>
            <p className="mt-4 text-white/70">
              Yes! Start for free with our developer tier. Upgrade to Pro or Enterprise when you're ready.
            </p>
          </details>

          <details className="group rounded-lg border border-white/10 bg-white/5 p-6">
            <summary className="flex cursor-pointer items-center justify-between font-semibold">
              Can I migrate from another provider?
              <span className="transition group-open:rotate-180">↓</span>
            </summary>
            <p className="mt-4 text-white/70">
              Absolutely. Contact our team for a custom migration plan. We'll help you move your data seamlessly.
            </p>
          </details>
        </div>
      </div>
    </main>
  );
}
