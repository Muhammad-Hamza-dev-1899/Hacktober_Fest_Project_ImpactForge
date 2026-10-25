"use client";

import { animate, motion, useInView, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import { forwardRef, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { cn, formatNumber } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* ShimmerButton — gradient CTA with a moving light sweep              */
/* ------------------------------------------------------------------ */

type ShimmerButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { size?: "md" | "lg" };

export const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(function ShimmerButton(
  { className, children, size = "md", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold text-[var(--accent-text)] transition-all duration-300",
        "bg-[linear-gradient(110deg,var(--c3),var(--c1)_45%,var(--c2))] shadow-[0_0_40px_-8px_var(--glow)] hover:shadow-[0_0_60px_-6px_var(--glow)] hover:scale-[1.02] active:scale-[0.98]",
        "disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
        size === "lg" ? "h-14 px-8 text-base" : "h-11 px-6 text-sm",
        className,
      )}
      {...props}
    >
      <span className="animate-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
});

export function GhostButton({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-medium text-white/90 backdrop-blur transition hover:border-white/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* NumberTicker — counts up when scrolled into view                     */
/* ------------------------------------------------------------------ */

export function NumberTicker({
  value,
  duration = 1.6,
  delay = 0,
  prefix = "",
  suffix = "",
  className,
  format = formatNumber,
}: {
  value: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const from = useRef(0);

  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    if (reduce) {
      node.textContent = prefix + format(value) + suffix;
      return;
    }
    const controls = animate(from.current, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (node.textContent = prefix + format(v) + suffix),
    });
    from.current = value;
    return () => controls.stop();
  }, [inView, value, duration, delay, prefix, suffix, format, reduce]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {format(0)}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* GlowCard — spotlight follows the cursor                              */
/* ------------------------------------------------------------------ */

export function GlowCard({ children, className }: { children: ReactNode; className?: string }) {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const bg = useMotionTemplate`radial-gradient(420px circle at ${x}px ${y}px, color-mix(in oklab, var(--c1) 18%, transparent), transparent 70%)`;
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };
  return (
    <div
      onMouseMove={onMove}
      onMouseLeave={() => {
        x.set(-400);
        y.set(-400);
      }}
      className={cn("group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl", className)}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: bg }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee                                                              */
/* ------------------------------------------------------------------ */

export function Marquee({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mask-fade-x group flex overflow-hidden", className)}>
      <div className="animate-marquee flex w-max shrink-0 gap-3 pr-3 group-hover:[animation-play-state:paused]">
        {children}
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ProgressRing                                                         */
/* ------------------------------------------------------------------ */

export function ProgressRing({
  pct,
  size = 180,
  stroke = 12,
  children,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const id = `ring${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgb(255 255 255 / 0.08)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (Math.max(1.5, pct) / 100) * c }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: "drop-shadow(0 0 10px var(--glow))" }}
        />
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--c3)" />
            <stop offset="0.5" stopColor="var(--c1)" />
            <stop offset="1" stopColor="var(--c2)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* BlurText — word-by-word reveal                                       */
/* ------------------------------------------------------------------ */

export function BlurText({
  text,
  className,
  delay = 0,
  stagger = 0.06,
  gradient = false,
  wordClassName,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  /** Gradient must be applied per word: background-clip:text doesn't reach animated children. */
  gradient?: boolean;
  /** Applied to each word (needed for background-clip text effects). */
  wordClassName?: string;
}) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          aria-hidden
          className={cn("inline-block", gradient && "text-gradient pb-[0.08em] pr-[0.04em]", wordClassName)}
          initial={{ opacity: 0, filter: "blur(10px)", y: 12 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.6, delay: delay + i * stagger, ease: [0.16, 1, 0.3, 1] }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Reveal — fade/slide in on scroll                                     */
/* ------------------------------------------------------------------ */

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Typewriter                                                           */
/* ------------------------------------------------------------------ */

export function Typewriter({ phrases, className }: { phrases: string[]; className?: string }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = phrases[i % phrases.length];
    const done = !deleting && text === full;
    const empty = deleting && text === "";
    const t = setTimeout(
      () => {
        if (done) setDeleting(true);
        else if (empty) {
          setDeleting(false);
          setI((n) => n + 1);
        } else setText(deleting ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1));
      },
      done ? 1800 : deleting ? 18 : 38,
    );
    return () => clearTimeout(t);
  }, [text, deleting, i, phrases]);

  return (
    <span className={className}>
      {text}
      <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-current" />
    </span>
  );
}
