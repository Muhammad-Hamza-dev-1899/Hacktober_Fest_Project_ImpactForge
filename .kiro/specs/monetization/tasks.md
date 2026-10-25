# Tasks: Monetization & payments

- [x] 1. `src/lib/monetization.ts`: plans, `computeCheckout` gross-up, sponsor `matchFor`, `platformRevenue` _(R1, R3, R4, R5)_
- [x] 2. Stripe REST client, session verify, webhook HMAC verification _(R2)_
- [x] 3. `/api/checkout` (server-side recompute, mock fallback), `/api/checkout/verify`, `/api/webhooks/stripe` _(R1.3, R2)_
- [x] 4. Donate sheet: tip, fee cover, monthly, match, itemized total _(R1)_
- [x] 5. Receipts and `/checkout/success` _(R1.5, R2.1)_
- [x] 6. Pricing page with calculator and comparison _(R3, R5.1)_
- [x] 7. Plan gating and upsell sheet (campaign limit, AI quota, analytics, CSV, AI rewrite) _(R3.4)_
- [x] 8. Dashboard: analytics, billing, revenue view _(R5.2)_
- [x] 9. Unit tests: gross-up math, match caps, revenue roll-up, signature verification
- [ ] 10. Postgres persistence and idempotent webhook writes (production)
- [ ] 11. PayFast / JazzCash provider for Pakistani merchants (production)
