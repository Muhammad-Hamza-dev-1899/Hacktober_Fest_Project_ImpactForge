"use client";

import { SEED_CAMPAIGNS } from "@/data/campaigns";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { NumberTicker, Reveal } from "@/components/ui/primitives";
import { useAppStore } from "@/store/useAppStore";

export function LandingStats() {
  const donations = useAppStore((s) => s.donations);
  const raised = SEED_CAMPAIGNS.reduce((s, c) => s + c.baseRaisedPKR, 0) + donations.reduce((s, d) => s + d.amountPKR, 0);
  const donors = SEED_CAMPAIGNS.reduce((s, c) => s + c.baseDonors, 0) + donations.length;
  const stats = [
    { value: raised, prefix: "PKR ", label: "raised across demo campaigns" },
    { value: donors, label: "donors with a Wrapped story" },
    { value: 100, suffix: "%", label: "of rupees traced to a budget line" },
    { value: 10, prefix: "<", suffix: "s", label: "from idea to live campaign" },
  ];
  return (
    <section className="border-y border-white/[0.06] bg-white/[0.015]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06} className="text-center">
            <div className="font-display text-2xl font-semibold tracking-tight sm:text-4xl">
              <NumberTicker value={s.value} prefix={s.prefix} suffix={s.suffix} />
            </div>
            <p className="mt-1 text-xs text-white/50 sm:text-sm">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function FeaturedCampaigns() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--c1)]">Live on campus</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Campaigns forged with ImpactForge</h2>
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SEED_CAMPAIGNS.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.06}>
            <CampaignCard campaign={c} className="h-full" />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
