"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { Check, CircleCheck, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Globe, IMPACT_SITES } from "@/components/ui/Globe";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/primitives";
import { PALETTE_TOKENS, SERIES } from "@/lib/themes";
import { cn } from "@/lib/utils";

function BentoCard({
  eyebrow,
  title,
  body,
  children,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  body: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("card group relative flex flex-col overflow-hidden transition duration-500 hover:border-white/15", className)}>
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100 [background:radial-gradient(600px_circle_at_50%_0%,rgba(255,106,61,0.08),transparent_60%)]" />
      <div className="relative flex-1">{children}</div>
      <div className="relative p-6 pt-0 sm:p-7 sm:pt-0">
        <p className="eyebrow text-[#ff8a4c]">{eyebrow}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/50">{body}</p>
      </div>
    </div>
  );
}

/* ---------------- 1. Prompt → JSON → page ---------------- */

const PROMPT = "winter coats for kids in Gilgit";
const JSON_LINES: [string, string, string][] = [
  ["title", '"Warmth for Gilgit"', "#ffd18a"],
  ["palette", '"glacier"', "#7dd3fc"],
  ["heroVariant", '"spotlight"', "#7dd3fc"],
  ["goalPKR", "1000000", "#ff8a4c"],
  ["impactUnits", "[ 3 tiers ]", "#c4b5fd"],
  ["days", "[ 12-day plan ]", "#c4b5fd"],
];

function GenerateDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const [typed, setTyped] = useState(0);
  const [lines, setLines] = useState(0);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(() => !cancelled && fn(), ms));
    const run = () => {
      setTyped(0);
      setLines(0);
      setValid(false);
      for (let i = 1; i <= PROMPT.length; i++) at(300 + i * 45, () => setTyped(i));
      const t0 = 300 + PROMPT.length * 45 + 400;
      JSON_LINES.forEach((_, i) => at(t0 + i * 260, () => setLines(i + 1)));
      at(t0 + JSON_LINES.length * 260 + 300, () => setValid(true));
      at(t0 + JSON_LINES.length * 260 + 3800, run);
    };
    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [inView]);

  return (
    <div ref={ref} className="grid gap-4 p-6 sm:grid-cols-[1fr_1.1fr] sm:p-7">
      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="eyebrow text-[9px] text-white/35">Student prompt</p>
          <p className="mt-2 min-h-[3rem] text-[15px] leading-snug">
            {PROMPT.slice(0, typed)}
            <span className="animate-caret ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] bg-[#ff8a4c]" />
          </p>
        </div>
        <div className="flex gap-2 text-[11px]">
          {["Claude · copy + theme", "Claude · strategy"].map((t, i) => (
            <span
              key={t}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-2 py-1.5 transition duration-500",
                lines > i * 3 ? "border-[#ff6a3d]/50 bg-[#ff6a3d]/10 text-white" : "border-white/10 text-white/40",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  lines > 0 && !valid ? "animate-pulse bg-[#ff8a4c]" : valid ? "bg-emerald-400" : "bg-white/30",
                )}
              />
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="relative rounded-2xl border border-white/10 bg-[#0b0a0e] p-4 font-mono text-[12px] leading-6">
        <p className="text-white/35">{"{"}</p>
        {JSON_LINES.map(([k, v, c], i) => (
          <motion.p key={k} initial={false} animate={{ opacity: i < lines ? 1 : 0.08, x: i < lines ? 0 : -4 }} className="pl-4">
            <span className="text-white/55">&quot;{k}&quot;</span>
            <span className="text-white/30">: </span>
            <span style={{ color: c }}>{v}</span>
          </motion.p>
        ))}
        <p className="text-white/35">{"}"}</p>
        <AnimatePresence>
          {valid && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 font-sans text-[11px] font-medium text-emerald-300"
            >
              <CircleCheck className="h-3.5 w-3.5" /> Schema valid
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------- 2. Mini Wrapped (auto-cycling) ---------------- */

const G = PALETTE_TOKENS.glacier;

function MiniWrappedCycle() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % 3), 2600);
    return () => clearInterval(t);
  }, []);
  const bgs = [
    `linear-gradient(165deg, color-mix(in oklab, ${G.c1} 70%, black), color-mix(in oklab, ${G.c2} 65%, black))`,
    `radial-gradient(90% 60% at 50% 0%, color-mix(in oklab, ${G.c2} 55%, transparent), transparent 70%), #0b0a0f`,
    `linear-gradient(200deg, color-mix(in oklab, ${PALETTE_TOKENS.sunrise.c1} 55%, black), color-mix(in oklab, ${PALETTE_TOKENS.sunrise.c2} 60%, black))`,
  ];
  return (
    <div className="flex h-full items-center justify-center px-6 py-8">
      <div className="relative h-[440px] w-[230px] rounded-[2.1rem] border border-white/15 bg-black p-1.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
        <div className="relative h-full overflow-hidden rounded-[1.7rem]">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={i}
              className="absolute inset-0 p-4"
              style={{ background: bgs[i] }}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((k) => (
                  <span key={k} className="h-[2px] flex-1 rounded-full bg-white/30">
                    <span className="block h-full rounded-full bg-white" style={{ width: k < i ? "100%" : k === i ? "60%" : "0%" }} />
                  </span>
                ))}
              </div>
              {i === 0 && (
                <div className="flex h-[calc(100%-12px)] flex-col pt-16">
                  <p className="eyebrow text-[9px] text-white/70">You gave</p>
                  <p className="mt-1 text-[36px] font-semibold leading-none tracking-tight">PKR 7,500</p>
                  <p className="serif mt-6 text-[28px] leading-[1.05]">became 3 winter coats.</p>
                  <div className="mt-6 flex gap-2">
                    {[0, 1, 2].map((k) => (
                      <span key={k} className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#3730a3] shadow-lg">
                        <Icon name="shirt" className="h-5 w-5" />
                      </span>
                    ))}
                  </div>
                  <p className="mt-auto text-[11px] text-white/65">for 3 children in Danyore, Gilgit-Baltistan</p>
                </div>
              )}
              {i === 1 && (
                <div className="pt-10">
                  <p className="eyebrow text-[9px] text-white/70">Follow the money</p>
                  <svg viewBox="0 0 180 170" className="mt-4 w-full">
                    {[
                      [20, 120, 68],
                      [70, 60, 17],
                      [100, 30, 11],
                      [125, 14, 4],
                    ].map(([y, h, pct], k) => (
                      <g key={k}>
                        <motion.path
                          d={`M8 ${50 + k * 18} C 70 ${50 + k * 18}, 70 ${y + h / 2 - (k === 0 ? 30 : 0)}, 120 ${y + (k === 0 ? 15 : h / 4)}`}
                          stroke={SERIES[k]}
                          strokeOpacity={0.55}
                          strokeWidth={k === 0 ? 30 : 10 - k * 2}
                          fill="none"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.9, delay: 0.1 + k * 0.12 }}
                        />
                        <rect x="120" y={y + (k === 0 ? 0 : h / 4 - 4)} width="5" height={k === 0 ? 30 : 8} rx="2" fill={SERIES[k]} />
                        <text x="130" y={y + (k === 0 ? 18 : h / 4 + 3)} fontSize="9" fill="white" opacity={0.85}>
                          {pct}%
                        </text>
                      </g>
                    ))}
                    <rect x="2" y="40" width="5" height="70" rx="2" fill="white" />
                  </svg>
                  <p className="serif absolute inset-x-4 bottom-6 text-[26px] leading-[1.05]">68% went straight to coats.</p>
                </div>
              )}
              {i === 2 && (
                <div className="pt-12 text-center">
                  <p className="eyebrow text-[9px] text-white/70">Ayesha helped</p>
                  <p className="mt-2 text-5xl font-semibold tracking-tight">3</p>
                  <p className="serif text-2xl">children</p>
                  <div className="relative mx-auto mt-6 grid h-28 w-28 place-items-center">
                    {[112, 80, 48].map((s) => (
                      <span key={s} className="absolute rounded-full border border-white/40" style={{ width: s, height: s }} />
                    ))}
                    <Icon name="heart" className="h-5 w-5" />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 3. Sankey ---------------- */

function MiniSankey() {
  const flows = [
    { label: "Coats from tailors", pct: 68, y: 8, h: 68 },
    { label: "Gloves & boots", pct: 17, y: 96, h: 17 },
    { label: "Logistics", pct: 11, y: 132, h: 11 },
    { label: "Fees", pct: 4, y: 162, h: 6 },
  ];
  const sources = flows.reduce<number[]>((acc, f, i) => [...acc, i === 0 ? 44 : acc[i - 1] + flows[i - 1].h], []);
  return (
    <div className="p-6 sm:p-7">
      <svg viewBox="0 0 320 180" className="w-full" role="img" aria-label="Sankey: 68% to coats, 17% accessories, 11% logistics, 4% fees">
        <rect x="0" y="44" width="6" height="102" rx="3" fill="white" />
        {flows.map((f, i) => {
          const sy = sources[i] + f.h / 2;
          const ty = f.y + f.h / 2;
          const d = `M6 ${sy} C 100 ${sy}, 100 ${ty}, 190 ${ty}`;
          return (
            <g key={f.label}>
              <motion.path
                d={d}
                stroke={SERIES[i]}
                strokeOpacity={0.5}
                strokeWidth={Math.max(3, f.h)}
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.2 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              />
              <path d={d} stroke="white" strokeOpacity={0.35} strokeWidth="1" strokeDasharray="2 16" fill="none">
                <animate attributeName="stroke-dashoffset" from="36" to="0" dur="1.4s" repeatCount="indefinite" />
              </path>
              <rect x="190" y={f.y} width="6" height={Math.max(4, f.h)} rx="2" fill={SERIES[i]} />
              <text x="204" y={ty + 4} fontSize="11" fill="rgba(255,255,255,0.85)">
                {f.label} <tspan fill="rgba(255,255,255,0.45)">{f.pct}%</tspan>
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------------- 4. Timeline ---------------- */

function MiniTimeline() {
  const rows = [
    ["01", "Soft launch with the core team", "WhatsApp"],
    ["05", "Coat-drop stall at the C1 lawn", "Campus"],
    ["08", "Winter Night fundraiser", "Event"],
    ["12", "Send every donor their Wrapped", "Email"],
  ];
  return (
    <div className="space-y-2 p-6 sm:p-7">
      {rows.map(([d, t, c], i) => (
        <motion.div
          key={d}
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5"
        >
          <span className="font-mono text-[11px] text-white/35">D{d}</span>
          <span className="flex-1 truncate text-[13px] text-white/80">{t}</span>
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/50">{c}</span>
          <motion.span
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.5 + i * 0.15 }}
            className="grid h-4 w-4 place-items-center rounded-full bg-[#ff6a3d] text-[#1c0700]"
          >
            <Check className="h-2.5 w-2.5" strokeWidth={4} />
          </motion.span>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------------- 5. Validation ---------------- */

function Validation() {
  const checks = [
    "Goal clamped to PKR 25K–5M",
    "Budget rebalanced to exactly 100%",
    "Tiers sorted, max 3",
    "Days renumbered 1…14",
    "No HTML ever rendered",
  ];
  return (
    <div className="p-6 sm:p-7">
      <div className="rounded-2xl border border-white/10 bg-[#0b0a0e] p-4 font-mono text-[11.5px]">
        <p className="mb-2 text-white/35">$ CampaignSchema.parse(output)</p>
        {checks.map((c, i) => (
          <motion.p
            key={c}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.18 }}
            className="flex items-center gap-2 py-0.5 text-white/75"
          >
            <span className="text-emerald-400">✓</span> {c}
          </motion.p>
        ))}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.3 }}
          className="mt-2 text-[#ffc061]"
        >
          ↳ on failure: curated fallback, 0ms
        </motion.p>
      </div>
    </div>
  );
}

/* ---------------- 6. Globe ---------------- */

function GlobeCard() {
  return (
    <div className="relative grid items-center gap-2 p-6 sm:grid-cols-[1fr_1.1fr] sm:p-7">
      <ul className="order-2 space-y-1.5 text-sm sm:order-1">
        {IMPACT_SITES.slice(0, 5).map((s, i) => (
          <motion.li
            key={s.name}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="flex items-center gap-2.5 text-white/70"
          >
            <span className="relative flex h-2 w-2">
              <span
                className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-[#ff6a3d]"
                style={{ animationDelay: `${i * 0.4}s` }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff8a4c]" />
            </span>
            NUST, Islamabad <span className="text-white/25">→</span> {s.name}
          </motion.li>
        ))}
      </ul>
      <div className="relative order-1 -my-6 mx-auto w-full max-w-[340px] sm:order-2">
        <Globe />
      </div>
    </div>
  );
}

export function Bento() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow text-[#ff8a4c]">What it does</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
          A whole fundraising team, <span className="serif text-ember">in one prompt.</span>
        </h2>
      </Reveal>
      <div className="mt-16 grid gap-4 md:grid-cols-6">
        <Reveal className="md:col-span-4">
          <BentoCard
            className="h-full"
            eyebrow="Campaign-in-a-Box"
            title="One sentence in. A launch-ready campaign out."
            body="Two Claude agents run in parallel: one writes the story, tiers, budget and picks a visual identity; the other plans every day of the launch."
          >
            <GenerateDemo />
          </BentoCard>
        </Reveal>
        <Reveal className="md:col-span-2 md:row-span-2" delay={0.08}>
          <BentoCard
            className="h-full"
            eyebrow="Impact Wrapped"
            title="Every donor gets a story."
            body="A cinematic, swipeable recap of where their money went and who it reached."
          >
            <MiniWrappedCycle />
          </BentoCard>
        </Reveal>
        <Reveal className="md:col-span-2" delay={0.04}>
          <BentoCard
            className="h-full"
            eyebrow="Radical transparency"
            title="Every rupee, traced."
            body="Gifts flow through the published budget. Nothing hidden."
          >
            <MiniSankey />
          </BentoCard>
        </Reveal>
        <Reveal className="md:col-span-2" delay={0.08}>
          <BentoCard
            className="h-full"
            eyebrow="Execution plan"
            title="Not just ideas. A plan."
            body="Daily tasks, channels and KPIs a student team can run between classes."
          >
            <MiniTimeline />
          </BentoCard>
        </Reveal>
        <Reveal className="md:col-span-4" delay={0.04}>
          <BentoCard
            className="h-full"
            eyebrow="From campus to the valleys"
            title="Your campus, connected to the places that need it."
            body="Campaigns reach Gilgit, Skardu, Tharparkar, Dadu and Kech. Drag the globe."
          >
            <GlobeCard />
          </BentoCard>
        </Reveal>
        <Reveal className="md:col-span-2" delay={0.08}>
          <BentoCard
            className="h-full"
            eyebrow={"Can't-fail AI"}
            title={
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" /> Validated, always.
              </span>
            }
            body="Model output is repaired and schema-checked before it ever renders."
          >
            <Validation />
          </BentoCard>
        </Reveal>
      </div>
    </section>
  );
}
