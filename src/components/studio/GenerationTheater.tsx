"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, CircleCheck, LoaderCircle, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { CoverArt } from "@/components/ui/CoverArt";
import { Embers } from "@/components/ui/Embers";
import type { Campaign } from "@/lib/schema";
import { themeVars } from "@/lib/themes";
import { cn, formatPKR } from "@/lib/utils";

export const THEATER_STEPS = [
  { label: "Understanding your cause", detail: "Beneficiaries, region & urgency" },
  { label: "Writing your story", detail: "Headline, narrative, FAQs & WhatsApp pitch" },
  { label: "Designing a visual identity", detail: "Palette, hero & mood tokens" },
  { label: "Planning your launch", detail: "Day-by-day tasks, channels & KPIs" },
  { label: "Validating & publishing", detail: "Schema checks, budget balancing" },
];

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-white/[0.07]", className)}>
      <span className="animate-shimmer absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

/** The campaign page assembling itself: skeletons appear with each step, then the real result snaps in. */
function AssemblingPreview({ step, result }: { step: number; result: Campaign | null }) {
  const show = (n: number) => step >= n || !!result;
  return (
    <div style={result ? themeVars(result.theme.palette) : undefined} className="w-full max-w-xl">
      <div className="rounded-[1.4rem] border border-white/[0.12] bg-white/[0.04] p-1.5 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)]">
        <div className="overflow-hidden rounded-[1.1rem] border border-white/[0.08] bg-[#0c0b10]">
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="mx-auto flex items-center gap-1.5 rounded-md bg-white/[0.05] px-3 py-1 font-mono text-[10px] text-white/40">
              <Lock className="h-2.5 w-2.5" /> impactforge.app/c/{result ? result.slug.slice(0, 22) : "…"}
            </span>
          </div>
          <div className="relative grid grid-cols-[1.2fr_1fr] gap-5 p-6">
            {result && (
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_0%,color-mix(in_oklab,var(--c2)_25%,transparent),transparent_70%)]" />
            )}
            <div className="relative space-y-3 pt-2">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div key="real" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="text-[10px] text-white/50">{result.region}</p>
                    <p className="mt-2 text-2xl font-semibold leading-tight tracking-tight">
                      <span className="text-gradient">{result.title}</span>
                    </p>
                    <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-white/55">{result.tagline}</p>
                    <span className="mt-4 inline-flex h-7 items-center rounded-full bg-[linear-gradient(110deg,var(--c3),var(--c1),var(--c2))] px-3 text-[10px] font-semibold text-[var(--accent-text)]">
                      Donate now
                    </span>
                  </motion.div>
                ) : (
                  <motion.div key="skel" exit={{ opacity: 0 }} className="space-y-3">
                    {show(0) && <Shimmer className="h-3 w-24" />}
                    {show(1) && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 pt-1">
                        <Shimmer className="h-6 w-[90%]" />
                        <Shimmer className="h-6 w-[60%]" />
                        <Shimmer className="mt-3 h-2.5 w-full" />
                        <Shimmer className="h-2.5 w-[85%]" />
                      </motion.div>
                    )}
                    {show(1) && <Shimmer className="mt-3 h-7 w-24 rounded-full" />}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    key="art"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 18 }}
                  >
                    <CoverArt campaign={result} size="md" className="aspect-[4/4.6] w-full rounded-xl border border-white/10" />
                  </motion.div>
                ) : show(2) ? (
                  <motion.div key="art-skel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="relative aspect-[4/4.6] w-full overflow-hidden rounded-xl border border-white/10 bg-[conic-gradient(from_0deg,#ffc061,#ff6a3d,#ff3d77,#8b5cf6,#38bdf8,#2dd4bf,#ffc061)] opacity-40">
                      <motion.div
                        className="absolute inset-0 backdrop-blur-2xl"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                    <p className="mt-2 text-center font-mono text-[9px] text-white/35">choosing palette…</p>
                  </motion.div>
                ) : (
                  <Shimmer key="art-empty" className="aspect-[4/4.6] w-full rounded-xl" />
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 px-6 pb-6">
            {[0, 1, 2].map((i) =>
              result ? (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-2.5"
                >
                  <p className="text-[12px] font-semibold">{formatPKR(result.impactUnits[i].amountPKR)}</p>
                  <p className="line-clamp-1 text-[9px] text-white/45">{result.impactUnits[i].label}</p>
                </motion.div>
              ) : (
                <Shimmer key={i} className={cn("h-11 rounded-lg transition-opacity", show(3) ? "opacity-100" : "opacity-30")} />
              ),
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {result && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-300"
          >
            <CircleCheck className="h-4 w-4" /> Schema valid · budget = 100% · {result.days.length}-day plan
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Staged progress UI shown while the two AI calls run. Steps advance on a timer
 * and hold on the last "thinking" step until the result arrives, then finish fast.
 */
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
      className="fixed inset-0 z-[70] overflow-y-auto bg-[#09080b]/95 backdrop-blur-2xl"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute bottom-[-30%] left-1/2 h-[50rem] w-[70rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,106,61,0.25),transparent)]" />
        <Embers density={0.7} />
      </div>
      <div className="relative mx-auto grid min-h-full max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="mx-auto w-full max-w-md">
          {/* forge core */}
          <div className="relative mb-10 h-28 w-28">
            <div className="absolute inset-0 rounded-full bg-[#ff6a3d] opacity-40 blur-2xl" />
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-white/10"
                style={{ inset: i * 12, borderTopColor: ["#ffc061", "#ff6a3d", "#ff3d77"][i] }}
                animate={{ rotate: i % 2 ? -360 : 360 }}
                transition={{ duration: 2.6 + i * 1.2, repeat: Infinity, ease: "linear" }}
              />
            ))}
            <motion.div
              className="absolute inset-[38px] rounded-full bg-[linear-gradient(135deg,#ffd18a,#ff6a3d,#ff3d77)]"
              animate={{ scale: done ? [1, 1.5, 1.2] : [1, 1.15, 1] }}
              transition={{ duration: done ? 0.6 : 1.4, repeat: done ? 0 : Infinity }}
              style={{ boxShadow: "0 0 50px 12px rgba(255,106,61,0.55)" }}
            />
          </div>

          <p className="eyebrow text-[#ff8a4c]">{done ? "Forged" : "Forging your campaign"}</p>
          <p className="serif mt-3 text-[1.8rem] leading-tight text-white/90">&ldquo;{prompt}&rdquo;</p>

          <ol className="mt-8 space-y-1.5">
            {THEATER_STEPS.map((s, i) => {
              const state = i < step ? "done" : i === step ? "active" : "todo";
              return (
                <motion.li
                  key={s.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: state === "todo" ? 0.3 : 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors duration-300",
                    state === "active" ? "border-white/15 bg-white/[0.05]" : "border-transparent",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors",
                      state === "done"
                        ? "border-transparent bg-[linear-gradient(135deg,#ffc061,#ff6a3d)] text-[#1c0700]"
                        : "border-white/20",
                    )}
                  >
                    {state === "done" ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    ) : state === "active" ? (
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[#ff8a4c]" />
                    ) : (
                      <span className="h-1 w-1 rounded-full bg-white/40" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{s.label}</p>
                    {state === "active" && <p className="truncate text-xs text-white/45">{s.detail}</p>}
                  </div>
                </motion.li>
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
