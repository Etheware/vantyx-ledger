-- Create checkout_sessions table
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id TEXT PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_key VARCHAR(255) NOT NULL,
  price_cents INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  stripe_session_id TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create billing_export_rows table
CREATE TABLE IF NOT EXISTS billing_export_rows (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invoice_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create view for billing analytics (fixed syntax)
CREATE OR REPLACE VIEW billing_analytics AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount
FROM billing_export_rows
GROUP BY DATE_TRUNC('day', created_at);
