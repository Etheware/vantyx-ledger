# Vantyx Ledger Deployment Checklist

Before deploying to production, verify all items:

## Local Verification (Required)

- [ ] Type check passes: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors in build output
- [ ] No ESLint warnings/errors

## Database

- [ ] PostgreSQL instance running
- [ ] Database created: `vantyx_ledger`
- [ ] All migrations applied:
  - [ ] 0001_auth.sql
  - [ ] 0002_billing.sql
  - [ ] 0003_wallet.sql
- [ ] Tables created:
  - [ ] users
  - [ ] sessions
  - [ ] checkout_sessions
  - [ ] billing_export_rows
  - [ ] wallet_access_grants

## Environment Variables

- [ ] `DATABASE_URL` set and tested
- [ ] `STRIPE_API_KEY` configured
- [ ] `STRIPE_WEBHOOK_SECRET` set
- [ ] `PLAID_CLIENT_ID` configured
- [ ] `PLAID_SECRET` set
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` public key set
- [ ] `NEXT_PUBLIC_PLAID_ENV` set to `sandbox` or `production`
- [ ] `NEXT_PUBLIC_VANTYX_PORTAL_URL` matches deployment domain
- [ ] `CHECKOUT_SESSION_SECRET` set for token signing

## API Endpoints Verified

- [ ] `GET /api/health` returns 200 OK
- [ ] `POST /api/auth/signup` accepts valid credentials
- [ ] `POST /api/auth/login` authenticates user
- [ ] `GET /api/auth/sso/complete` returns redirect
- [ ] `POST /api/billing/checkout` creates session with token
- [ ] `GET /api/billing/checkout/[token]` validates token

## Routes Verified

- [ ] `/` loads home page
- [ ] `/auth/login` displays login form
- [ ] `/auth/signup` displays signup form
- [ ] `/checkout/[token]` displays checkout page
- [ ] `/checkout/[token]/card` displays card form
- [ ] `/checkout/[token]/bank-connect` displays bank form
- [ ] `/dashboard` accessible (may redirect if not authenticated)
- [ ] `/learning-center` lists courses
- [ ] `/courses` shows course catalog
- [ ] `/courses/[courseSlug]` displays course detail
- [ ] `/billing` displays pricing

## Security

- [ ] All API endpoints validate input
- [ ] Sensitive keys not committed to git
- [ ] `.env` file in `.gitignore`
- [ ] HTTPS enforced (if applicable)
- [ ] CORS configured appropriately
- [ ] Session tokens signed and verified

## Performance

- [ ] First Contentful Paint (FCP) < 2s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Time to Interactive (TTI) < 4s

## Post-Deployment

- [ ] Monitor error logs for first 24 hours
- [ ] Test complete checkout flow with test card
- [ ] Verify database backups are running
- [ ] Set up monitoring/alerting on health endpoint
- [ ] Document deployment date and version

## Rollback Plan

If issues arise:

1. Stop the application: `pm2 stop vantyx-ledger`
2. Checkout previous commit: `git checkout [previous-sha]`
3. Reinstall dependencies: `npm install`
4. Rebuild: `npm run build`
5. Start application: `pm2 start vantyx-ledger`

Known good commit: (to be filled after successful deployment)

## Notes

- Database migrations are idempotent and can be re-run safely
- Checkout tokens expire after 1 hour (configurable)
- All timestamps are in UTC
- Stripe test cards: 4242 4242 4242 4242 (any future date, any CVC)
