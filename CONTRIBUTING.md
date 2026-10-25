# Contributing to ImpactForge

Thanks for helping students raise money for causes they care about. Contributions of every size are welcome: typo fixes, new campaign templates, accessibility fixes and whole new features.

## Quick start

```bash
git clone https://github.com/your-username/impactforge.git
cd impactforge
npm install
cp .env.example .env.local   # the API key is optional
npm run dev
```

## Before you open a PR

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
```

CI runs the same commands.

## Ground rules

- **Never render AI-generated HTML.** The model returns JSON. It gets normalized in `src/lib/normalize.ts`, validated by `CampaignSchema` in `src/lib/schema.ts`, and drawn by typed components.
- **Every AI path needs a fallback.** If you add a generated field, add it to the curated campaigns in `src/data/campaigns/*.json` too. They're validated at build time.
- **Theme through tokens.** Campaign colors come from CSS variables (`--c1`, `--c2`, `--c3`, `--accent`, `--glow`) set by `themeVars()`. Don't hardcode campaign colors.
- **Charts use `SERIES`** from `src/lib/themes.ts`. It's a fixed, colorblind-validated order. Always pair color with a text label.
- **Motion is subtle and respects `prefers-reduced-motion`.** Use `motion/react`. Each page gets one big "hero moment".
- **Mobile first.** Check every UI change at 375px width.

## Good first issues

Look for issues labelled `good first issue` or `hacktoberfest`. Some ideas:

- Add a new curated campaign template (with keywords in `src/data/campaigns/index.ts`)
- Add a new hero background variant
- Add Urdu translations of the UI chrome
- Improve screen-reader descriptions for the Wrapped slides

## Commit style

We use [Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.

## Code of Conduct

By participating you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).
