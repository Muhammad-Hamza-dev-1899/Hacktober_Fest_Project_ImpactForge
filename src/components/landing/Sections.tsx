"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { MiniWrapped } from "@/components/landing/Showcase";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/primitives";
import { SEED_CAMPAIGNS } from "@/data/campaigns";
import { PALETTE_TOKENS } from "@/lib/themes";
import { formatPKR, unitPhrase } from "@/lib/utils";

/* ---------------- Impact Wrapped: the one dark, full-bleed moment ---------------- */

export function WrappedSection() {
  return (
    <section className="bg-black py-24 text-[#f5f5f7] sm:py-32">
      <div className="mx-auto grid max-w-[1080px] items-center gap-14 px-6 md:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <p className="t-eyebrow text-[#a1a1a6]">Impact Wrapped</p>
          <h2 className="t-headline mt-2">
            Every donor
            <br />
            gets the story.
          </h2>
          <p className="mt-6 max-w-md text-[19px] leading-[1.42] text-[#a1a1a6]">
            A personal, swipeable recap of exactly where each rupee went: the budget it flowed through, the people it reached and the day it
            was delivered. Then a card worth sharing.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link href="/impact/demo" className="btn-primary">
              Watch a Wrapped
            </Link>
            <Link href="/c/warmth-for-gilgit" className="text-[17px] text-[#2997ff] hover:underline">
              Give to see your own ›
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="relative flex justify-center">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,0.35),transparent)] blur-2xl" />
          <motion.div
            initial={{ rotate: -4, y: 20 }}
            whileInView={{ rotate: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <MiniWrapped />
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- How it works (a real sequence, so it's numbered) ---------------- */

export function HowItWorks() {
  const steps = [
    { t: "Describe your cause.", d: "One sentence is enough: “Winter coats for kids in Gilgit.”" },
    { t: "Launch a designed page.", d: "Story, tiers, budget, cover art and a day-by-day plan. Share it on WhatsApp." },
    { t: "Show the impact.", d: "Every donor gets a receipt and a Wrapped story of where their money went." },
  ];
  return (
    <section id="how" className="mx-auto w-full max-w-[1080px] scroll-mt-16 px-6 py-24 sm:py-32">
      <Reveal className="max-w-2xl">
        <h2 className="t-headline">
          Idea to impact.
          <br />
          <span className="text-ink-3">In about ten seconds.</span>
        </h2>
      </Reveal>
      <ol className="mt-14 grid gap-10 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.t} delay={i * 0.08}>
            <li className="border-t border-line pt-6">
              <span className="text-[14px] font-semibold text-ink-2">Step {i + 1}</span>
              <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.01em]">{s.t}</h3>
              <p className="mt-2 text-[17px] leading-relaxed text-ink-2">{s.d}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

/* ---------------- Business model ---------------- */

export function BusinessSection() {
  const items = [
    { h: "Free for students.", d: "No platform fee on donations. Donors can add an optional tip that keeps ImpactForge running." },
    { h: "100% reaches the cause.", d: "Donors can cover the processing fee, so every rupee of the gift lands with the campaign." },
    {
      h: "Doubled by sponsors.",
      d: "Companies match student gifts through the Campus sponsor marketplace and fund the platform as they do.",
    },
    { h: "Pro for societies.", d: "Unlimited campaigns, monthly giving, analytics and AI rewrites for PKR 2,499 a month." },
  ];
  return (
    <section className="bg-mist py-24 sm:py-32">
      <div className="mx-auto max-w-[1080px] px-6">
        <Reveal className="max-w-2xl">
          <p className="t-eyebrow text-ink-2">Business model</p>
          <h2 className="t-headline mt-2">Sustainable by design.</h2>
          <p className="t-lede mt-5">Students never pay to raise money. Revenue comes from people who choose to support the platform.</p>
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {items.map((it, i) => (
            <Reveal key={it.h} delay={i * 0.05}>
              <div className="h-full rounded-[22px] bg-raised p-8">
                <h3 className="text-[24px] font-semibold tracking-[-0.01em]">{it.h}</h3>
                <p className="mt-2 text-[17px] leading-relaxed text-ink-2">{it.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 flex flex-wrap items-center gap-5">
          <Link href="/pricing" className="btn-primary">
            See pricing
          </Link>
          <Link href="/pricing#campus" className="link text-[17px]">
            Become a sponsor ›
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Live feed (simulated) ---------------- */

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
    const t = setInterval(() => setN((x) => x + 1), 2600);
    return () => clearInterval(t);
  }, []);
  const items = Array.from({ length: 4 }, (_, i) => feedItem(n - i));
  return (
    <ul className="space-y-2" aria-live="off">
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((it) => {
          const t = PALETTE_TOKENS[it.campaign.theme.palette];
          return (
            <motion.li
              key={it.id}
              layout
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="flex items-center gap-3 rounded-2xl bg-raised p-3.5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]"
            >
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white"
                style={{ background: `linear-gradient(135deg, ${t.d1}, ${t.d2})` }}
              >
                <Icon name={it.unit.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px]">
                  <span className="font-semibold">{it.name}</span> gave {formatPKR(it.amount)}
                </p>
                <p className="truncate text-[13px] text-ink-2">
                  {unitPhrase(it.mult, it.unit.label)} · {it.campaign.title}
                </p>
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}

export function Featured() {
  return (
    <section className="mx-auto w-full max-w-[1080px] px-6 py-24 sm:py-32">
      <div className="grid gap-12 md:grid-cols-[1fr_1.1fr] md:items-center">
        <Reveal>
          <h2 className="t-headline">
            Live on campus.
            <br />
            <span className="text-ink-3">Right now.</span>
          </h2>
          <p className="t-lede mt-5 max-w-md">
            Real causes, real budgets, students on the ground. Every gift becomes something you can picture.
          </p>
          <Link href="/explore" className="link mt-6 text-[19px]">
            Explore all campaigns ›
          </Link>
        </Reveal>
        <Reveal delay={0.08} className="tile p-4 sm:p-5">
          <p className="mb-3 flex items-center gap-2 px-1 text-[13px] font-semibold text-ink-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-[#28c840]" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#28c840]" />
            </span>
            Recent gifts · simulated
          </p>
          <LiveFeed />
        </Reveal>
      </div>
      <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SEED_CAMPAIGNS.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.05}>
            <CampaignCard campaign={c} className="h-full" />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="px-6 pb-24">
      <div className="tile mx-auto max-w-[1080px] px-6 py-20 text-center sm:py-28">
        <h2 className="t-headline">
          Your cause deserves
          <br />
          <span className="text-intel">a campaign.</span>
        </h2>
        <p className="t-lede mx-auto mt-5 max-w-md">About ten seconds. No sign-up. No card. No design skills.</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-5">
          <Link href="/create" className="btn-primary">
            Start a campaign
          </Link>
          <Link href="/pricing" className="link text-[17px]">
            Compare plans ›
          </Link>
        </div>
      </div>
    </section>
  );
}
