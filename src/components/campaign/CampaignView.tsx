"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { BadgeCheck, CalendarDays, Check, CheckCheck, ChevronDown, Copy, Heart, MapPin, MessageCircle, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useState, type MouseEvent, type ReactNode } from "react";
import { BudgetDonut } from "@/components/campaign/BudgetDonut";
import { DonateDialog } from "@/components/campaign/DonateDialog";
import { StrategyTimeline } from "@/components/campaign/StrategyTimeline";
import { HeroBackground } from "@/components/ui/backgrounds";
import { CoverArt } from "@/components/ui/CoverArt";
import { Icon } from "@/components/ui/Icon";
import { BlurText, NumberTicker, Reveal, ShimmerButton } from "@/components/ui/primitives";
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
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4 pt-20 text-center">
      <span className="text-5xl">🔭</span>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight">
        Not on <span className="serif text-ember">this device.</span>
      </h1>
      <p className="mt-3 text-sm text-white/55">
        Prototype campaigns live in the creator&apos;s browser (no database yet). Forge your own in seconds.
      </p>
      <Link href="/create" className="mt-7 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#09080b]">
        Create a campaign
      </Link>
    </div>
  );
}

function SectionHeading({ eyebrow, title, sub, center }: { eyebrow: string; title: ReactNode; sub?: string; center?: boolean }) {
  return (
    <Reveal className={cn("mb-10", center && "text-center")}>
      <p className="eyebrow text-[var(--c1)]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
      {sub && <p className={cn("mt-3 max-w-xl text-[15px] text-white/50", center && "mx-auto")}>{sub}</p>}
    </Reveal>
  );
}

/** Splits a title so the tail renders in the editorial serif: "Warmth for *Gilgit*". */
function splitTitle(title: string) {
  const words = title.split(" ");
  const tail = words.length >= 3 ? Math.floor(words.length / 2) : words.length === 2 ? 1 : 0;
  return { head: words.slice(0, words.length - tail).join(" "), tail: words.slice(words.length - tail).join(" ") };
}

function TiltPoster({ campaign }: { campaign: Campaign }) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 150, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 150, damping: 18 });
  const glare = useTransform(mx, (g) => `radial-gradient(circle at ${g * 100}% 20%, rgba(255,255,255,0.6), transparent 50%)`);
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const direct = campaign.budget[0];
  return (
    <div className="relative [perspective:1200px]" onMouseMove={onMove} onMouseLeave={() => (mx.set(0.5), my.set(0.5))}>
      <motion.div style={{ rotateX: rx, rotateY: ry }} className="relative [transform-style:preserve-3d]">
        <div className="absolute -inset-6 rounded-[3rem] bg-[var(--glow)] opacity-60 blur-3xl" />
        <div className="relative overflow-hidden rounded-[2rem] border border-white/15 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]">
          <CoverArt campaign={campaign} size="lg" className="aspect-[4/4.6] w-full" />
          <motion.div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light" style={{ background: glare }} />
          <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl border border-white/15 bg-black/45 p-3 backdrop-blur-xl [transform:translateZ(40px)]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[color-mix(in_oklab,var(--c2)_75%,black)]">
              <Icon name={campaign.impactUnits[0].icon} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{formatPKR(campaign.impactUnits[0].amountPKR)}</p>
              <p className="truncate text-xs text-white/65">= {campaign.impactUnits[0].label}</p>
            </div>
          </div>
        </div>
        <div className="absolute -left-5 top-10 hidden items-center gap-2 rounded-full border border-white/15 bg-[#111015]/85 px-3.5 py-2 text-xs shadow-xl backdrop-blur-xl [transform:translateZ(60px)] sm:flex">
          <BadgeCheck className="h-4 w-4 text-emerald-400" /> {direct.percent}% to {direct.category.toLowerCase()}
        </div>
        <div className="absolute -right-4 top-1/3 hidden items-center gap-2 rounded-full border border-white/15 bg-[#111015]/85 px-3.5 py-2 text-xs shadow-xl backdrop-blur-xl [transform:translateZ(80px)] sm:flex">
          <CalendarDays className="h-4 w-4 text-[var(--c1)]" /> {campaign.days.length}-day plan
        </div>
      </motion.div>
    </div>
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
  const [now] = useState(() => Date.now());

  const isFresh = fresh?.campaignId === campaign.id;
  const { head, tail } = splitTitle(campaign.title);
  const daysLeft = Math.max(1, campaign.days.length - Math.floor((now - new Date(campaign.createdAt).getTime()) / 86_400_000));

  const openDonate = (amount?: number) => {
    setPreset(amount);
    setDonateOpen(true);
  };
  const closeDonate = useCallback(() => setDonateOpen(false), []);

  const copyPitch = async () => {
    await navigator.clipboard?.writeText(`${campaign.whatsappPitch}\n${window.location.href}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={themeVars(campaign.theme.palette)} className="relative">
      {/* ---------- Fresh toast ---------- */}
      <AnimatePresence>
        {isFresh && fresh && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.6, type: "spring", damping: 20 }}
            className="fixed inset-x-0 top-20 z-40 flex justify-center px-4"
          >
            <div className="flex max-w-xl items-center gap-3 rounded-full border border-white/15 bg-[#111015]/90 py-2 pl-2 pr-3 text-sm shadow-[0_20px_60px_-15px_var(--glow)] backdrop-blur-xl">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--c3),var(--c1),var(--c2))] text-[var(--accent-text)]">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 truncate">
                <strong className="font-semibold">Your campaign is live.</strong>{" "}
                <span className="text-white/60">
                  {fresh.source === "ai"
                    ? `Written, designed & planned by Claude in ${(fresh.ms / 1000).toFixed(1)}s`
                    : `Built offline from curated templates`}
                </span>
              </span>
              <button onClick={() => setFresh(null)} aria-label="Dismiss" className="rounded-full p-1 text-white/50 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Hero ---------- */}
      <section className="relative isolate overflow-hidden pt-28 sm:pt-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-[-10%] top-[-20%] h-[50rem] w-[50rem] rounded-full bg-[var(--c1)] opacity-[0.13] blur-[140px]" />
          <div className="absolute right-[-15%] top-[10%] h-[45rem] w-[45rem] rounded-full bg-[var(--c2)] opacity-[0.16] blur-[140px]" />
          <div className="opacity-50">
            <HeroBackground variant={campaign.theme.heroVariant} />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#09080b]" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 sm:px-6 md:grid-cols-[1.2fr_1fr] md:pb-28">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-2 text-xs"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-white/75 backdrop-blur">
                <MapPin className="h-3.5 w-3.5 text-[var(--c1)]" /> {campaign.region}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 capitalize text-white/75 backdrop-blur">
                <Heart className="h-3.5 w-3.5 text-[var(--c2)]" /> For {campaign.beneficiaryNoun}
              </span>
              {campaign.source === "ai" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--c1)]/40 bg-[var(--c1)]/10 px-3 py-1.5 text-white/85">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--c3)]" /> AI generated
                </span>
              )}
            </motion.div>

            <h1 className="mt-7 text-[3rem] font-semibold leading-[0.95] tracking-[-0.04em] sm:text-7xl lg:text-[5.5rem]">
              <BlurText text={head} wordClassName="text-silver pb-[0.06em]" />
              {tail && (
                <>
                  {" "}
                  <BlurText text={tail} delay={0.2} gradient className="serif tracking-[-0.02em]" />
                </>
              )}
            </h1>
            <Reveal delay={0.35}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65">{campaign.tagline}</p>
            </Reveal>

            {/* funding module */}
            <Reveal delay={0.45} className="mt-9 max-w-xl">
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                <div>
                  <p className="text-4xl font-semibold tracking-tight sm:text-5xl">
                    <NumberTicker value={raised} prefix="PKR " />
                  </p>
                  <p className="mt-1 text-sm text-white/45">raised of {formatPKR(campaign.goalPKR)} goal</p>
                </div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-xl font-semibold">{donors}</p>
                    <p className="text-white/45">donors</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold">{daysLeft}</p>
                    <p className="text-white/45">{daysLeft === 1 ? "day left" : "days left"}</p>
                  </div>
                </div>
              </div>
              <div className="relative mt-5 h-2.5 overflow-hidden rounded-full bg-white/[0.08]">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,var(--c3),var(--c1),var(--c2))] shadow-[0_0_20px_var(--glow)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(1.5, pct)}%` }}
                  transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                />
                {raised === 0 && (
                  <span className="animate-shimmer absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                )}
              </div>
              {raised === 0 && (
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-[var(--c3)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-[var(--c3)]" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--c3)]" />
                  </span>
                  Just launched. Be the very first donor.
                </p>
              )}
            </Reveal>

            <Reveal delay={0.55} className="mt-9 flex flex-wrap gap-3">
              <ShimmerButton size="lg" onClick={() => openDonate()}>
                <Heart className="h-4 w-4" fill="currentColor" /> Donate now
              </ShimmerButton>
              <button
                onClick={copyPitch}
                className="inline-flex h-14 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-medium backdrop-blur transition hover:bg-white/10"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied!" : "Share"}
              </button>
            </Reveal>
          </div>

          <Reveal delay={0.25} className="mx-auto w-full max-w-md">
            <TiltPoster campaign={campaign} />
          </Reveal>
        </div>
      </section>

      {/* ---------- Impact tiers ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
        <SectionHeading
          center
          eyebrow="Your impact"
          title={
            <>
              Every rupee <span className="serif text-gradient">has a job.</span>
            </>
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {campaign.impactUnits.map((u, i) => {
            const featured = i === 1;
            return (
              <Reveal key={u.label} delay={i * 0.08}>
                <div className={cn("relative h-full rounded-[1.75rem] p-px", featured ? "border-spin" : "bg-white/[0.08]")}>
                  <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(1.75rem-1px)] bg-[#0f0e13] p-7">
                    {featured && (
                      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,color-mix(in_oklab,var(--c1)_18%,transparent),transparent)]" />
                    )}
                    <div className="relative flex items-start justify-between">
                      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--c3),var(--c1),var(--c2))] text-[var(--accent-text)] shadow-[0_10px_30px_-8px_var(--glow)]">
                        <Icon name={u.icon} className="h-6 w-6" />
                      </span>
                      {featured && (
                        <span className="rounded-full bg-white px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-[#09080b]">
                          Most chosen
                        </span>
                      )}
                    </div>
                    <p className="relative mt-8 text-4xl font-semibold tracking-tight">{formatPKR(u.amountPKR)}</p>
                    <p className="relative mt-2 text-white/60">{u.label}</p>
                    <button
                      onClick={() => openDonate(u.amountPKR)}
                      className={cn(
                        "relative mt-8 w-full rounded-full py-3 text-sm font-semibold transition",
                        featured
                          ? "bg-[linear-gradient(110deg,var(--c3),var(--c1)_50%,var(--c2))] text-[var(--accent-text)] hover:brightness-110"
                          : "border border-white/15 hover:border-white/30 hover:bg-white/[0.05]",
                      )}
                    >
                      Give {formatPKR(u.amountPKR)}
                    </button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------- Story + Budget ---------- */}
      <section className="mx-auto grid max-w-6xl gap-14 px-5 py-20 sm:px-6 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <SectionHeading
            eyebrow="The story"
            title={
              <>
                Why this, <span className="serif text-gradient">why now.</span>
              </>
            }
          />
          <Reveal>
            <p className="serif text-[1.9rem] leading-[1.25] text-white/90 sm:text-[2.2rem]">&ldquo;{campaign.story[0]}&rdquo;</p>
          </Reveal>
          <div className="mt-8 space-y-5 border-l border-white/10 pl-6 text-[16px] leading-relaxed text-white/60">
            {campaign.story.slice(1).map((p, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
        </div>
        <div>
          <SectionHeading
            eyebrow="Radical transparency"
            title={
              <>
                Where the <span className="serif text-gradient">money goes.</span>
              </>
            }
          />
          <Reveal>
            <div className="card p-6 sm:p-8">
              <BudgetDonut campaign={campaign} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Share kit ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
        <Reveal>
          <div className="card relative grid items-center gap-10 overflow-hidden p-7 sm:p-10 md:grid-cols-[1fr_1fr]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_100%_50%,color-mix(in_oklab,var(--c2)_16%,transparent),transparent)]" />
            <div className="relative">
              <p className="eyebrow text-[var(--c1)]">AI share kit</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready for <span className="serif text-gradient">every class group.</span>
              </h3>
              <p className="mt-3 max-w-sm text-white/50">A forward-ready pitch, written for WhatsApp. One tap to share.</p>
              <div className="mt-7 flex flex-wrap gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(campaign.whatsappPitch)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-semibold text-[#052e14] transition hover:brightness-110"
                >
                  <MessageCircle className="h-4 w-4" /> Share on WhatsApp
                </a>
                <button
                  onClick={copyPitch}
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-sm hover:bg-white/5"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            {/* WhatsApp-style preview */}
            <div className="relative mx-auto w-full max-w-sm rounded-[1.75rem] bg-[#0b141a] p-4 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
              <div className="mb-3 flex items-center gap-2 border-b border-white/5 pb-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#25D366]/20 text-xs">🎓</span>
                <div>
                  <p className="text-[13px] font-medium">SEECS Batch 2027</p>
                  <p className="text-[10px] text-white/40">Hamza, Ayesha, Bilal, You</p>
                </div>
              </div>
              <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-[#005c4b] p-1.5 text-[13px] leading-snug">
                <div className="overflow-hidden rounded-xl bg-black/20">
                  <CoverArt campaign={campaign} animated={false} size="sm" className="h-24 w-full" />
                  <div className="p-2.5">
                    <p className="text-[12px] font-semibold">{campaign.title}</p>
                    <p className="line-clamp-1 text-[11px] text-white/60">{campaign.tagline}</p>
                    <p className="mt-0.5 text-[10px] text-white/40">impactforge.app</p>
                  </div>
                </div>
                <p className="px-1.5 pb-1 pt-2">{campaign.whatsappPitch}</p>
                <p className="flex items-center justify-end gap-1 px-1.5 text-[10px] text-white/50">
                  9:41 <CheckCheck className="h-3 w-3 text-sky-400" />
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Strategy ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Behind the campaign"
          title={
            <>
              The {campaign.days.length}-day <span className="serif text-gradient">launch plan.</span>
            </>
          }
          sub="Generated for the organizing team: what to do each day, where to do it, and the number to hit."
        />
        <StrategyTimeline days={campaign.days} />
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="mx-auto max-w-3xl px-5 pb-32 pt-8 sm:px-6">
        <SectionHeading
          eyebrow="Questions"
          title={
            <>
              Before you <span className="serif text-gradient">give.</span>
            </>
          }
        />
        <div className="space-y-2">
          {campaign.faqs.map((f, i) => (
            <div key={f.q} className={cn("card overflow-hidden transition", openFaq === i && "border-white/15")}>
              <button
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-medium"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                {f.q}
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 transition",
                    openFaq === i && "rotate-180 bg-white/10",
                  )}
                >
                  <ChevronDown className="h-4 w-4" />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {openFaq === i && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden px-6 text-[15px] leading-relaxed text-white/55"
                  >
                    <span className="block pb-6">{f.a}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Sticky mobile CTA ---------- */}
      <div className="fixed inset-x-3 bottom-3 z-40 rounded-full border border-white/10 bg-[#111015]/90 p-2 pl-5 shadow-2xl backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-white/60">
              <span className="font-semibold text-white">{formatPKR(raised, { compact: true })}</span> of{" "}
              {formatPKR(campaign.goalPKR, { compact: true })}
            </p>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--c3),var(--c1),var(--c2))]"
                style={{ width: `${Math.max(2, pct)}%` }}
              />
            </div>
          </div>
          <ShimmerButton onClick={() => openDonate()}>
            <Heart className="h-4 w-4" fill="currentColor" /> Donate
          </ShimmerButton>
        </div>
      </div>

      <DonateDialog campaign={campaign} open={donateOpen} initialAmount={preset} onClose={closeDonate} />
    </div>
  );
}
