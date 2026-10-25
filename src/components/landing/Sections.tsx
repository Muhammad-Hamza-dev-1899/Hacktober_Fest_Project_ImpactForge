"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Gift, Rocket, WandSparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { Embers } from "@/components/ui/Embers";
import { Icon } from "@/components/ui/Icon";
import { NumberTicker, Reveal } from "@/components/ui/primitives";
import { SEED_CAMPAIGNS } from "@/data/campaigns";
import { PALETTE_TOKENS } from "@/lib/themes";
import { formatPKR, unitPhrase } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

/* ---------------- Live donation feed (simulated) ---------------- */

const NAMES = ["Ayesha", "Hamza", "Zainab", "Bilal", "Mahnoor", "Usman", "Hira", "Saad", "Iqra", "Danish", "Noor", "Areeba"];

function feedItem(n: number) {
  const c = SEED_CAMPAIGNS[(n * 7) % SEED_CAMPAIGNS.length];
  const u = c.impactUnits[(n * 3) % 2];
  const mult = 1 + (n % 3);
  return { id: n, name: NAMES[(n * 5) % NAMES.length], campaign: c, unit: u, amount: u.amountPKR * mult, mult };
}

export function LiveFeed() {
  const [n, setN] = useState(4);
  useEffect(() => {
    const t = setInterval(() => setN((x) => x + 1), 2400);
    return () => clearInterval(t);
  }, []);
  const items = Array.from({ length: 5 }, (_, i) => feedItem(n - i));

  return (
    <div className="relative h-[332px] overflow-hidden mask-fade-b">
      <ul className="space-y-2.5">
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((it) => {
            const t = PALETTE_TOKENS[it.campaign.theme.palette];
            return (
              <motion.li
                key={it.id}
                layout
                initial={{ opacity: 0, y: -24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5 backdrop-blur"
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#0b0a0f]"
                  style={{ background: `linear-gradient(135deg, ${t.c3}, ${t.c1})` }}
                >
                  <Icon name={it.unit.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="font-medium">{it.name}</span> <span className="text-white/45">gave</span> {formatPKR(it.amount)}
                  </p>
                  <p className="truncate text-xs text-white/45">
                    {unitPhrase(it.mult, it.unit.label)} · {it.campaign.title}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-white/30">now</span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

export function Pulse() {
  const donations = useAppStore((s) => s.donations);
  const raised = SEED_CAMPAIGNS.reduce((s, c) => s + c.baseRaisedPKR, 0) + donations.reduce((s, d) => s + d.amountPKR, 0);
  const donors = SEED_CAMPAIGNS.reduce((s, c) => s + c.baseDonors, 0) + donations.length;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
      <div className="grid items-center gap-12 md:grid-cols-[1fr_1.05fr]">
        <Reveal>
          <p className="eyebrow text-[#ff8a4c]">Live on campus</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Generosity, <span className="serif text-ember">made visible.</span>
          </h2>
          <p className="mt-5 max-w-md text-white/55">
            Every gift is translated into something real (a coat, a textbook, a solar panel), so giving feels like what it is.
          </p>
          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8">
            {[
              { v: raised, p: "PKR ", l: "raised across demo campaigns", f: (x: number) => (x / 1_000_000).toFixed(2) + "M" },
              { v: donors, l: "donors with a Wrapped story" },
              { v: 100, s: "%", l: "of rupees traced to a budget line" },
              { v: 10, p: "<", s: "s", l: "from idea to live campaign" },
            ].map((s) => (
              <div key={s.l} className="border-l border-white/10 pl-4">
                <dt className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  <NumberTicker value={s.v} prefix={s.p} suffix={s.s} format={s.f} />
                </dt>
                <dd className="mt-1 text-xs text-white/45">{s.l}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="card relative p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="flex items-center gap-2 text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Live donations
              </p>
              <span className="font-mono text-[10px] text-white/30">SIMULATED FEED</span>
            </div>
            <LiveFeed />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- How it works ---------------- */

export function HowItWorks() {
  const steps = [
    { icon: WandSparkles, n: "01", t: "Describe your cause", d: "One sentence is enough. “Winter coats for kids in Gilgit.”" },
    { icon: Rocket, n: "02", t: "Launch a designed page", d: "AI writes, designs and plans. Share the link on WhatsApp." },
    { icon: Gift, n: "03", t: "Show the impact", d: "Each donor gets a personal, animated story of where their money went." },
  ];
  return (
    <section id="how" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
      <Reveal className="max-w-xl">
        <p className="eyebrow text-[#ff8a4c]">How it works</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Ten seconds from <span className="serif text-ember">idea to impact.</span>
        </h2>
      </Reveal>
      <div className="relative mt-14 grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.1}>
            <div className="card relative h-full p-7">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-[#141218] shadow-[0_0_30px_-8px_rgba(255,106,61,0.6)]">
                  <s.icon className="h-5 w-5 text-[#ff8a4c]" />
                </span>
                <span className="serif text-5xl text-white/[0.12]">{s.n}</span>
              </div>
              <h3 className="mt-8 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Featured campaigns ---------------- */

export function Featured() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-[#ff8a4c]">Forged with ImpactForge</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Campaigns <span className="serif text-ember">live right now.</span>
          </h2>
        </div>
        <Link href="/create" className="inline-flex items-center gap-1.5 text-sm text-white/60 transition hover:text-white">
          Forge your own <ArrowRight className="h-4 w-4" />
        </Link>
      </Reveal>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SEED_CAMPAIGNS.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.06}>
            <CampaignCard campaign={c} className="h-full" />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Final CTA ---------------- */

export function FinalCTA() {
  return (
    <section className="px-4 pb-24 pt-8 sm:px-6">
      <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0d0b0f] px-6 py-24 text-center sm:px-12 sm:py-32">
        <div className="absolute inset-x-0 bottom-0 -z-10 h-[70%] bg-[radial-gradient(60%_80%_at_50%_100%,rgba(255,106,61,0.55),rgba(255,61,119,0.18)_45%,transparent_75%)]" />
        <div className="bg-grid mask-radial absolute inset-0 -z-10 opacity-40" />
        <Embers className="-z-10" density={0.8} />
        <h2 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
          Your cause deserves <span className="serif text-ember">a campaign.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-white/60">About ten seconds. No sign-up, no card, no design skills.</p>
        <Link
          href="/create"
          className="group mt-10 inline-flex h-14 items-center gap-2 rounded-full bg-white px-8 font-semibold text-[#09080b] shadow-[0_0_60px_-10px_rgba(255,160,100,0.8)] transition hover:scale-[1.03]"
        >
          Start forging <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
