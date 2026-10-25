---
inclusion: always
---

# Product: ImpactForge

An open-source, AI-powered philanthropy engine for university students in Pakistan (NUST / NSTP community).

**Users**
- *Organizers*: students running a charity drive. They type one sentence and get a launch-ready campaign.
- *Donors*: classmates, faculty and alumni. They give in seconds and get a personal "Impact Wrapped" story.

**Demo happy path (must never break)**
1. Landing → type a cause → "Forge campaign" (auto guest login)
2. Generation Theater (5 staged steps) → themed campaign page `/c/[slug]`
3. Donate → demo checkout → confetti → "See your Impact Wrapped"
4. `/impact/[id]`: 7-slide story (amount, Sankey, network, ripple, journey, share card)
5. `/dashboard`: campaigns and Wrapped stories

**Out of scope (mocked on purpose)**: real auth, real payments, a database, NGO verification.
