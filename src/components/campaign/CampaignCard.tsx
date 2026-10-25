"use client";

import { ArrowUpRight, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { CoverArt } from "@/components/ui/CoverArt";
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
        "card group relative flex flex-col overflow-hidden p-2 transition duration-500 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_30px_80px_-30px_var(--glow)]",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-[1.1rem]">
        <CoverArt
          campaign={campaign}
          animated={false}
          size="sm"
          className="aspect-[4/3] w-full transition duration-700 group-hover:scale-[1.06]"
        />
        <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white/80 backdrop-blur transition group-hover:bg-white group-hover:text-[#09080b]">
          <ArrowUpRight className="h-4 w-4" />
        </span>
        {campaign.source !== "seed" && (
          <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-white/90 backdrop-blur">
            {campaign.source === "ai" ? "AI generated" : "Generated · offline"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
        <p className="flex items-center gap-1 text-[11px] text-white/45">
          <MapPin className="h-3 w-3" /> {campaign.region}
        </p>
        <h3 className="mt-1.5 text-lg font-semibold leading-tight tracking-tight">{campaign.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-white/50">{campaign.tagline}</p>
        <div className="mt-auto pt-5">
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--c3),var(--c1),var(--c2))]"
              style={{ width: `${Math.max(2, pct)}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-white/50">
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
