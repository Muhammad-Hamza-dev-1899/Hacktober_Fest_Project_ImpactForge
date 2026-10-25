import { ArrowRight, BadgeCheck, CalendarDays, GitPullRequest, PieChart, Sparkles, WandSparkles } from "lucide-react";
import Link from "next/link";
import { FeaturedCampaigns, LandingStats } from "@/components/campaign/LandingClient";
import { HeroPrompt } from "@/components/studio/HeroPrompt";
import { EXAMPLE_PROMPTS } from "@/components/studio/examples";
import { Aurora, Spotlight } from "@/components/ui/backgrounds";
import { BlurText, GlowCard, Marquee, Reveal } from "@/components/ui/primitives";
import { SITE } from "@/lib/site";

export default function Home() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative isolate overflow-hidden">
        <div className="bg-grid mask-radial pointer-events-none absolute inset-0 -z-10 opacity-70" />
        <Aurora className="-z-10 opacity-70" />
        <Spotlight className="-z-10" />
        <div className="mx-auto flex max-w-5xl flex-col items-center px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24 md:pb-28">
          <Link
            href={SITE.repoUrl}
            target="_blank"
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/75 backdrop-blur transition hover:border-white/25"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-[var(--c1)]" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--c1)]" />
            </span>
            Open source · {SITE.hackathon}
            <ArrowRight className="h-3 w-3" />
          </Link>

          <h1 className="font-display text-[2.6rem] font-semibold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
            <BlurText text="Turn one sentence" />
            <br />
            <BlurText text="into a movement." delay={0.25} gradient />
          </h1>
          <Reveal delay={0.5}>
            <p className="mx-auto mt-6 max-w-xl text-base text-white/60 sm:text-lg">
              ImpactForge is an AI philanthropy engine for students. Describe a cause and get a designed campaign page, copy and a
              day-by-day launch plan in seconds. Every donor then gets a <span className="text-white">Wrapped-style</span> story of exactly
              where their money went.
            </p>
          </Reveal>

          <Reveal delay={0.65} className="mt-10 w-full">
            <HeroPrompt />
          </Reveal>

          <Reveal delay={0.8} className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
            <Link href="/impact/demo" className="inline-flex items-center gap-1.5 text-white/70 transition hover:text-white">
              <Sparkles className="h-4 w-4 text-[var(--c3)]" /> Watch an Impact Wrapped demo
            </Link>
            <span className="text-white/20">•</span>
            <Link href="/c/warmth-for-gilgit" className="text-white/70 transition hover:text-white">
              Browse a live campaign →
            </Link>
          </Reveal>
        </div>

        <Marquee className="pb-12">
          {EXAMPLE_PROMPTS.map((p) => (
            <span
              key={p.label}
              className="glass inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm text-white/70"
            >
              <span>{p.emoji}</span> {p.label}
            </span>
          ))}
        </Marquee>
      </section>

      <LandingStats />

      {/* ---------- Bento ---------- */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--c1)]">What it does</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            A whole fundraising team, in one prompt.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-6">
          <Reveal className="md:col-span-4">
            <GlowCard className="h-full p-7">
              <WandSparkles className="h-6 w-6 text-[var(--c1)]" />
              <h3 className="mt-4 font-display text-xl font-semibold">Campaign-in-a-Box</h3>
              <p className="mt-2 max-w-md text-sm text-white/60">
                Two AI agents run in parallel. One writes the story, impact tiers, FAQs and picks a visual theme; the other plans the launch
                day by day. Every response is schema-validated before it renders.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-2 text-[11px] text-white/60">
                {["Copy & story", "Theme tokens", "14-day plan"].map((t, i) => (
                  <div key={t} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="mb-2 h-1.5 w-8 rounded-full" style={{ background: `var(${["--c1", "--c2", "--c3"][i]})` }} />
                    {t}
                  </div>
                ))}
              </div>
            </GlowCard>
          </Reveal>
          <Reveal className="md:col-span-2" delay={0.1}>
            <GlowCard className="h-full p-7">
              <PieChart className="h-6 w-6 text-[var(--c3)]" />
              <h3 className="mt-4 font-display text-xl font-semibold">Impact Wrapped</h3>
              <p className="mt-2 text-sm text-white/60">
                A cinematic, swipeable story for every donor: fund flows, the people reached, and a shareable card.
              </p>
            </GlowCard>
          </Reveal>
          <Reveal className="md:col-span-2" delay={0.05}>
            <GlowCard className="h-full p-7">
              <BadgeCheck className="h-6 w-6 text-[var(--c1)]" />
              <h3 className="mt-4 font-display text-xl font-semibold">Radical transparency</h3>
              <p className="mt-2 text-sm text-white/60">Every campaign publishes a budget, and every rupee is traced through it.</p>
            </GlowCard>
          </Reveal>
          <Reveal className="md:col-span-2" delay={0.1}>
            <GlowCard className="h-full p-7">
              <CalendarDays className="h-6 w-6 text-[var(--c2)]" />
              <h3 className="mt-4 font-display text-xl font-semibold">Execution, not just ideas</h3>
              <p className="mt-2 text-sm text-white/60">Daily tasks, channels and KPIs a student team can run alongside classes.</p>
            </GlowCard>
          </Reveal>
          <Reveal className="md:col-span-2" delay={0.15}>
            <GlowCard className="h-full p-7">
              <GitPullRequest className="h-6 w-6 text-[var(--c3)]" />
              <h3 className="mt-4 font-display text-xl font-semibold">MIT open source</h3>
              <p className="mt-2 text-sm text-white/60">Fork it for your society. Built spec-first with Kiro; specs included.</p>
            </GlowCard>
          </Reveal>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["01", "Describe your cause", "One sentence is enough. “Winter coats for kids in Gilgit.”"],
            ["02", "Launch a designed page", "AI writes, designs and plans. Share the link on WhatsApp."],
            ["03", "Show the impact", "Donors get a personal, animated story of where their money went."],
          ].map(([n, t, d], i) => (
            <Reveal key={n} delay={i * 0.08}>
              <div className="relative h-full rounded-3xl border border-white/10 p-7">
                <span className="font-display text-5xl font-semibold text-white/10">{n}</span>
                <h3 className="mt-3 font-display text-lg font-semibold">{t}</h3>
                <p className="mt-1.5 text-sm text-white/55">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <FeaturedCampaigns />

      {/* ---------- CTA ---------- */}
      <section className="relative isolate mx-auto mb-20 w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 px-6 py-16 text-center sm:px-12">
        <Aurora className="-z-10 opacity-60" />
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">Your cause deserves a campaign.</h2>
        <p className="mx-auto mt-4 max-w-lg text-white/60">It takes about ten seconds. No sign-up, no credit card, no design skills.</p>
        <Link
          href="/create"
          className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-white px-8 font-semibold text-ink transition hover:scale-[1.02] hover:bg-white/90"
        >
          Start forging <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </>
  );
}
