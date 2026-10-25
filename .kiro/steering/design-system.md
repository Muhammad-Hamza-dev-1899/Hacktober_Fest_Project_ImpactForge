---
inclusion: fileMatch
fileMatchPattern: "src/components/**/*.tsx"
---

# Design system

- Brand "Forge": molten ember (gold `#ffc061` → orange `#ff6a3d` → magenta `#ff3d77`) on warm black `#09080b`, with film grain and ember particles.
- Surfaces use `.card` (subtle top-lit gradient + hairline border). Avoid flat gray boxes.
- Fonts: Geist (tight tracking, `tracking-[-0.04em]` on display sizes), Geist Mono for eyebrows/labels (`.eyebrow`), and Instrument Serif italic (`.serif`) for the emotional accent words in headlines.
- Never use `mix-blend-mode` on fixed full-screen layers (causes repaint artifacts).
- Theme colors come only from CSS variables set by `themeVars(palette)`: `--c1 --c2 --c3 --accent --accent-text --glow`.
- Chart data colors use `SERIES` (fixed, colorblind-validated order), always paired with text labels.
- Each page gets exactly one "hero moment" animation. Other motion is subtle: opacity plus at most 16px of translate, ease `[0.16, 1, 0.3, 1]`.
- Gradient text on animated words: apply `.text-gradient` per word (`<BlurText gradient />`). `background-clip: text` doesn't reach transformed children.
- Mobile first: check at 375px, keep tap targets ≥ 44px, and add a sticky bottom CTA on long pages.
