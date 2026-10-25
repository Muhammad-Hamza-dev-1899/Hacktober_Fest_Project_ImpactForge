---
inclusion: fileMatch
fileMatchPattern: "src/components/**/*.tsx"
---

# Design system

- Dark-first. Page background `#05060a`. Glass surfaces use the `.glass` utility (`border-white/10 bg-white/[0.04] backdrop-blur-xl`).
- Fonts: `font-display` (Space Grotesk) for headings and numbers, Inter for body text.
- Theme colors come only from CSS variables set by `themeVars(palette)`: `--c1 --c2 --c3 --accent --accent-text --glow`.
- Chart data colors use `SERIES` (fixed, colorblind-validated order), always paired with text labels.
- Each page gets exactly one "hero moment" animation. Other motion is subtle: opacity plus at most 16px of translate, ease `[0.16, 1, 0.3, 1]`.
- Gradient text on animated words: apply `.text-gradient` per word (`<BlurText gradient />`). `background-clip: text` doesn't reach transformed children.
- Mobile first: check at 375px, keep tap targets ≥ 44px, and add a sticky bottom CTA on long pages.
