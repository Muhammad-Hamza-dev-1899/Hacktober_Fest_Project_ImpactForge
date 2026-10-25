"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const THEATER_STEPS = [
  { label: "Understanding your cause", detail: "Extracting beneficiaries, region & urgency" },
  { label: "Writing your story", detail: "Headline, narrative, FAQs & WhatsApp pitch" },
  { label: "Designing a visual identity", detail: "Choosing palette, hero & mood tokens" },
  { label: "Planning your launch", detail: "Day-by-day tasks, channels & KPIs" },
  { label: "Validating & publishing", detail: "Schema checks, budget balancing, slug" },
];

/**
 * Staged progress UI shown while the two AI calls run. Steps advance on a timer
 * and hold on the last "thinking" step until the result arrives, then finish fast.
 */
export function GenerationTheater({ prompt, done }: { prompt: string; done: boolean }) {
  const [step, setStep] = useState(0);
  const last = THEATER_STEPS.length - 1;

  useEffect(() => {
    if (done) {
      const t = setInterval(() => setStep((s) => Math.min(THEATER_STEPS.length, s + 1)), 220);
      return () => clearInterval(t);
    }
    const t = setInterval(() => setStep((s) => Math.min(last - 1, s + 1)), 1300);
    return () => clearInterval(t);
  }, [done, last]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-ink/90 px-4 py-10 backdrop-blur-2xl"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-md">
        {/* Core */}
        <div className="relative mx-auto mb-10 h-40 w-40">
          <div className="absolute inset-0 rounded-full bg-[var(--c1)] opacity-30 blur-3xl" />
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-white/15"
              style={{ borderTopColor: `var(${["--c1", "--c2", "--c3"][i]})`, inset: i * 14 }}
              animate={{ rotate: i % 2 ? -360 : 360 }}
              transition={{ duration: 3 + i * 1.4, repeat: Infinity, ease: "linear" }}
            />
          ))}
          <motion.div
            className="absolute inset-[52px] rounded-full bg-[linear-gradient(135deg,var(--c3),var(--c1),var(--c2))]"
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ boxShadow: "0 0 60px 10px var(--glow)" }}
          />
        </div>

        <p className="text-center text-xs uppercase tracking-[0.25em] text-white/40">Forging your campaign</p>
        <p className="mx-auto mt-3 line-clamp-2 max-w-sm text-center font-display text-lg text-white/85">&ldquo;{prompt}&rdquo;</p>

        <ol className="mt-8 space-y-2">
          {THEATER_STEPS.map((s, i) => {
            const state = i < step ? "done" : i === step ? "active" : "todo";
            return (
              <motion.li
                key={s.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: state === "todo" ? 0.35 : 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
                  state === "active" ? "border-white/20 bg-white/[0.06]" : "border-transparent",
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full border",
                    state === "done" ? "border-transparent bg-[var(--c1)] text-ink" : "border-white/20",
                  )}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {state === "done" ? (
                      <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </motion.span>
                    ) : state === "active" ? (
                      <LoaderCircle key="l" className="h-4 w-4 animate-spin text-[var(--c1)]" />
                    ) : (
                      <span key="d" className="h-1.5 w-1.5 rounded-full bg-white/30" />
                    )}
                  </AnimatePresence>
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{s.label}</p>
                  {state === "active" && <p className="truncate text-xs text-white/50">{s.detail}</p>}
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </motion.div>
  );
}
