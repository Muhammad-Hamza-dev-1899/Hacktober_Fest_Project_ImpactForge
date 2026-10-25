"use client";

import { nanoid } from "nanoid";
import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { SEED_CAMPAIGNS } from "@/data/campaigns";
import { buildDonation } from "@/lib/mock/impact";
import { getPlan, matchFor, sponsorFor, type BillingCycle, type PlanId } from "@/lib/monetization";
import type { Campaign, Donation, DonationExtras } from "@/lib/schema";

/**
 * Client-side persistence (localStorage) so the prototype runs with zero backend.
 * The shape mirrors what a CampaignRepository / AuthProvider / BillingProvider would expose,
 * so swapping in Postgres + real auth doesn't touch the UI.
 */
type User = { id: string; name: string; isGuest: true };
export type Subscription = { plan: PlanId; cycle: BillingCycle; since: string; txId: string };

type AppState = {
  hydrated: boolean;
  user: User | null;
  campaigns: Campaign[];
  donations: Donation[];
  subscription: Subscription | null;
  /** Mock page-view counter per campaign (feeds the organizer funnel). */
  views: Record<string, number>;
  aiGenerations: { month: string; count: number };
  draftPrompt: string;
  fresh: { campaignId: string; source: "ai" | "fallback"; ms: number; reason?: string } | null;
  setFresh: (f: AppState["fresh"]) => void;
  loginAsGuest: (name?: string) => User;
  logout: () => void;
  setDraftPrompt: (p: string) => void;
  addCampaign: (c: Campaign) => void;
  updateCampaign: (id: string, patch: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  trackView: (campaignId: string) => void;
  noteGeneration: () => void;
  subscribe: (plan: PlanId, cycle: BillingCycle, txId: string) => void;
  cancelSubscription: () => void;
  recordDonation: (campaign: Campaign, amountPKR: number, donorName: string, txId: string, extras?: DonationExtras) => Donation;
};

const monthKey = () => new Date().toISOString().slice(0, 7);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      user: null,
      campaigns: [],
      donations: [],
      subscription: null,
      views: {},
      aiGenerations: { month: monthKey(), count: 0 },
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
      updateCampaign: (id, patch) =>
        set((s) => ({ campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, ...patch, id: c.id, slug: c.slug } : c)) })),
      deleteCampaign: (id) => set((s) => ({ campaigns: s.campaigns.filter((c) => c.id !== id) })),
      trackView: (campaignId) => set((s) => ({ views: { ...s.views, [campaignId]: (s.views[campaignId] ?? 0) + 1 } })),
      noteGeneration: () =>
        set((s) => {
          const m = monthKey();
          return { aiGenerations: { month: m, count: (s.aiGenerations.month === m ? s.aiGenerations.count : 0) + 1 } };
        }),
      subscribe: (plan, cycle, txId) =>
        set({ subscription: plan === "free" ? null : { plan, cycle, since: new Date().toISOString(), txId } }),
      cancelSubscription: () => set({ subscription: null }),
      recordDonation: (campaign, amountPKR, donorName, txId, extras = {}) => {
        const prior = get().donations.filter((d) => d.campaignId === campaign.id).length;
        const donation = buildDonation(
          campaign,
          amountPKR,
          donorName,
          `don_${nanoid(10)}`,
          txId,
          undefined,
          campaign.baseDonors + prior,
          extras,
        );
        set((s) => ({ donations: [donation, ...s.donations] }));
        return donation;
      },
    }),
    {
      name: "impactforge:v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ user, campaigns, donations, subscription, views, aiGenerations }) => ({
        user,
        campaigns,
        donations,
        subscription,
        views,
        aiGenerations,
      }),
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
    if (!campaign) return { raised: 0, donors: 0, pct: 0, matched: 0, monthly: 0 };
    const mine = donations.filter((d) => d.campaignId === campaign.id);
    const matched = mine.reduce((s, d) => s + (d.matchedPKR ?? 0), 0);
    const raised = campaign.baseRaisedPKR + mine.reduce((s, d) => s + d.amountPKR, 0) + matched;
    const donors = campaign.baseDonors + mine.length;
    const monthly = mine.filter((d) => d.recurring).reduce((s, d) => s + d.amountPKR, 0);
    return { raised, donors, pct: Math.min(100, (raised / campaign.goalPKR) * 100), matched, monthly };
  }, [campaign, donations]);
}

/** Live sponsor state for a campaign, including matches made on this device. */
export function useSponsor(campaign: Campaign | undefined) {
  const donations = useAppStore((s) => s.donations);
  return useMemo(() => {
    if (!campaign) return null;
    const used = donations.filter((d) => d.campaignId === campaign.id).reduce((s, d) => s + (d.matchedPKR ?? 0), 0);
    return sponsorFor(campaign.id, used);
  }, [campaign, donations]);
}

export function usePlan() {
  const subscription = useAppStore((s) => s.subscription);
  return useMemo(() => ({ subscription, plan: getPlan(subscription?.plan ?? "free") }), [subscription]);
}

export { matchFor };

export function findCampaignById(id: string): Campaign | undefined {
  return useAppStore.getState().campaigns.find((c) => c.id === id) ?? SEED_CAMPAIGNS.find((c) => c.id === id);
}
