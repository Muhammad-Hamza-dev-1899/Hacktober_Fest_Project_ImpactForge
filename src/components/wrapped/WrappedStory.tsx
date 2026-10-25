"use client";

import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import type { Campaign, Donation } from "@/lib/schema";
import { themeVars } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { AmountSlide, IntroSlide, JourneySlide, NetworkSlide, RippleSlide, SankeySlide, ShareSlide } from "./slides";

export type SlideProps = { donation: Donation; campaign: Campaign };

type SlideDef = { id: string; Component: ComponentType<SlideProps>; duration: number; bg: string };

// Bold, Wrapped-style color fields; each one is built from the campaign's theme.
const SLIDES: SlideDef[] = [
  {
    id: "intro",
    Component: IntroSlide,
    duration: 6000,
    bg: "radial-gradient(120% 90% at 20% 10%, var(--c2), transparent 60%), radial-gradient(100% 80% at 90% 90%, var(--c1), transparent 55%), #0b0a0f",
  },
  {
    id: "amount",
    Component: AmountSlide,
    duration: 7500,
    bg: "linear-gradient(160deg, color-mix(in oklab, var(--c1) 70%, black), color-mix(in oklab, var(--c2) 55%, black))",
  },
  {
    id: "sankey",
    Component: SankeySlide,
    duration: 9500,
    bg: "radial-gradient(90% 70% at 50% 0%, color-mix(in oklab, var(--c2) 45%, transparent), transparent 70%), #0b0a0f",
  },
  {
    id: "network",
    Component: NetworkSlide,
    duration: 10000,
    bg: "radial-gradient(80% 60% at 50% 40%, color-mix(in oklab, var(--c1) 30%, transparent), transparent 70%), #09080b",
  },
  {
    id: "ripple",
    Component: RippleSlide,
    duration: 8000,
    bg: "linear-gradient(200deg, color-mix(in oklab, var(--c3) 35%, black), color-mix(in oklab, var(--c2) 50%, black) 70%)",
  },
  {
    id: "journey",
    Component: JourneySlide,
    duration: 9000,
    bg: "radial-gradient(100% 80% at 0% 100%, color-mix(in oklab, var(--c1) 35%, transparent), transparent 60%), #0b0a0f",
  },
  {
    id: "share",
    Component: ShareSlide,
    duration: 60_000,
    bg: "radial-gradient(110% 80% at 50% 0%, color-mix(in oklab, var(--c2) 55%, transparent), transparent 65%), radial-gradient(90% 70% at 50% 100%, color-mix(in oklab, var(--c1) 40%, transparent), transparent 60%), #0b0a0f",
  },
];

const SHAPES = [
  { right: -180, top: -120 },
  { left: -200, bottom: -160 },
  { right: -220, bottom: -60 },
  { left: -160, top: 120 },
  { right: -140, top: 260 },
  { left: -220, top: -140 },
  { right: -200, bottom: -200 },
];
const BLOBS = [
  { left: -60, top: 80 },
  { right: -40, top: 40 },
  { left: 40, bottom: -40 },
  { right: -60, bottom: 120 },
];

function Segment({ i, index, progress }: { i: number; index: number; progress: MotionValue<number> }) {
  const width = useTransform(progress, (p) => `${p * 100}%`);
  return (
    <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
      <motion.div className="h-full rounded-full bg-white" style={{ width: i < index ? "100%" : i > index ? "0%" : width }} />
    </div>
  );
}

export function WrappedStory({ donation, campaign }: SlideProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const progress = useMotionValue(0);
  const elapsed = useRef(0);
  const downAt = useRef<{ t: number; x: number } | null>(null);
  const stage = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => {
        const n = Math.min(SLIDES.length - 1, Math.max(0, i + dir));
        if (n !== i) {
          elapsed.current = 0;
          progress.set(0);
        }
        return n;
      });
    },
    [progress],
  );

  useAnimationFrame((_, delta) => {
    if (paused || held) return;
    const dur = SLIDES[index].duration;
    elapsed.current = Math.min(dur, elapsed.current + delta);
    progress.set(elapsed.current / dur);
    if (elapsed.current >= dur && index < SLIDES.length - 1) go(1);
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [go]);

  const slide = SLIDES[index];
  const { Component } = slide;

  return (
    <div style={themeVars(campaign.theme.palette)} className="fixed inset-0 z-[60] flex items-center justify-center bg-black">
      {/* Desktop ambient backdrop */}
      <motion.div
        key={`amb-${slide.id}`}
        className="absolute inset-0 opacity-50 blur-3xl"
        style={{ background: slide.bg }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1 }}
      />

      <button
        onClick={() => go(-1)}
        className="absolute left-[calc(50%-290px)] top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-0 md:grid"
        disabled={index === 0}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => go(1)}
        className="absolute right-[calc(50%-290px)] top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-0 md:grid"
        disabled={index === SLIDES.length - 1}
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        ref={stage}
        className="relative h-full w-full overflow-hidden md:h-[min(860px,94vh)] md:w-[440px] md:rounded-[2.25rem] md:border md:border-white/10 md:shadow-[0_40px_120px_-20px_var(--glow)]"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("[data-interactive]")) return;
          downAt.current = { t: Date.now(), x: e.clientX };
          setHeld(true);
        }}
        onPointerUp={(e) => {
          setHeld(false);
          const d = downAt.current;
          downAt.current = null;
          if (!d || Date.now() - d.t > 300 || !stage.current) return;
          const r = stage.current.getBoundingClientRect();
          go(e.clientX - r.left < r.width * 0.33 ? -1 : 1);
        }}
        onPointerLeave={() => setHeld(false)}
      >
        <motion.div
          key={`bg-${slide.id}`}
          className="absolute inset-0"
          style={{ background: slide.bg }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
        <div className="bg-dots pointer-events-none absolute inset-0 opacity-20" />
        {/* Wrapped-style geometry: a big shape per slide that swings into place */}
        <motion.div
          key={`shape-${slide.id}`}
          aria-hidden
          className="pointer-events-none absolute rounded-full border-[28px] border-white/[0.06]"
          style={{ width: 420, height: 420, ...SHAPES[index % SHAPES.length] }}
          initial={{ scale: 0.6, opacity: 0, rotate: -30 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          key={`blob-${slide.id}`}
          aria-hidden
          className="pointer-events-none absolute h-72 w-72 rounded-full bg-[var(--c3)] opacity-20 blur-3xl"
          style={BLOBS[index % BLOBS.length]}
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 25, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Chrome */}
        <div className="absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/40 to-transparent px-4 pb-6 pt-4">
          <div className="flex gap-1.5">
            {SLIDES.map((s, i) => (
              <Segment key={s.id} i={i} index={index} progress={progress} />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-white/85">
              <span className="text-lg">{campaign.theme.emoji}</span>
              <span className="max-w-[200px] truncate">{campaign.title}</span>
              <span className="text-white/40">· Impact Wrapped</span>
            </div>
            <div className="flex items-center gap-1" data-interactive>
              <button
                onClick={() => setPaused((p) => !p)}
                className="rounded-full p-2 text-white/80 hover:bg-white/10"
                aria-label={paused ? "Play" : "Pause"}
              >
                {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
              <Link href={`/c/${campaign.slug}`} className="rounded-full p-2 text-white/80 hover:bg-white/10" aria-label="Close">
                <X className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className="absolute inset-0 z-10 flex flex-col px-6 pb-8 pt-24"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <Component donation={donation} campaign={campaign} />
          </motion.div>
        </AnimatePresence>

        <p
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-3 z-20 text-center text-[10px] uppercase tracking-[0.25em] text-white/30 transition",
            index > 0 && "opacity-0",
          )}
        >
          Tap to advance · hold to pause
        </p>
      </div>
    </div>
  );
}
