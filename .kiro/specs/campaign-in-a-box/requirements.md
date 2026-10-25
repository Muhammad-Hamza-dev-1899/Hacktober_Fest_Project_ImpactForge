# Requirements: Campaign-in-a-Box

## Introduction
A student describes a cause in one sentence. The system generates a complete, themed fundraising campaign: landing-page copy, impact tiers, a transparent budget, FAQs, a share pitch and a day-by-day execution plan.

## Requirements

### R1: Prompt input
**User story:** As an organizer, I want to describe my cause in plain language so that I don't need fundraising or design skills.
1. WHEN the user submits a prompt of 8–280 characters THEN the system SHALL start generation.
2. IF the prompt is shorter than 8 characters THEN the system SHALL show an inline error and SHALL NOT call the API.
3. WHEN the user arrives from the landing-page hero with a prompt THEN the system SHALL start generation automatically, logging them in as a guest if needed.
4. The system SHALL offer at least 6 one-click example prompts.

### R2: Generation
**User story:** As an organizer, I want a complete campaign in seconds so that I can launch today.
1. WHEN generation runs with an API key THEN the system SHALL make two parallel structured-output calls (copy+theme, strategy).
2. WHEN model output is received THEN the system SHALL normalize it (clamp the goal, sort and limit tiers, rebalance the budget to 100%, renumber days) and validate it against `CampaignSchema`.
3. IF there is no API key, `DEMO_MODE=true`, the call exceeds `AI_TIMEOUT_MS`, or validation fails THEN the system SHALL return a curated or template campaign instead and report the reason.
4. The system SHALL rate-limit `/api/generate` to 8 requests per minute per IP.
5. The system SHALL treat prompt text as untrusted data and never render model output as HTML.

### R3: Generation Theater
1. WHILE generation is in progress THE system SHALL show 5 staged steps with live status.
2. The theater SHALL display for at least 4.2s so the experience feels intentional even in offline mode.

### R4: Campaign page
**User story:** As a donor, I want a beautiful, trustworthy page so that I feel confident giving.
1. The page SHALL apply the AI-chosen palette and hero variant through CSS variables.
2. The page SHALL show: hero, progress ring (raised / goal / donors), 3 impact tiers, story, budget donut with a labeled legend, share kit, a 5–14 day strategy timeline, and FAQs.
3. WHEN the campaign was just generated THEN the page SHALL show a "campaign is live" banner naming the source (AI or offline) and the generation time.
4. On viewports narrower than 768px the page SHALL show a sticky donate bar.

### R5: Mock donation
1. WHEN the donor picks an amount THEN the dialog SHALL translate it into tangible units.
2. The demo checkout SHALL Luhn-check the card locally, simulate ~1.4s of latency, and never transmit card data.
3. WHEN payment succeeds THEN the system SHALL record the donation, update the campaign totals, fire theme-colored confetti and offer "See your Impact Wrapped".
