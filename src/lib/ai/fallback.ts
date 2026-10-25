import { nanoid } from "nanoid";
import { SEED_CAMPAIGNS, SEED_KEYWORDS } from "@/data/campaigns";
import { CampaignSchema, type Campaign } from "../schema";
import { slugify } from "../utils";

const tokenize = (s: string) => s.toLowerCase().match(/[a-z]+/g) ?? [];

/**
 * Offline "generation": matches the prompt to the closest curated campaign, or
 * builds a generic campaign around the prompt's own words. Always valid, always instant.
 */
export function fallbackCampaign(prompt: string): { campaign: Campaign; source: "fallback" } {
  const words = new Set(tokenize(prompt));
  let best: { seed: Campaign; score: number } | null = null;
  for (const seed of SEED_CAMPAIGNS) {
    const score = (SEED_KEYWORDS[seed.id] ?? []).filter((k) => words.has(k)).length;
    if (score > 0 && (!best || score > best.score)) best = { seed, score };
  }

  const id = nanoid(10);
  const base = best ? best.seed : genericCampaign(prompt);
  const campaign = CampaignSchema.parse({
    ...base,
    id,
    slug: `${base.slug}-${id
      .slice(0, 4)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "x")}`,
    prompt,
    source: "fallback",
    createdAt: new Date().toISOString(),
    baseRaisedPKR: 0,
    baseDonors: 0,
  });
  return { campaign, source: "fallback" };
}

const LEADS = [
  /^(?:i|we)\s+(?:want|would like|need|plan)\s+to\s+/i,
  /^please\s+/i,
  /^help\s+(?:us\s+)?/i,
  /^(?:raise|collect)\s+(?:funds|money|donations)\s+(?:for|to)\s+/i,
  /^create\s+a\s+fund\s+to\s+/i,
];
const VERB =
  /^(?:and\s+)?(?:fund|buy|provide|organi[sz]e|start|create|build|install|get|support|cover|pay|vaccinate|feed|give|send|distribute)\s+(?:an?\s+|the\s+|for\s+)?/i;

const titleCase = (s: string) => s.replace(/(^|[\s-])([a-z])/g, (m) => m.toUpperCase());
const strip = (s: string, res: RegExp[]) => {
  for (let i = 0; i < 6; i++) for (const re of res) s = s.replace(re, "").trim();
  return s;
};

/** "Help buy wheelchairs for elderly patients in Peshawar" → { cause, title: "Wheelchairs for Elderly Patients", region: "Peshawar" } */
export function parsePrompt(prompt: string) {
  let cause = strip(prompt.trim().replace(/[.!?]+$/, ""), LEADS);
  if (cause.length < 4) cause = prompt.trim();

  const region = cause.match(/\b(?:in|at|around|across)\s+(?:the\s+)?([A-Z][\w-]*(?:\s+[A-Z][\w-]*)*)/)?.[1];
  const core = cause.replace(/\s+(?:in|at|around|across|near)\s+.*$/i, "");
  const [rawWhat, rawWho] = core.split(/\s+for\s+/i);
  const what = strip(rawWhat, [VERB]) || rawWhat;
  const who = rawWho?.replace(/\s+(?:who|that|facing|with|from|during|affected)\b.*$/i, "");
  const words = (t: string, n: number, fromEnd = false) => {
    const w = t.split(/\s+/).filter(Boolean);
    return (fromEnd ? w.slice(-n) : w.slice(0, n)).join(" ");
  };
  const title = who ? `${titleCase(words(what, 3, true))} for ${titleCase(words(who, 3))}` : `Project ${titleCase(words(what, 3, true))}`;
  // Noun phrase for prose: "buy wheelchairs for…" → "wheelchairs for…"
  const subject = strip(cause, [VERB]) || cause;
  return { cause, subject, title: title.slice(0, 60), region };
}

function genericCampaign(prompt: string): Campaign {
  const { subject: cause, title, region } = parsePrompt(prompt);
  return {
    id: "generic",
    slug: slugify(title) || "campaign",
    prompt,
    source: "fallback",
    createdAt: new Date().toISOString(),
    baseRaisedPKR: 0,
    baseDonors: 0,
    title,
    tagline: `A student-led movement for ${cause}. Small gifts, pooled together, change real lives.`.slice(0, 160),
    story: [
      `Some problems are too big for one person, but not for a campus. We started this campaign for one reason: ${cause}. That needs more than sympathy; it needs a plan and people willing to show up.`,
      "Every rupee is tracked against a transparent budget and spent with verified local partners. Our student team handles outreach, logistics and reporting, and every donor gets a personal impact report.",
      "Give what you can, share it with three friends, and help us prove what a student community can do in two weeks.",
    ],
    goalPKR: 500_000,
    region: region ?? "Pakistan",
    beneficiaryNoun: "people",
    impactUnits: [
      { amountPKR: 1500, label: "Essentials for 1 person", icon: "heart" },
      { amountPKR: 5000, label: "A full support kit for a family", icon: "package" },
      { amountPKR: 20000, label: "Sponsor a community drive", icon: "users" },
    ],
    budget: [
      { category: "Direct aid", percent: 75 },
      { category: "Logistics & delivery", percent: 15 },
      { category: "Outreach materials", percent: 6 },
      { category: "Payment & admin fees", percent: 4 },
    ],
    faqs: [
      { q: "Who runs this campaign?", a: "A volunteer team of university students, working with verified local partners." },
      {
        q: "How will I know my money was used well?",
        a: "You'll receive an Impact Wrapped report showing exactly where every rupee went.",
      },
    ],
    whatsappPitch: `✨ Students are raising funds for ${cause}. Every PKR 1,500 helps one person directly. Takes 30 seconds to give 👇`,
    theme: { palette: "midnight", heroVariant: "orbit", mood: "bold", emoji: "✨" },
    days: [
      { day: 1, title: "Soft launch", tasks: ["Team donates first", "Share with close friends"], channel: "whatsapp", kpi: "10 donors" },
      {
        day: 2,
        title: "Story post",
        tasks: ["Instagram carousel explaining the cause", "Tag campus societies"],
        channel: "instagram",
        kpi: "50 shares",
      },
      {
        day: 3,
        title: "Faculty outreach",
        tasks: ["Email department heads", "Request class announcements"],
        channel: "email",
        kpi: "10 faculty donors",
      },
      {
        day: 4,
        title: "Campus stall",
        tasks: ["QR-code stall at the cafeteria", "Live progress board"],
        channel: "campus",
        kpi: "PKR 50,000",
      },
      {
        day: 5,
        title: "Alumni ask",
        tasks: ["LinkedIn post tagging alumni", "Direct messages to 20 alumni"],
        channel: "linkedin",
        kpi: "15 alumni donors",
      },
      {
        day: 6,
        title: "Fundraiser night",
        tasks: ["Host an open-mic or quiz", "Entry by donation"],
        channel: "event",
        kpi: "100 attendees",
      },
      {
        day: 7,
        title: "Midpoint update",
        tasks: ["Share progress & thank donors", "Ask each donor to forward once"],
        channel: "whatsapp",
        kpi: "50% of goal",
      },
      { day: 8, title: "Final push", tasks: ["Countdown stories", "Personal follow-ups"], channel: "instagram", kpi: "Goal reached" },
      {
        day: 9,
        title: "Impact report",
        tasks: ["Send every donor their Impact Wrapped", "Publish the budget"],
        channel: "email",
        kpi: "80% open rate",
      },
    ],
  };
}
