export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-slate-900">Vantyx</div>
          <div className="flex gap-8">
            <a href="#features" className="text-slate-600 hover:text-slate-900">
              Features
            </a>
            <a href="#pricing" className="text-slate-600 hover:text-slate-900">
              Pricing
            </a>
            <a href="/docs" className="text-slate-600 hover:text-slate-900">
              Docs
            </a>
            <a href="/login" className="text-slate-600 hover:text-slate-900">
              Login
            </a>
            <a href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold text-slate-900 leading-tight">
            Modern Payment<br />Infrastructure for<br />Your Business
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Accept payments worldwide, manage payouts seamlessly, and grow your revenue with Vantyx Ledger.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Start Free Trial
            </button>
            <button className="px-8 py-3 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 font-medium">
              Schedule Demo
            </button>
          </div>
        </div>

        <div className="mt-20 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-12 border border-blue-100">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">99.9%</div>
              <p className="text-slate-600 mt-2">Uptime SLA</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">150+</div>
              <p className="text-slate-600 mt-2">Payment Methods</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">$10B+</div>
              <p className="text-slate-600 mt-2">Processed Annually</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-slate-600 mt-4">
              Powerful features designed for modern businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "💳",
                title: "Multi-Rail Payments",
                description:
                  "Accept cards, ACH transfers, bank connections, and crypto payments",
              },
              {
                icon: "💰",
                title: "Instant Payouts",
                description: "Send funds to your account within 24 hours via Stripe Connect",
              },
              {
                icon: "📊",
                title: "Advanced Analytics",
                description:
                  "Real-time dashboards with MRR, ARR, churn tracking, and insights",
              },
              {
                icon: "🔒",
                title: "Enterprise Security",
                description:
                  "PCI DSS Level 1 compliance, encryption, and fraud detection",
              },
              {
                icon: "👥",
                title: "Team Management",
                description:
                  "Role-based access control with audit logs and activity tracking",
              },
              {
                icon: "🔌",
                title: "Native Integrations",
                description: "Webhooks, APIs, SDKs for Node, Python, Go, and more",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-lg transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900">Simple, Transparent Pricing</h2>
            <p className="text-xl text-slate-600 mt-4">
              No hidden fees. Pay only for what you use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "$0",
                description: "Perfect for testing",
                features: [
                  "Up to $10k/month volume",
                  "2.9% + $0.30 per transaction",
                  "Email support",
                  "Basic analytics",
                ],
              },
              {
                name: "Growth",
                price: "$99",
                period: "/month",
                description: "For growing businesses",
                features: [
                  "Unlimited volume",
                  "2.5% + $0.30 per transaction",
                  "Priority support",
                  "Advanced analytics",
                  "Custom integrations",
                ],
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large teams",
                features: [
                  "Custom pricing",
                  "Custom processing fees",
                  "Dedicated support",
                  "SLA guarantee",
                  "White-label options",
                ],
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`rounded-lg border p-8 ${
                  plan.highlighted
                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600"
                    : "border-slate-200 bg-white"
                }`}
              >
                <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-slate-600 text-sm mt-2">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-slate-600">{plan.period}</span>
                  )}
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex gap-2 text-sm text-slate-700">
                      <span className="text-blue-600">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full mt-8 py-2 rounded-lg font-medium transition ${
                    plan.highlighted
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border border-slate-300 text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-4xl font-bold">Ready to get started?</h2>
          <p className="text-xl opacity-90">
            Join thousands of businesses processing payments with Vantyx
          </p>
          <button className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-slate-50 font-medium">
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Developers</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">API Docs</a></li>
                <li><a href="#" className="hover:text-white">SDKs</a></li>
                <li><a href="#" className="hover:text-white">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-sm text-center">
            <p>&copy; 2026 Vantyx. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
