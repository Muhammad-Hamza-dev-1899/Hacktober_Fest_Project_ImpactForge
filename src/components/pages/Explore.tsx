"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Segmented } from "@/components/billing/Sheet";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { SEED_CAMPAIGNS } from "@/data/campaigns";
import type { Campaign, IconName } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const CAUSES: { id: string; label: string; icons: IconName[]; words: string[] }[] = [
  { id: "all", label: "All", icons: [], words: [] },
  { id: "warmth", label: "Warmth", icons: ["shirt", "snowflake", "flame"], words: ["winter", "coat", "blanket"] },
  { id: "education", label: "Education", icons: ["book", "graduation-cap"], words: ["book", "school", "fees", "tuition"] },
  { id: "water", label: "Water", icons: ["droplet", "sun"], words: ["water", "well", "pump"] },
  { id: "relief", label: "Relief", icons: ["package", "utensils", "leaf"], words: ["flood", "ration", "food", "relief", "iftar"] },
  { id: "health", label: "Health", icons: ["stethoscope", "heart"], words: ["health", "dialysis", "hospital", "wheelchair"] },
];

function causeOf(c: Campaign) {
  const text = `${c.title} ${c.prompt}`.toLowerCase();
  return (
    CAUSES.find((k) => k.id !== "all" && (k.icons.includes(c.impactUnits[0].icon) || k.words.some((w) => text.includes(w))))?.id ?? "other"
  );
}

export function Explore() {
  const mine = useAppStore((s) => s.campaigns);
  const donations = useAppStore((s) => s.donations);
  const [q, setQ] = useState("");
  const [cause, setCause] = useState("all");
  const [sort, setSort] = useState<"trending" | "funded" | "new">("trending");

  const list = useMemo(() => {
    const all = [...mine, ...SEED_CAMPAIGNS];
    const raised = (c: Campaign) =>
      c.baseRaisedPKR + donations.filter((d) => d.campaignId === c.id).reduce((s, d) => s + d.amountPKR + (d.matchedPKR ?? 0), 0);
    const needle = q.trim().toLowerCase();
    return all
      .filter((c) => cause === "all" || causeOf(c) === cause)
      .filter((c) => !needle || `${c.title} ${c.tagline} ${c.region}`.toLowerCase().includes(needle))
      .sort((a, b) =>
        sort === "new"
          ? +new Date(b.createdAt) - +new Date(a.createdAt)
          : sort === "funded"
            ? raised(b) / b.goalPKR - raised(a) / a.goalPKR
            : b.baseDonors +
              donations.filter((d) => d.campaignId === b.id).length -
              (a.baseDonors + donations.filter((d) => d.campaignId === a.id).length),
      );
  }, [mine, donations, q, cause, sort]);

  return (
    <div className="mx-auto max-w-[1080px] px-6 pb-28 pt-28 sm:pt-36">
      <h1 className="t-hero">Explore.</h1>
      <p className="t-lede mt-4 max-w-xl">Student-led campaigns across Pakistan. Every one has a published budget and a delivery plan.</p>

      <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <label className="relative block w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-2" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search campaigns or places"
            className="field pl-11"
            aria-label="Search campaigns"
          />
        </label>
        <Segmented
          label="Sort"
          value={sort}
          onChange={setSort}
          className="md:w-80"
          options={[
            { value: "trending", label: "Trending" },
            { value: "funded", label: "Most funded" },
            { value: "new", label: "Newest" },
          ]}
        />
      </div>
      <div className="mt-5 flex flex-wrap gap-2" role="radiogroup" aria-label="Cause">
        {CAUSES.map((c) => (
          <button
            key={c.id}
            role="radio"
            aria-checked={cause === c.id}
            onClick={() => setCause(c.id)}
            className={cn(
              "min-h-9 rounded-full px-4 text-[14px] transition",
              cause === c.id ? "bg-ink text-canvas" : "bg-mist text-ink hover:bg-line/50",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {list.length ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      ) : (
        <div className="mt-16 rounded-[28px] bg-mist px-6 py-16 text-center">
          <p className="text-[24px] font-semibold">No campaigns match yet.</p>
          <p className="mt-2 text-[17px] text-ink-2">Be the first to start one for this cause.</p>
          <Link href="/create" className="btn-primary mt-6">
            Start a campaign
          </Link>
        </div>
      )}
    </div>
  );
}
