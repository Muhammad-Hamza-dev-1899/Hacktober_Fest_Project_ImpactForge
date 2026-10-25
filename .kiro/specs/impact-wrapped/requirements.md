# Requirements: Impact Wrapped

## Introduction
After donating, each donor gets a full-screen, Spotify-Wrapped-style story showing exactly how their contribution was used.

## Requirements

### R1: Story engine
1. The story SHALL have 7 slides with segmented progress bars at the top.
2. Slides SHALL auto-advance (6–10s each). Holding a pointer down SHALL pause; a quick tap on the left third SHALL go back and anywhere else SHALL go forward.
3. Arrow keys SHALL navigate and Space SHALL toggle pause.
4. On desktop the story SHALL render as a 440px phone frame with an ambient backdrop. On mobile it SHALL fill the screen.

### R2: Data (mock)
1. The system SHALL derive donation data deterministically from the donation id (seeded PRNG), so the same story always replays identically.
2. The allocation SHALL follow the campaign's published budget and sum exactly to the donated amount.
3. Beneficiaries (1–8) SHALL have names, ages and towns plausible for the campaign region.

### R3: Slides
1. **Intro**: greeting with donor name and campaign emoji.
2. **Amount**: animated counter, then tangible units with icons popping in.
3. **Follow the money**: Sankey from "You" to each budget category, with direct labels and hover tooltips.
4. **Who it reached**: animated SVG network (you → campaign → beneficiaries, plus fellow donors) with particles flowing along the edges.
5. **Ripple**: three concentric circles (direct, household, community) with counters.
6. **Journey**: 6-step timeline, with past steps marked done and future steps showing an ETA.
7. **Share**: an exportable card (PNG via html-to-image), native share or copy, and give-again / start-a-cause CTAs.

### R4: Access
1. `/impact/demo` SHALL always work without donating.
2. IF a donation id isn't found on this device THEN the system SHALL explain why and link to the demo.
