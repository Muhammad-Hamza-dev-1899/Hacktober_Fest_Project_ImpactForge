"use client";

import { motion } from "motion/react";
import { Briefcase, CalendarDays, Camera, Mail, MessageCircle, School, Target, type LucideIcon } from "lucide-react";
import type { Channel, StrategyDay } from "@/lib/schema";
import { cn } from "@/lib/utils";

const CHANNEL_META: Record<Channel, { icon: LucideIcon; label: string }> = {
  instagram: { icon: Camera, label: "Instagram" },
  whatsapp: { icon: MessageCircle, label: "WhatsApp" },
  campus: { icon: School, label: "On campus" },
  linkedin: { icon: Briefcase, label: "LinkedIn" },
  email: { icon: Mail, label: "Email" },
  event: { icon: CalendarDays, label: "Event" },
};

type Phase = "Launch" | "Momentum" | "Peak" | "Final push" | "Report";

const PHASE_STYLE: Record<Phase, string> = {
  Launch: "var(--c3)",
  Momentum: "var(--c1)",
  Peak: "var(--c2)",
  "Final push": "var(--c1)",
  Report: "#34d399",
};

/** Derives the campaign arc from the plan itself, so any AI-generated plan gets phases. */
export function phaseOf(day: StrategyDay, total: number): Phase {
  if (day.day === total) return "Report";
  if (day.day >= total - 2) return "Final push";
  if (day.day <= Math.ceil(total * 0.25)) return "Launch";
  if (day.channel === "event") return "Peak";
  return "Momentum";
}

/** Day-by-day execution plan as a compact board, with the campaign arc on top. */
export function StrategyTimeline({ days }: { days: StrategyDay[] }) {
  const total = days.length;
  const phases = days.map((d) => phaseOf(d, total));
  const channels = Object.entries(
    days.reduce<Record<string, number>>((acc, d) => ({ ...acc, [d.channel]: (acc[d.channel] ?? 0) + 1 }), {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      {/* campaign arc */}
      <div className="card mb-6 p-5 sm:p-6">
        <div className="flex gap-1">
          {days.map((d, i) => (
            <motion.div
              key={d.day}
              className="h-2 flex-1 origin-left rounded-full"
              style={{ background: PHASE_STYLE[phases[i]], opacity: phases[i] === "Momentum" ? 0.45 : 1 }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-white/55">
            {(Object.keys(PHASE_STYLE) as Phase[])
              .filter((p) => phases.includes(p))
              .map((p) => (
                <span key={p} className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: PHASE_STYLE[p], opacity: p === "Momentum" ? 0.45 : 1 }} />
                  {p}
                </span>
              ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {channels.map(([c, n]) => {
              const I = CHANNEL_META[c as Channel].icon;
              return (
                <span key={c} className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-white/60">
                  <I className="h-3 w-3" /> {CHANNEL_META[c as Channel].label} <span className="text-white/35">×{n}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {days.map((d, i) => {
          const meta = CHANNEL_META[d.channel];
          const I = meta.icon;
          const phase = phases[i];
          return (
            <motion.li
              key={d.day}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "card group relative flex flex-col overflow-hidden p-5 transition hover:-translate-y-0.5 hover:border-white/15",
              )}
            >
              <span
                className="absolute inset-x-0 top-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${PHASE_STYLE[phase]}, transparent)` }}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="serif text-3xl leading-none text-white/90">{String(d.day).padStart(2, "0")}</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: PHASE_STYLE[phase] }}>
                    {phase}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/65">
                  <I className="h-3.5 w-3.5" /> {meta.label}
                </span>
              </div>
              <h4 className="mt-4 font-semibold leading-snug">{d.title}</h4>
              <ul className="mt-2.5 flex-1 space-y-1.5">
                {d.tasks.map((t) => (
                  <li key={t} className="flex gap-2 text-[13px] leading-relaxed text-white/55">
                    <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-white/30" />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-white/80">
                <Target className="h-3 w-3 text-[var(--c1)]" /> {d.kpi}
              </p>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
