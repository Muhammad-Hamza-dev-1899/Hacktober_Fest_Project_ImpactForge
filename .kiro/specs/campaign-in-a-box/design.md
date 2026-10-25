# Design: Campaign-in-a-Box

## Flow
```
PromptStudio ──POST /api/generate──► route.ts (zod input, rate limit)
                                         │
                                   generateCampaign()
                          ┌──────────────┴──────────────┐
            messages.parse(CampaignCopyAISchema)   messages.parse(StrategyAISchema)
                          └──────────────┬──────────────┘
                                 buildCampaign() ── normalize + CampaignSchema.parse
                                         │  (any error / timeout)
                                         └──────────► fallbackCampaign(prompt)
                                         ▼
                        { campaign, source, ms, reason } ──► store.addCampaign ──► /c/[slug]
```

## Key decisions
- **Two-layer schemas.** Structured outputs don't support every numeric/length constraint, so the AI-facing schema encodes only structure, enums and descriptions. A deterministic normalizer repairs values, and the strict schema guarantees rendering safety.
- **Constrained creativity.** The model chooses `palette` (6), `heroVariant` (4), `mood` and `emoji`. `themes.ts` maps these to tokens, so every page is distinct and none is broken.
- **Fallback quality.** Keyword scoring picks the closest of 4 curated campaigns. Unknown causes get a template built from `parsePrompt()` (title + region extraction).
- **Persistence.** Generated campaigns live in Zustand/localStorage. Seed campaigns are prerendered via `generateStaticParams`.

## Error handling
| Failure | Behaviour |
|---|---|
| No key / demo mode | Instant fallback; banner says "offline" |
| Timeout (AbortController) | Fallback, reason `timeout` |
| Unrepairable output (ZodError) | Fallback, reason logged server-side |
| 429 / 400 | Inline error in the studio |
