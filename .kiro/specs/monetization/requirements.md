# Requirements: Monetization & payments

## Introduction
ImpactForge must sustain itself without charging students to raise money.

### R1: Donor checkout
1. The checkout SHALL show an itemized total: donation, optional tip (0/5/10/15%, default 10%), optional processing-fee cover, and any sponsor match.
2. WHEN the donor covers fees THEN the system SHALL gross up the charge so the cause nets 100% of the gift.
3. The server SHALL recompute every amount; client totals SHALL NOT be trusted.
4. Donors MAY choose monthly giving; recurring checkouts SHALL use subscription mode.
5. Every completed donation SHALL produce a printable receipt.

### R2: Payment providers
1. IF `STRIPE_SECRET_KEY` is set THEN checkout SHALL redirect to hosted Stripe Checkout and confirm the session server-side on return.
2. IF it is not set THEN checkout SHALL complete in demo mode with a clearly labeled mock receipt.
3. The webhook endpoint SHALL verify the `Stripe-Signature` HMAC and reject stale (more than 5 minutes) or tampered events.

### R3: Plans
1. Starter (free): 1 live campaign, 3 AI generations a month, an ImpactForge badge.
2. Society Pro (PKR 2,499/mo or PKR 24,990/yr): unlimited campaigns and generations, AI rewrite with undo, monthly giving, analytics, CSV export, no badge.
3. Campus (custom): the sponsor-matching marketplace, a verified NGO network, SSO and white-label.
4. WHEN a user reaches a Pro feature THEN the system SHALL show an upgrade sheet explaining exactly what unlocks.

### R4: Sponsor matching
1. Sponsors pledge a ratio and cap. Matches SHALL never exceed the remaining cap.
2. Sponsors pay a 5% listing fee on matched funds.

### R5: Transparency
1. The pricing page SHALL include an interactive calculator using the same function as checkout.
2. The dashboard SHALL show organizer analytics (Pro) and a platform-revenue roll-up (tips, sponsor fees, subscription MRR, GMV, take rate).
