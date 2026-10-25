/**
 * ImpactForge business model. All money math lives here so it can be unit-tested
 * and audited in one place.
 *
 * Revenue streams:
 *  1. Optional donor tip to the platform (0% platform fee on donations, GoFundMe-style).
 *  2. Organizer subscriptions (Free / Society Pro / Campus).
 *  3. Sponsor matching: corporate sponsors pay a 5% listing fee on matched funds.
 * Donors may also cover the payment processor's fee so 100% of the gift reaches the cause.
 */

export type PlanId = "free" | "pro" | "campus";
export type BillingCycle = "monthly" | "yearly";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  pricePKR: { monthly: number; yearly: number } | null; // null = contact sales
  highlight?: boolean;
  features: string[];
  limits: { liveCampaigns: number; aiGenerationsPerMonth: number; teamSeats: number };
  perks: {
    removeBadge: boolean;
    analytics: boolean;
    csvExport: boolean;
    aiRewrite: boolean;
    recurring: boolean;
    sponsorMarketplace: boolean;
  };
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Starter",
    tagline: "For your first drive.",
    pricePKR: { monthly: 0, yearly: 0 },
    features: [
      "1 live campaign",
      "3 AI generations / month",
      "Impact Wrapped for every donor",
      "Transparent budget & receipts",
      "ImpactForge badge on page",
    ],
    limits: { liveCampaigns: 1, aiGenerationsPerMonth: 3, teamSeats: 1 },
    perks: { removeBadge: false, analytics: false, csvExport: false, aiRewrite: false, recurring: false, sponsorMarketplace: false },
  },
  {
    id: "pro",
    name: "Society Pro",
    tagline: "For societies that run drives every semester.",
    pricePKR: { monthly: 2_499, yearly: 24_990 },
    highlight: true,
    features: [
      "Unlimited campaigns",
      "Unlimited AI generations & AI rewrite",
      "Monthly giving (recurring donations)",
      "Organizer analytics & CSV export",
      "Remove ImpactForge badge",
      "Up to 10 team members",
    ],
    limits: { liveCampaigns: Infinity, aiGenerationsPerMonth: Infinity, teamSeats: 10 },
    perks: { removeBadge: true, analytics: true, csvExport: true, aiRewrite: true, recurring: true, sponsorMarketplace: false },
  },
  {
    id: "campus",
    name: "Campus",
    tagline: "For universities and CSR programs.",
    pricePKR: null,
    features: [
      "Everything in Society Pro",
      "Corporate sponsor-matching marketplace",
      "Verified NGO partner network",
      "University-wide leaderboard & SSO",
      "White-label domain",
      "Dedicated success manager",
    ],
    limits: { liveCampaigns: Infinity, aiGenerationsPerMonth: Infinity, teamSeats: Infinity },
    perks: { removeBadge: true, analytics: true, csvExport: true, aiRewrite: true, recurring: true, sponsorMarketplace: true },
  },
];

export const getPlan = (id: PlanId) => PLANS.find((p) => p.id === id) ?? PLANS[0];

/** Payment processor cost (card network + gateway). Conservative blended rate for PK gateways/Stripe. */
export const PROCESSING = { rate: 0.029, fixedPKR: 30 };
export const SPONSOR_LISTING_FEE = 0.05;
export const TIP_OPTIONS = [0, 0.05, 0.1, 0.15] as const;
export const DEFAULT_TIP = 0.1;

const round = (n: number) => Math.round(n);

export type CheckoutInput = { amountPKR: number; tipRate: number; coverFees: boolean };
export type CheckoutBreakdown = {
  donationPKR: number; // what the cause is credited with (before match)
  tipPKR: number; // platform revenue
  feePKR: number; // processor fee on the whole charge
  feeCoveredPKR: number; // extra the donor adds to cover the fee
  totalPKR: number; // what the donor is charged
  netToCausePKR: number; // what actually lands with the cause
};

/**
 * Computes a checkout. When the donor covers fees we gross-up so that after the
 * processor takes rate+fixed on the full charge, the cause receives 100% of the gift
 * and the platform receives 100% of the tip.
 */
export function computeCheckout({ amountPKR, tipRate, coverFees }: CheckoutInput): CheckoutBreakdown {
  const donation = Math.max(0, round(amountPKR));
  const tip = round(donation * Math.max(0, tipRate));
  const base = donation + tip;
  const total = coverFees ? Math.ceil((base + PROCESSING.fixedPKR) / (1 - PROCESSING.rate)) : base;
  const fee = donation === 0 ? 0 : round(total * PROCESSING.rate + PROCESSING.fixedPKR);
  const feeCovered = coverFees ? total - base : 0;
  // Without fee cover, the processor fee comes out of the donation.
  const netToCause = coverFees ? donation : Math.max(0, donation - fee);
  return { donationPKR: donation, tipPKR: tip, feePKR: fee, feeCoveredPKR: feeCovered, totalPKR: total, netToCausePKR: netToCause };
}

/* ------------------------------------------------------------------ */
/* Sponsor matching                                                    */
/* ------------------------------------------------------------------ */

export type Sponsor = { id: string; name: string; logo: string; ratio: number; capPKR: number; usedPKR: number };

/** Fictional demo sponsors. In production these come from the Campus sponsor marketplace. */
export const SPONSORS: Record<string, Sponsor> = {
  "seed-winter-coats": { id: "sp-nimbus", name: "Nimbus Labs", logo: "N", ratio: 1, capPKR: 200_000, usedPKR: 112_000 },
  "seed-flood-relief": { id: "sp-qalam", name: "Qalam Fintech", logo: "Q", ratio: 1, capPKR: 300_000, usedPKR: 260_000 },
  "seed-clean-water": { id: "sp-saya", name: "Saya Solar", logo: "S", ratio: 0.5, capPKR: 150_000, usedPKR: 61_000 },
};

export function sponsorFor(campaignId: string, extraUsedPKR = 0): Sponsor | null {
  const s = SPONSORS[campaignId];
  return s ? { ...s, usedPKR: Math.min(s.capPKR, s.usedPKR + extraUsedPKR) } : null;
}

/** How much a sponsor adds for a gift, respecting the remaining cap. */
export function matchFor(sponsor: Sponsor | null, donationPKR: number) {
  if (!sponsor) return 0;
  const remaining = Math.max(0, sponsor.capPKR - sponsor.usedPKR);
  return Math.min(remaining, round(donationPKR * sponsor.ratio));
}

/* ------------------------------------------------------------------ */
/* Platform revenue roll-up                                            */
/* ------------------------------------------------------------------ */

export type RevenueInput = {
  donations: { tipPKR: number; matchedPKR: number; amountPKR: number; recurring: boolean }[];
  subscription: { plan: PlanId; cycle: BillingCycle } | null;
};

export function platformRevenue({ donations, subscription }: RevenueInput) {
  const tips = donations.reduce((s, d) => s + d.tipPKR, 0);
  const sponsorFees = round(donations.reduce((s, d) => s + d.matchedPKR, 0) * SPONSOR_LISTING_FEE);
  const plan = subscription ? getPlan(subscription.plan) : null;
  const mrrSubs = plan?.pricePKR ? (subscription!.cycle === "monthly" ? plan.pricePKR.monthly : round(plan.pricePKR.yearly / 12)) : 0;
  const gmv = donations.reduce((s, d) => s + d.amountPKR, 0);
  const recurringMRR = donations.filter((d) => d.recurring).reduce((s, d) => s + d.amountPKR + d.tipPKR, 0);
  const total = tips + sponsorFees + mrrSubs;
  return { tips, sponsorFees, mrrSubs, gmv, recurringMRR, total, takeRate: gmv ? total / gmv : 0 };
}
