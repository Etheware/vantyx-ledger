import { getWalletBalance, getTransactions } from "@/lib/wallet-service";
import { getWalletAccessGrant } from "@/lib/auth";
import { WalletShell } from "@/components/wallet-shell";

export default async function OverviewPage() {
  const session = {
    userId: "user_123",
    tenantId: "tenant_456",
    email: "user@example.com",
    emailVerified: true,
    twoFactorEnabled: true,
  };

  try {
    const balance = await getWalletBalance(session.tenantId, session.userId);
    const transactions = await getTransactions(session.tenantId, session.userId, 10);

    return (
      <WalletShell>
        <div className="grid gap-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Available Balance</p>
              <p className="text-2xl font-bold">${balance.available.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Lifetime Earnings</p>
              <p className="text-2xl font-bold">${balance.lifetimeEarnings.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Total Withdrawn</p>
              <p className="text-2xl font-bold">${balance.lifetimeWithdrawals.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
            {transactions.length === 0 ? (
              <p className="text-gray-500">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx: any) => (
                  <div key={tx.id} className="flex justify-between items-center border-b pb-4">
                    <div>
                      <p className="font-medium">{tx.type}</p>
                      <p className="text-gray-600 text-sm">{tx.reference}</p>
                    </div>
                    <p className="font-bold">${tx.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </WalletShell>
    );
  } catch (error) {
    return (
      <WalletShell>
        <div className="bg-red-50 p-6 rounded-lg">
          <p className="text-red-700">Error loading wallet data</p>
        </div>
      </WalletShell>
    );
  }
}
