"use client";

import type { BillingCycle, CheckoutBreakdown } from "@/lib/monetization";

/**
 * Browser side of checkout. Calls the server (which recomputes every amount), then either
 * redirects to the hosted Stripe page or, in demo mode, returns a mock receipt immediately.
 * Before a redirect, the pending intent is kept so /checkout/success can finish recording it.
 */
export const PENDING_KEY = "impactforge:pending";

export type PendingDonation = {
  kind: "donation";
  campaignId: string;
  amountPKR: number;
  donorName: string;
  tipPKR: number;
  feeCoveredPKR: number;
  matchedPKR: number;
  sponsorName?: string;
  recurring: boolean;
  totalPKR: number;
};
export type PendingSubscription = { kind: "subscription"; plan: "pro"; cycle: BillingCycle };
export type Pending = PendingDonation | PendingSubscription;

export async function paymentsMode(): Promise<"stripe" | "mock"> {
  try {
    const r = await fetch("/api/checkout");
    return ((await r.json()) as { mode: "stripe" | "mock" }).mode;
  } catch {
    return "mock";
  }
}

async function post<T>(body: unknown): Promise<T> {
  const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(json.error ?? "Checkout failed. Please try again.");
  return json;
}

export async function checkoutDonation(
  input: {
    campaignId: string;
    campaignSlug: string;
    campaignTitle: string;
    amountPKR: number;
    tipRate: number;
    coverFees: boolean;
    recurring: boolean;
  },
  pending: Omit<PendingDonation, "kind">,
) {
  const r = await post<{ mode: "mock" | "stripe"; url?: string; txId?: string; breakdown: CheckoutBreakdown }>({
    kind: "donation",
    ...input,
  });
  if (r.mode === "stripe" && r.url) {
    localStorage.setItem(PENDING_KEY, JSON.stringify({ kind: "donation", ...pending } satisfies Pending));
    window.location.assign(r.url);
    return { redirected: true as const };
  }
  return { redirected: false as const, txId: r.txId!, breakdown: r.breakdown };
}

export async function checkoutSubscription(cycle: BillingCycle) {
  const r = await post<{ mode: "mock" | "stripe"; url?: string; txId?: string }>({ kind: "subscription", plan: "pro", cycle });
  if (r.mode === "stripe" && r.url) {
    localStorage.setItem(PENDING_KEY, JSON.stringify({ kind: "subscription", plan: "pro", cycle } satisfies Pending));
    window.location.assign(r.url);
    return { redirected: true as const };
  }
  return { redirected: false as const, txId: r.txId! };
}
