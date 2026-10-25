# Design: Impact Wrapped

## Components
- `ImpactPage`: resolves the donation (store or demo) after hydration.
- `WrappedStory`: slide engine. `useAnimationFrame` advances a `MotionValue` progress (so it can be paused without re-renders), `AnimatePresence mode="wait"` transitions slides, and pointer handlers implement tap vs hold.
- `slides.tsx`: one component per slide, each owning its entrance choreography.

## Data
`buildDonation(campaign, amount, donor, id, txId, createdAt)` in `src/lib/mock/impact.ts`:
- `units`: count of the entry-tier unit
- `allocation`: budget percents × amount, with the remainder assigned to the last line so the total is exact
- `beneficiaries`: seeded names and towns by region
- `ripple`: direct → household (×4.5–7) → community (×8–13)
- `journey`: 6 steps with day offsets

## Visual
- Slide backgrounds are built from theme variables, so each campaign's Wrapped has its own color story.
- Data marks use the validated `SERIES` palette with direct labels (identity is never color-alone).
