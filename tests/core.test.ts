import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SEED_CAMPAIGNS } from "../src/data/campaigns";
import { fallbackCampaign, parsePrompt } from "../src/lib/ai/fallback";
import { buildDonation } from "../src/lib/mock/impact";
import { luhn } from "../src/lib/mock/payments";
import { buildCampaign, rebalancePercents } from "../src/lib/normalize";
import { CampaignSchema, type CampaignCopyAI, type StrategyAI } from "../src/lib/schema";

describe("rebalancePercents", () => {
  it("always sums to exactly 100", () => {
    for (const input of [
      [33, 33, 33],
      [70, 20, 5, 4],
      [1, 1, 1],
      [120, 60, 20],
      [99.6, 0.2, 0.2],
    ]) {
      const out = rebalancePercents(input.map((percent) => ({ percent })));
      assert.equal(
        out.reduce((s, x) => s + x.percent, 0),
        100,
        `input ${input}`,
      );
      assert.ok(out.every((x) => x.percent >= 1));
    }
  });
});

describe("seed campaigns", () => {
  it("all validate against the strict schema", () => {
    for (const c of SEED_CAMPAIGNS) assert.doesNotThrow(() => CampaignSchema.parse(c), c.slug);
  });
});

describe("fallbackCampaign", () => {
  it("matches prompts to the closest curated campaign", () => {
    assert.equal(fallbackCampaign("winter coats for kids").campaign.title, "Warmth for Gilgit");
    assert.equal(fallbackCampaign("solar water pumps in thar").campaign.title, "Thar Water Wells");
  });
  it("builds a valid generic campaign for unknown causes", () => {
    const { campaign } = fallbackCampaign("Help buy wheelchairs for elderly patients in Peshawar");
    assert.equal(campaign.title, "Wheelchairs for Elderly Patients");
    assert.equal(campaign.region, "Peshawar");
    assert.doesNotThrow(() => CampaignSchema.parse(campaign));
  });
  it("gives every generated campaign a unique slug", () => {
    assert.notEqual(fallbackCampaign("winter coats").campaign.slug, fallbackCampaign("winter coats").campaign.slug);
  });
});

describe("parsePrompt", () => {
  it("extracts a readable title and region", () => {
    assert.deepEqual(parsePrompt("Organize a Ramadan iftar drive for daily-wage workers in Islamabad"), {
      cause: "Organize a Ramadan iftar drive for daily-wage workers in Islamabad",
      title: "Ramadan Iftar Drive for Daily-Wage Workers",
      region: "Islamabad",
    });
  });
});

describe("buildCampaign (AI output normalization)", () => {
  const copy: CampaignCopyAI = {
    title: '"Books for Every Child in the Valley Today Now"',
    tagline: "A tagline",
    story: ["one", "two", "three", "four", "five"],
    goalPKR: 9_999_999,
    region: "Swat",
    beneficiaryNoun: "Children",
    impactUnits: [
      { amountPKR: 9000, label: "Library shelf", icon: "book" },
      { amountPKR: 1200.4, label: "1 book set", icon: "book" },
      { amountPKR: 4000, label: "1 school bag", icon: "package" },
      { amountPKR: 50000, label: "extra", icon: "house" },
    ],
    budget: [
      { category: "Books", percent: 70 },
      { category: "Delivery", percent: 20 },
      { category: "Fees", percent: 15 },
    ],
    faqs: [{ q: "Q?", a: "A." }],
    whatsappPitch: "Share this",
    theme: { palette: "sunrise", heroVariant: "aurora", mood: "hopeful", emoji: "📚" },
  };
  const strategy: StrategyAI = {
    days: Array.from({ length: 20 }, (_, i) => ({
      day: i * 2,
      title: `Day ${i}`,
      tasks: ["Post a reel", "Share in groups", "Email faculty", "Run a stall"],
      channel: "instagram",
      kpi: "50 shares",
    })),
  };

  it("repairs out-of-range model output into a valid campaign", () => {
    const c = buildCampaign("prompt", copy, strategy, "ai");
    assert.equal(c.goalPKR, 5_000_000);
    assert.equal(c.story.length, 4);
    assert.deepEqual(
      c.impactUnits.map((u) => u.amountPKR),
      [1200, 4000, 9000],
    );
    assert.equal(
      c.budget.reduce((s, b) => s + b.percent, 0),
      100,
    );
    assert.equal(c.days.length, 14);
    assert.deepEqual(c.days.map((d) => d.day).slice(0, 3), [1, 2, 3]);
    assert.ok(c.days.every((d) => d.tasks.length <= 3));
    assert.equal(c.beneficiaryNoun, "children");
    assert.ok(!c.title.startsWith('"'));
  });

  it("throws when output can't be repaired, so callers fall back", () => {
    assert.throws(() => buildCampaign("p", { ...copy, impactUnits: copy.impactUnits.slice(0, 1) }, strategy, "ai"));
  });
});

describe("buildDonation", () => {
  const campaign = SEED_CAMPAIGNS[0];
  it("allocates exactly the donated amount across the budget", () => {
    for (const amount of [100, 2500, 7777, 25000]) {
      const d = buildDonation(campaign, amount, "Test", `id-${amount}`, "TX");
      assert.equal(
        d.allocation.reduce((s, a) => s + a.amountPKR, 0),
        amount,
      );
    }
  });
  it("is deterministic for the same donation id", () => {
    const a = buildDonation(campaign, 5000, "Test", "same", "TX", "2026-01-01T00:00:00.000Z");
    const b = buildDonation(campaign, 5000, "Test", "same", "TX", "2026-01-01T00:00:00.000Z");
    assert.deepEqual(a, b);
  });
});

describe("luhn", () => {
  it("accepts the demo card and rejects typos", () => {
    assert.ok(luhn("4242 4242 4242 4242"));
    assert.ok(!luhn("4242 4242 4242 4241"));
  });
});

describe("AI output formats", () => {
  it("convert to JSON schema for structured outputs", async () => {
    const { zodOutputFormat } = await import("@anthropic-ai/sdk/helpers/zod");
    const { CampaignCopyAISchema, StrategyAISchema } = await import("../src/lib/schema");
    for (const s of [CampaignCopyAISchema, StrategyAISchema]) {
      const fmt = zodOutputFormat(s) as unknown as { type: string; schema: { type: string } };
      assert.equal(fmt.type, "json_schema");
      assert.equal(fmt.schema.type, "object");
    }
  });
});
