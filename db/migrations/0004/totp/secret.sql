# File: db/migrations/0004_totp_secret.sql ===
# Type: new
# Size: 158 bytes
# Session: d119a42e-9752-4533-95f8-aeec82eced46

ALTER TABLE "auth_users"
  ADD COLUMN IF NOT EXISTS "two_factor_secret_encrypted" text,
  ADD COLUMN IF NOT EXISTS "two_factor_pending_secret_encrypted" text;