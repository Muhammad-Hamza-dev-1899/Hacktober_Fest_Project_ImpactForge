"use client";

import { nanoid } from "nanoid";
import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { SEED_CAMPAIGNS } from "@/data/campaigns";
import { buildDonation } from "@/lib/mock/impact";
import type { Campaign, Donation } from "@/lib/schema";

/**
 * MOCK persistence + auth. Everything lives in localStorage so the prototype needs
 * no backend. The shape mirrors what a CampaignRepository / AuthProvider would expose.
 */
type User = { id: string; name: string; isGuest: true };

type AppState = {
  hydrated: boolean;
  user: User | null;
  campaigns: Campaign[];
  donations: Donation[];
  draftPrompt: string;
  /** Set right after generation so the campaign page can show a "just launched" banner. */
  fresh: { campaignId: string; source: "ai" | "fallback"; ms: number; reason?: string } | null;
  setFresh: (f: AppState["fresh"]) => void;
  loginAsGuest: (name?: string) => User;
  logout: () => void;
  setDraftPrompt: (p: string) => void;
  addCampaign: (c: Campaign) => void;
  recordDonation: (campaign: Campaign, amountPKR: number, donorName: string, txId: string) => Donation;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      user: null,
      campaigns: [],
      donations: [],
      draftPrompt: "",
      fresh: null,
      setFresh: (fresh) => set({ fresh }),
      loginAsGuest: (name = "Guest") => {
        const user: User = { id: `guest_${nanoid(6)}`, name, isGuest: true };
        set({ user });
        return user;
      },
      logout: () => set({ user: null }),
      setDraftPrompt: (draftPrompt) => set({ draftPrompt }),
      addCampaign: (c) => set((s) => ({ campaigns: [c, ...s.campaigns.filter((x) => x.id !== c.id)] })),
      recordDonation: (campaign, amountPKR, donorName, txId) => {
        const prior = get().donations.filter((d) => d.campaignId === campaign.id).length;
        const donation = buildDonation(campaign, amountPKR, donorName, `don_${nanoid(10)}`, txId, undefined, campaign.baseDonors + prior);
        set((s) => ({ donations: [donation, ...s.donations] }));
        return donation;
      },
    }),
    {
      name: "impactforge:v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ user, campaigns, donations }) => ({ user, campaigns, donations }),
      onRehydrateStorage: () => () => useAppStore.setState({ hydrated: true }),
    },
  ),
);

export function useCampaign(slug: string): Campaign | undefined {
  const campaigns = useAppStore((s) => s.campaigns);
  return useMemo(() => campaigns.find((c) => c.slug === slug) ?? SEED_CAMPAIGNS.find((c) => c.slug === slug), [campaigns, slug]);
}

export function useCampaignTotals(campaign: Campaign | undefined) {
  const donations = useAppStore((s) => s.donations);
  return useMemo(() => {
    if (!campaign) return { raised: 0, donors: 0, pct: 0 };
    const mine = donations.filter((d) => d.campaignId === campaign.id);
    const raised = campaign.baseRaisedPKR + mine.reduce((s, d) => s + d.amountPKR, 0);
    const donors = campaign.baseDonors + mine.length;
    return { raised, donors, pct: Math.min(100, (raised / campaign.goalPKR) * 100) };
  }, [campaign, donations]);
}

export function findCampaignById(id: string): Campaign | undefined {
  return useAppStore.getState().campaigns.find((c) => c.id === id) ?? SEED_CAMPAIGNS.find((c) => c.id === id);
}
