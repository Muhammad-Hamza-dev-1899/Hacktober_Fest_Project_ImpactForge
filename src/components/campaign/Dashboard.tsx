"use client";

import { Download, Lock, Plus, Repeat } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Segmented } from "@/components/billing/Sheet";
import { UpsellSheet } from "@/components/billing/Upsell";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { Icon } from "@/components/ui/Icon";
import { SEED_CAMPAIGNS } from "@/data/campaigns";
import { getPlan, platformRevenue } from "@/lib/monetization";
import type { Campaign, Donation } from "@/lib/schema";
import { addDays, cn, formatDate, formatPKR, seededRandom, unitPhrase } from "@/lib/utils";
import { findCampaignById, useAppStore, usePlan } from "@/store/useAppStore";

type Tab = "overview" | "campaigns" | "gifts" | "billing";

/** Cumulative raised per day over the campaign's life. Sample mode draws a plausible seeded curve. */
function series(campaigns: Campaign[], donations: Donation[], sample: boolean, now: number) {
  if (!campaigns.length) return [];
  const start = campaigns.reduce((m, c) => Math.min(m, +new Date(c.createdAt)), Infinity);
  const days = Math.max(...campaigns.map((c) => c.days.length));
  if (sample) {
    const c = campaigns[0];
    const rand = seededRandom(c.id);
    const weights = Array.from({ length: days }, (_, i) => 0.6 + rand() + (i === Math.floor(days / 2) ? 2 : 0));
    const sum = weights.reduce((s, w) => s + w, 0);
    let acc = 0;
    return weights.map((w, i) => {
      acc += (w / sum) * c.baseRaisedPKR;
      return { day: formatDate(addDays(new Date(start).toISOString(), i)), raised: Math.round(acc) };
    });
  }
  // Real data stops at today; never plot the future.
  const total = (until: number) =>
    donations.filter((d) => +new Date(d.createdAt) <= until).reduce((s, d) => s + d.amountPKR + (d.matchedPKR ?? 0), 0);
  const elapsed = Math.min(days, Math.floor((now - start) / 86_400_000) + 1);
  if (elapsed <= 1)
    return [
      { day: "Launch", raised: 0 },
      { day: "Now", raised: total(now) },
    ];
  return Array.from({ length: elapsed }, (_, i) => {
    const cutoff = Math.min(now, +addDays(new Date(start).toISOString(), i + 1));
    return { day: formatDate(addDays(new Date(start).toISOString(), i)), raised: total(cutoff) };
  });
}

function toCSV(rows: Donation[]) {
  const head = ["date", "campaign", "donor", "amount_pkr", "tip_pkr", "fee_covered_pkr", "matched_pkr", "recurring", "tx_id"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    head.join(","),
    ...rows.map((d) =>
      [d.createdAt, d.campaignSlug, d.donorName, d.amountPKR, d.tipPKR ?? 0, d.feeCoveredPKR ?? 0, d.matchedPKR ?? 0, !!d.recurring, d.txId]
        .map(esc)
        .join(","),
    ),
  ].join("\n");
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[22px] bg-mist p-6">
      <p className="text-[15px] text-ink-2">{label}</p>
      <p className="mt-2 text-[32px] font-semibold leading-none tracking-[-0.02em] tabular-nums">{value}</p>
      {hint && <p className="mt-2 text-[13px] text-ink-2">{hint}</p>}
    </div>
  );
}

export function Dashboard() {
  const user = useAppStore((s) => s.user);
  const campaigns = useAppStore((s) => s.campaigns);
  const donations = useAppStore((s) => s.donations);
  const views = useAppStore((s) => s.views);
  const aiGenerations = useAppStore((s) => s.aiGenerations);
  const cancel = useAppStore((s) => s.cancelSubscription);
  const { plan, subscription } = usePlan();
  const [tab, setTab] = useState<Tab>("overview");
  const [upsell, setUpsell] = useState<string | null>(null);

  const sample = campaigns.length === 0;
  const organized = useMemo(() => (sample ? [SEED_CAMPAIGNS[0]] : campaigns), [sample, campaigns]);
  const received = useMemo(() => {
    const ids = new Set(organized.map((c) => c.id));
    return donations.filter((d) => ids.has(d.campaignId));
  }, [organized, donations]);

  const stats = useMemo(() => {
    const raised = sample ? organized[0].baseRaisedPKR : received.reduce((s, d) => s + d.amountPKR + (d.matchedPKR ?? 0), 0);
    const donors = sample ? organized[0].baseDonors : received.length;
    const v = sample ? donors * 17 : organized.reduce((s, c) => s + (views[c.id] ?? 0), 0);
    const monthly = received.filter((d) => d.recurring).reduce((s, d) => s + d.amountPKR, 0);
    return { raised, donors, views: v, conversion: v ? donors / v : 0, monthly };
  }, [sample, organized, received, views]);

  const [now] = useState(() => Date.now());
  const data = useMemo(() => series(organized, received, sample, now), [organized, received, sample, now]);
  const locked = !sample && !plan.perks.analytics;
  const revenue = platformRevenue({
    donations: donations.map((d) => ({
      amountPKR: d.amountPKR,
      tipPKR: d.tipPKR ?? 0,
      matchedPKR: d.matchedPKR ?? 0,
      recurring: !!d.recurring,
    })),
    subscription: subscription ? { plan: subscription.plan, cycle: subscription.cycle } : null,
  });
  const usedAI = aiGenerations.month === new Date().toISOString().slice(0, 7) ? aiGenerations.count : 0;

  const exportCSV = () => {
    if (!plan.perks.csvExport) return setUpsell("Export every gift to CSV with Society Pro.");
    const blob = new Blob([toCSV(received)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "impactforge-donations.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="mx-auto w-full max-w-[1080px] px-6 pb-28 pt-28 sm:pt-32">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="t-eyebrow text-ink-2">Dashboard</p>
          <h1 className="t-headline mt-1">Salaam, {user?.name}.</h1>
        </div>
        <Segmented
          label="Dashboard section"
          value={tab}
          onChange={setTab}
          className="md:w-[420px]"
          options={[
            { value: "overview", label: "Overview" },
            { value: "campaigns", label: "Campaigns" },
            { value: "gifts", label: "Your gifts" },
            { value: "billing", label: "Billing" },
          ]}
        />
      </div>

      {tab === "overview" && (
        <div className="mt-10">
          {sample && (
            <div className="mb-6 flex flex-col gap-3 rounded-[22px] border border-line/70 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[15px]">
                <strong className="font-semibold">Showing sample data</strong>{" "}
                <span className="text-ink-2">from “{organized[0].title}”. Create a campaign to see your own.</span>
              </p>
              <Link href="/create" className="btn-primary btn-sm">
                Create a campaign
              </Link>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Raised" value={formatPKR(stats.raised, { compact: true })} hint="including sponsor matches" />
            <Stat label="Donors" value={String(stats.donors)} />
            <Stat label="Conversion" value={`${(stats.conversion * 100).toFixed(1)}%`} hint={`${stats.views} page views`} />
            <Stat label="Monthly giving" value={formatPKR(stats.monthly, { compact: true })} hint="recurring per month" />
          </div>

          <div className="relative mt-4 rounded-[22px] bg-mist p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-[21px] font-semibold tracking-[-0.01em]">Raised over time</h2>
              <button className="link text-[15px]" onClick={exportCSV}>
                <Download className="h-4 w-4" aria-hidden /> Export CSV{" "}
                {!plan.perks.csvExport && (
                  <span className="ml-1 rounded bg-[#bf5af2]/15 px-1 text-[10px] font-semibold text-[#9b3fd1]">PRO</span>
                )}
              </button>
            </div>
            <div className={cn("mt-6 h-64", locked && "pointer-events-none select-none blur-[6px]")} aria-hidden={locked}>
              {data.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="raisedFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--blue)" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="var(--blue)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="var(--line)" strokeOpacity={0.6} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--ink-2)", fontSize: 12 }} minTickGap={24} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={64}
                      tick={{ fill: "var(--ink-2)", fontSize: 12 }}
                      tickFormatter={(v: number) => formatPKR(v, { compact: true }).replace("PKR ", "")}
                    />
                    <Tooltip
                      cursor={{ stroke: "var(--ink-2)", strokeDasharray: "3 3" }}
                      content={({ active, payload, label }) =>
                        active && payload?.[0] ? (
                          <div className="rounded-xl bg-raised px-3 py-2 text-[13px] shadow-lg ring-1 ring-line/60">
                            <p className="text-ink-2">{label}</p>
                            <p className="font-semibold">{formatPKR(Number(payload[0].value))}</p>
                          </div>
                        ) : null
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="raised"
                      stroke="var(--blue)"
                      strokeWidth={2}
                      fill="url(#raisedFill)"
                      activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--raised)" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="grid h-full place-items-center text-[15px] text-ink-2">Your chart appears after your first gifts.</div>
              )}
            </div>
            {locked && (
              <div className="absolute inset-0 grid place-items-center rounded-[22px]">
                <div className="text-center">
                  <Lock className="mx-auto h-6 w-6 text-ink-2" aria-hidden />
                  <p className="mt-2 text-[17px] font-semibold">Analytics are part of Society Pro.</p>
                  <button
                    className="btn-primary btn-sm mt-4"
                    onClick={() => setUpsell("See how every campaign performs with Society Pro.")}
                  >
                    Unlock analytics
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={cn("mt-4 rounded-[22px] bg-mist p-6", locked && "blur-[6px]")} aria-hidden={locked}>
            <h2 className="text-[21px] font-semibold tracking-[-0.01em]">Visitors to donors</h2>
            <div className="mt-5 space-y-3">
              {[
                ["Page views", stats.views],
                ["Donors", stats.donors],
              ].map(([l, v]) => (
                <div key={String(l)}>
                  <div className="flex justify-between text-[15px]">
                    <span>{l}</span>
                    <span className="tabular-nums text-ink-2">{v}</span>
                  </div>
                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-raised">
                    <div
                      className="h-full rounded-full bg-blue"
                      style={{ width: `${stats.views ? Math.max(2, (Number(v) / stats.views) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "campaigns" && (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/create"
            className="grid min-h-[300px] place-items-center rounded-[22px] border-2 border-dashed border-line text-ink-2 transition hover:border-blue hover:text-blue"
          >
            <span className="text-center">
              <Plus className="mx-auto h-7 w-7" aria-hidden />
              <span className="mt-2 block text-[17px]">New campaign</span>
              <span className="mt-1 block text-[13px]">
                {campaigns.length} of {plan.limits.liveCampaigns === Infinity ? "unlimited" : plan.limits.liveCampaigns} on {plan.name}
              </span>
            </span>
          </Link>
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}

      {tab === "gifts" && (
        <div className="mt-10">
          {donations.length === 0 ? (
            <div className="rounded-[28px] bg-mist px-6 py-16 text-center">
              <p className="text-[24px] font-semibold">No gifts yet.</p>
              <p className="mt-2 text-[17px] text-ink-2">Give to any campaign and your receipt and Impact Wrapped appear here.</p>
              <div className="mt-6 flex items-center justify-center gap-6">
                <Link href="/explore" className="btn-primary">
                  Explore campaigns
                </Link>
                <Link href="/impact/demo" className="link text-[17px]">
                  Watch a demo Wrapped ›
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {donations.map((d) => {
                const c = findCampaignById(d.campaignId);
                if (!c) return null;
                return (
                  <li key={d.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mist">
                      <Icon name={d.units.icon} className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[17px] font-semibold">
                        {c.title} {d.recurring && <Repeat className="ml-1 inline h-4 w-4 text-ink-2" aria-label="Monthly" />}
                      </p>
                      <p className="truncate text-[14px] text-ink-2">
                        {formatDate(d.createdAt)} · {formatPKR(d.amountPKR)} · {unitPhrase(d.units.count, d.units.label)}
                      </p>
                    </div>
                    <div className="flex gap-5 text-[15px]">
                      <Link href={`/receipt/${d.id}`} className="link">
                        Receipt ›
                      </Link>
                      <Link href={`/impact/${d.id}`} className="link">
                        Wrapped ›
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {tab === "billing" && (
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[22px] bg-mist p-7">
            <p className="text-[15px] text-ink-2">Current plan</p>
            <p className="mt-1 text-[32px] font-semibold tracking-[-0.01em]">{plan.name}</p>
            {subscription && (
              <p className="mt-1 text-[15px] text-ink-2">
                Billed {subscription.cycle} since {formatDate(subscription.since)} · {subscription.txId}
              </p>
            )}
            <div className="mt-6 space-y-4">
              {[
                ["Live campaigns", campaigns.length, plan.limits.liveCampaigns],
                ["AI generations this month", usedAI, plan.limits.aiGenerationsPerMonth],
              ].map(([l, used, limit]) => (
                <div key={String(l)}>
                  <div className="flex justify-between text-[15px]">
                    <span>{l}</span>
                    <span className="tabular-nums text-ink-2">
                      {used} / {limit === Infinity ? "∞" : limit}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-raised">
                    <div
                      className="h-full rounded-full bg-blue"
                      style={{ width: `${limit === Infinity ? 4 : Math.min(100, (Number(used) / Number(limit)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-5">
              {plan.id === "free" ? (
                <button className="btn-primary" onClick={() => setUpsell("Unlock unlimited campaigns with Society Pro.")}>
                  Upgrade to Pro
                </button>
              ) : (
                <button className="btn-secondary" onClick={cancel}>
                  Cancel subscription
                </button>
              )}
              <Link href="/pricing" className="link text-[17px]">
                Compare plans ›
              </Link>
            </div>
          </div>

          <div className="rounded-[22px] border border-line/70 p-7">
            <p className="text-[15px] text-ink-2">ImpactForge revenue · admin preview</p>
            <p className="mt-1 text-[32px] font-semibold tracking-[-0.01em]">{formatPKR(revenue.total)}</p>
            <p className="mt-1 text-[15px] text-ink-2">from activity on this device</p>
            <dl className="mt-6 space-y-2.5 text-[15px]">
              {[
                ["Donor tips", revenue.tips],
                ["Sponsor listing fees (5% of matches)", revenue.sponsorFees],
                ["Subscription MRR", revenue.mrrSubs],
              ].map(([l, v]) => (
                <div key={String(l)} className="flex justify-between">
                  <dt>{l}</dt>
                  <dd className="tabular-nums">{formatPKR(Number(v))}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-line pt-2.5 text-ink-2">
                <dt>Donation volume (GMV)</dt>
                <dd className="tabular-nums">{formatPKR(revenue.gmv)}</dd>
              </div>
              <div className="flex justify-between text-ink-2">
                <dt>Take rate</dt>
                <dd className="tabular-nums">{(revenue.takeRate * 100).toFixed(1)}%</dd>
              </div>
            </dl>
            <p className="mt-5 text-[13px] text-ink-2">
              {getPlan("pro").name} and Campus plans plus optional tips fund the platform. There is no fee on donations.
            </p>
          </div>
        </div>
      )}

      <UpsellSheet open={!!upsell} reason={upsell ?? ""} onClose={() => setUpsell(null)} />
    </div>
  );
}
