"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  CheckCheck,
  ChevronDown,
  Copy,
  Heart,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Pencil,
  Sparkles,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { UpsellSheet } from "@/components/billing/Upsell";
import { BudgetDonut } from "@/components/campaign/BudgetDonut";
import { DonateDialog } from "@/components/campaign/DonateDialog";
import { EditSheet } from "@/components/campaign/EditSheet";
import { StrategyTimeline } from "@/components/campaign/StrategyTimeline";
import { CoverArt } from "@/components/ui/CoverArt";
import { Icon } from "@/components/ui/Icon";
import { NumberTicker, Reveal } from "@/components/ui/primitives";
import type { Campaign, GenerateResponse } from "@/lib/schema";
import { themeVars } from "@/lib/themes";
import { cn, formatPKR } from "@/lib/utils";
import { useAppStore, useCampaign, useCampaignTotals, usePlan, useSponsor } from "@/store/useAppStore";

export function CampaignPage({ slug }: { slug: string }) {
  const hydrated = useAppStore((s) => s.hydrated);
  const campaign = useCampaign(slug);
  if (!campaign && !hydrated) return <div className="min-h-screen" />;
  if (!campaign) return <NotFound />;
  return <CampaignView campaign={campaign} />;
}

function NotFound() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 pt-12 text-center">
      <h1 className="t-title">This campaign isn&apos;t on this device.</h1>
      <p className="mt-3 text-[17px] text-ink-2">
        Prototype campaigns are saved in the creator&apos;s browser. You can create your own in seconds.
      </p>
      <div className="mt-7 flex items-center gap-5">
        <Link href="/create" className="btn-primary">
          Create a campaign
        </Link>
        <Link href="/explore" className="link">
          Explore ›
        </Link>
      </div>
    </div>
  );
}

function Section({ id, title, children, className }: { id?: string; title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={cn("mx-auto max-w-[1080px] scroll-mt-28 px-6 py-20 sm:py-28", className)}>
      <Reveal>
        <h2 className="t-headline mb-12 max-w-3xl">{title}</h2>
      </Reveal>
      {children}
    </section>
  );
}

/** Splits a title so its tail carries the campaign's gradient: "Warmth *for Gilgit.*" */
function splitTitle(title: string) {
  const words = title.replace(/\.$/, "").split(" ");
  const tail = words.length >= 3 ? Math.floor(words.length / 2) : words.length === 2 ? 1 : 0;
  return { head: words.slice(0, words.length - tail).join(" "), tail: words.slice(words.length - tail).join(" ") };
}

function CampaignView({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const { raised, donors, pct, monthly } = useCampaignTotals(campaign);
  const sponsor = useSponsor(campaign);
  const { plan } = usePlan();
  const isOwner = useAppStore((s) => s.campaigns.some((c) => c.id === campaign.id));
  const fresh = useAppStore((s) => s.fresh);
  const setFresh = useAppStore((s) => s.setFresh);
  const trackView = useAppStore((s) => s.trackView);
  const updateCampaign = useAppStore((s) => s.updateCampaign);
  const deleteCampaign = useAppStore((s) => s.deleteCampaign);

  const [donateOpen, setDonateOpen] = useState(false);
  const [preset, setPreset] = useState<number | undefined>();
  const [editOpen, setEditOpen] = useState(false);
  const [upsell, setUpsell] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [rewriting, setRewriting] = useState(false);
  const [previous, setPrevious] = useState<Campaign | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    trackView(campaign.id);
  }, [campaign.id, trackView]);

  const { head, tail } = splitTitle(campaign.title);
  const daysLeft = Math.max(1, campaign.days.length - Math.floor((now - new Date(campaign.createdAt).getTime()) / 86_400_000));
  const isFresh = fresh?.campaignId === campaign.id;
  const matchLeft = sponsor ? sponsor.capPKR - sponsor.usedPKR : 0;

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

  /** Pro: regenerate the copy with AI, keeping id/slug/history. Undo restores the previous version. */
  const rewrite = async () => {
    if (!plan.perks.aiRewrite) return setUpsell("Rewrite your page with AI on Society Pro.");
    setRewriting(true);
    setAiError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: campaign.prompt }),
      });
      const data = (await res.json()) as GenerateResponse & { error?: string };
      if (!res.ok || !data.campaign) throw new Error(data.error || "Rewrite failed");
      const { title, tagline, story, impactUnits, budget, faqs, whatsappPitch, theme, days, goalPKR, region, beneficiaryNoun } =
        data.campaign;
      setPrevious(campaign);
      updateCampaign(campaign.id, {
        title,
        tagline,
        story,
        impactUnits,
        budget,
        faqs,
        whatsappPitch,
        theme,
        days,
        goalPKR,
        region,
        beneficiaryNoun,
        source: data.source,
      });
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Rewrite failed. Try again.");
    } finally {
      setRewriting(false);
    }
  };

  return (
    <div style={themeVars(campaign.theme.palette)}>
      {/* ---------- Local nav (Apple product sub-navigation) ---------- */}
      <div className="sticky top-12 z-40 border-b border-line/60 bg-[var(--nav)] backdrop-blur-xl backdrop-saturate-[1.8]">
        <div className="mx-auto flex h-[52px] max-w-[1080px] items-center justify-between gap-4 px-6">
          <p className="truncate text-[19px] font-semibold tracking-[-0.01em] sm:text-[21px]">{campaign.title}</p>
          <div className="flex shrink-0 items-center gap-6">
            <nav className="hidden items-center gap-6 text-[12px] text-ink-2 md:flex" aria-label="Campaign sections">
              <a href="#impact" className="hover:text-ink">
                Impact
              </a>
              <a href="#story" className="hover:text-ink">
                Story
              </a>
              <a href="#plan" className="hover:text-ink">
                Plan
              </a>
              <a href="#faq" className="hover:text-ink">
                FAQ
              </a>
            </nav>
            <button
              onClick={() => openDonate()}
              className="rounded-full bg-blue px-3.5 py-1.5 text-[12px] text-white transition hover:bg-[var(--blue-hover)]"
            >
              Donate
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isFresh && fresh && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-mist"
          >
            <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-3 px-6 py-3 text-[14px]">
              <p className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-[#bf5af2]" aria-hidden />
                <span>
                  <strong className="font-semibold">Your campaign is live.</strong>{" "}
                  <span className="text-ink-2">
                    {fresh.source === "ai"
                      ? `Written, designed and planned by Claude in ${(fresh.ms / 1000).toFixed(1)}s.`
                      : "Built from curated templates (offline mode)."}
                  </span>
                </span>
              </p>
              <button
                onClick={() => setFresh(null)}
                aria-label="Dismiss"
                className="grid h-8 w-8 place-items-center rounded-full text-ink-2 hover:bg-raised"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Hero ---------- */}
      <section className="mx-auto max-w-[1080px] px-6 pb-10 pt-16 text-center sm:pt-24">
        <Reveal>
          <p className="t-eyebrow inline-flex items-center gap-1.5 text-ink-2">
            <MapPin className="h-4 w-4" aria-hidden /> {campaign.region} · for {campaign.beneficiaryNoun}
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="t-hero mx-auto mt-3 max-w-4xl">
            {head} {tail && <span className="text-gradient pb-[0.06em]">{tail}.</span>}
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="t-lede mx-auto mt-6 max-w-[680px]">{campaign.tagline}</p>
        </Reveal>
        <Reveal delay={0.18} className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <button className="btn-primary" onClick={() => openDonate()}>
            <Heart className="h-4 w-4" fill="currentColor" aria-hidden /> Donate
          </button>
          <button className="link text-[17px]" onClick={copyPitch}>
            {copied ? "Link copied" : "Share"} ›
          </button>
        </Reveal>
      </section>

      {/* ---------- Product image + funding ---------- */}
      <section className="mx-auto max-w-[1080px] px-6">
        <Reveal>
          <CoverArt campaign={campaign} size="lg" className="aspect-[16/10] w-full rounded-[28px] sm:aspect-[16/7]" />
        </Reveal>
        <Reveal delay={0.05} className="mt-10 grid gap-8 sm:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <p className="text-[40px] font-semibold leading-none tracking-[-0.02em] sm:text-[48px]">
              <NumberTicker value={raised} prefix="PKR " />
            </p>
            <p className="mt-2 text-[15px] text-ink-2">raised of {formatPKR(campaign.goalPKR)}</p>
          </div>
          {[
            [`${Math.round(pct)}%`, "funded"],
            [String(donors), donors === 1 ? "donor" : "donors"],
            [String(daysLeft), daysLeft === 1 ? "day left" : "days left"],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="text-[28px] font-semibold leading-none tracking-[-0.01em]">{v}</p>
              <p className="mt-2 text-[15px] text-ink-2">{l}</p>
            </div>
          ))}
        </Reveal>
        <div
          className="mt-6 h-2 overflow-hidden rounded-full bg-mist"
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Funded"
        >
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--d1),var(--d2))]"
            initial={{ width: 0 }}
            whileInView={{ width: `${Math.max(1.5, pct)}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        {raised === 0 && <p className="mt-3 text-[15px] text-ink-2">Just launched. Be the first to give.</p>}
        {monthly > 0 && <p className="mt-3 text-[15px] text-ink-2">{formatPKR(monthly)} a month in recurring gifts.</p>}

        {sponsor && matchLeft > 0 && (
          <Reveal className="mt-8 flex flex-col gap-3 rounded-[22px] bg-mist p-5 sm:flex-row sm:items-center">
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink text-[17px] font-semibold text-canvas"
              aria-hidden
            >
              {sponsor.logo}
            </span>
            <p className="flex-1 text-[17px]">
              <strong className="font-semibold">{sponsor.name}</strong> is matching every gift{" "}
              {sponsor.ratio === 1 ? "1:1" : `at ${sponsor.ratio * 100}%`}.
              <span className="text-ink-2"> {formatPKR(matchLeft)} of matching left.</span>
            </p>
            <button className="btn-primary btn-sm" onClick={() => openDonate()}>
              Double my gift
            </button>
          </Reveal>
        )}

        {/* ---------- Organizer tools (owner only) ---------- */}
        {isOwner && (
          <div className="mt-8 rounded-[22px] border border-line/70 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-[15px] font-semibold">
                  <Sparkles className="h-4 w-4 text-[#bf5af2]" aria-hidden />{" "}
                  {campaign.source === "ai" ? "Written by AI" : "Built from a template"}
                </p>
                <p className="mt-1 text-[14px] text-ink-2">
                  You&apos;re the organizer. Review names, numbers and claims before you share this page.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn-secondary btn-sm" onClick={() => setEditOpen(true)}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                </button>
                <button className="btn-secondary btn-sm" onClick={rewrite} disabled={rewriting}>
                  {rewriting ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" aria-hidden />}{" "}
                  Rewrite with AI
                  {!plan.perks.aiRewrite && (
                    <span className="ml-1 rounded bg-[#bf5af2]/15 px-1 text-[10px] font-semibold text-[#9b3fd1]">PRO</span>
                  )}
                </button>
                {previous && (
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => {
                      updateCampaign(campaign.id, previous);
                      setPrevious(null);
                    }}
                  >
                    <Undo2 className="h-3.5 w-3.5" aria-hidden /> Undo rewrite
                  </button>
                )}
                <button
                  className="btn-sm inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] text-[#d70015] hover:bg-[#d70015]/10"
                  onClick={() => {
                    if (window.confirm(`Delete “${campaign.title}”? This can't be undone.`)) {
                      deleteCampaign(campaign.id);
                      router.push("/dashboard");
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
                </button>
              </div>
            </div>
            {aiError && (
              <p role="alert" className="mt-3 text-[14px] text-[#d70015]">
                {aiError}
              </p>
            )}
          </div>
        )}
      </section>

      {/* ---------- Impact tiers ---------- */}
      <Section id="impact" title={<>Every rupee has a job.</>}>
        <div className="grid gap-5 md:grid-cols-3">
          {campaign.impactUnits.map((u, i) => (
            <Reveal key={u.label} delay={i * 0.06}>
              <div className="flex h-full flex-col rounded-[22px] bg-mist p-8">
                <Icon name={u.icon} className="h-8 w-8 text-[var(--d1)]" aria-hidden />
                <p className="mt-6 text-[32px] font-semibold tracking-[-0.01em]">{formatPKR(u.amountPKR)}</p>
                <p className="mt-1 flex-1 text-[17px] text-ink-2">{u.label}</p>
                <button className="link mt-6 text-[17px]" onClick={() => openDonate(u.amountPKR)}>
                  Give {formatPKR(u.amountPKR)} ›
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------- Story + Budget ---------- */}
      <section id="story" className="bg-mist">
        <div className="mx-auto grid max-w-[1080px] scroll-mt-28 gap-14 px-6 py-20 sm:py-28 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <Reveal>
              <h2 className="t-headline">Why this. Why now.</h2>
            </Reveal>
            <div className="mt-10 space-y-6">
              {campaign.story.map((p, i) => (
                <Reveal key={i} delay={i * 0.04}>
                  <p
                    className={cn(
                      i === 0 ? "text-[24px] font-semibold leading-snug tracking-[-0.01em]" : "text-[19px] leading-[1.5] text-ink-2",
                    )}
                  >
                    {p}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
          <div>
            <Reveal>
              <h2 className="t-headline">Where it goes.</h2>
            </Reveal>
            <Reveal className="mt-10 rounded-[22px] bg-raised p-6 sm:p-8">
              <BudgetDonut campaign={campaign} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Share ---------- */}
      <Section title={<>Ready for every class group.</>}>
        <div className="grid items-center gap-10 md:grid-cols-2">
          <Reveal>
            <p className="t-lede">A forward-ready message, written for WhatsApp. Share it in one tap.</p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(campaign.whatsappPitch)}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                <MessageCircle className="h-4 w-4" aria-hidden /> Share on WhatsApp
              </a>
              <button onClick={copyPitch} className="link text-[17px]">
                <Copy className="h-4 w-4" aria-hidden /> {copied ? "Copied" : "Copy message"}
              </button>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="mx-auto w-full max-w-sm rounded-[28px] bg-[#e5ddd5] p-4 dark:bg-[#0b141a]">
            <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-[#d9fdd3] p-1.5 text-[14px] leading-snug text-[#111b21] shadow-sm dark:bg-[#005c4b] dark:text-[#e9edef]">
              <div className="overflow-hidden rounded-xl bg-black/5">
                <CoverArt campaign={campaign} animated={false} size="sm" className="h-24 w-full" />
                <div className="p-2.5">
                  <p className="text-[13px] font-semibold">{campaign.title}</p>
                  <p className="line-clamp-1 text-[12px] opacity-70">{campaign.tagline}</p>
                  <p className="mt-0.5 text-[11px] opacity-60">impactforge.app</p>
                </div>
              </div>
              <p className="px-1.5 pb-1 pt-2">{campaign.whatsappPitch}</p>
              <p className="flex items-center justify-end gap-1 px-1.5 text-[11px] opacity-60">
                9:41 <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" aria-hidden />
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ---------- Plan ---------- */}
      <Section id="plan" className="pt-0 sm:pt-0" title={<>The {campaign.days.length}-day launch plan.</>}>
        <StrategyTimeline days={campaign.days} />
      </Section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="mx-auto max-w-[760px] scroll-mt-28 px-6 pb-32 pt-4">
        <Reveal>
          <h2 className="t-headline mb-10">Questions.</h2>
        </Reveal>
        <div className="divide-y divide-line border-y border-line">
          {campaign.faqs.map((f, i) => (
            <div key={f.q}>
              <button
                className="flex w-full items-center justify-between gap-4 py-5 text-left text-[19px] font-semibold"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                {f.q}
                <ChevronDown className={cn("h-5 w-5 shrink-0 text-ink-2 transition", openFaq === i && "rotate-180")} aria-hidden />
              </button>
              <AnimatePresence initial={false}>
                {openFaq === i && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden text-[17px] leading-relaxed text-ink-2"
                  >
                    <span className="block pb-6">{f.a}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        {!plan.perks.removeBadge && isOwner && <p className="mt-10 text-center text-[13px] text-ink-2">Made with ImpactForge</p>}
      </section>

      {/* ---------- Mobile donate bar ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line/60 bg-[var(--nav)] px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] text-ink-2">
              <span className="font-semibold text-ink">{formatPKR(raised, { compact: true })}</span> of{" "}
              {formatPKR(campaign.goalPKR, { compact: true })}
            </p>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line/60">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--d1),var(--d2))]"
                style={{ width: `${Math.max(2, pct)}%` }}
              />
            </div>
          </div>
          <button className="btn-primary min-h-11" onClick={() => openDonate()}>
            Donate
          </button>
        </div>
      </div>

      <DonateDialog campaign={campaign} open={donateOpen} initialAmount={preset} onClose={closeDonate} />
      <EditSheet campaign={campaign} open={editOpen} onClose={() => setEditOpen(false)} />
      <UpsellSheet open={!!upsell} reason={upsell ?? ""} onClose={() => setUpsell(null)} />
    </div>
  );
}
