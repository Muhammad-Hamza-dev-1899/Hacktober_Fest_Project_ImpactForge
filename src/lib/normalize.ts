import { nanoid } from "nanoid";
import { CampaignSchema, type Campaign, type CampaignCopyAI, type StrategyAI } from "./schema";
import { clamp, slugify } from "./utils";

const trunc = (s: string, n: number) => {
  const t = s.trim().replace(/^["']|["']$/g, "");
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
};

/** Integer percents that always sum to exactly 100 (largest-remainder method). */
export function rebalancePercents<T extends { percent: number }>(items: T[]): T[] {
  const total = items.reduce((s, x) => s + Math.max(0, x.percent), 0) || 1;
  const raw = items.map((x) => (Math.max(0, x.percent) / total) * 100);
  const floored = raw.map((r) => Math.max(1, Math.floor(r)));
  let diff = 100 - floored.reduce((s, x) => s + x, 0);
  const order = raw.map((r, i) => ({ i, rem: r - Math.floor(r) })).sort((a, b) => b.rem - a.rem);
  for (let k = 0; diff !== 0 && k < order.length * 4; k++) {
    const idx = order[k % order.length].i;
    if (diff > 0) {
      floored[idx]++;
      diff--;
    } else if (floored[idx] > 1) {
      floored[idx]--;
      diff++;
    }
  }
  return items.map((x, i) => ({ ...x, percent: floored[i] }));
}

/**
 * Turns raw model output into a strict, render-safe Campaign.
 * Throws (ZodError) if the output can't be repaired — callers fall back.
 */
export function buildCampaign(prompt: string, copy: CampaignCopyAI, strategy: StrategyAI, source: Campaign["source"]): Campaign {
  const id = nanoid(10);
  const title = trunc(copy.title, 60);
  const units = [...copy.impactUnits]
    .filter((u) => u.amountPKR > 0)
    .sort((a, b) => a.amountPKR - b.amountPKR)
    .slice(0, 3)
    .map((u) => ({ ...u, amountPKR: Math.round(u.amountPKR), label: trunc(u.label, 60) }));

  const budget = rebalancePercents(
    [...copy.budget]
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 5)
      .map((b) => ({ category: trunc(b.category, 40), percent: b.percent })),
  );

  const days = strategy.days.slice(0, 14).map((d, i) => ({
    day: i + 1,
    title: trunc(d.title, 80),
    tasks: d.tasks.slice(0, 3).map((t) => trunc(t, 140)),
    channel: d.channel,
    kpi: trunc(d.kpi, 80),
  }));

  return CampaignSchema.parse({
    id,
    slug: `${slugify(title) || "campaign"}-${id
      .slice(0, 4)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "x")}`,
    prompt,
    source,
    createdAt: new Date().toISOString(),
    baseRaisedPKR: 0,
    baseDonors: 0,
    title,
    tagline: trunc(copy.tagline, 160),
    story: copy.story.slice(0, 4).map((p) => trunc(p, 600)),
    goalPKR: Math.round(clamp(copy.goalPKR, 25_000, 5_000_000) / 5000) * 5000,
    region: trunc(copy.region, 60),
    beneficiaryNoun: trunc(copy.beneficiaryNoun, 30).toLowerCase(),
    impactUnits: units,
    budget,
    faqs: copy.faqs.slice(0, 4),
    whatsappPitch: trunc(copy.whatsappPitch, 400),
    theme: { ...copy.theme, emoji: [...copy.theme.emoji.trim()].slice(0, 2).join("") || "✨" },
    days,
  });
}
