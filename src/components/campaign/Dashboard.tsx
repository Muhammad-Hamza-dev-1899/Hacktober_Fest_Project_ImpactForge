"use client";

import { ArrowRight, Gift, HandCoins, Plus, Sparkles, Users, WandSparkles } from "lucide-react";
import Link from "next/link";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { Icon } from "@/components/ui/Icon";
import { GlowCard, NumberTicker, Reveal } from "@/components/ui/primitives";
import { SEED_CAMPAIGNS } from "@/data/campaigns";
import { themeVars } from "@/lib/themes";
import { formatDate, formatPKR } from "@/lib/utils";
import { findCampaignById, useAppStore } from "@/store/useAppStore";

export function Dashboard() {
  const user = useAppStore((s) => s.user);
  const campaigns = useAppStore((s) => s.campaigns);
  const donations = useAppStore((s) => s.donations);

  const given = donations.reduce((s, d) => s + d.amountPKR, 0);
  const reached = donations.reduce((s, d) => s + d.ripple.community, 0);

  const tiles = [
    { icon: WandSparkles, label: "Campaigns forged", value: campaigns.length },
    { icon: HandCoins, label: "Total given", value: given, prefix: "PKR " },
    { icon: Users, label: "People reached", value: reached },
    { icon: Gift, label: "Wrapped stories", value: donations.length },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-12 sm:px-6">
      <Reveal>
        <p className="text-sm text-white/50">Dashboard</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          Salaam, <span className="text-gradient">{user?.name}</span>
        </h1>
      </Reveal>

      <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t, i) => (
          <Reveal key={t.label} delay={i * 0.05}>
            <GlowCard className="p-5">
              <t.icon className="h-5 w-5 text-[var(--c1)]" />
              <p className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
                <NumberTicker value={t.value} prefix={t.prefix} />
              </p>
              <p className="text-xs text-white/50 sm:text-sm">{t.label}</p>
            </GlowCard>
          </Reveal>
        ))}
      </div>

      <section className="mt-14">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold">Your campaigns</h2>
          <Link href="/create" className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white">
            New <Plus className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/create"
            className="group flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 text-white/60 transition hover:border-white/35 hover:text-white"
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5 transition group-hover:scale-110 group-hover:bg-[linear-gradient(135deg,var(--c1),var(--c2))] group-hover:text-ink">
              <Plus className="h-6 w-6" />
            </span>
            <span className="mt-3 text-sm font-medium">Forge a new campaign</span>
          </Link>
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="mb-5 font-display text-xl font-semibold">Your Impact Wrapped</h2>
        {donations.length === 0 ? (
          <div className="flex flex-col items-start gap-4 rounded-3xl border border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-white/60">No donations yet. Give to any campaign and your personal Wrapped story appears here.</p>
            <div className="flex gap-2">
              <Link href={`/c/${SEED_CAMPAIGNS[0].slug}`} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink">
                Donate to a campaign
              </Link>
              <Link
                href="/impact/demo"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-2.5 text-sm"
              >
                <Sparkles className="h-4 w-4" /> Demo
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {donations.map((d) => {
              const c = findCampaignById(d.campaignId);
              if (!c) return null;
              return (
                <li key={d.id} style={themeVars(c.theme.palette)}>
                  <Link
                    href={`/impact/${d.id}`}
                    className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/25 hover:bg-white/[0.05]"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--c1),var(--c2))] text-ink">
                      <Icon name={d.units.icon} className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{c.title}</p>
                      <p className="truncate text-xs text-white/50">
                        {formatDate(d.createdAt)} · {d.units.count} × {d.units.label} · {d.ripple.direct} {c.beneficiaryNoun}
                      </p>
                    </div>
                    <span className="hidden font-display font-semibold sm:block">{formatPKR(d.amountPKR)}</span>
                    <ArrowRight className="h-4 w-4 text-white/40 transition group-hover:translate-x-1 group-hover:text-white" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
