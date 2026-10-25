"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, CircleCheck, LoaderCircle, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { CoverArt } from "@/components/ui/CoverArt";
import type { Campaign } from "@/lib/schema";
import { themeVars } from "@/lib/themes";
import { cn, formatPKR } from "@/lib/utils";

export const THEATER_STEPS = [
  { label: "Understanding your cause", detail: "Who it helps, where, and how urgent it is" },
  { label: "Writing your story", detail: "Headline, story, FAQs and a WhatsApp message" },
  { label: "Designing the page", detail: "Choosing colors, cover art and mood" },
  { label: "Planning your launch", detail: "Daily tasks, channels and targets" },
  { label: "Checking everything", detail: "Validating numbers and balancing the budget" },
];

function Skel({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-line/50", className)}>
      <span className="animate-shimmer absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/10" />
    </div>
  );
}

/** The page assembling itself while the model works; the real result snaps in when it arrives. */
function AssemblingPreview({ step, result }: { step: number; result: Campaign | null }) {
  const show = (n: number) => step >= n || !!result;
  return (
    <div style={result ? themeVars(result.theme.palette) : undefined} className="w-full max-w-xl">
      <div className="overflow-hidden rounded-[22px] border border-line/60 bg-canvas shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)]">
        <div className="flex items-center gap-2 border-b border-line/60 bg-mist px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="mx-auto flex items-center gap-1.5 rounded-md bg-canvas px-3 py-1 text-[11px] text-ink-2">
            <Lock className="h-2.5 w-2.5" aria-hidden /> impactforge.app/c/{result ? result.slug.slice(0, 22) : "…"}
          </span>
        </div>
        <div className="grid grid-cols-[1.2fr_1fr] gap-5 p-6">
          <div className="space-y-3 pt-2">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="real" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-[12px] text-ink-2">{result.region}</p>
                  <p className="mt-1 text-[24px] font-semibold leading-tight tracking-[-0.01em]">
                    <span className="text-gradient">{result.title}</span>
                  </p>
                  <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-ink-2">{result.tagline}</p>
                  <span className="btn-primary btn-sm mt-4 px-3 py-1.5 text-[12px]">Donate</span>
                </motion.div>
              ) : (
                <motion.div key="skel" exit={{ opacity: 0 }} className="space-y-3">
                  {show(0) && <Skel className="h-3 w-24" />}
                  {show(1) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 pt-1">
                      <Skel className="h-6 w-[90%]" />
                      <Skel className="h-6 w-[60%]" />
                      <Skel className="mt-3 h-2.5 w-full" />
                      <Skel className="h-2.5 w-[85%]" />
                    </motion.div>
                  )}
                  {show(1) && <Skel className="mt-3 h-7 w-20 rounded-full" />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="art"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 18 }}
              >
                <CoverArt campaign={result} size="md" className="aspect-[4/4.6] w-full rounded-xl" />
              </motion.div>
            ) : show(2) ? (
              <motion.div
                key="art-skel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="intel-ring aspect-[4/4.6] w-full rounded-xl opacity-30 blur-[2px]"
              />
            ) : (
              <Skel key="art-empty" className="aspect-[4/4.6] w-full rounded-xl" />
            )}
          </AnimatePresence>
        </div>
        <div className="grid grid-cols-3 gap-2 px-6 pb-6">
          {[0, 1, 2].map((i) =>
            result ? (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="rounded-lg bg-mist p-2.5"
              >
                <p className="text-[13px] font-semibold">{formatPKR(result.impactUnits[i].amountPKR)}</p>
                <p className="line-clamp-1 text-[11px] text-ink-2">{result.impactUnits[i].label}</p>
              </motion.div>
            ) : (
              <Skel key={i} className={cn("h-11 rounded-lg transition-opacity", show(3) ? "opacity-100" : "opacity-30")} />
            ),
          )}
        </div>
      </div>
      <AnimatePresence>
        {result && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center justify-center gap-2 text-[13px] text-[#1f8a35] dark:text-[#30d158]"
          >
            <CircleCheck className="h-4 w-4" aria-hidden /> Validated · budget adds up to 100% · {result.days.length}-day plan
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Staged progress while two AI calls run. Holds on the last working step until the result arrives. */
export function GenerationTheater({ prompt, result }: { prompt: string; result: Campaign | null }) {
  const [step, setStep] = useState(0);
  const done = !!result;
  const last = THEATER_STEPS.length - 1;

  useEffect(() => {
    if (done) {
      const t = setInterval(() => setStep((s) => Math.min(THEATER_STEPS.length, s + 1)), 160);
      return () => clearInterval(t);
    }
    const t = setInterval(() => setStep((s) => Math.min(last - 1, s + 1)), 1100);
    return () => clearInterval(t);
  }, [done, last]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] overflow-y-auto bg-canvas"
      role="status"
      aria-live="polite"
      aria-label={done ? "Campaign ready" : "Creating your campaign"}
    >
      <div
        aria-hidden
        className="intel-ring pointer-events-none fixed -bottom-40 left-1/2 h-80 w-[80vw] -translate-x-1/2 rounded-full opacity-25 blur-[100px]"
      />
      <div className="relative mx-auto grid min-h-full max-w-[1080px] items-center gap-12 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="mx-auto w-full max-w-md">
          <div className="relative mb-8 h-16 w-16">
            <div className="intel-ring absolute inset-0 rounded-full blur-md" />
            <div className="intel-ring absolute inset-0 rounded-full" />
            <motion.div
              className="absolute inset-[6px] rounded-full bg-canvas"
              animate={{ scale: done ? 0.4 : [1, 0.88, 1] }}
              transition={{ duration: 1.4, repeat: done ? 0 : Infinity }}
            />
          </div>
          <p className="t-eyebrow text-ink-2">{done ? "Your campaign is ready" : "Creating your campaign"}</p>
          <p className="mt-2 text-[28px] font-semibold leading-tight tracking-[-0.01em]">&ldquo;{prompt}&rdquo;</p>

          <ol className="mt-8 space-y-1">
            {THEATER_STEPS.map((s, i) => {
              const state = i < step ? "done" : i === step ? "active" : "todo";
              return (
                <li
                  key={s.label}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors",
                    state === "active" && "bg-mist",
                    state === "todo" && "opacity-40",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full",
                      state === "done" ? "bg-blue text-white" : "border border-line",
                    )}
                  >
                    {state === "done" ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                    ) : state === "active" ? (
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin text-blue" aria-hidden />
                    ) : null}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium">{s.label}</p>
                    {state === "active" && <p className="truncate text-[13px] text-ink-2">{s.detail}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="hidden justify-center lg:flex">
          <AssemblingPreview step={step} result={result} />
        </div>
      </div>
    </motion.div>
  );
}
