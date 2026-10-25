"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Info, WandSparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { GenerationTheater } from "@/components/studio/GenerationTheater";
import { EXAMPLE_PROMPTS } from "@/components/studio/examples";
import { Embers } from "@/components/ui/Embers";
import { BlurText, ShimmerButton } from "@/components/ui/primitives";
import type { Campaign, GenerateResponse } from "@/lib/schema";
import { cn, sleep } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const MIN_THEATER_MS = 4200;
const MAX_LEN = 280;

export function PromptStudio() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const campaigns = useAppStore((s) => s.campaigns);
  const draftPrompt = useAppStore((s) => s.draftPrompt);
  const setDraftPrompt = useAppStore((s) => s.setDraftPrompt);
  const addCampaign = useAppStore((s) => s.addCampaign);
  const setFresh = useAppStore((s) => s.setFresh);

  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState<"idle" | "generating" | "finishing">("idle");
  const [result, setResult] = useState<Campaign | null>(null);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const generate = useCallback(
    async (text: string) => {
      const p = text.trim();
      if (p.length < 8) {
        setError("Tell us a little more about your cause (at least a few words).");
        return;
      }
      setError(null);
      setPrompt(p);
      setResult(null);
      setPhase("generating");
      try {
        const [res] = await Promise.all([
          fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: p }),
          }),
          sleep(MIN_THEATER_MS),
        ]);
        const data = (await res.json()) as GenerateResponse & { error?: string };
        if (!res.ok || !data.campaign) throw new Error(data.error || "Generation failed");
        setPhase("finishing");
        setResult(data.campaign);
        addCampaign(data.campaign);
        setFresh({ campaignId: data.campaign.id, source: data.source, ms: data.ms, reason: data.reason });
        await sleep(2200);
        router.push(`/c/${data.campaign.slug}`);
      } catch (e) {
        setPhase("idle");
        setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      }
    },
    [addCampaign, router, setFresh],
  );

  // Arriving from the landing page hero: start immediately.
  useEffect(() => {
    if (started.current || !draftPrompt) return;
    started.current = true;
    const p = draftPrompt;
    setDraftPrompt("");
    void generate(p);
  }, [draftPrompt, generate, setDraftPrompt]);

  return (
    <div className="relative isolate flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-20rem] h-[44rem] w-[64rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,106,61,0.28),rgba(255,61,119,0.1)_55%,transparent)] blur-2xl" />
        <div className="bg-grid mask-radial absolute inset-0 opacity-50" />
        <Embers density={0.6} />
      </div>

      <div className="mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-6 sm:pt-40">
        <p className="text-center font-mono text-xs uppercase tracking-[0.22em] text-white/40">Salaam, {user?.name ?? "friend"} 👋</p>
        <h1 className="mt-4 text-center text-5xl font-semibold tracking-[-0.04em] sm:text-7xl">
          <BlurText text="What will you" wordClassName="text-silver pb-[0.06em]" />{" "}
          <BlurText text="change?" delay={0.25} gradient className="serif tracking-[-0.02em]" />
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-center text-white/50">
          Describe your cause in one sentence. We&apos;ll write the story, design the page and plan every day of your launch.
        </p>

        <form
          className="group relative mt-12"
          onSubmit={(e) => {
            e.preventDefault();
            void generate(prompt);
          }}
        >
          <div className="absolute -inset-4 rounded-[2.5rem] bg-[radial-gradient(60%_100%_at_50%_50%,rgba(255,106,61,0.3),transparent)] opacity-60 blur-2xl transition duration-500 group-focus-within:opacity-100" />
          <div className="border-spin relative rounded-[1.9rem] p-px">
            <div className="relative rounded-[calc(1.9rem-1px)] bg-[#0e0d12] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value.slice(0, MAX_LEN))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
                    e.preventDefault();
                    void generate(prompt);
                  }
                }}
                rows={3}
                autoFocus
                placeholder="I want to raise funds for winter coats for kids in Gilgit…"
                aria-label="Describe your cause"
                className="w-full resize-none bg-transparent px-3 pt-2 text-xl leading-relaxed text-white outline-none placeholder:text-white/25"
              />
              <div className="flex items-center justify-between gap-3 px-2 pb-1">
                <span className={cn("font-mono text-[11px] tabular-nums text-white/30", prompt.length > MAX_LEN - 20 && "text-amber-300")}>
                  {prompt.length}/{MAX_LEN}
                </span>
                <ShimmerButton type="submit" disabled={phase !== "idle"}>
                  <WandSparkles className="h-4 w-4" /> Generate campaign
                </ShimmerButton>
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
              className="mt-4 flex items-center gap-2 text-sm text-rose-300"
              role="alert"
            >
              <Info className="h-4 w-4" /> {error}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="mt-10">
          <p className="eyebrow mb-4 text-center text-white/30">Or try one</p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_PROMPTS.map((ex, i) => (
              <motion.button
                key={ex.label}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.04 }}
                onClick={() => setPrompt(ex.prompt)}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-white/60 transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
              >
                <span>{ex.emoji}</span>
                {ex.label}
              </motion.button>
            ))}
          </div>
        </div>

        {campaigns.length > 0 && (
          <div className="mt-20">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your recent campaigns</h2>
              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white"
              >
                Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {campaigns.slice(0, 2).map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>{phase !== "idle" && <GenerationTheater prompt={prompt} result={result} />}</AnimatePresence>
    </div>
  );
}
