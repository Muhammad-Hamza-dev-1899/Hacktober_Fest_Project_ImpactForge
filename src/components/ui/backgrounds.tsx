"use client";

import { motion } from "motion/react";
import type { HeroVariant } from "@/lib/schema";
import { cn } from "@/lib/utils";

/**
 * Hero backgrounds, hand-built in the spirit of Aceternity UI / Magic UI.
 * All colors come from the --c1/--c2/--c3 theme variables.
 */

export function Spotlight({ className }: { className?: string }) {
  return (
    <motion.svg
      initial={{ opacity: 0, x: -120, y: -80 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className={cn("pointer-events-none absolute -top-40 left-0 h-[170%] w-[140%] md:-top-24 md:left-40 md:w-[90%]", className)}
      viewBox="0 0 3787 2842"
      fill="none"
      aria-hidden
    >
      <g filter="url(#spot-blur)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill="var(--c3)"
          fillOpacity="0.16"
        />
      </g>
      <defs>
        <filter id="spot-blur" x="0.86" y="0.84" width="3785.16" height="2840.26" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="151" />
        </filter>
      </defs>
    </motion.svg>
  );
}

export function Aurora({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="animate-aurora absolute -left-1/4 -top-1/3 h-[70vmax] w-[70vmax] rounded-full bg-[var(--c1)] opacity-25 blur-[120px]" />
      <div
        className="animate-aurora absolute -right-1/4 top-0 h-[60vmax] w-[60vmax] rounded-full bg-[var(--c2)] opacity-25 blur-[120px]"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="animate-aurora absolute bottom-[-30%] left-1/4 h-[50vmax] w-[50vmax] rounded-full bg-[var(--c3)] opacity-15 blur-[120px]"
        style={{ animationDelay: "-12s" }}
      />
    </div>
  );
}

const BEAM_PATHS = Array.from({ length: 14 }, (_, i) => {
  const o = i * 34;
  return `M${-380 + o} ${-189 - i * 6}C${-380 + o} ${-189 - i * 6} ${-312 + o} ${216 - i * 6} ${152 + o} ${343 - i * 6}C${616 + o} ${470 - i * 6} ${684 + o} ${875 - i * 6} ${684 + o} ${875 - i * 6}`;
});

export function Beams({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 696 316" preserveAspectRatio="xMidYMid slice" fill="none">
        {BEAM_PATHS.map((d, i) => (
          <path key={`base-${i}`} d={d} stroke="white" strokeOpacity="0.04" strokeWidth="0.6" />
        ))}
        {BEAM_PATHS.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke={`url(#beam-${i % 3})`}
            strokeWidth="1.1"
            strokeLinecap="round"
            initial={{ pathLength: 0.15, pathOffset: 0 }}
            animate={{ pathOffset: [0, 1] }}
            transition={{ duration: 6 + (i % 5) * 1.6, repeat: Infinity, ease: "linear", delay: i * 0.45 }}
            style={{ pathLength: 0.15 }}
          />
        ))}
        <defs>
          {["--c1", "--c2", "--c3"].map((v, i) => (
            <linearGradient key={v} id={`beam-${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor={`var(${v})`} stopOpacity="0" />
              <stop offset="0.5" stopColor={`var(${v})`} />
              <stop offset="1" stopColor={`var(${v})`} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--glow),transparent_60%)] opacity-40" />
    </div>
  );
}

export function Orbit({ className }: { className?: string }) {
  const rings = [260, 380, 520, 680];
  return (
    <div className={cn("pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden", className)} aria-hidden>
      <div className="absolute h-72 w-72 rounded-full bg-[var(--c1)] opacity-20 blur-[100px]" />
      {rings.map((size, i) => (
        <div
          key={size}
          className={cn("absolute rounded-full border border-white/[0.07]", i % 2 ? "animate-spin-slower" : "animate-spin-slow")}
          style={{ width: size, height: size }}
        >
          <span
            className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: `var(${["--c1", "--c2", "--c3", "--c1"][i]})`, boxShadow: "0 0 18px 4px var(--glow)" }}
          />
          {i > 1 && <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/70" />}
        </div>
      ))}
    </div>
  );
}

export function HeroBackground({ variant }: { variant: HeroVariant }) {
  return (
    <>
      <div className="bg-grid mask-radial pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      {variant === "spotlight" && (
        <>
          <Aurora className="opacity-50" />
          <Spotlight />
        </>
      )}
      {variant === "aurora" && <Aurora />}
      {variant === "beams" && <Beams />}
      {variant === "orbit" && <Orbit />}
    </>
  );
}
