---
inclusion: fileMatch
fileMatchPattern: "src/components/**/*.tsx"
---

# Design system (Apple design language)

- Light canvas `#ffffff`, tiles `#f5f5f7`, ink `#1d1d1f`, secondary `#6e6e73` (5.0:1, OK for small text). Never `#86868b` for text under 18px.
- Use the semantic tokens only (`bg-canvas`, `bg-mist`, `bg-raised`, `text-ink`, `text-ink-2`, `border-line`, `bg-blue`, `text-link`). They resolve per appearance; dark mode follows the system, with no toggle.
- Type: system SF stack (Inter fallback). Scale utilities: `.t-hero`, `.t-headline`, `.t-title`, `.t-eyebrow`, `.t-lede`. Body 17px; nothing under 11px.
- Primary action: `.btn-primary` (Apple blue pill). Secondary: `.btn-secondary` or a `.link` with a trailing ›.
- Blur/frosted material only on floating chrome (global nav, local nav, bottom bars, sheets), never on content. `prefers-reduced-transparency` makes it opaque.
- Signature: the Intelligence glow (`.intel-ring`, `.text-intel`) is reserved for AI moments (the prompt, generation). Spend it nowhere else.
- Campaign identity lives in the content layer: cover art and the title's tail gradient (`.text-gradient`, deep tones on light, lighter steps on dark).
- Charts use `SERIES_VAR` (`var(--s1..s5)`) and always carry text labels.
- Sheets (`components/billing/Sheet.tsx`): one task, grabber on phones, Escape/backdrop/close button, drag to dismiss.
- Touch targets ≥ 44px on mobile. Icon-only buttons need `aria-label`.
- Never draw an Apple Pay button or mark.
