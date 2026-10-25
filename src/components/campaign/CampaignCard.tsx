"use client";

import { MapPin, Users } from "lucide-react";
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
        "group flex flex-col overflow-hidden rounded-[22px] bg-mist transition duration-300 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue/30",
        className,
      )}
    >
      <div className="relative overflow-hidden">
        <CoverArt
          campaign={campaign}
          animated={false}
          size="sm"
          className="aspect-[4/3] w-full transition duration-700 group-hover:scale-[1.04]"
        />
        {campaign.source !== "seed" && (
          <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white">
            {campaign.source === "ai" ? "AI-generated" : "Generated offline"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1 text-[13px] text-ink-2">
          <MapPin className="h-3.5 w-3.5" aria-hidden /> {campaign.region}
        </p>
        <h3 className="mt-1 text-[19px] font-semibold leading-tight tracking-[-0.01em]">{campaign.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-ink-2">{campaign.tagline}</p>
        <div className="mt-auto pt-5">
          <div
            className="h-1 overflow-hidden rounded-full bg-line/60"
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Funded"
          >
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--d1),var(--d2))]"
              style={{ width: `${Math.max(2, pct)}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[13px] text-ink-2">
            <span>
              <span className="font-semibold text-ink">{formatPKR(raised, { compact: true })}</span> of{" "}
              {formatPKR(campaign.goalPKR, { compact: true })}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" aria-hidden /> {donors}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
