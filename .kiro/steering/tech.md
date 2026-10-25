---
inclusion: always
---

# Tech rules

- Next.js App Router (v16, Cache Components on), TypeScript strict, Tailwind CSS v4. No `any`.
- Dynamic route params are read in a server component inside `<Suspense>`, then passed to client components.
- Animation: `motion/react` only. Wrap the app in `<MotionConfig reducedMotion="user">`.
- Charts: Recharts. Node graphs: hand-built SVG plus motion (no heavy graph libraries).
- State: Zustand + `persist` to localStorage, with `skipHydration` and manual `rehydrate()` to avoid SSR mismatches.
- **AI output is data, never markup.** Model → `*AISchema` (structured outputs) → `buildCampaign()` normalizer → strict `CampaignSchema`.
- **Every AI path has a fallback** to `src/data/campaigns/*.json` (missing key, timeout, invalid output).
- Money is PKR, formatted with `formatPKR()`.
- Before finishing a task: `npm run lint && npm run typecheck && npm test && npm run build`.
