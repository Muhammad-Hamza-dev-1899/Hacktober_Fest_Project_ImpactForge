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
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="text-5xl">🎁</span>
        <h1 className="mt-4 font-display text-2xl font-semibold">This Wrapped lives on another device</h1>
        <p className="mt-2 text-sm text-white/55">
          Donations in the prototype are stored in the donor&apos;s browser. Watch the demo instead.
        </p>
        <Link href="/impact/demo" className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink">
          Play the demo Wrapped
        </Link>
      </div>
    );
  }
  return <WrappedStory campaign={resolved.campaign} donation={resolved.donation} />;
}
