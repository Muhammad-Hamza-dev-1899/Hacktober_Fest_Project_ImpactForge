"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { Check, CircleCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Globe, IMPACT_SITES } from "@/components/ui/Globe";
import { Reveal } from "@/components/ui/primitives";
import { SERIES_VAR } from "@/lib/themes";
import { cn } from "@/lib/utils";

function Tile({
  title,
  body,
  children,
  className,
  dark,
  href,
  cta,
}: {
  title: ReactNode;
  body?: string;
  children?: ReactNode;
  className?: string;
  dark?: boolean;
  href?: string;
  cta?: string;
}) {
  return (
    <div className={cn("relative flex flex-col overflow-hidden", dark ? "tile-dark" : "tile", className)}>
      <div className="relative px-7 pt-8 sm:px-9 sm:pt-10">
        <h3 className="text-[1.5rem] font-semibold leading-[1.15] tracking-[-0.01em] sm:text-[1.75rem]">{title}</h3>
        {body && (
          <p className={cn("mt-2 max-w-md text-[15px] leading-relaxed sm:text-[17px]", dark ? "text-[#a1a1a6]" : "text-ink-2")}>{body}</p>
        )}
        {href && (
          <Link
            href={href}
            className={cn("mt-3 inline-block text-[15px] hover:underline sm:text-[17px]", dark ? "text-[#2997ff]" : "text-link")}
          >
            {cta ?? "Learn more"} ›
          </Link>
        )}
      </div>
      <div className="relative flex-1">{children}</div>
    </div>
  );
}

/* ---------------- Prompt → JSON ---------------- */

const PROMPT = "winter coats for kids in Gilgit";
const JSON_LINES: [string, string, string][] = [
  ["title", '"Warmth for Gilgit"', "#c41a16"],
  ["palette", '"glacier"', "#c41a16"],
  ["goalPKR", "1000000", "#1c00cf"],
  ["impactUnits", "[3 tiers]", "#5c2699"],
  ["days", "[12-day plan]", "#5c2699"],
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
    <div ref={ref} className="grid gap-3 p-7 sm:grid-cols-2 sm:p-9">
      <div className="rounded-2xl bg-raised p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
        <p className="eyebrow text-[10px] text-ink-3">Prompt</p>
        <p className="mt-2 min-h-[3.2rem] text-[17px] leading-snug">
          {PROMPT.slice(0, typed)}
          <span className="animate-caret ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] bg-blue" />
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5 text-[11px]">
          {["Copy + theme", "Strategy"].map((t, i) => (
            <span
              key={t}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 transition",
                lines > i * 3 ? "bg-blue/10 text-blue" : "bg-mist text-ink-3",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", valid ? "bg-[#28c840]" : lines > 0 ? "animate-pulse bg-blue" : "bg-ink-3")} />
              Claude · {t}
            </span>
          ))}
        </div>
      </div>
      <div className="relative rounded-2xl bg-raised p-5 font-mono text-[12px] leading-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
        <p className="text-ink-3">{"{"}</p>
        {JSON_LINES.map(([k, v, c], i) => (
          <motion.p key={k} initial={false} animate={{ opacity: i < lines ? 1 : 0.12 }} className="pl-4">
            <span className="text-[#836c28]">&quot;{k}&quot;</span>
            <span className="text-ink-3">: </span>
            <span style={{ color: c }}>{v}</span>
          </motion.p>
        ))}
        <p className="text-ink-3">{"}"}</p>
        <AnimatePresence>
          {valid && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-[#28c840]/12 px-2.5 py-1 font-sans text-[11px] font-medium text-[#1f8a35]"
            >
              <CircleCheck className="h-3.5 w-3.5" /> Validated
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------- Sankey ---------------- */

function MiniSankey() {
  const flows = [
    { label: "Coats from tailors", pct: 68, y: 8, h: 68 },
    { label: "Gloves & boots", pct: 17, y: 96, h: 17 },
    { label: "Logistics", pct: 11, y: 132, h: 11 },
    { label: "Fees", pct: 4, y: 162, h: 6 },
  ];
  const sources = flows.reduce<number[]>((acc, f, i) => [...acc, i === 0 ? 44 : acc[i - 1] + flows[i - 1].h], []);
  return (
    <div className="px-7 pb-9 pt-6 sm:px-9">
      <svg viewBox="0 0 320 180" className="w-full" role="img" aria-label="Sankey: 68% to coats, 17% accessories, 11% logistics, 4% fees">
        <rect x="0" y="44" width="6" height="102" rx="3" fill="currentColor" />
        {flows.map((f, i) => {
          const sy = sources[i] + f.h / 2;
          const ty = f.y + f.h / 2;
          const d = `M6 ${sy} C 100 ${sy}, 100 ${ty}, 190 ${ty}`;
          return (
            <g key={f.label}>
              <motion.path
                d={d}
                stroke={SERIES_VAR[i]}
                strokeOpacity={0.35}
                strokeWidth={Math.max(3, f.h)}
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.2 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              />
              <rect x="190" y={f.y} width="6" height={Math.max(4, f.h)} rx="2" fill={SERIES_VAR[i]} />
              <text x="204" y={ty + 4} fontSize="11" fill="currentColor" className="text-ink">
                {f.label}{" "}
                <tspan fill="currentColor" fillOpacity={0.6}>
                  {f.pct}%
                </tspan>
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------------- Plan ---------------- */

function MiniPlan() {
  const rows = [
    ["01", "Soft launch with the core team", "WhatsApp"],
    ["05", "Coat-drop stall at the C1 lawn", "Campus"],
    ["08", "Winter Night fundraiser", "Event"],
    ["12", "Send every donor their Wrapped", "Email"],
  ];
  return (
    <div className="space-y-2 px-7 pb-9 pt-6 sm:px-9">
      {rows.map(([d, t, c], i) => (
        <motion.div
          key={d}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + i * 0.1 }}
          className="flex items-center gap-3 rounded-xl bg-raised px-3.5 py-3 shadow-[0_1px_6px_rgba(0,0,0,0.04)]"
        >
          <span className="w-7 text-[13px] font-semibold text-ink-3">{d}</span>
          <span className="flex-1 truncate text-[14px]">{t}</span>
          <span className="hidden text-[12px] text-ink-3 sm:inline">{c}</span>
          <motion.span
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.4 + i * 0.12 }}
            className="grid h-5 w-5 place-items-center rounded-full bg-blue text-white"
          >
            <Check className="h-3 w-3" strokeWidth={3.5} />
          </motion.span>
        </motion.div>
      ))}
    </div>
  );
}

export function FeatureTiles() {
  return (
    <section className="mx-auto w-full max-w-[1080px] px-4 py-24 sm:py-32">
      <Reveal className="mx-auto max-w-3xl text-center">
        <h2 className="t-headline">
          A whole fundraising team.
          <br />
          <span className="text-ink-3">In one prompt.</span>
        </h2>
      </Reveal>
      <div className="mt-14 grid gap-5 md:grid-cols-2">
        <Reveal className="md:col-span-2">
          <Tile
            title="Campaign-in-a-Box."
            body="Two Claude agents work in parallel. One writes the story, tiers and budget and picks a visual identity. The other plans every day of the launch. Every word is schema-checked before it appears."
            href="/create"
            cta="Try it now"
          >
            <GenerateDemo />
          </Tile>
        </Reveal>
        <Reveal>
          <Tile
            title="Every rupee, traced."
            body="Gifts flow through a published budget. Donors see exactly where their money went."
            className="h-full"
          >
            <MiniSankey />
          </Tile>
        </Reveal>
        <Reveal delay={0.06}>
          <Tile
            title="Not just ideas. A plan."
            body="Daily tasks, channels and targets a student team can run between classes."
            className="h-full"
          >
            <MiniPlan />
          </Tile>
        </Reveal>
        <Reveal className="md:col-span-2">
          <Tile
            title="From campus to the valleys."
            body="Campaigns connect NUST, Islamabad with communities in Gilgit, Skardu, Tharparkar, Dadu and Kech."
            href="/explore"
            cta="Explore campaigns"
            className="md:grid md:grid-cols-[1fr_1.1fr] md:items-center"
          >
            <div className="grid items-center gap-4 px-7 pb-9 sm:px-9 md:grid-cols-1">
              <div className="mx-auto w-full max-w-[380px]">
                <Globe light color="#0071e3" />
              </div>
              <ul className="flex flex-wrap justify-center gap-2 text-[13px] text-ink-2">
                {IMPACT_SITES.slice(0, 5).map((s) => (
                  <li key={s.name} className="rounded-full bg-raised px-3 py-1 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
                    {s.name}
                  </li>
                ))}
              </ul>
            </div>
          </Tile>
        </Reveal>
      </div>
    </section>
  );
}
