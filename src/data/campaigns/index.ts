import { CampaignSchema, type Campaign } from "@/lib/schema";
import cleanWater from "./clean-water.json";
import floodRelief from "./flood-relief.json";
import textbooks from "./textbooks.json";
import winterCoats from "./winter-coats.json";

/** Curated campaigns. Validated at import time, so a bad edit fails the build, not the demo. */
export const SEED_CAMPAIGNS: Campaign[] = [winterCoats, floodRelief, textbooks, cleanWater].map((c) => CampaignSchema.parse(c));

/** Keywords used to match a free-text prompt to the closest curated campaign when AI is unavailable. */
export const SEED_KEYWORDS: Record<string, string[]> = {
  "seed-winter-coats": [
    "winter",
    "coat",
    "coats",
    "jacket",
    "cold",
    "snow",
    "blanket",
    "warm",
    "gilgit",
    "skardu",
    "hunza",
    "sweater",
    "clothes",
    "clothing",
  ],
  "seed-flood-relief": [
    "flood",
    "floods",
    "relief",
    "disaster",
    "ration",
    "food",
    "sindh",
    "rain",
    "earthquake",
    "emergency",
    "hunger",
    "families",
  ],
  "seed-textbooks": [
    "book",
    "books",
    "textbook",
    "school",
    "education",
    "girls",
    "stationery",
    "supplies",
    "students",
    "library",
    "balochistan",
    "tuition",
    "fees",
    "study",
  ],
  "seed-clean-water": ["water", "well", "wells", "pump", "solar", "thar", "drought", "filter", "clean", "sanitation", "tharparkar"],
};

export const getSeed = (slug: string) => SEED_CAMPAIGNS.find((c) => c.slug === slug);
