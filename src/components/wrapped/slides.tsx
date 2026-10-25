"use client";

import { motion } from "motion/react";
import { Check, Clock, Download, HeartHandshake, Repeat2, Share2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { ResponsiveContainer, Sankey, Tooltip } from "recharts";
import { Icon } from "@/components/ui/Icon";
import { CoverArt } from "@/components/ui/CoverArt";
import { NumberTicker } from "@/components/ui/primitives";
import { SERIES } from "@/lib/themes";
import { addDays, formatDate, formatNumber, formatPKR, unitPhrase } from "@/lib/utils";
import type { SlideProps } from "./WrappedStory";

const ease = [0.16, 1, 0.3, 1] as const;

const up = (delay = 0) => ({
  initial: { opacity: 0, y: 24, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.7, delay, ease },
});

function Eyebrow({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.p {...up(delay)} className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
      {children}
    </motion.p>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Intro                                                             */
/* ------------------------------------------------------------------ */

export function IntroSlide({ donation, campaign }: SlideProps) {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <motion.div
        initial={{ scale: 0, rotate: -40 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 11, stiffness: 110, delay: 0.1 }}
        className="mb-8 h-32 w-32 overflow-hidden rounded-full border border-white/25 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)]"
      >
        <CoverArt campaign={campaign} size="sm" animated={false} className="h-full w-full" />
      </motion.div>
      <Eyebrow delay={0.4}>Hey {donation.donorName}</Eyebrow>
      <motion.h2 {...up(0.6)} className="mt-3 text-[2.9rem] font-semibold leading-[0.98] tracking-[-0.03em]">
        Your {formatPKR(donation.amountPKR)} went on a <span className="serif font-normal">journey.</span>
      </motion.h2>
      <motion.p {...up(1.2)} className="mt-5 text-lg text-white/70">
        Here&apos;s exactly where it went, and who it reached in {campaign.region}.
      </motion.p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Amount → tangible units                                           */
/* ------------------------------------------------------------------ */

export function AmountSlide({ donation, campaign }: SlideProps) {
  const n = Math.min(donation.units.count, 24);
  return (
    <div className="flex flex-1 flex-col justify-center">
      <Eyebrow>You gave</Eyebrow>
      <motion.div {...up(0.15)} className="mt-2 text-[4.2rem] font-semibold leading-none tracking-[-0.04em]">
        <NumberTicker value={donation.amountPKR} prefix="PKR " duration={1.8} />
      </motion.div>
      <motion.p {...up(1.6)} className="mt-10 text-lg text-white/75">
        That became
      </motion.p>
      <motion.p {...up(1.8)} className="serif text-[2.6rem] leading-[1.02]">
        {unitPhrase(donation.units.count, donation.units.label)}
      </motion.p>
      <div className="mt-8 flex flex-wrap gap-2.5">
        {Array.from({ length: n }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 260, delay: 2.3 + i * 0.09 }}
            className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-[color-mix(in_oklab,var(--c2)_80%,black)] shadow-lg"
          >
            <Icon name={donation.units.icon} className="h-7 w-7" />
          </motion.span>
        ))}
      </div>
      <motion.p {...up(3.2)} className="mt-8 text-sm text-white/60">
        for {donation.ripple.direct} {campaign.beneficiaryNoun} who&apos;ll feel it directly.
      </motion.p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Sankey: where every rupee went                                    */
/* ------------------------------------------------------------------ */

type SankeyNodeRenderProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: { name: string; value: number };
};
type SankeyLinkRenderProps = {
  sourceX: number;
  targetX: number;
  sourceY: number;
  targetY: number;
  sourceControlX: number;
  targetControlX: number;
  linkWidth: number;
  index: number;
};

export function SankeySlide({ donation }: SlideProps) {
  const data = {
    nodes: [{ name: "You" }, ...donation.allocation.map((a) => ({ name: a.category }))],
    links: donation.allocation.map((a, i) => ({ source: 0, target: i + 1, value: Math.max(1, a.amountPKR) })),
  };

  const Node = ({ x, y, width, height, index, payload }: SankeyNodeRenderProps) => {
    const isRoot = index === 0;
    const color = isRoot ? "#ffffff" : SERIES[(index - 1) % SERIES.length];
    return (
      <g>
        <rect x={x} y={y} width={width} height={Math.max(2, height)} rx={4} fill={color} />
        {isRoot ? (
          <text x={x} y={y - 8} fill="#ffffff" fontSize={13} fontWeight={600}>
            You
          </text>
        ) : (
          <>
            <text
              x={x + width + 8}
              y={y + height / 2 - 7}
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.92)"
              fontSize={12}
              fontWeight={500}
            >
              {payload.name.length > 22 ? `${payload.name.slice(0, 21)}…` : payload.name}
            </text>
            <text x={x + width + 8} y={y + height / 2 + 9} dominantBaseline="middle" fill="rgba(255,255,255,0.55)" fontSize={11}>
              {formatPKR(payload.value)}
            </text>
          </>
        )}
      </g>
    );
  };

  const Link_ = ({ sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index }: SankeyLinkRenderProps) => (
    <motion.path
      d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
      fill="none"
      stroke={SERIES[index % SERIES.length]}
      strokeOpacity={0.45}
      strokeWidth={Math.max(2, linkWidth)}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.2, delay: 0.6 + index * 0.15, ease }}
    />
  );

  return (
    <div className="flex flex-1 flex-col">
      <Eyebrow>Follow the money</Eyebrow>
      <motion.h2 {...up(0.15)} className="mt-2 text-[2.2rem] font-semibold leading-[1] tracking-[-0.03em]">
        Every rupee, <span className="serif font-normal">traced.</span>
      </motion.h2>
      <motion.div {...up(0.4)} className="mt-6 h-[320px] w-full" data-interactive>
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={data}
            nodeWidth={10}
            nodePadding={22}
            margin={{ top: 24, right: 150, bottom: 8, left: 0 }}
            node={(p: unknown) => <Node {...(p as SankeyNodeRenderProps)} />}
            link={(p: unknown) => <Link_ {...(p as SankeyLinkRenderProps)} />}
          >
            <Tooltip
              content={({ active, payload }) => {
                const item = payload?.[0]?.payload as
                  { payload?: { source?: { name: string }; target?: { name: string }; value?: number; name?: string } } | undefined;
                const inner = item?.payload;
                if (!active || !inner) return null;
                const label = inner.target ? `${inner.source?.name} → ${inner.target.name}` : inner.name;
                return (
                  <div className="rounded-xl border border-white/10 bg-[#0f0e13]/95 px-3 py-2 text-xs">
                    <p className="text-white">{label}</p>
                    <p className="text-white/60">{formatPKR(Number(inner.value ?? 0))}</p>
                  </div>
                );
              }}
            />
          </Sankey>
        </ResponsiveContainer>
      </motion.div>
      <motion.p {...up(1.6)} className="mt-auto rounded-2xl bg-white/[0.06] p-4 text-sm text-white/70">
        <span className="font-semibold text-white">{Math.round((donation.allocation[0].amountPKR / donation.amountPKR) * 100)}%</span> of
        your gift went straight to {donation.allocation[0].category.toLowerCase()}.
      </motion.p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Network: donor → campaign → people                                */
/* ------------------------------------------------------------------ */

export function NetworkSlide({ donation, campaign }: SlideProps) {
  const W = 360;
  const H = 440;
  const you = { x: W / 2, y: 46 };
  const hub = { x: W / 2, y: 170 };
  const people = donation.beneficiaries;
  const n = people.length;
  const radius = n > 4 ? 165 : 150;
  const nodes = people.map((p, i) => {
    const a = n === 1 ? Math.PI / 2 : Math.PI * (0.12 + (0.76 * i) / (n - 1));
    return {
      ...p,
      x: hub.x + Math.cos(a) * radius * (n > 4 && i % 2 ? 0.78 : 1),
      y: hub.y + Math.sin(a) * radius * (n > 4 && i % 2 ? 0.78 : 1) + 40,
    };
  });
  const fellow = Math.min(14, donation.stats.totalDonors - 1);
  const others = Array.from({ length: fellow }, (_, i) => {
    const a = (Math.PI * 2 * i) / fellow + 0.2;
    return { x: hub.x + Math.cos(a) * 78, y: hub.y + Math.sin(a) * 50 - 10 };
  });
  const curve = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    `M${a.x},${a.y} Q${(a.x + b.x) / 2},${a.y + (b.y - a.y) * 0.15} ${b.x},${b.y}`;

  return (
    <div className="flex flex-1 flex-col">
      <Eyebrow>Who it reached</Eyebrow>
      <motion.h2 {...up(0.15)} className="mt-2 text-[2.2rem] font-semibold leading-[1] tracking-[-0.03em]">
        You&apos;re now connected to{" "}
        <span className="serif font-normal">
          {n} {n === 1 ? campaign.beneficiaryNoun.replace(/s$/, "") : campaign.beneficiaryNoun}.
        </span>
      </motion.h2>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 w-full flex-1"
        role="img"
        aria-label={`Network graph linking you to ${n} ${campaign.beneficiaryNoun}`}
      >
        <defs>
          <radialGradient id="hubGlow">
            <stop offset="0%" stopColor="var(--c1)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--c1)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* fellow donors */}
        {others.map((o, i) => (
          <motion.g key={`o${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.03 }}>
            <line x1={o.x} y1={o.y} x2={hub.x} y2={hub.y} stroke="white" strokeOpacity={0.08} />
            <circle cx={o.x} cy={o.y} r={3} fill="white" fillOpacity={0.35} />
          </motion.g>
        ))}

        {/* you → hub */}
        <motion.path
          id="edge-you"
          d={`M${you.x},${you.y} L${hub.x},${hub.y}`}
          stroke="white"
          strokeWidth={3}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease }}
        />

        {/* hub → people */}
        {nodes.map((p, i) => (
          <g key={p.id}>
            <motion.path
              id={`edge-${i}`}
              d={curve(hub, p)}
              fill="none"
              stroke="var(--c1)"
              strokeOpacity={0.6}
              strokeWidth={1.6}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, delay: 1.2 + i * 0.12, ease }}
            />
            {/* particles flowing along the edge */}
            {[0, 1].map((k) => (
              <circle key={k} r={2.4} fill="var(--c3)" opacity={0}>
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur="2.2s"
                  begin={`${2 + i * 0.15 + k * 1.1}s`}
                  repeatCount="indefinite"
                />
                <animateMotion dur="2.2s" begin={`${2 + i * 0.15 + k * 1.1}s`} repeatCount="indefinite" path={curve(hub, p)} />
              </circle>
            ))}
          </g>
        ))}

        {/* particles you → hub */}
        {[0, 1, 2].map((k) => (
          <circle key={`y${k}`} r={3} fill="white" opacity={0}>
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin={`${1.2 + k * 0.5}s`} repeatCount="indefinite" />
            <animateMotion dur="1.5s" begin={`${1.2 + k * 0.5}s`} repeatCount="indefinite" path={`M${you.x},${you.y} L${hub.x},${hub.y}`} />
          </circle>
        ))}

        {/* hub */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10, delay: 0.8 }}
          style={{ transformOrigin: `${hub.x}px ${hub.y}px` }}
        >
          <circle cx={hub.x} cy={hub.y} r={48} fill="url(#hubGlow)" />
          <circle cx={hub.x} cy={hub.y} r={24} fill="var(--c2)" stroke="white" strokeOpacity={0.6} strokeWidth={2} />
          <text x={hub.x} y={hub.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={20}>
            {campaign.theme.emoji}
          </text>
        </motion.g>

        {/* you */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10, delay: 0.2 }}
          style={{ transformOrigin: `${you.x}px ${you.y}px` }}
        >
          <circle cx={you.x} cy={you.y} r={20} fill="white" />
          <text x={you.x} y={you.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={14} fontWeight={700} fill="#09080b">
            {donation.donorName[0]?.toUpperCase() ?? "Y"}
          </text>
          <text x={you.x + 30} y={you.y + 1} dominantBaseline="middle" fontSize={12} fill="white" fontWeight={600}>
            You
          </text>
        </motion.g>

        {/* people */}
        {nodes.map((p, i) => (
          <motion.g
            key={`n-${p.id}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 11, delay: 1.8 + i * 0.12 }}
            style={{ transformOrigin: `${p.x}px ${p.y}px` }}
          >
            <circle cx={p.x} cy={p.y} r={16} fill="#0f0e13" stroke="var(--c3)" strokeWidth={2} />
            <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight={600} fill="white">
              {p.name[0]}
            </text>
            <text x={p.x} y={p.y + 30} textAnchor="middle" fontSize={11} fontWeight={600} fill="white">
              {p.name}
            </text>
            <text x={p.x} y={p.y + 43} textAnchor="middle" fontSize={9.5} fill="rgba(255,255,255,0.55)">
              {p.age} · {p.town}
            </text>
          </motion.g>
        ))}
      </svg>
      <motion.p {...up(2.8)} className="text-center text-xs text-white/50">
        {donation.stats.totalDonors > 1
          ? `Plus ${donation.stats.totalDonors - 1} fellow donors in the same circle.`
          : "You're the first donor. The circle starts with you."}{" "}
        Names changed for privacy.
      </motion.p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Ripple effect                                                     */
/* ------------------------------------------------------------------ */

export function RippleSlide({ donation, campaign }: SlideProps) {
  const rings = [
    {
      value: donation.ripple.community,
      label: `people in ${donation.beneficiaries[0]?.town ?? campaign.region} feel the ripple`,
      size: 300,
    },
    { value: donation.ripple.household, label: "family members with one less worry", size: 200 },
    { value: donation.ripple.direct, label: `${campaign.beneficiaryNoun} helped directly`, size: 100 },
  ];
  return (
    <div className="flex flex-1 flex-col">
      <Eyebrow>The ripple effect</Eyebrow>
      <motion.h2 {...up(0.15)} className="mt-2 text-[2.2rem] font-semibold leading-[1] tracking-[-0.03em]">
        One gift. <span className="serif font-normal">Three circles.</span>
      </motion.h2>
      <div className="relative mx-auto my-8 grid h-[300px] w-[300px] place-items-center">
        {rings.map((r, i) => (
          <motion.div
            key={r.label}
            className="absolute rounded-full border border-white/25"
            style={{
              width: r.size,
              height: r.size,
              background: `radial-gradient(circle, color-mix(in oklab, var(${["--c2", "--c1", "--c3"][i]}) ${20 + i * 15}%, transparent), transparent 70%)`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 1.4 - i * 0.5, ease }}
          />
        ))}
        <motion.span
          className="absolute h-[100px] w-[100px] rounded-full border border-white/40"
          animate={{ scale: [1, 3], opacity: [0.6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: 2 }}
        />
        <span className="relative text-4xl font-semibold">
          <NumberTicker value={donation.ripple.direct} delay={0.4} />
        </span>
      </div>
      <div className="space-y-3">
        {[...rings].reverse().map((r, i) => (
          <motion.div key={r.label} {...up(1.2 + i * 0.4)} className="flex items-baseline gap-3">
            <span className="w-16 shrink-0 text-right text-2xl font-semibold tabular-nums">
              <NumberTicker value={r.value} delay={1.2 + i * 0.4} />
            </span>
            <span className="text-sm text-white/70">{r.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Journey timeline                                                  */
/* ------------------------------------------------------------------ */

export function JourneySlide({ donation }: SlideProps) {
  const [now] = useState(() => Date.now());
  return (
    <div className="flex flex-1 flex-col">
      <Eyebrow>The journey</Eyebrow>
      <motion.h2 {...up(0.15)} className="mt-2 text-[2.2rem] font-semibold leading-[1] tracking-[-0.03em]">
        From your phone <span className="serif font-normal">to their hands.</span>
      </motion.h2>
      <ol className="relative mt-8 space-y-5 pl-10">
        <motion.span
          className="absolute bottom-3 left-[13px] top-3 w-[2px] origin-top bg-[linear-gradient(var(--c3),var(--c1),var(--c2))]"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 2.4, delay: 0.4, ease }}
        />
        {donation.journey.map((s, i) => {
          const date = addDays(donation.createdAt, s.dayOffset);
          const done = date.getTime() <= now;
          return (
            <motion.li key={s.label} {...up(0.5 + i * 0.35)} className="relative">
              <span
                className={`absolute -left-10 top-0.5 grid h-7 w-7 place-items-center rounded-full ${done ? "bg-white text-[#1d1d1f]" : "border border-white/40 bg-[#0b0a0f] text-white/70"}`}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : <Clock className="h-3.5 w-3.5" />}
              </span>
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-semibold">{s.label}</p>
                <p className="shrink-0 text-xs text-white/50">{done ? formatDate(date) : `ETA ${formatDate(date)}`}</p>
              </div>
              <p className="text-sm text-white/60">{s.detail}</p>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Share card                                                        */
/* ------------------------------------------------------------------ */

export function ShareSlide({ donation, campaign }: SlideProps) {
  const card = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [shared, setShared] = useState(false);

  const download = async () => {
    if (!card.current) return;
    setBusy(true);
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(card.current, { pixelRatio: 3, cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = `impact-wrapped-${campaign.slug}.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/c/${campaign.slug}`;
    const text = `I just helped ${donation.ripple.direct} ${campaign.beneficiaryNoun} in ${campaign.region} through ${campaign.title} ${campaign.theme.emoji}`;
    try {
      if (navigator.share) await navigator.share({ title: campaign.title, text, url });
      else await navigator.clipboard.writeText(`${text} ${url}`);
      setShared(true);
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="flex flex-1 flex-col justify-center">
      <Eyebrow>Your 2026 impact</Eyebrow>
      <motion.div
        ref={card}
        initial={{ opacity: 0, y: 30, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease }}
        className="relative mt-4 overflow-hidden rounded-[1.75rem] border border-white/20 p-6 text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
      >
        <CoverArt campaign={campaign} medallion={false} animated={false} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/70" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="text-3xl">{campaign.theme.emoji}</span>
            <span className="rounded-full bg-black/30 px-3 py-1 font-mono text-[9px] font-semibold uppercase tracking-widest backdrop-blur">
              Impact Wrapped
            </span>
          </div>
          <p className="mt-10 text-sm text-white/80">{donation.donorName} helped</p>
          <p className="text-[3.4rem] font-semibold leading-[0.9] tracking-[-0.04em]">{donation.ripple.direct}</p>
          <p className="serif text-[2.4rem] leading-none">{campaign.beneficiaryNoun}</p>
          <p className="mt-2 text-sm text-white/75">in {campaign.region}</p>
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            {[
              [formatNumber(donation.amountPKR), "PKR given"],
              [`Top ${donation.stats.percentile}%`, "of donors"],
              [String(donation.ripple.community), "reached"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-2xl border border-white/10 bg-black/30 px-2 py-3 backdrop-blur">
                <p className="text-base font-semibold">{v}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/60">{l}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-white/60">{campaign.title} · impactforge</p>
        </div>
      </motion.div>

      <motion.div {...up(0.9)} className="mt-6 grid grid-cols-2 gap-2" data-interactive>
        <button
          onClick={download}
          disabled={busy}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-[#1d1d1f] disabled:opacity-60"
        >
          <Download className="h-4 w-4" /> {busy ? "Saving…" : "Save image"}
        </button>
        <button
          onClick={share}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/25 text-sm font-semibold"
        >
          <Share2 className="h-4 w-4" /> {shared ? "Shared!" : "Share"}
        </button>
        <Link
          href={`/c/${campaign.slug}`}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 text-sm text-white/80"
        >
          <Repeat2 className="h-4 w-4" /> Give again
        </Link>
        <Link
          href="/create"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 text-sm text-white/80"
        >
          <HeartHandshake className="h-4 w-4" /> Start a cause
        </Link>
      </motion.div>
    </div>
  );
}
