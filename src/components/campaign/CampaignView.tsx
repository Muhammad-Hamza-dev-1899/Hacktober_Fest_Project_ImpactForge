"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Copy, Heart, MapPin, MessageCircle, Sparkles, Users, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { BudgetDonut } from "@/components/campaign/BudgetDonut";
import { DonateDialog } from "@/components/campaign/DonateDialog";
import { StrategyTimeline } from "@/components/campaign/StrategyTimeline";
import { HeroBackground } from "@/components/ui/backgrounds";
import { Icon } from "@/components/ui/Icon";
import { BlurText, GlowCard, NumberTicker, ProgressRing, Reveal, ShimmerButton } from "@/components/ui/primitives";
import type { Campaign } from "@/lib/schema";
import { themeVars } from "@/lib/themes";
import { cn, formatPKR } from "@/lib/utils";
import { useAppStore, useCampaign, useCampaignTotals } from "@/store/useAppStore";

export function CampaignPage({ slug }: { slug: string }) {
  const hydrated = useAppStore((s) => s.hydrated);
  const campaign = useCampaign(slug);
  if (!campaign && !hydrated) return <div className="min-h-screen" />;
  if (!campaign) return <NotFound />;
  return <CampaignView campaign={campaign} />;
}

function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <span className="text-5xl">🔭</span>
      <h1 className="mt-4 font-display text-2xl font-semibold">Campaign not found on this device</h1>
      <p className="mt-2 text-sm text-white/55">
        Prototype campaigns live in the creator&apos;s browser (no database yet). Generate your own in seconds.
      </p>
      <Link href="/create" className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink">
        Create a campaign
      </Link>
    </div>
  );
}

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <Reveal className="mb-8">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--c1)]">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {sub && <p className="mt-2 max-w-xl text-sm text-white/55">{sub}</p>}
    </Reveal>
  );
}

function CampaignView({ campaign }: { campaign: Campaign }) {
  const { raised, donors, pct } = useCampaignTotals(campaign);
  const fresh = useAppStore((s) => s.fresh);
  const setFresh = useAppStore((s) => s.setFresh);
  const [donateOpen, setDonateOpen] = useState(false);
  const [preset, setPreset] = useState<number | undefined>();
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const isFresh = fresh?.campaignId === campaign.id;
  const openDonate = (amount?: number) => {
    setPreset(amount);
    setDonateOpen(true);
  };
  const closeDonate = useCallback(() => setDonateOpen(false), []);

  const copyPitch = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    await navigator.clipboard?.writeText(`${campaign.whatsappPitch}\n${url}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={themeVars(campaign.theme.palette)} className="relative">
      {/* ---------- Fresh banner ---------- */}
      <AnimatePresence>
        {isFresh && fresh && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-20 overflow-hidden border-b border-white/10 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--c1)_22%,transparent),color-mix(in_oklab,var(--c2)_22%,transparent))]"
          >
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 text-sm sm:px-6">
              <p className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-[var(--c3)]" />
                <span>
                  <strong>Your campaign is live.</strong>{" "}
                  <span className="text-white/70">
                    {fresh.source === "ai"
                      ? `Written, designed & planned by Claude in ${(fresh.ms / 1000).toFixed(1)}s.`
                      : `Built from our curated templates (${fresh.reason ?? "offline mode"}).`}
                  </span>
                </span>
              </p>
              <button onClick={() => setFresh(null)} aria-label="Dismiss" className="rounded-full p-1 text-white/60 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Hero ---------- */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <HeroBackground variant={campaign.theme.heroVariant} />
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 md:grid-cols-[1.35fr_1fr] md:pb-24 md:pt-20">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-2 text-xs"
            >
              <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white/80">
                <MapPin className="h-3.5 w-3.5 text-[var(--c1)]" /> {campaign.region}
              </span>
              <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 capitalize text-white/80">
                <Heart className="h-3.5 w-3.5 text-[var(--c2)]" /> For {campaign.beneficiaryNoun}
              </span>
            </motion.div>
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10, delay: 0.1 }}
              className="mt-7 text-6xl sm:text-7xl"
              aria-hidden
            >
              {campaign.theme.emoji}
            </motion.div>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              <BlurText text={campaign.title} gradient />
            </h1>
            <Reveal delay={0.35}>
              <p className="mt-5 max-w-xl text-lg text-white/70 sm:text-xl">{campaign.tagline}</p>
            </Reveal>
            <Reveal delay={0.5} className="mt-8 flex flex-wrap gap-3">
              <ShimmerButton size="lg" onClick={() => openDonate()}>
                <Heart className="h-4 w-4" fill="currentColor" /> Donate now
              </ShimmerButton>
              <button
                onClick={copyPitch}
                className="inline-flex h-14 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-medium backdrop-blur transition hover:bg-white/10"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied!" : "Copy share pitch"}
              </button>
            </Reveal>
          </div>

          <Reveal delay={0.3}>
            <div className="glass relative mx-auto flex w-full max-w-sm flex-col items-center rounded-[2rem] p-7 shadow-[0_30px_100px_-30px_var(--glow)]">
              <ProgressRing pct={pct} size={200} stroke={14}>
                <span className="font-display text-4xl font-semibold tabular-nums">
                  <NumberTicker value={pct} format={(n) => n.toFixed(0)} suffix="%" />
                </span>
                <span className="text-xs text-white/50">funded</span>
              </ProgressRing>
              <div className="mt-6 w-full space-y-3 text-sm">
                <div className="flex items-end justify-between">
                  <span className="text-white/50">Raised</span>
                  <span className="font-display text-2xl font-semibold">
                    <NumberTicker value={raised} prefix="PKR " />
                  </span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Goal</span>
                  <span className="text-white/80">{formatPKR(campaign.goalPKR)}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Donors</span>
                  <span className="inline-flex items-center gap-1 text-white/80">
                    <Users className="h-3.5 w-3.5" /> {donors}
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Impact tiers ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="Your impact" title="Every rupee has a job." />
        <div className="grid gap-4 md:grid-cols-3">
          {campaign.impactUnits.map((u, i) => (
            <Reveal key={u.label} delay={i * 0.08}>
              <GlowCard className={cn("h-full p-6", i === 1 && "md:-translate-y-3 md:border-white/20")}>
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--c1),var(--c2))] text-ink shadow-[0_0_30px_-6px_var(--glow)]">
                    <Icon name={u.icon} className="h-6 w-6" />
                  </span>
                  {i === 1 && (
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
                      Most chosen
                    </span>
                  )}
                </div>
                <p className="mt-6 font-display text-3xl font-semibold">{formatPKR(u.amountPKR)}</p>
                <p className="mt-1 text-white/65">{u.label}</p>
                <button
                  onClick={() => openDonate(u.amountPKR)}
                  className="mt-6 w-full rounded-full border border-white/15 py-2.5 text-sm font-medium transition hover:border-transparent hover:bg-[var(--accent)] hover:text-[var(--accent-text)]"
                >
                  Give {formatPKR(u.amountPKR)}
                </button>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Story + Budget ---------- */}
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <SectionHeading eyebrow="The story" title="Why this, why now." />
          <div className="space-y-5 text-[17px] leading-relaxed text-white/70">
            {campaign.story.map((p, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <p
                  className={cn(
                    i === 0 &&
                      "first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.85] first-letter:text-[var(--c1)]",
                  )}
                >
                  {p}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
        <div>
          <SectionHeading eyebrow="Radical transparency" title="Where the money goes." />
          <Reveal>
            <div className="glass rounded-3xl p-6">
              <BudgetDonut campaign={campaign} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Share kit ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-8">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_120%_at_100%_0%,color-mix(in_oklab,var(--c2)_25%,transparent),transparent)]" />
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--c1)]">AI share kit</p>
                <p className="mt-3 text-lg text-white/85">&ldquo;{campaign.whatsappPitch}&rdquo;</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={copyPitch}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm hover:bg-white/5"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(campaign.whatsappPitch)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-semibold text-[#06290f]"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Strategy ---------- */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Behind the campaign"
          title={`The ${campaign.days.length}-day launch plan`}
          sub="Generated for the organizing team: daily tasks, the channel to use, and a measurable target to hit."
        />
        <StrategyTimeline days={campaign.days} />
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="mx-auto max-w-3xl px-4 pb-28 pt-8 sm:px-6">
        <SectionHeading eyebrow="Questions" title="Donor FAQ" />
        <div className="divide-y divide-white/10 rounded-3xl border border-white/10">
          {campaign.faqs.map((f, i) => (
            <div key={f.q}>
              <button
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-medium"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                {f.q}
                <ChevronDown className={cn("h-4 w-4 shrink-0 transition", openFaq === i && "rotate-180")} />
              </button>
              <AnimatePresence initial={false}>
                {openFaq === i && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden px-6 text-sm text-white/60"
                  >
                    <span className="block pb-5">{f.a}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Sticky mobile CTA ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/85 p-3 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--c3),var(--c1),var(--c2))]"
                style={{ width: `${Math.max(2, pct)}%` }}
              />
            </div>
            <p className="mt-1.5 truncate text-xs text-white/60">
              {formatPKR(raised, { compact: true })} of {formatPKR(campaign.goalPKR, { compact: true })}
            </p>
          </div>
          <ShimmerButton onClick={() => openDonate()}>Donate</ShimmerButton>
        </div>
      </div>

      <DonateDialog campaign={campaign} open={donateOpen} initialAmount={preset} onClose={closeDonate} />
    </div>
  );
}
