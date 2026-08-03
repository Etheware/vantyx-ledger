
import crypto from "crypto";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import {
  authBackupCodeBatches,
  authBackupCodes,
  authChallenges,
  authUsers,
  getDatabase,
} from "@/lib/db-compat";
import { buildProvisioningUri, decryptSecret, encryptSecret, generateTotpSecret, verifyTotpCode } from "./totp";

type UserAuthState = {
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  ssoProvider: string | null;
  twoFactorEnabled: boolean;
  twoFactorSecretEncrypted: string | null;
  twoFactorPendingSecretEncrypted: string | null;
};

type StoredChallenge = {
  id: string;
  userId: string;
  email: string;
  purpose: "email_otp" | "password_reset";
  secretHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  attempts: number;
};

type StoredBackupCode = {
  id: string;
  userId: string;
  codeHash: string;
  codeHint: string;
  usedAt: Date | null;
  batchId: string;
};

const userState = new Map<string, UserAuthState>();
const challenges = new Map<string, StoredChallenge>();
const backupCodes = new Map<string, StoredBackupCode>();
const backupCodeBatches = new Map<string, { id: string; userId: string; label: string }>();

function getUserState(userId: string): UserAuthState {
  const existing = userState.get(userId);
  if (existing) return existing;
  const created: UserAuthState = {
    emailVerifiedAt: null,
    lastLoginAt: null,
    ssoProvider: null,
    twoFactorEnabled: false,
    twoFactorSecretEncrypted: null,
    twoFactorPendingSecretEncrypted: null,
  };
  userState.set(userId, created);
  return created;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashValue(value: string) {
  const secret = process.env.SESSION_SECRET || "replace_with_session_secret";
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
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
  const db = getDatabase() as any;
  if (!db) throw new Error("Database unavailable");
  const normalizedEmail = normalizeEmail(email);
  const [created] = await db
    .insert(authUsers)
    .values({ email: normalizedEmail, passwordHash: hashPassword(crypto.randomUUID()) })
    .onConflictDoUpdate({
      target: authUsers.email,
      set: { email: normalizedEmail },
    })
    .returning();

  return created;
}

export async function markUserEmailVerified(email: string, ssoProvider?: string) {
  const user = await findOrCreateAuthUser(email);
  const state = getUserState(user.id);
  state.emailVerifiedAt = new Date();
  state.lastLoginAt = new Date();
  state.ssoProvider = ssoProvider ?? state.ssoProvider;
  return user;
}

export async function setUserPassword(email: string, password: string) {
  const db = getDatabase() as any;
  if (!db) throw new Error("Database unavailable");
  const user = await findOrCreateAuthUser(email);
  const [updated] = await db
    .update(authUsers)
    .set({ passwordHash: hashPassword(password) })
    .where(eq(authUsers.id, user.id))
    .returning();

  return updated;
}

export async function authenticateUser(email: string, password: string) {
  const db = getDatabase() as any;
  if (!db) return null;
  const normalizedEmail = normalizeEmail(email);
  const user = await db.query.authUsers.findFirst({
    where: eq(authUsers.email, normalizedEmail),
  });

  if (!user?.passwordHash || !verifyPasswordHash(password, user.passwordHash)) {
    return null;
  }

  getUserState(user.id).lastLoginAt = new Date();

  return user;
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
  const db = getDatabase() as any;
  if (!db) throw new Error("Database unavailable");
  const user = await findOrCreateAuthUser(email);
  const record: StoredChallenge = {
    id: crypto.randomUUID(),
    userId: user.id,
    email: normalizeEmail(email),
    purpose,
    secretHash: hashValue(secret),
    expiresAt,
    consumedAt: null,
    attempts: 0,
  };
  challenges.set(record.id, record);
  await db.insert(authChallenges).values({
    userId: user.id,
    code: hashValue(secret),
    type: purpose,
    expiresAt,
  });

  return record;
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
  const db = getDatabase() as any;
  if (!db) return null;
  const normalizedEmail = normalizeEmail(email);
  const record = [...challenges.values()]
    .filter((challenge) => challenge.email === normalizedEmail)
    .filter((challenge) => challenge.purpose === purpose)
    .filter((challenge) => challenge.consumedAt === null)
    .filter((challenge) => challenge.expiresAt > new Date())
    .sort((a, b) => b.expiresAt.getTime() - a.expiresAt.getTime())[0] ?? null;

  if (!record || record.attempts >= 5) {
    return null;
  }

  if (record.secretHash !== hashValue(secret)) {
    record.attempts += 1;
    return null;
  }

  record.consumedAt = new Date();
  record.attempts += 1;
  return record;
}

export async function createBackupCodesForUser(email: string) {
  const db = getDatabase() as any;
  if (!db) throw new Error("Database unavailable");
  const user = await findOrCreateAuthUser(email);
  const codes = Array.from({ length: 10 }, () => randomBackupCode());
  const batchId = crypto.randomUUID();

  backupCodeBatches.set(batchId, { id: batchId, userId: user.id, label: "dashboard-shell" });
  for (const existing of backupCodes.values()) {
    if (existing.userId === user.id && existing.usedAt === null) {
      existing.usedAt = new Date();
    }
  }
  for (const code of codes) {
    const id = crypto.randomUUID();
    backupCodes.set(id, {
      id,
      userId: user.id,
      codeHash: hashValue(code),
      codeHint: code.slice(-4),
      usedAt: null,
      batchId,
    });
  }

  // Enabling 2FA is a separate, deliberate step (see confirmTwoFactorEnrollment) —
  // generating backup codes alone must never flip twoFactorEnabled on its own.
  return { user, codes };
}

export async function consumeBackupCode(email: string, code: string) {
  const db = getDatabase() as any;
  if (!db) return false;
  const normalizedEmail = normalizeEmail(email);
  const user = await db.query.authUsers.findFirst({ where: eq(authUsers.email, normalizedEmail) });
  if (!user) return false;

  const codeHash = hashValue(code.trim().toUpperCase());
  const existing = [...backupCodes.values()].find((entry) => entry.userId === user.id && entry.codeHash === codeHash) ?? null;

  if (!existing || existing.usedAt) return false;
  existing.usedAt = new Date();
  return true;
}

export async function verifyBackupCode(email: string, code: string) {
  const db = getDatabase() as any;
  if (!db) return false;
  const normalizedEmail = normalizeEmail(email);
  const user = await db.query.authUsers.findFirst({ where: eq(authUsers.email, normalizedEmail) });
  if (!user) return false;

  const codeHash = hashValue(code.trim().toUpperCase());
  const existing = [...backupCodes.values()].find((entry) => entry.userId === user.id && entry.codeHash === codeHash) ?? null;

  return Boolean(existing && !existing.usedAt);
}

export async function beginTwoFactorEnrollment(email: string) {
  const db = getDatabase() as any;
  if (!db) throw new Error("Database unavailable");
  const user = await findOrCreateAuthUser(email);
  const secret = generateTotpSecret();
  getUserState(user.id).twoFactorPendingSecretEncrypted = encryptSecret(secret);

  await db
    .update(authUsers)
    .set({})
    .where(eq(authUsers.id, user.id));

  return { secret, otpauthUri: buildProvisioningUri(user.email, secret) };
}

export async function confirmTwoFactorEnrollment(email: string, code: string) {
  const db = getDatabase() as any;
  if (!db) return null;
  const normalizedEmail = normalizeEmail(email);
  const user = await db.query.authUsers.findFirst({ where: eq(authUsers.email, normalizedEmail) });

  const state = user ? getUserState(user.id) : null;
  if (!state?.twoFactorPendingSecretEncrypted) {
    return null;
  }

  const pendingSecret = decryptSecret(state.twoFactorPendingSecretEncrypted);
  if (!verifyTotpCode(pendingSecret, code)) {
    return null;
  }
  state.twoFactorEnabled = true;
  state.twoFactorSecretEncrypted = encryptSecret(pendingSecret);
  state.twoFactorPendingSecretEncrypted = null;

  await db
    .update(authUsers)
    .set({})
    .where(eq(authUsers.id, user.id));

  return await createBackupCodesForUser(user.email);
}

export async function verifyTotpForUser(email: string, code: string) {
  const db = getDatabase() as any;
  if (!db) return false;
  const normalizedEmail = normalizeEmail(email);
  const user = await db.query.authUsers.findFirst({ where: eq(authUsers.email, normalizedEmail) });
  const state = user ? getUserState(user.id) : null;
  if (!state?.twoFactorEnabled || !state.twoFactorSecretEncrypted) {
    return false;
  }

  const secret = decryptSecret(state.twoFactorSecretEncrypted);
  return verifyTotpCode(secret, code);
}

export async function hasActiveTwoFactor(email: string) {
  const db = getDatabase() as any;
  if (!db) return false;
  const normalizedEmail = normalizeEmail(email);
  const user = await db.query.authUsers.findFirst({ where: eq(authUsers.email, normalizedEmail) });
  const state = user ? getUserState(user.id) : null;
  return Boolean(state?.twoFactorEnabled && state.twoFactorSecretEncrypted);
}

export async function disableTwoFactor(email: string) {
  const db = getDatabase() as any;
  if (!db) return false;
  const normalizedEmail = normalizeEmail(email);
  const user = await db.query.authUsers.findFirst({ where: eq(authUsers.email, normalizedEmail) });
  if (!user) return false;
  const state = getUserState(user.id);
  state.twoFactorEnabled = false;
  state.twoFactorSecretEncrypted = null;
  state.twoFactorPendingSecretEncrypted = null;

  await db
    .update(authUsers)
    .set({})
    .where(eq(authUsers.id, user.id));

  return true;
}
