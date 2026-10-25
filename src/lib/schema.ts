import { z } from "zod";

/**
 * Single source of truth for every shape the AI produces and the UI consumes.
 *
 * Two layers:
 *  - `*AISchema`  — the loose shape sent to the model as a JSON-schema output format.
 *                   Structured outputs don't support every numeric/length constraint,
 *                   so it only encodes structure, enums and descriptions.
 *  - `CampaignSchema` — the strict shape the app renders. AI output is normalized
 *                   (clamped, trimmed, re-balanced) and then validated against it.
 *                   Fallback JSON in src/data/campaigns must also pass it.
 */

export const PALETTES = ["aurora", "ember", "glacier", "forest", "sunrise", "midnight"] as const;
export const HERO_VARIANTS = ["spotlight", "aurora", "beams", "orbit"] as const;
export const MOODS = ["urgent", "hopeful", "warm", "bold"] as const;
export const CHANNELS = ["instagram", "whatsapp", "campus", "linkedin", "email", "event"] as const;
export const ICONS = [
  "shirt",
  "heart",
  "book",
  "droplet",
  "house",
  "utensils",
  "flame",
  "graduation-cap",
  "stethoscope",
  "package",
  "sun",
  "tree",
  "users",
  "snowflake",
  "baby",
  "leaf",
] as const;

export type Palette = (typeof PALETTES)[number];
export type HeroVariant = (typeof HERO_VARIANTS)[number];
export type Channel = (typeof CHANNELS)[number];
export type IconName = (typeof ICONS)[number];

/* ------------------------------------------------------------------ */
/* AI-facing schemas                                                   */
/* ------------------------------------------------------------------ */

export const ThemeAISchema = z.object({
  palette: z
    .enum(PALETTES)
    .describe(
      "aurora=teal/violet (tech, education), ember=orange/red (urgent relief, warmth), glacier=icy blue (winter, water), forest=green (environment, food), sunrise=amber/pink (children, hope), midnight=indigo/gold (dignity, health)",
    ),
  heroVariant: z.enum(HERO_VARIANTS).describe("spotlight=dramatic, aurora=soft and hopeful, beams=energetic, orbit=global/community"),
  mood: z.enum(MOODS),
  emoji: z.string().describe("Exactly one emoji that represents the cause"),
});

export const CampaignCopyAISchema = z.object({
  title: z.string().describe("Punchy campaign name, max 6 words, no quotes"),
  tagline: z.string().describe("One emotional sentence, max 18 words"),
  story: z.array(z.string()).describe("3 short paragraphs: the problem, the plan, the call to action"),
  goalPKR: z.number().describe("Realistic student-run fundraising goal in Pakistani Rupees, 50,000 to 2,000,000"),
  region: z.string().describe("Where the impact happens, e.g. 'Gilgit-Baltistan'. Infer a plausible region in Pakistan if unstated"),
  beneficiaryNoun: z.string().describe("Plural noun for who is helped, e.g. 'children', 'families', 'students'"),
  impactUnits: z
    .array(
      z.object({
        amountPKR: z.number().describe("Cost in PKR"),
        label: z.string().describe("What that amount buys, e.g. '1 insulated winter coat'"),
        icon: z.enum(ICONS),
      }),
    )
    .describe("Exactly 3 tiers, ascending price"),
  budget: z
    .array(z.object({ category: z.string(), percent: z.number() }))
    .describe("3-5 transparent budget categories, percents sum to 100, direct aid must be the largest"),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).describe("3 donor FAQs"),
  whatsappPitch: z.string().describe("A 2-3 sentence WhatsApp forward message with 1-2 emojis"),
  theme: ThemeAISchema,
});

export const StrategyAISchema = z.object({
  days: z
    .array(
      z.object({
        day: z.number(),
        title: z.string().describe("Short headline for the day"),
        tasks: z.array(z.string()).describe("2-3 concrete actions a student team can do"),
        channel: z.enum(CHANNELS),
        kpi: z.string().describe("Measurable target for the day, e.g. '50 story shares'"),
      }),
    )
    .describe("A 10 to 14 day execution plan for a university student team"),
});

export type CampaignCopyAI = z.infer<typeof CampaignCopyAISchema>;
export type StrategyAI = z.infer<typeof StrategyAISchema>;

/* ------------------------------------------------------------------ */
/* Strict app schemas                                                  */
/* ------------------------------------------------------------------ */

export const ThemeSchema = z.object({
  palette: z.enum(PALETTES),
  heroVariant: z.enum(HERO_VARIANTS),
  mood: z.enum(MOODS),
  emoji: z.string().min(1).max(8),
});

export const StrategyDaySchema = z.object({
  day: z.number().int().min(1).max(14),
  title: z.string().min(2).max(80),
  tasks: z.array(z.string().min(2)).min(1).max(4),
  channel: z.enum(CHANNELS),
  kpi: z.string().min(2).max(80),
});

export const CampaignSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  prompt: z.string(),
  source: z.enum(["ai", "fallback", "seed"]),
  createdAt: z.string(),
  baseRaisedPKR: z.number().int().min(0),
  baseDonors: z.number().int().min(0),

  title: z.string().min(2).max(70),
  tagline: z.string().min(2).max(160),
  story: z.array(z.string().min(2)).min(2).max(4),
  goalPKR: z.number().int().min(10_000).max(5_000_000),
  region: z.string().min(2).max(60),
  beneficiaryNoun: z.string().min(2).max(30),
  impactUnits: z.array(z.object({ amountPKR: z.number().int().positive(), label: z.string().min(2), icon: z.enum(ICONS) })).length(3),
  budget: z
    .array(z.object({ category: z.string().min(2).max(40), percent: z.number().int().min(1).max(100) }))
    .min(2)
    .max(5)
    .refine((b) => b.reduce((s, x) => s + x.percent, 0) === 100, "budget must sum to 100"),
  faqs: z
    .array(z.object({ q: z.string().min(2), a: z.string().min(2) }))
    .min(1)
    .max(4),
  whatsappPitch: z.string().min(2),
  theme: ThemeSchema,
  days: z.array(StrategyDaySchema).min(5).max(14),
});

export type Campaign = z.infer<typeof CampaignSchema>;
export type StrategyDay = z.infer<typeof StrategyDaySchema>;

export const GenerateRequestSchema = z.object({
  prompt: z.string().trim().min(8, "Tell us a bit more about your cause").max(280),
});

export type GenerateResponse = {
  campaign: Campaign;
  source: "ai" | "fallback";
  ms: number;
  reason?: string;
};

/* ------------------------------------------------------------------ */
/* Donations (mock)                                                    */
/* ------------------------------------------------------------------ */

export type Beneficiary = {
  id: string;
  name: string;
  age: number;
  town: string;
  outcome: string;
};

export type JourneyStep = { label: string; detail: string; dayOffset: number };

export type Donation = {
  id: string;
  campaignId: string;
  campaignSlug: string;
  donorName: string;
  amountPKR: number;
  createdAt: string;
  txId: string;
  allocation: { category: string; amountPKR: number }[];
  beneficiaries: Beneficiary[];
  units: { label: string; count: number; icon: IconName };
  ripple: { direct: number; household: number; community: number };
  journey: JourneyStep[];
  stats: { donorRank: number; totalDonors: number; percentile: number; streakDays: number };
  /* Checkout extras (optional so donations saved by older versions still load). */
  tipPKR?: number;
  feeCoveredPKR?: number;
  matchedPKR?: number;
  sponsorName?: string;
  recurring?: boolean;
  totalPKR?: number;
};

export type DonationExtras = Pick<Donation, "tipPKR" | "feeCoveredPKR" | "matchedPKR" | "sponsorName" | "recurring" | "totalPKR">;
