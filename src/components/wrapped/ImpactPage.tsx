"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getSeed } from "@/data/campaigns";
import { buildDonation } from "@/lib/mock/impact";
import { findCampaignById, useAppStore } from "@/store/useAppStore";
import { WrappedStory } from "./WrappedStory";

const DEMO_SLUG = "warmth-for-gilgit";

export function ImpactPage({ donationId }: { donationId: string }) {
  const hydrated = useAppStore((s) => s.hydrated);
  const donations = useAppStore((s) => s.donations);
  const user = useAppStore((s) => s.user);
  // The demo donation is backdated so most of its journey shows as delivered.
  const [demoCreatedAt] = useState(() => new Date(Date.now() - 6 * 86_400_000).toISOString());

  const resolved = useMemo(() => {
    if (!hydrated) return null;
    if (donationId === "demo") {
      const campaign = getSeed(DEMO_SLUG)!;
      const donation = buildDonation(
        campaign,
        7500,
        user?.name && user.name !== "Guest" ? user.name : "Ayesha",
        "demo-donation",
        "TX-DEMO2026",
        demoCreatedAt,
      );
      return { campaign, donation };
    }
    const donation = donations.find((d) => d.id === donationId);
    const campaign = donation && findCampaignById(donation.campaignId);
    return donation && campaign ? { campaign, donation } : undefined;
  }, [hydrated, donationId, donations, user, demoCreatedAt]);

  if (resolved === null) return <div className="fixed inset-0 z-[60] bg-black" />;
  if (!resolved) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md pt-20 flex-col items-center justify-center px-4 text-center">
        <h1 className="t-title">This Wrapped is on another device.</h1>
        <p className="mt-3 text-[17px] text-ink-2">
          Prototype donations are saved in the donor&apos;s browser. You can watch the demo instead.
        </p>
        <Link href="/impact/demo" className="btn-primary mt-7">
          Play the demo Wrapped
        </Link>
      </div>
    );
  }
  return <WrappedStory campaign={resolved.campaign} donation={resolved.donation} />;
}
