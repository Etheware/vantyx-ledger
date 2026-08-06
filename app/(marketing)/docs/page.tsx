export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-200 sticky top-0 bg-white z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-slate-900">Vantyx Docs</div>
          <a href="/" className="text-slate-600 hover:text-slate-900">
            Back to Home
          </a>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-200 p-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm uppercase mb-2">
                Getting Started
              </h3>
              <ul className="space-y-1">
                <li>
                  <a href="#quickstart" className="text-slate-600 hover:text-slate-900 text-sm">
                    Quickstart
                  </a>
                </li>
                <li>
                  <a href="#authentication" className="text-slate-600 hover:text-slate-900 text-sm">
                    Authentication
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm uppercase mb-2">
                API Reference
              </h3>
              <ul className="space-y-1">
                <li>
                  <a href="#payments" className="text-slate-600 hover:text-slate-900 text-sm">
                    Payments
                  </a>
                </li>
                <li>
                  <a href="#payouts" className="text-slate-600 hover:text-slate-900 text-sm">
                    Payouts
                  </a>
                </li>
                <li>
                  <a href="#webhooks" className="text-slate-600 hover:text-slate-900 text-sm">
                    Webhooks
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm uppercase mb-2">
                SDKs
              </h3>
              <ul className="space-y-1">
                <li>
                  <a href="#nodejs" className="text-slate-600 hover:text-slate-900 text-sm">
                    Node.js
                  </a>
                </li>
                <li>
                  <a href="#python" className="text-slate-600 hover:text-slate-900 text-sm">
                    Python
                  </a>
                </li>
                <li>
                  <a href="#go" className="text-slate-600 hover:text-slate-900 text-sm">
                    Go
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl p-12">
          <section id="quickstart" className="mb-16">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Quickstart</h1>
            <p className="text-slate-600 mb-4">
              Get up and running with Vantyx in 5 minutes.
            </p>

            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">1. Get Your API Key</h3>
                <p className="text-slate-600 text-sm">
                  Navigate to Settings in your dashboard and copy your Live API Key.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">2. Install SDK</h3>
                <pre className="bg-slate-900 text-slate-50 p-4 rounded text-sm overflow-x-auto">
                  <code>npm install @vantyx/sdk</code>
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">3. Initialize Client</h3>
                <pre className="bg-slate-900 text-slate-50 p-4 rounded text-sm overflow-x-auto">
                  <code>{`const { Vantyx } = require("@vantyx/sdk");
const vantyx = new Vantyx({
  apiKey: "sk_live_...",
});`}</code>
                </pre>
              </div>
            </div>
          </section>

          <section id="authentication" className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication</h2>
            <p className="text-slate-600 mb-4">
              All API requests require authentication via your API key in the Authorization header.
            </p>
            <pre className="bg-slate-50 border border-slate-200 p-4 rounded text-sm overflow-x-auto">
              <code>Authorization: Bearer sk_live_...</code>
            </pre>
          </section>

          <section id="payments" className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Payments</h2>
            <p className="text-slate-600 mb-4">
              Create and manage payments via card, ACH, or bank connections.
            </p>

            <h3 className="font-semibold text-slate-900 mb-2">Create Payment</h3>
            <pre className="bg-slate-900 text-slate-50 p-4 rounded text-sm overflow-x-auto mb-4">
              <code>{`POST /api/payments/create
{
  "amount": 5000,
  "currency": "USD",
  "method": "card",
  "description": "Order #123"
}`}</code>
            </pre>

            <h3 className="font-semibold text-slate-900 mb-2">Response</h3>
            <pre className="bg-slate-900 text-slate-50 p-4 rounded text-sm overflow-x-auto">
              <code>{`{
  "paymentId": "pay_...",
  "amount": 5000,
  "status": "succeeded",
  "createdAt": "2026-08-05T..."
}`}</code>
            </pre>
          </section>

          <section id="payouts" className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Payouts</h2>
            <p className="text-slate-600 mb-4">
              Manage payouts to your connected Stripe account.
            </p>

            <h3 className="font-semibold text-slate-900 mb-2">Initiate Payout</h3>
            <pre className="bg-slate-900 text-slate-50 p-4 rounded text-sm overflow-x-auto mb-4">
              <code>{`POST /api/payouts/initiate
{
  "amount": 50000,
  "method": "bank_account"
}`}</code>
            </pre>
          </section>

          <section id="webhooks" className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Webhooks</h2>
            <p className="text-slate-600 mb-4">
              Receive real-time updates on payment and payout events.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-blue-900 mb-2">Webhook Events:</p>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>payment.succeeded</li>
                <li>payment.failed</li>
                <li>payout.paid</li>
                <li>payout.failed</li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
