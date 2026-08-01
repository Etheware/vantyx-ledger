import { getDatabase } from "vantyx-db";
import { and, eq } from "vantyx-db";
import { walletAccessGrants } from "vantyx-db/src/db/schema";

export interface WalletSession {
  userId: string;
  tenantId: string;
  email: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface WalletAccessGrant {
  userId: string;
  tenantId: string;
  role: string;
  withdrawalAllowed: boolean;
  accessStatus: string;
}

export async function getWalletAccessGrant(
  userId: string,
  tenantId: string
): Promise<WalletAccessGrant | null> {
  const db = getDatabase();
  const grant = await db
    .select()
    .from(walletAccessGrants)
    .where(
      and(
        eq(walletAccessGrants.userId, userId),
        eq(walletAccessGrants.tenantId, tenantId)
      )
    )
    .then(r => r[0]);

  if (!grant) {
    return {
      userId,
      tenantId,
      role: "viewer",
      withdrawalAllowed: false,
      accessStatus: "revoked",
    };
  }

  return {
    userId: grant.userId,
    tenantId: grant.tenantId,
    role: grant.role || "viewer",
    withdrawalAllowed: grant.withdrawalAllowed || false,
    accessStatus: grant.accessStatus || "active",
  };
}

export async function canWithdraw(session: WalletSession, grant: WalletAccessGrant): Promise<boolean> {
  const hasRequiredRole = ["owner", "admin", "billing"].includes(grant.role);

  return (
    session.emailVerified &&
    session.twoFactorEnabled &&
    grant.accessStatus === "active" &&
    grant.withdrawalAllowed &&
    hasRequiredRole
  );
}
