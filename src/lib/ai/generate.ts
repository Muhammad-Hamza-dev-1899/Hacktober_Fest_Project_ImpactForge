import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
import { buildCampaign } from "../normalize";
import { CampaignCopyAISchema, StrategyAISchema, type Campaign } from "../schema";
import { fallbackCampaign } from "./fallback";
import { COPY_SYSTEM, STRATEGY_SYSTEM, userPrompt } from "./prompts";

const MODEL = process.env.AI_MODEL || "claude-haiku-5-5";
const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 25_000);

let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic({ maxRetries: 0 }));

async function structured<S extends z.ZodType>(schema: S, system: string, prompt: string, signal: AbortSignal) {
  const res = await getClient().messages.parse(
    {
      model: MODEL,
      max_tokens: 4000,
      system,
      messages: [{ role: "user", content: userPrompt(prompt) }],
      output_config: { format: zodOutputFormat(schema) },
    },
    { signal },
  );
  if (!res.parsed_output) throw new Error(`model returned no parsable output (stop_reason=${res.stop_reason})`);
  return res.parsed_output as z.infer<S>;
}

export type GenerationResult = { campaign: Campaign; source: "ai" | "fallback"; reason?: string };

/**
 * Generates a campaign with two parallel structured-output calls (copy+theme, strategy).
 * Never throws: any failure (no key, timeout, invalid output) resolves to a curated fallback,
 * so the demo always works.
 */
export async function generateCampaign(prompt: string): Promise<GenerationResult> {
  if (process.env.DEMO_MODE === "true") return { ...fallbackCampaign(prompt), reason: "demo mode" };
  if (!process.env.ANTHROPIC_API_KEY) return { ...fallbackCampaign(prompt), reason: "no API key configured" };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const [copy, strategy] = await Promise.all([
      structured(CampaignCopyAISchema, COPY_SYSTEM, prompt, ctrl.signal),
      structured(StrategyAISchema, STRATEGY_SYSTEM, prompt, ctrl.signal),
    ]);
    return { campaign: buildCampaign(prompt, copy, strategy, "ai"), source: "ai" };
  } catch (err) {
    const reason = ctrl.signal.aborted ? "timeout" : err instanceof Error ? err.message.slice(0, 200) : "unknown";
    console.warn("[generate] falling back:", reason);
    return { ...fallbackCampaign(prompt), reason };
  } finally {
    clearTimeout(timer);
  }
}
