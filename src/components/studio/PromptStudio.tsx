"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Info, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { UpsellSheet } from "@/components/billing/Upsell";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { GenerationTheater } from "@/components/studio/GenerationTheater";
import { EXAMPLE_PROMPTS } from "@/components/studio/examples";
import type { Campaign, GenerateResponse } from "@/lib/schema";
import { cn, sleep } from "@/lib/utils";
import { useAppStore, usePlan } from "@/store/useAppStore";

const MIN_THEATER_MS = 4200;
const MAX_LEN = 280;

export function PromptStudio() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const campaigns = useAppStore((s) => s.campaigns);
  const aiGenerations = useAppStore((s) => s.aiGenerations);
  const draftPrompt = useAppStore((s) => s.draftPrompt);
  const setDraftPrompt = useAppStore((s) => s.setDraftPrompt);
  const addCampaign = useAppStore((s) => s.addCampaign);
  const setFresh = useAppStore((s) => s.setFresh);
  const noteGeneration = useAppStore((s) => s.noteGeneration);
  const { plan } = usePlan();

  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState<"idle" | "generating" | "finishing">("idle");
  const [result, setResult] = useState<Campaign | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [upsell, setUpsell] = useState<string | null>(null);
  const started = useRef(false);

  const usedThisMonth = aiGenerations.month === new Date().toISOString().slice(0, 7) ? aiGenerations.count : 0;
  const atCampaignLimit = campaigns.length >= plan.limits.liveCampaigns;
  const atGenerationLimit = usedThisMonth >= plan.limits.aiGenerationsPerMonth;

  const generate = useCallback(
    async (text: string) => {
      const p = text.trim();
      if (p.length < 8) {
        setError("Add a few more words about your cause (at least 8 characters).");
        return;
      }
      if (atCampaignLimit) return setUpsell("Run more than one campaign at a time with Society Pro.");
      if (atGenerationLimit) return setUpsell("You've used this month's 3 free AI generations.");
      setError(null);
      setPrompt(p);
      setResult(null);
      setPhase("generating");
      try {
        const [res] = await Promise.all([
          fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: p }) }),
          sleep(MIN_THEATER_MS),
        ]);
        const data = (await res.json()) as GenerateResponse & { error?: string };
        if (!res.ok || !data.campaign) throw new Error(data.error || "We couldn't create the campaign. Please try again.");
        setPhase("finishing");
        setResult(data.campaign);
        addCampaign(data.campaign);
        noteGeneration();
        setFresh({ campaignId: data.campaign.id, source: data.source, ms: data.ms, reason: data.reason });
        await sleep(2200);
        router.push(`/c/${data.campaign.slug}`);
      } catch (e) {
        setPhase("idle");
        setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      }
    },
    [addCampaign, atCampaignLimit, atGenerationLimit, noteGeneration, router, setFresh],
  );

  useEffect(() => {
    if (started.current || !draftPrompt) return;
    started.current = true;
    const p = draftPrompt;
    setDraftPrompt("");
    void generate(p);
  }, [draftPrompt, generate, setDraftPrompt]);

  return (
    <div className="flex-1">
      <div className="mx-auto max-w-[760px] px-6 pb-24 pt-28 sm:pt-36">
        <p className="t-eyebrow text-center text-ink-2">Welcome, {user?.name ?? "friend"}</p>
        <h1 className="t-hero mt-2 text-center">
          What will you <span className="text-intel">change?</span>
        </h1>
        <p className="t-lede mx-auto mt-5 max-w-lg text-center">
          Describe your cause in one sentence. We&apos;ll write the story, design the page and plan every day of your launch.
        </p>

        <form
          className="group relative mt-12"
          onSubmit={(e) => {
            e.preventDefault();
            void generate(prompt);
          }}
        >
          <div
            aria-hidden
            className="intel-ring absolute -inset-1 rounded-[30px] opacity-40 blur-xl transition duration-500 group-focus-within:opacity-70"
          />
          <div className="intel-ring relative rounded-[28px] p-[2px]">
            <div className="rounded-[26px] bg-raised p-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value.slice(0, MAX_LEN))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void generate(prompt);
                  }
                }}
                rows={3}
                autoFocus
                placeholder="I want to raise funds for winter coats for kids in Gilgit…"
                aria-label="Describe your cause in one sentence"
                aria-describedby="prompt-hint"
                className="w-full resize-none bg-transparent px-3 pt-2 text-[21px] leading-relaxed text-ink outline-none placeholder:text-ink-2"
              />
              <div className="flex items-center justify-between gap-3 px-2 pb-1">
                <span
                  id="prompt-hint"
                  className={cn("text-[13px] tabular-nums text-ink-2", prompt.length > MAX_LEN - 20 && "text-[#b25000]")}
                >
                  {prompt.length}/{MAX_LEN} · Return to create
                </span>
                <button
                  type="submit"
                  disabled={phase !== "idle"}
                  aria-label="Create campaign"
                  className="grid h-11 w-11 place-items-center rounded-full bg-blue text-white transition hover:bg-[var(--blue-hover)] disabled:opacity-40"
                >
                  <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </form>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-center gap-2 text-[15px] text-[#d70015]"
              role="alert"
            >
              <Info className="h-4 w-4 shrink-0" aria-hidden /> {error}
            </motion.p>
          )}
        </AnimatePresence>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[13px] text-ink-2">
          <Sparkles className="h-3.5 w-3.5" aria-hidden /> Written by AI. You can edit everything before you share.
          {plan.id === "free" && (
            <span> · {Math.max(0, plan.limits.aiGenerationsPerMonth - usedThisMonth)} free generations left this month</span>
          )}
        </p>

        <div className="mt-12">
          <p className="mb-4 text-center text-[15px] text-ink-2">Or start from an idea</p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_PROMPTS.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => setPrompt(ex.prompt)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-mist px-4 text-[15px] text-ink transition hover:bg-line/50"
              >
                <span aria-hidden>{ex.emoji}</span>
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {campaigns.length > 0 && (
          <div className="mt-20">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="text-[24px] font-semibold tracking-[-0.01em]">Your campaigns</h2>
              <Link href="/dashboard" className="link text-[15px]">
                Dashboard ›
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {campaigns.slice(0, 2).map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>{phase !== "idle" && <GenerationTheater prompt={prompt} result={result} />}</AnimatePresence>
      <UpsellSheet open={!!upsell} reason={upsell ?? ""} onClose={() => setUpsell(null)} />
    </div>
  );
}
