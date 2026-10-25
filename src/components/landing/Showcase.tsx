"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { Heart, Lock, MapPin, Users } from "lucide-react";
import { useRef } from "react";
import { CoverArt } from "@/components/ui/CoverArt";
import { Icon } from "@/components/ui/Icon";
import { SEED_CAMPAIGNS } from "@/data/campaigns";
import { themeVars } from "@/lib/themes";
import { formatPKR } from "@/lib/utils";

const C = SEED_CAMPAIGNS[0];

/** A faithful miniature of a generated campaign page: the hero "product shot". */
export function MiniCampaign() {
  const pct = Math.round((C.baseRaisedPKR / C.goalPKR) * 100);
  return (
    <div style={themeVars(C.theme.palette)} className="bg-canvas">
      <div className="grid gap-6 p-5 sm:p-8 md:grid-cols-[1.2fr_1fr] md:p-12">
        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap gap-2 text-[11px] text-ink-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1">
              <MapPin className="h-3 w-3" /> {C.region}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1">
              <Users className="h-3 w-3" /> {C.baseDonors} donors
            </span>
          </div>
          <h3 className="mt-4 text-[2rem] font-semibold leading-[1.05] tracking-[-0.015em] sm:text-5xl">
            Warmth <span className="text-gradient">for Gilgit.</span>
          </h3>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-2">{C.tagline}</p>
          <div className="mt-5">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold">{formatPKR(C.baseRaisedPKR)}</span>
              <span className="text-ink-3">
                {pct}% of {formatPKR(C.goalPKR, { compact: true })}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line/50">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--d1),var(--d2))]" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <span className="btn-primary btn-sm">
              <Heart className="h-3.5 w-3.5" fill="currentColor" /> Donate
            </span>
            <span className="link text-sm">Share ›</span>
          </div>
        </div>
        <CoverArt campaign={C} animated={false} size="lg" className="aspect-[4/4.2] w-full rounded-[20px]" />
      </div>
      <div className="hidden grid-cols-3 gap-3 px-12 pb-12 md:grid">
        {C.impactUnits.map((u) => (
          <div key={u.label} className="rounded-2xl bg-mist p-4">
            <Icon name={u.icon} className="h-5 w-5 text-[var(--d1)]" />
            <p className="mt-3 text-lg font-semibold">{formatPKR(u.amountPKR)}</p>
            <p className="text-xs text-ink-2">{u.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MiniWrapped({ className }: { className?: string }) {
  return (
    <div
      style={themeVars(C.theme.palette)}
      className={`relative h-[420px] w-[214px] overflow-hidden rounded-[2.4rem] border-[6px] border-[#1d1d1f] bg-black shadow-[0_40px_80px_-20px_rgba(0,0,0,0.45)] ${className ?? ""}`}
    >
      <div className="relative h-full overflow-hidden rounded-[2rem] bg-[linear-gradient(165deg,color-mix(in_oklab,var(--c1)_70%,black),color-mix(in_oklab,var(--c2)_60%,black))] p-4 text-white">
        <div className="flex gap-1">
          {[1, 1, 0.5, 0, 0, 0, 0].map((f, i) => (
            <span key={i} className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/30">
              <span className="block h-full bg-white" style={{ width: `${f * 100}%` }} />
            </span>
          ))}
        </div>
        <p className="eyebrow mt-12 text-[9px] text-white/70">You gave</p>
        <p className="mt-1 text-[2rem] font-semibold tracking-tight">PKR 7,500</p>
        <p className="mt-6 text-[11px] text-white/75">That became</p>
        <p className="text-[26px] font-semibold leading-tight tracking-tight">3 winter coats</p>
        <div className="mt-4 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", delay: 0.4 + i * 0.12 }}
              className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#3730a3]"
            >
              <Icon name="shirt" className="h-4 w-4" />
            </motion.span>
          ))}
        </div>
        <p className="absolute inset-x-4 bottom-5 text-[10px] text-white/60">for 3 children in Danyore, Gilgit-Baltistan</p>
      </div>
    </div>
  );
}

/** Hero product shot that scales up as it scrolls into view (Apple's signature move). */
export function Showcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.25"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const scale = useTransform(p, [0, 1], [0.88, 1]);
  const radius = useTransform(p, [0, 1], [44, 28]);
  const y = useTransform(p, [0, 1], [60, 0]);

  return (
    <div ref={ref} className="relative mx-auto mt-16 w-full max-w-[1080px] px-4 sm:mt-20">
      <motion.div
        style={{ scale, y, borderRadius: radius }}
        className="relative overflow-hidden border border-line/60 bg-canvas shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)]"
      >
        <div className="flex items-center gap-2 border-b border-line/60 bg-mist px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="mx-auto flex items-center gap-1.5 rounded-md bg-canvas px-3 py-1 text-[11px] text-ink-2">
            <Lock className="h-2.5 w-2.5" /> impactforge.app/c/warmth-for-gilgit
          </span>
          <span className="w-12" />
        </div>
        <MiniCampaign />
      </motion.div>
    </div>
  );
}
