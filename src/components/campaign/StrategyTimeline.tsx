"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { Briefcase, CalendarDays, Camera, Mail, MessageCircle, School, Target, type LucideIcon } from "lucide-react";
import { useRef } from "react";
import type { Channel, StrategyDay } from "@/lib/schema";

const CHANNEL_META: Record<Channel, { icon: LucideIcon; label: string }> = {
  instagram: { icon: Camera, label: "Instagram" },
  whatsapp: { icon: MessageCircle, label: "WhatsApp" },
  campus: { icon: School, label: "On campus" },
  linkedin: { icon: Briefcase, label: "LinkedIn" },
  email: { icon: Mail, label: "Email" },
  event: { icon: CalendarDays, label: "Event" },
};

/** Day-by-day execution plan; the glowing spine "draws" as you scroll. */
export function StrategyTimeline({ days }: { days: StrategyDay[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <ol ref={ref} className="relative space-y-4 pl-12 sm:pl-16">
      <div className="absolute bottom-2 left-[19px] top-2 w-px bg-white/10 sm:left-[27px]" aria-hidden />
      <motion.div
        aria-hidden
        className="absolute bottom-2 left-[19px] top-2 w-px origin-top bg-[linear-gradient(var(--c3),var(--c1),var(--c2))] shadow-[0_0_12px_var(--glow)] sm:left-[27px]"
        style={{ scaleY }}
      />
      {days.map((d, i) => {
        const meta = CHANNEL_META[d.channel];
        const I = meta.icon;
        return (
          <motion.li
            key={d.day}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <span className="absolute -left-12 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-[#0b0d12] font-display text-xs font-semibold sm:-left-16 sm:h-14 sm:w-14 sm:text-sm">
              <span className="flex flex-col items-center leading-none">
                <span className="text-[9px] font-normal uppercase tracking-wider text-white/40">Day</span>
                {d.day}
              </span>
            </span>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-display font-semibold">{d.title}</h4>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-white/70">
                  <I className="h-3.5 w-3.5" /> {meta.label}
                </span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {d.tasks.map((t) => (
                  <li key={t} className="flex gap-2 text-sm text-white/65">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--c1)]" />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--c1)]">
                <Target className="h-3.5 w-3.5" /> {d.kpi}
              </p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
