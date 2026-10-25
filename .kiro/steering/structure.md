---
inclusion: always
---

# Project structure

```
src/app/                    routes: /, /create, /c/[slug], /impact/[donationId], /dashboard, /api/generate
src/components/ui/          visual primitives (backgrounds, ShimmerButton, NumberTicker, GlowCard, ProgressRing, Icon)
src/components/studio/      prompt input + GenerationTheater
src/components/campaign/    campaign page sections, DonateDialog, BudgetDonut, StrategyTimeline, Dashboard
src/components/wrapped/     WrappedStory slide engine + slides
src/lib/schema.ts           all Zod schemas and types (single source of truth)
src/lib/normalize.ts        AI output → strict Campaign
src/lib/ai/                 Anthropic client, prompts, fallback
src/lib/mock/               mock payments + deterministic impact engine
src/store/useAppStore.ts    Zustand store (mock auth + persistence)
src/data/campaigns/         curated campaigns (fallback + featured)
tests/                      node:test unit tests (run with tsx)
```
