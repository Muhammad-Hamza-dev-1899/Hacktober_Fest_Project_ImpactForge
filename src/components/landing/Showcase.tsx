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

/** A faithful miniature of a generated campaign page, used as the hero product shot. */
function MiniCampaign() {
  const pct = Math.round((C.baseRaisedPKR / C.goalPKR) * 100);
  return (
    <div style={themeVars(C.theme.palette)} className="relative overflow-hidden bg-[#0b0a0f]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_0%,color-mix(in_oklab,var(--c2)_30%,transparent),transparent_70%),radial-gradient(60%_50%_at_0%_30%,color-mix(in_oklab,var(--c1)_18%,transparent),transparent_70%)]" />
      <div className="bg-grid mask-radial pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative grid gap-6 p-5 sm:p-8 md:grid-cols-[1.25fr_1fr] md:p-10">
        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap gap-2 text-[11px] text-white/70">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              <MapPin className="h-3 w-3 text-[var(--c1)]" /> {C.region}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              <Users className="h-3 w-3 text-[var(--c1)]" /> {C.baseDonors} donors
            </span>
          </div>
          <h3 className="mt-4 text-3xl font-semibold leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
            <span className="text-silver">Warmth</span> <span className="serif text-gradient pr-1">for Gilgit</span>
          </h3>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">{C.tagline}</p>
          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex h-10 items-center gap-2 rounded-full bg-[linear-gradient(110deg,var(--c3),var(--c1)_50%,var(--c2))] px-5 text-sm font-semibold text-[var(--accent-text)] shadow-[0_0_30px_-6px_var(--glow)]">
              <Heart className="h-3.5 w-3.5" fill="currentColor" /> Donate now
            </span>
            <span className="hidden text-xs text-white/45 sm:inline">PKR 2,500 = 1 winter coat</span>
          </div>
        </div>
        <div className="relative">
          <CoverArt campaign={C} animated={false} size="lg" className="aspect-[4/4.2] w-full rounded-2xl border border-white/10" />
          <div className="absolute inset-x-3 bottom-3 rounded-xl border border-white/10 bg-black/50 p-3 backdrop-blur-xl">
            <div className="flex items-end justify-between text-xs">
              <span className="font-mono text-white/50">RAISED</span>
              <span className="text-base font-semibold tabular-nums">{formatPKR(C.baseRaisedPKR)}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--c3),var(--c1),var(--c2))]" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] text-white/45">
              {pct}% of {formatPKR(C.goalPKR, { compact: true })}
            </p>
          </div>
        </div>
      </div>
      <div className="relative hidden grid-cols-3 gap-3 px-10 pb-10 md:grid">
        {C.impactUnits.map((u) => (
          <div key={u.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--c1),var(--c2))] text-[#0b0a0f]">
              <Icon name={u.icon} className="h-4 w-4" />
            </span>
            <p className="mt-3 text-lg font-semibold">{formatPKR(u.amountPKR)}</p>
            <p className="text-xs text-white/50">{u.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniWrapped() {
  return (
    <div
      style={themeVars(C.theme.palette)}
      className="relative h-[380px] w-[200px] overflow-hidden rounded-[2rem] border border-white/15 bg-[#0b0a0f] p-1.5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9),0_0_60px_-20px_var(--glow)]"
    >
      <div className="relative h-full overflow-hidden rounded-[1.6rem] bg-[linear-gradient(165deg,color-mix(in_oklab,var(--c1)_70%,black),color-mix(in_oklab,var(--c2)_60%,black))] p-4">
        <div className="flex gap-1">
          {[1, 1, 0.5, 0, 0, 0, 0].map((f, i) => (
            <span key={i} className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/30">
              <span className="block h-full bg-white" style={{ width: `${f * 100}%` }} />
            </span>
          ))}
        </div>
        <p className="eyebrow mt-10 text-[9px] text-white/70">You gave</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">PKR 7,500</p>
        <p className="mt-6 text-[11px] text-white/75">That became</p>
        <p className="serif text-[26px] leading-tight">3 winter coats</p>
        <div className="mt-4 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", delay: 0.6 + i * 0.12 }}
              className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[color-mix(in_oklab,var(--c2)_80%,black)]"
            >
              <Icon name="shirt" className="h-4 w-4" />
            </motion.span>
          ))}
        </div>
        <p className="absolute inset-x-4 bottom-4 text-[10px] text-white/60">for 3 children in Danyore, Gilgit-Baltistan</p>
      </div>
    </div>
  );
}

function DonationToast() {
  return (
    <div className="flex w-[270px] items-center gap-3 rounded-2xl border border-white/10 bg-[#121116]/85 p-3 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#ffc061,#ff6a3d)] text-sm font-bold text-[#1c0700]">
        A
      </span>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium">Ayesha gave PKR 2,500</p>
        <p className="truncate text-[11px] text-white/50">= 1 insulated winter coat · just now</p>
      </div>
      <Lock className="ml-auto h-3.5 w-3.5 shrink-0 text-emerald-400" />
    </div>
  );
}

/** Hero product shot: tilts back in 3D and straightens as you scroll (Aceternity "container scroll" idea). */
export function Showcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.2"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const rotateX = useTransform(p, [0, 1], [26, 0]);
  const scale = useTransform(p, [0, 1], [0.92, 1]);
  const y = useTransform(p, [0, 1], [40, 0]);
  const floatY = useTransform(p, [0, 1], [60, 0]);

  return (
    <div ref={ref} className="relative mx-auto mt-16 w-full max-w-5xl px-1 [perspective:1400px] sm:mt-20">
      <div className="pointer-events-none absolute -inset-x-10 -top-10 bottom-0 bg-[radial-gradient(50%_50%_at_50%_40%,rgba(255,106,61,0.28),transparent_70%)] blur-2xl" />
      <motion.div style={{ rotateX, scale, y, transformOrigin: "50% 0%" }} className="relative">
        <div className="rounded-[1.6rem] border border-white/[0.12] bg-white/[0.04] p-1.5 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)] backdrop-blur sm:p-2">
          <div className="overflow-hidden rounded-[1.25rem] border border-white/[0.08]">
            <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#0f0e13] px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="mx-auto flex items-center gap-1.5 rounded-md bg-white/[0.05] px-3 py-1 font-mono text-[10px] text-white/45 sm:text-[11px]">
                <Lock className="h-2.5 w-2.5" /> impactforge.app/c/warmth-for-gilgit
              </span>
              <span className="w-12" />
            </div>
            <MiniCampaign />
          </div>
        </div>
      </motion.div>

      <motion.div style={{ y: floatY }} className="absolute -right-32 top-[34%] hidden xl:block">
        <div className="animate-float">
          <MiniWrapped />
        </div>
      </motion.div>
      <motion.div style={{ y: floatY }} className="absolute -bottom-8 left-10 hidden lg:block">
        <div className="animate-float-delayed">
          <DonationToast />
        </div>
      </motion.div>
    </div>
  );
}
