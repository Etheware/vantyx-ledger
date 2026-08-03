import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getDatabase } from "vantyx-db";

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

export interface WalletSessionRecord {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export async function createSession(userId: string): Promise<WalletSessionRecord> {
  const db = getDatabase();
  const id = randomUUID();
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  await db.execute(sql`
    insert into sessions (id, user_id, token, expires_at)
    values (${id}, ${userId}, ${token}, ${expiresAt})
  ` as any);

  return { id, userId, token, expiresAt };
}

export async function getWalletAccessGrant(
  userId: string,
  tenantId: string
): Promise<WalletAccessGrant | null> {
  const db = getDatabase();
  const query = `select user_id, tenant_id, role, withdrawal_allowed, access_status
    from wallet_access_grants
    where user_id = $1 and tenant_id = $2
    limit 1`;
  const result = await (db as any).execute(query, [userId, tenantId]);
  const grant = result?.rows?.[0] ?? result?.[0];

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