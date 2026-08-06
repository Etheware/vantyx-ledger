# Vantyx Ledger Deployment Guide

## Overview

Vantyx Ledger is a multi-tenant financial infrastructure SaaS platform built with Next.js, featuring double-entry ledger accounting, multi-rail payment processing, and comprehensive billing lifecycle management.

## Architecture

### Core Infrastructure
- **Application Servers**: CT522 (Vantyx only)
- **Database**: CT502 (PostgreSQL + PgBouncer)
- **Cache**: CT512 (Redis)
- **Authentication**: Server-side opaque session tokens (HttpOnly cookies)
- **Payments**: Stripe (card/ACH), Plaid (bank connections), Solana (USDC), Manual methods

### Key Components
1. **Authentication**: Email OTP, TOTP 2FA, session management
2. **Multi-Tenant Isolation**: Org → Project → Environment scope hierarchy
3. **Double-Entry Ledger**: Immutable journal entries with balanced accounts
4. **Billing Engine**: Subscriptions, invoices, usage metering, analytics
5. **License Management**: Issue, activate, suspend, revoke with entitlements
6. **Payout System**: Stripe Connect OAuth, transfer orchestration, webhook handlers
7. **Merchant Portal**: Dashboard, settings, payment methods, team management
8. **Public API**: v1 REST endpoints with Bearer token auth

## Environment Setup

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@ct502:5432/vantyx_ledger

# Session Management
SESSION_SECRET=<64-char-hex-string>

# Encryption
VAULT_MASTER_KEY=<64-char-hex-string>

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_CONNECT_CLIENT_ID=ca_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Plaid
PLAID_CLIENT_ID=...
PLAID_SECRET=...

# Email
RESEND_API_KEY=re_...

# Solana
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com

# Application
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.vantyx.io
```

## Deployment Checklist

### Pre-Deployment
- [ ] Run `npm run build` (verify 0 TypeScript errors)
- [ ] Run `npm test` (verify 47 tests pass)
- [ ] Run `npm run lint` (verify no ESLint violations)
- [ ] Run `npm run type-check` (strict type checking)
- [ ] Environment variables configured in `.env.production`
- [ ] Database migrations applied
- [ ] Stripe webhook endpoint registered

### Deployment Steps

#### 1. Database Migration
```bash
npm run migrate:latest
```

Ensures all schema changes (licenses, entitlements, connect accounts, payouts, transfers) are applied.

#### 2. Build Verification
```bash
npm run build
# Verifies:
# - ✓ Compiled successfully in X.Xs
# - ✓ Generating static pages using 9 workers (49/49)
# - 49 routes verified
# - 0 build errors
```

#### 3. Secrets Provisioning
```bash
# Provision to environment (e.g., Vercel)
vercel env add SESSION_SECRET
vercel env add VAULT_MASTER_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_CONNECT_CLIENT_ID
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add RESEND_API_KEY
```

#### 4. Health Check
```bash
# Verify application health endpoints
curl https://api.vantyx.io/health
# Expected response: { "ok": true, "timestamp": "2026-08-06T..." }
```

#### 5. Smoke Tests
```bash
# Test critical paths
npm run test:integration
# - Authentication (email OTP → session token)
# - Payment creation (card, ACH, Solana)
# - Payout initiation (balance validation, Stripe Connect)
# - License activation (seat limit checks)
```

## Security Hardening

### Authentication
- **Session Tokens**: Opaque, server-side revocable via Redis
- **2FA**: TOTP with QR code enrollment + backup codes
- **Password Hashing**: bcryptjs with 12-round salt cost
- **Email Verification**: HMAC-SHA256 signed tokens

### Authorization
- **Tenant Isolation**: All queries filtered by `tenantId`
- **Role-Based Access**: owner/admin/billing/member/viewer
- **Capability Matrix**: Resolved from role + org billing status

### API Security
- **Bearer Token Auth**: API key in Authorization header
- **Idempotency**: X-Idempotency-Key support via UUID
- **Webhook Verification**: Stripe v1 signature with timing-safe comparison
- **Rate Limiting**: TBD per endpoint

### Data Protection
- **Encryption at Rest**: TOTP secrets encrypted with AES-256-GCM
- **Encryption in Transit**: TLS 1.2+ enforced
- **PCI Compliance**: Level 1 via Stripe (no card data stored)

## Monitoring & Observability

### Key Metrics
- Request latency (p50, p95, p99)
- Error rate by endpoint
- Database query performance
- Webhook success rate
- Session creation/revocation rate
- Payment processing success rate
- Payout completion time

### Log Aggregation
- Application logs: stderr/stdout
- Database logs: PostgreSQL query logs
- Webhook audit trail: event_id, timestamp, status, payload_hash

### Alerting
- Deployment failure
- Database connection pool exhaustion
- Webhook processing failures (> 5% error rate)
- Authentication failures (> 10 failed attempts / minute)
- Payment processing errors (> 1% failure rate)

## Rollback Procedure

### Recent Deployment Rollback
1. Identify last known good commit: `git log --oneline | head -5`
2. Revert deployment: `git revert <commit-sha>`
3. Rebuild and redeploy: `npm run build && vercel deploy --prod`
4. Verify health check: `curl https://api.vantyx.io/health`

### Database Rollback
1. Backup current state: `pg_dump -Fc vantyx_ledger > backup.sql`
2. Apply previous migration: `npm run migrate:down`
3. Verify application compatibility

## Performance Optimization

### Caching Strategy
- **Redis**: Session storage, rate limit counters
- **CDN**: Static assets, marketing pages
- **Database**: Query result caching (TBD)

### Database Optimization
- Connection pooling via PgBouncer
- Prepared statement caching
- Index optimization on high-volume queries
- Vacuum/analyze schedule

### API Response Times
- Payment creation: < 500ms
- Payout initiation: < 300ms
- List endpoints: < 200ms (with pagination)

## Incident Response

### Payment Processing Down
1. Check Stripe status: https://status.stripe.com
2. Verify webhook endpoint health: `GET /api/webhooks/stripe/payouts`
3. Review error logs: `tail -f /var/log/vantyx/api.log`
4. Escalate to Stripe support if needed

### Database Performance Degradation
1. Check active connections: `SELECT count(*) FROM pg_stat_activity`
2. Identify slow queries: `SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10`
3. Restart PgBouncer if needed: `systemctl restart pgbouncer`

### Authentication Failures
1. Verify SESSION_SECRET is correctly configured
2. Check Redis connectivity: `redis-cli ping`
3. Review session expiration: Default 7 days, configurable per org

## Rollout Strategy

### Blue-Green Deployment
1. Deploy to blue environment (staging)
2. Run full test suite + smoke tests
3. Switch traffic to blue
4. Green environment available for quick rollback

### Canary Deployment
1. Deploy to 10% of traffic
2. Monitor error rate and latency for 30 minutes
3. Gradual increase to 100% over 2 hours
4. Full rollout or rollback based on metrics

## Disaster Recovery

### RTO/RPO Targets
- **RTO** (Recovery Time Objective): 4 hours
- **RPO** (Recovery Point Objective): 1 hour

### Backup Strategy
- Daily full database backups to S3
- Hourly WAL archiving
- Point-in-time recovery to any timestamp within 7 days

### Recovery Steps
1. Restore database from backup: `pg_restore -d vantyx_ledger backup.sql`
2. Verify data integrity: `SELECT count(*) FROM ledger_entries`
3. Restart application servers
4. Verify all payment reconciliation

## Maintenance Windows

### Scheduled Maintenance
- Database maintenance: Sundays 2-4 AM UTC (low-traffic window)
- Dependency updates: Monthly security patches
- Schema migrations: Coordinated with blue-green deployment

### No-Downtime Deployments
- Use database migrations that are backwards-compatible
- Deploy new code first, then run migrations
- Feature flags for large behavioral changes

## Post-Deployment Verification

### Automated Checks
```bash
# Health check
curl -f https://api.vantyx.io/health || exit 1

# API connectivity
curl -f -H "Authorization: Bearer sk_test_..." \
  https://api.vantyx.io/v1/payments || exit 1

# Webhook endpoint accessible
curl -f -X POST https://api.vantyx.io/webhooks/stripe/payouts \
  -H "stripe-signature: t=123,v1=abc" || exit 1
```

### Manual Smoke Tests
1. Sign up → verify email OTP → create session
2. Add payment method → create payment
3. Connect Stripe account → initiate payout
4. Create subscription → verify invoice generation
5. Invite team member → verify role assignment

## Support & Escalation

- **On-Call**: Page on-call engineer for P1 incidents
- **Incidents**: Post in #incidents channel
- **Logs**: ELK stack at https://logs.vantyx.io
- **Uptime Status**: https://status.vantyx.io

---

**Last Updated**: 2026-08-06  
**Deployment Team**: Platform Engineering  
**Next Review**: 2026-09-06
