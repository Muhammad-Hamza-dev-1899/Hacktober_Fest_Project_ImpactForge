"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Info, WandSparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { GenerationTheater } from "@/components/studio/GenerationTheater";
import { EXAMPLE_PROMPTS } from "@/components/studio/examples";
import { Aurora } from "@/components/ui/backgrounds";
import { BlurText, ShimmerButton } from "@/components/ui/primitives";
import type { GenerateResponse } from "@/lib/schema";
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
        addCampaign(data.campaign);
        setFresh({ campaignId: data.campaign.id, source: data.source, ms: data.ms, reason: data.reason });
        await sleep(1300);
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
      <Aurora className="-z-10 opacity-50" />
      <div className="bg-grid mask-radial pointer-events-none absolute inset-0 -z-10 opacity-60" />

      <div className="mx-auto max-w-3xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20">
        <p className="text-center text-sm text-white/50">Welcome, {user?.name ?? "friend"} 👋</p>
        <h1 className="mt-3 text-center font-display text-4xl font-semibold tracking-tight sm:text-6xl">
          <BlurText text="What do you want to" /> <BlurText text="change?" delay={0.25} gradient />
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-center text-white/55">
          Describe your cause in one sentence. We&apos;ll write the story, design the page and plan every day of your launch.
        </p>

        <form
          className="group relative mt-10"
          onSubmit={(e) => {
            e.preventDefault();
            void generate(prompt);
          }}
        >
          <div className="absolute -inset-px rounded-[1.75rem] bg-[linear-gradient(110deg,var(--c3),var(--c1),var(--c2),var(--c3))] opacity-40 blur-lg transition duration-500 group-focus-within:opacity-90" />
          <div className="relative rounded-[1.75rem] border border-white/15 bg-ink/90 p-3 backdrop-blur-xl">
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
              className="w-full resize-none bg-transparent px-3 pt-2 text-lg text-white outline-none placeholder:text-white/30"
            />
            <div className="flex items-center justify-between gap-3 px-2 pb-1">
              <span className={cn("text-xs tabular-nums text-white/35", prompt.length > MAX_LEN - 20 && "text-amber-300")}>
                {prompt.length}/{MAX_LEN}
              </span>
              <ShimmerButton type="submit" disabled={phase !== "idle"}>
                <WandSparkles className="h-4 w-4" /> Generate campaign
              </ShimmerButton>
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

        <div className="mt-8">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/35">Try one</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((ex, i) => (
              <motion.button
                key={ex.label}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.04 }}
                onClick={() => setPrompt(ex.prompt)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-white/70 transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
              >
                <span>{ex.emoji}</span>
                {ex.label}
              </motion.button>
            ))}
          </div>
        </div>

        {campaigns.length > 0 && (
          <div className="mt-16">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Your recent campaigns</h2>
              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white"
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

      <AnimatePresence>{phase !== "idle" && <GenerationTheater prompt={prompt} done={phase === "finishing"} />}</AnimatePresence>
    </div>
  );
}
