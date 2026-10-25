import type { Beneficiary, Campaign, Donation, DonationExtras, JourneyStep } from "../schema";
import { pick, seededRandom } from "../utils";

/**
 * MOCK impact engine. In production this data would come from partner NGO reports
 * (receipts, distribution logs). Here it's derived deterministically from the donation
 * id, so the same donation always tells the same story.
 */

const FIRST_NAMES = [
  "Ayesha",
  "Bilal",
  "Zainab",
  "Hamza",
  "Mahnoor",
  "Ali",
  "Fatima",
  "Usman",
  "Hira",
  "Saad",
  "Iqra",
  "Danish",
  "Noor",
  "Rehan",
  "Sana",
  "Abdullah",
  "Maryam",
  "Shahzaib",
  "Laiba",
  "Farhan",
  "Kiran",
  "Sameer",
  "Areeba",
  "Yasir",
];

const TOWNS: Record<string, string[]> = {
  "gilgit-baltistan": ["Danyore", "Jutial", "Skardu", "Aliabad", "Shigar", "Nagar"],
  sindh: ["Johi", "Mehar", "Khairpur Nathan Shah", "Mithi", "Islamkot", "Diplo"],
  balochistan: ["Turbat", "Tump", "Buleda", "Mand", "Dasht"],
  default: ["Village A", "Village B", "Town Centre", "North Ward", "Riverside"],
};

function townsFor(region: string) {
  const r = region.toLowerCase();
  if (r.includes("gilgit") || r.includes("skardu") || r.includes("hunza")) return TOWNS["gilgit-baltistan"];
  if (r.includes("sindh") || r.includes("thar") || r.includes("dadu")) return TOWNS.sindh;
  if (r.includes("baloch") || r.includes("kech") || r.includes("quetta")) return TOWNS.balochistan;
  return [region.split(",")[0].trim() || "Town Centre", ...TOWNS.default];
}

export function buildDonation(
  campaign: Campaign,
  amountPKR: number,
  donorName: string,
  id: string,
  txId: string,
  createdAt = new Date().toISOString(),
  priorDonors = campaign.baseDonors,
  extras: DonationExtras = {},
): Donation {
  const rand = seededRandom(id);
  // A sponsor match multiplies real-world impact, so the story is told on gift + match.
  const effective = amountPKR + (extras.matchedPKR ?? 0);
  const [u1] = campaign.impactUnits;

  // The entry tier is the countable unit ("1 winter coat"), so it drives "your money became N …".
  const unit = u1;
  const count = Math.max(1, Math.floor(effective / unit.amountPKR));

  // Allocation follows the campaign's published budget exactly (sums to amount).
  let remaining = effective;
  const allocation = campaign.budget.map((b, i) => {
    const share = i === campaign.budget.length - 1 ? remaining : Math.round((effective * b.percent) / 100);
    remaining -= share;
    return { category: b.category, amountPKR: share };
  });

  const direct = Math.max(1, Math.min(8, Math.floor(effective / u1.amountPKR)));
  const towns = townsFor(campaign.region);
  const used = new Set<string>();
  const beneficiaries: Beneficiary[] = Array.from({ length: direct }, (_, i) => {
    let name = pick(rand, FIRST_NAMES);
    while (used.has(name)) name = pick(rand, FIRST_NAMES);
    used.add(name);
    return {
      id: `${id}-b${i}`,
      name,
      age: 6 + Math.floor(rand() * 9),
      town: pick(rand, towns),
      outcome: u1.label.replace(/^1\s+/, ""),
    };
  });

  const household = Math.round(direct * (4.5 + rand() * 2.5));
  const community = household * (8 + Math.floor(rand() * 6));

  const journey: JourneyStep[] = [
    { label: "Donation received", detail: `Secured & receipted · ${txId}`, dayOffset: 0 },
    { label: "Funds pooled", detail: `Joined ${priorDonors + 1} donors in the campaign pool`, dayOffset: 1 },
    { label: "Purchased locally", detail: `${allocation[0].category} sourced in ${campaign.region}`, dayOffset: 3 },
    { label: "Quality checked", detail: "Verified by student coordinators", dayOffset: 5 },
    { label: "Delivered", detail: `Handed to ${direct} ${campaign.beneficiaryNoun} in ${beneficiaries[0].town}`, dayOffset: 8 },
    { label: "Thank-you note", detail: "Photos & handwritten notes sent back", dayOffset: 10 },
  ];

  const totalDonors = priorDonors + 1;
  // "Top X% of donors": bigger gifts relative to the entry tier rank higher.
  const percentile = Math.max(1, Math.min(60, Math.round(50 / Math.sqrt(amountPKR / u1.amountPKR) + rand() * 5)));

  return {
    id,
    campaignId: campaign.id,
    campaignSlug: campaign.slug,
    donorName,
    amountPKR,
    ...extras,
    createdAt,
    txId,
    allocation,
    beneficiaries,
    units: { label: unit.label.replace(/^1\s+/, ""), count, icon: unit.icon },
    ripple: { direct, household, community },
    journey,
    stats: { donorRank: totalDonors, totalDonors, percentile, streakDays: 1 + Math.floor(rand() * 4) },
  };
}
