# File: db/migrations/0003_auth_security.sql ===
# Type: new
# Size: 2347 bytes
# Session: d119a42e-9752-4533-95f8-aeec82eced46

CREATE TYPE "auth_challenge_purpose" AS ENUM ('email_otp', 'password_reset', 'backup_codes');

CREATE TABLE IF NOT EXISTS "auth_users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text NOT NULL,
  "password_hash" text,
  "email_verified_at" timestamptz,
  "last_login_at" timestamptz,
  "sso_provider" varchar(64),
  "two_factor_enabled" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "auth_users_email_idx" ON "auth_users" ("email");

CREATE TABLE IF NOT EXISTS "auth_challenges" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid REFERENCES "auth_users"("id") ON DELETE SET NULL,
  "email" text NOT NULL,
  "purpose" "auth_challenge_purpose" NOT NULL,
  "secret_hash" text NOT NULL,
  "delivery_target" text,
  "expires_at" timestamptz NOT NULL,
  "consumed_at" timestamptz,
  "attempts" integer NOT NULL DEFAULT 0,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "auth_challenges_email_purpose_idx" ON "auth_challenges" ("email", "purpose", "created_at");
CREATE INDEX IF NOT EXISTS "auth_challenges_user_purpose_idx" ON "auth_challenges" ("user_id", "purpose", "created_at");

CREATE TABLE IF NOT EXISTS "auth_backup_code_batches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "auth_users"("id") ON DELETE CASCADE,
  "label" varchar(120) NOT NULL DEFAULT 'default',
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "auth_backup_code_batches_user_idx" ON "auth_backup_code_batches" ("user_id", "created_at");

CREATE TABLE IF NOT EXISTS "auth_backup_codes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "batch_id" uuid NOT NULL REFERENCES "auth_backup_code_batches"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "auth_users"("id") ON DELETE CASCADE,
  "code_hash" text NOT NULL,
  "code_hint" varchar(32) NOT NULL,
  "used_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "auth_backup_codes_hash_idx" ON "auth_backup_codes" ("code_hash");
CREATE INDEX IF NOT EXISTS "auth_backup_codes_user_idx" ON "auth_backup_codes" ("user_id", "created_at");