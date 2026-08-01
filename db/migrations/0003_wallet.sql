-- Create wallet_access_grants table
CREATE TABLE IF NOT EXISTS wallet_access_grants (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  withdrawal_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  access_status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for fast tenant lookups
CREATE INDEX wallet_access_grants_user_tenant_idx ON wallet_access_grants(user_id, tenant_id);
