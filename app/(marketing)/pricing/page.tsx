export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-slate-900">Vantyx Pricing</div>
          <a href="/" className="text-slate-600 hover:text-slate-900">
            Back to Home
          </a>
        </div>
      </nav>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-900 mb-4">
              Pricing Built for Growth
            </h1>
            <p className="text-xl text-slate-600">
              Transparent pricing with no hidden fees. Scale as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: "Starter",
                price: "$0",
                description: "For founders and early-stage",
                features: [
                  "Up to $10k/month volume",
                  "2.9% + $0.30 per transaction",
                  "Email support",
                  "Basic analytics",
                  "1 team member",
                  "Test mode access",
                ],
                cta: "Start Free",
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
                  "Up to 10 team members",
                  "Custom webhooks",
                  "API rate limit: 10k/min",
                ],
                cta: "Get Started",
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For high-volume platforms",
                features: [
                  "Custom pricing",
                  "Custom processing fees",
                  "Dedicated support",
                  "SLA guarantee (99.99%)",
                  "Unlimited team members",
                  "White-label options",
                  "Custom integrations",
                ],
                cta: "Contact Sales",
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`rounded-xl border p-10 ${
                  plan.highlighted
                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600 transform scale-105"
                    : "border-slate-200 bg-white"
                }`}
              >
                {plan.highlighted && (
                  <div className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-slate-600 text-sm mt-1">{plan.description}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-slate-900">{plan.price}</span>
                  {plan.period && (
                    <span className="text-slate-600">{plan.period}</span>
                  )}
                </div>

                <button
                  className={`w-full mt-6 py-3 rounded-lg font-semibold transition ${
                    plan.highlighted
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border border-slate-300 text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {plan.cta}
                </button>

                <div className="border-t border-slate-200 mt-8 pt-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex gap-3 text-sm text-slate-700">
                        <span className="text-blue-600 font-bold">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              Detailed Comparison
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-left font-semibold text-slate-900">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-900">
                      Starter
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-900">
                      Growth
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-900">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Payment Methods", "3", "20+", "Unlimited"],
                    ["Transaction Volume Limit", "$10k/mo", "Unlimited", "Unlimited"],
                    ["API Rate Limit", "100/min", "10k/min", "Custom"],
                    ["Team Members", "1", "10", "Unlimited"],
                    ["Custom Integration Support", "—", "—", "✓"],
                    ["White-label Options", "—", "—", "✓"],
                    ["Dedicated Account Manager", "—", "—", "✓"],
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-900 font-medium">{row[0]}</td>
                      <td className="px-6 py-4 text-center text-slate-600">{row[1]}</td>
                      <td className="px-6 py-4 text-center text-slate-600">{row[2]}</td>
                      <td className="px-6 py-4 text-center text-slate-600">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              {[
                {
                  q: "Can I change plans anytime?",
                  a: "Yes, you can upgrade or downgrade anytime. Changes take effect immediately.",
                },
                {
                  q: "Are there any setup fees?",
                  a: "No. Vantyx has no setup, monthly, or hidden fees. You only pay when you process payments.",
                },
                {
                  q: "Do you offer discounts for annual billing?",
                  a: "Yes. Prepay annually and save 20% on your subscription.",
                },
                {
                  q: "What payment methods are supported?",
                  a: "We support cards, ACH transfers, bank connections, and cryptocurrency.",
                },
              ].map((faq, i) => (
                <div key={i} className="border-b border-slate-200 pb-6 last:border-0">
                  <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-slate-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
