
import crypto from "crypto";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import {
  authBackupCodeBatches,
  authBackupCodes,
  authChallenges,
  authUsers,
  getDatabase,
} from "vantyx-db";
import { buildProvisioningUri, decryptSecret, encryptSecret, generateTotpSecret, verifyTotpCode } from "./totp";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPasswordHash(password: string, value: string) {
  const [salt, stored] = value.split(":");
  if (!salt || !stored) {
    return false;
  }

  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  const expected = Buffer.from(stored, "hex");
  const actual = Buffer.from(derived, "hex");
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function randomBackupCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const makeChunk = () =>
    Array.from({ length: 4 }, () => alphabet[crypto.randomInt(0, alphabet.length)]).join("");
  return `${makeChunk()}-${makeChunk()}-${makeChunk()}`;
}

export async function findOrCreateAuthUser(email: string) {
  const db = getDatabase();
  const normalizedEmail = normalizeEmail(email);
  const existing = await db.query.authUsers.findFirst({
    where: eq(authUsers.email, normalizedEmail),
  });

  if (existing) {
    return existing;
  }

  const [created] = await db.insert(authUsers).values({ email: normalizedEmail }).returning();
  return created;
}

export async function markUserEmailVerified(email: string, ssoProvider?: string) {
  const db = getDatabase();
  const user = await findOrCreateAuthUser(email);
  const [updated] = await db
    .update(authUsers)
    .set({
      emailVerifiedAt: new Date(),
      lastLoginAt: new Date(),
      ssoProvider: ssoProvider ?? user.ssoProvider,
      updatedAt: new Date(),
    })
    .where(eq(authUsers.id, user.id))
    .returning();

  return updated;
}

export async function setUserPassword(email: string, password: string) {
  const db = getDatabase();
  const user = await findOrCreateAuthUser(email);
  const [updated] = await db
    .update(authUsers)
    .set({
      passwordHash: hashPassword(password),
      updatedAt: new Date(),
    })
    .where(eq(authUsers.id, user.id))
    .returning();

  return updated;
}

export async function authenticateUser(email: string, password: string) {
  const db = getDatabase();
  const normalizedEmail = normalizeEmail(email);
  const user = await db.query.authUsers.findFirst({
    where: eq(authUsers.email, normalizedEmail),
  });

  if (!user?.passwordHash || !verifyPasswordHash(password, user.passwordHash)) {
    return null;
  }

  const [updated] = await db
    .update(authUsers)
    .set({
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(authUsers.id, user.id))
    .returning();

  return updated;
}

export async function createStoredAuthChallenge({
  email,
  purpose,
  secret,
  expiresAt,
  metadata = {},
}: {
  email: string;
  purpose: "email_otp" | "password_reset";
  secret: string;
  expiresAt: Date;
  metadata?: Record<string, unknown>;
}) {
  const db = getDatabase();
  const user = await findOrCreateAuthUser(email);
  const [created] = await db
    .insert(authChallenges)
    .values({
      userId: user.id,
      email: normalizeEmail(email),
      purpose,
      secretHash: hashValue(secret),
      expiresAt,
      metadata,
    })
    .returning();

  return created;
}

export async function consumeStoredAuthChallenge({
  email,
  purpose,
  secret,
}: {
  email: string;
  purpose: "email_otp" | "password_reset";
  secret: string;
}) {
  const db = getDatabase();
  const normalizedEmail = normalizeEmail(email);
  const record = await db.query.authChallenges.findFirst({
    where: and(
      eq(authChallenges.email, normalizedEmail),
      eq(authChallenges.purpose, purpose),
      isNull(authChallenges.consumedAt),
      gt(authChallenges.expiresAt, new Date()),
    ),
    orderBy: [desc(authChallenges.createdAt)],
  });

  if (!record || record.secretHash !== hashValue(secret)) {
    return null;
  }

  const [updated] = await db
    .update(authChallenges)
    .set({
      consumedAt: new Date(),
      attempts: sql`${authChallenges.attempts} + 1`,
    })
    .where(eq(authChallenges.id, record.id))
    .returning();

  return updated;
}

export async function createBackupCodesForUser(email: string) {
  const db = getDatabase();
  const user = await findOrCreateAuthUser(email);
  const [batch] = await db
    .insert(authBackupCodeBatches)
    .values({
      userId: user.id,
      label: "dashboard-shell",
    })
    .returning();

  const codes = Array.from({ length: 10 }, () => randomBackupCode());
  await db.insert(authBackupCodes).values(
    codes.map((code) => ({
      batchId: batch.id,
      userId: user.id,
      codeHash: hashValue(code),
      codeHint: code.slice(-4),
    })),
  );

  // Enabling 2FA is a separate, deliberate step (see confirmTwoFactorEnrollment) —
  // generating backup codes alone must never flip twoFactorEnabled on its own.
  return { user, codes };
}

export async function consumeBackupCode(email: string, code: string) {
  const db = getDatabase();
  const normalizedEmail = normalizeEmail(email);
  const user = await db.query.authUsers.findFirst({ where: eq(authUsers.email, normalizedEmail) });
  if (!user) return false;

  const codeHash = hashValue(code.trim().toUpperCase());
  const existing = await db.query.authBackupCodes.findFirst({
    where: and(eq(authBackupCodes.userId, user.id), eq(authBackupCodes.codeHash, codeHash)),
  });

  if (!existing || existing.usedAt) return false;

  await db
    .update(authBackupCodes)
    .set({ usedAt: new Date() })
    .where(eq(authBackupCodes.id, existing.id));

  return true;
}

export async function beginTwoFactorEnrollment(email: string) {
  const db = getDatabase();
  const user = await findOrCreateAuthUser(email);
  const secret = generateTotpSecret();

  await db
    .update(authUsers)
    .set({ twoFactorPendingSecretEncrypted: encryptSecret(secret), updatedAt: new Date() })
    .where(eq(authUsers.id, user.id));

  return { secret, otpauthUri: buildProvisioningUri(user.email, secret) };
}

export async function confirmTwoFactorEnrollment(email: string, code: string) {
  const db = getDatabase();
  const normalizedEmail = normalizeEmail(email);
  const user = await db.query.authUsers.findFirst({ where: eq(authUsers.email, normalizedEmail) });

  if (!user?.twoFactorPendingSecretEncrypted) {
    return null;
  }

  const pendingSecret = decryptSecret(user.twoFactorPendingSecretEncrypted);
  if (!verifyTotpCode(pendingSecret, code)) {
    return null;
  }

  await db
    .update(authUsers)
    .set({
      twoFactorEnabled: true,
      twoFactorSecretEncrypted: encryptSecret(pendingSecret),
      twoFactorPendingSecretEncrypted: null,
      updatedAt: new Date(),
    })
    .where(eq(authUsers.id, user.id));

  return await createBackupCodesForUser(user.email);
}

export async function verifyTotpForUser(email: string, code: string) {
  const db = getDatabase();
  const normalizedEmail = normalizeEmail(email);
  const user = await db.query.authUsers.findFirst({ where: eq(authUsers.email, normalizedEmail) });

  if (!user?.twoFactorEnabled || !user.twoFactorSecretEncrypted) {
    return false;
  }

  const secret = decryptSecret(user.twoFactorSecretEncrypted);
  return verifyTotpCode(secret, code);
}

export async function hasActiveTwoFactor(email: string) {
  const db = getDatabase();
  const normalizedEmail = normalizeEmail(email);
  const user = await db.query.authUsers.findFirst({ where: eq(authUsers.email, normalizedEmail) });
  return Boolean(user?.twoFactorEnabled && user.twoFactorSecretEncrypted);
}

export async function disableTwoFactor(email: string) {
  const db = getDatabase();
  const normalizedEmail = normalizeEmail(email);
  const user = await db.query.authUsers.findFirst({ where: eq(authUsers.email, normalizedEmail) });
  if (!user) return false;

  await db
    .update(authUsers)
    .set({
      twoFactorEnabled: false,
      twoFactorSecretEncrypted: null,
      twoFactorPendingSecretEncrypted: null,
      updatedAt: new Date(),
    })
    .where(eq(authUsers.id, user.id));

  return true;
}