// Jest setup file
// Add any global test setup here

// Mock environment variables for tests
process.env.SESSION_SECRET = "test-session-secret-change-me";
process.env.VAULT_MASTER_KEY = "0".repeat(64);
process.env.STRIPE_SECRET_KEY = "sk_test_mock";
process.env.STRIPE_CONNECT_CLIENT_ID = "ca_test_mock";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_mock";
process.env.NODE_ENV = "test";
