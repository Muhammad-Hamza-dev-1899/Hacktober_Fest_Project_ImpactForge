import { NextResponse } from "next/server";
import { generateCampaign } from "@/lib/ai/generate";
import { GenerateRequestSchema, type GenerateResponse } from "@/lib/schema";

export const maxDuration = 30;

// Best-effort, per-instance rate limit so a public demo key can't be drained.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Easy there! Try again in a minute." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = GenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid prompt" }, { status: 400 });
  }

  const started = Date.now();
  const result = await generateCampaign(parsed.data.prompt);
  const payload: GenerateResponse = { ...result, ms: Date.now() - started };
  return NextResponse.json(payload);
}
