"use client";

import { ArrowUpRight, Users } from "lucide-react";
import Link from "next/link";
import type { Campaign } from "@/lib/schema";
import { themeVars } from "@/lib/themes";
import { cn, formatPKR } from "@/lib/utils";
import { useCampaignTotals } from "@/store/useAppStore";

export function CampaignCard({ campaign, className }: { campaign: Campaign; className?: string }) {
  const { raised, donors, pct } = useCampaignTotals(campaign);
  return (
    <Link
      href={`/c/${campaign.slug}`}
      style={themeVars(campaign.theme.palette)}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_20px_60px_-20px_var(--glow)]",
        className,
      )}
    >
      <div className="relative h-36 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,var(--c1),transparent_55%),radial-gradient(120%_120%_at_100%_100%,var(--c2),transparent_55%)] opacity-60 transition duration-500 group-hover:scale-110" />
        <div className="bg-dots absolute inset-0 opacity-40" />
        <span className="absolute bottom-3 left-4 text-4xl drop-shadow-lg">{campaign.theme.emoji}</span>
        <ArrowUpRight className="absolute right-4 top-4 h-5 w-5 text-white/70 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
        {campaign.source !== "seed" && (
          <span className="absolute left-4 top-4 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur">
            {campaign.source === "ai" ? "AI generated" : "Generated · offline"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-tight">{campaign.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-white/55">{campaign.tagline}</p>
        <div className="mt-auto pt-5">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--c3),var(--c1),var(--c2))]"
              style={{ width: `${Math.max(2, pct)}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-white/60">
            <span>
              <span className="font-semibold text-white">{formatPKR(raised, { compact: true })}</span> of{" "}
              {formatPKR(campaign.goalPKR, { compact: true })}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {donors}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
