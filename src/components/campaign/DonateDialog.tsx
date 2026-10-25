"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronLeft, CreditCard, LoaderCircle, Lock, Repeat, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Segmented, Sheet, Toggle } from "@/components/billing/Sheet";
import { CoverArt } from "@/components/ui/CoverArt";
import { Icon } from "@/components/ui/Icon";
import { celebrate } from "@/lib/confetti";
import { computeCheckout, DEFAULT_TIP, matchFor, TIP_OPTIONS } from "@/lib/monetization";
import { checkoutDonation, paymentsMode } from "@/lib/payments/client";
import { luhn } from "@/lib/payments/mock";
import type { Campaign, Donation } from "@/lib/schema";
import { cn, formatNumber, formatPKR, unitPhrase } from "@/lib/utils";
import { useAppStore, usePlan, useSponsor } from "@/store/useAppStore";

type Step = "amount" | "review" | "processing" | "success";

const formatCard = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 py-1.5 text-[15px]",
        strong && "pt-3 text-[17px] font-semibold",
        muted && "text-ink-2",
      )}
    >
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

type Props = { campaign: Campaign; open: boolean; initialAmount?: number; onClose: () => void };

export function DonateDialog({ campaign, open, initialAmount, onClose }: Props) {
  return (
    <Sheet open={open} onClose={onClose} label={`Donate to ${campaign.title}`}>
      {open && <DonateFlow campaign={campaign} initialAmount={initialAmount} onClose={onClose} />}
    </Sheet>
  );
}

function DonateFlow({ campaign, initialAmount, onClose }: Omit<Props, "open">) {
  const user = useAppStore((s) => s.user);
  const recordDonation = useAppStore((s) => s.recordDonation);
  const sponsor = useSponsor(campaign);
  const { plan } = usePlan();
  const ownCampaign = useAppStore((s) => s.campaigns.some((c) => c.id === campaign.id));
  const monthlyAvailable = campaign.source === "seed" || !ownCampaign || plan.perks.recurring;

  const presets = useMemo(
    () => [...new Set([...campaign.impactUnits.map((u) => u.amountPKR), campaign.impactUnits[0].amountPKR * 4])].sort((a, b) => a - b),
    [campaign],
  );

  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState(initialAmount ?? presets[1] ?? presets[0]);
  const [monthly, setMonthly] = useState(false);
  const [tipRate, setTipRate] = useState<number>(DEFAULT_TIP);
  const [coverFees, setCoverFees] = useState(true);
  const [name, setName] = useState(user?.name && user.name !== "Guest" ? user.name : "");
  const [card, setCard] = useState("4242 4242 4242 4242");
  const [mode, setMode] = useState<"stripe" | "mock">("mock");
  const [error, setError] = useState<string | null>(null);
  const [donation, setDonation] = useState<Donation | null>(null);

  useEffect(() => {
    void paymentsMode().then(setMode);
  }, []);

  const b = computeCheckout({ amountPKR: amount, tipRate, coverFees });
  const match = matchFor(sponsor, amount);
  const u = campaign.impactUnits[0];
  const units = Math.floor((amount + match) / u.amountPKR);
  const impactLine =
    units >= 1 ? unitPhrase(units, u.label) : `${Math.round(((amount + match) / u.amountPKR) * 100)}% of ${u.label.replace(/^1\s+/, "a ")}`;

  const pay = async () => {
    setError(null);
    if (mode === "mock" && !luhn(card)) {
      setError("That card number isn't valid. In demo mode, use 4242 4242 4242 4242.");
      return;
    }
    setStep("processing");
    const donorName = name.trim() || "Anonymous";
    const extras = {
      tipPKR: b.tipPKR,
      feeCoveredPKR: b.feeCoveredPKR,
      matchedPKR: match,
      sponsorName: match ? sponsor?.name : undefined,
      recurring: monthly,
      totalPKR: b.totalPKR,
    };
    try {
      const [r] = await Promise.all([
        checkoutDonation(
          {
            campaignId: campaign.id,
            campaignSlug: campaign.slug,
            campaignTitle: campaign.title.slice(0, 80),
            amountPKR: amount,
            tipRate,
            coverFees,
            recurring: monthly,
          },
          {
            campaignId: campaign.id,
            amountPKR: amount,
            donorName,
            ...extras,
            recurring: monthly,
            totalPKR: b.totalPKR,
            tipPKR: b.tipPKR,
            feeCoveredPKR: b.feeCoveredPKR,
            matchedPKR: match,
          },
        ),
        new Promise((r) => setTimeout(r, 1200)),
      ]);
      if (r.redirected) return;
      const d = recordDonation(campaign, amount, donorName, r.txId, extras);
      setDonation(d);
      setStep("success");
      celebrate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment didn't go through. Please try again.");
      setStep("review");
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {step === "amount" && (
        <motion.div key="amount" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
          <div className="flex items-center gap-3 pr-10">
            <CoverArt campaign={campaign} size="sm" animated={false} medallion={false} className="h-12 w-12 shrink-0 rounded-xl" />
            <div className="min-w-0">
              <p className="text-[13px] text-ink-2">Donate to</p>
              <h2 className="truncate text-[19px] font-semibold tracking-[-0.01em]">{campaign.title}</h2>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Amount">
            {presets.map((p) => (
              <button
                key={p}
                role="radio"
                aria-checked={amount === p}
                onClick={() => setAmount(p)}
                className={cn(
                  "rounded-2xl border-2 px-4 py-3.5 text-left text-[17px] font-semibold transition",
                  amount === p ? "border-blue bg-blue/[0.06]" : "border-transparent bg-mist hover:border-line",
                )}
              >
                {formatPKR(p)}
              </button>
            ))}
          </div>
          <label className="mt-2 flex h-14 items-center gap-2 rounded-2xl bg-mist px-4 focus-within:ring-4 focus-within:ring-blue/15">
            <span className="shrink-0 text-[15px] text-ink-2">Other</span>
            <input
              inputMode="numeric"
              value={formatNumber(amount)}
              onChange={(e) => setAmount(Math.min(10_000_000, Number(e.target.value.replace(/\D/g, "")) || 0))}
              className="w-full bg-transparent text-right text-[17px] font-semibold outline-none"
              aria-label="Custom amount in PKR"
            />
          </label>

          <div className="mt-4 rounded-2xl bg-mist p-4">
            <p className="flex items-center gap-2 text-[15px]">
              <Icon name={u.icon} className="h-5 w-5 shrink-0 text-[var(--d1)]" />
              <span>
                Your gift{match ? " + match" : ""} covers <strong className="font-semibold">{impactLine}</strong>
              </span>
            </p>
            {sponsor && match > 0 && (
              <p className="mt-2 flex items-center gap-2 text-[13px] text-ink-2">
                <Sparkles className="h-4 w-4 shrink-0 text-[#bf5af2]" />
                {sponsor.name} adds {formatPKR(match)} ({sponsor.ratio === 1 ? "1:1 match" : `${sponsor.ratio * 100}% match`}).
              </p>
            )}
          </div>

          {monthlyAvailable && (
            <div className="mt-2 border-b border-line/60">
              <Toggle checked={monthly} onChange={setMonthly} label="Give monthly" hint="Cancel anytime from your dashboard." />
            </div>
          )}

          <button className="btn-primary mt-6 w-full" disabled={amount < 100} onClick={() => setStep("review")}>
            Continue
          </button>
          {amount < 100 && <p className="mt-2 text-center text-[13px] text-ink-2">The minimum gift is PKR 100.</p>}
        </motion.div>
      )}

      {(step === "review" || step === "processing") && (
        <motion.div key="review" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
          <button onClick={() => setStep("amount")} disabled={step === "processing"} className="link -ml-1 text-[15px] disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" /> Amount
          </button>
          <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.01em]">Review your gift</h2>

          <div className="mt-5">
            <p className="text-[15px]">Add a tip for ImpactForge</p>
            <p className="text-[13px] text-ink-2">There&apos;s no platform fee. Tips keep it free for students.</p>
            <Segmented
              className="mt-3"
              label="Tip"
              value={tipRate}
              onChange={setTipRate}
              options={TIP_OPTIONS.map((t) => ({ value: t, label: t === 0 ? "None" : `${t * 100}%` }))}
            />
          </div>
          <div className="mt-2 border-b border-line/60">
            <Toggle
              checked={coverFees}
              onChange={setCoverFees}
              label="Cover processing fees"
              hint={`So 100% of your ${formatPKR(amount)} reaches the cause.`}
            />
          </div>

          <div className="mt-4 rounded-2xl bg-mist px-4 py-3">
            <Row label="Donation" value={formatPKR(b.donationPKR)} />
            {match > 0 && <Row label={`${sponsor?.name} match`} value={`+ ${formatPKR(match)}`} muted />}
            {b.tipPKR > 0 && <Row label="Tip to ImpactForge" value={formatPKR(b.tipPKR)} />}
            {b.feeCoveredPKR > 0 && <Row label="Processing fee" value={formatPKR(b.feeCoveredPKR)} />}
            <div className="mt-1 border-t border-line" />
            <Row label={monthly ? "Total per month" : "Total"} value={formatPKR(b.totalPKR)} strong />
            {!coverFees && (
              <p className="pb-1 text-[13px] text-ink-2">The cause receives about {formatPKR(b.netToCausePKR)} after processing fees.</p>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name on receipt (optional)"
              className="field"
              autoComplete="name"
            />
            {mode === "mock" ? (
              <>
                <label className="field flex items-center gap-3">
                  <CreditCard className="h-4 w-4 shrink-0 text-ink-2" aria-hidden />
                  <input
                    value={card}
                    onChange={(e) => setCard(formatCard(e.target.value))}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    className="w-full bg-transparent font-mono text-[15px] tracking-wider outline-none"
                    aria-label="Card number"
                  />
                </label>
                <p className="flex items-center gap-1.5 text-[13px] text-ink-2">
                  <ShieldCheck className="h-4 w-4 text-[#34c759]" /> Demo mode. No real charge is made.
                </p>
              </>
            ) : (
              <p className="flex items-center gap-1.5 text-[13px] text-ink-2">
                <Lock className="h-4 w-4" /> You&apos;ll enter card details on a secure Stripe page.
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-3 text-[14px] text-[#d70015]">
              {error}
            </p>
          )}

          <button className="btn-primary mt-6 w-full" onClick={pay} disabled={step === "processing"}>
            {step === "processing" ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" /> Processing…
              </>
            ) : (
              <>
                {monthly && <Repeat className="h-4 w-4" />} Pay {formatPKR(b.totalPKR)}
                {monthly ? " monthly" : ""}
              </>
            )}
          </button>
        </motion.div>
      )}

      {step === "success" && donation && (
        <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="pt-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
            className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#34c759] text-white"
          >
            <Check className="h-8 w-8" strokeWidth={3} />
          </motion.div>
          <h2 className="mt-5 text-[28px] font-semibold tracking-[-0.01em]">
            Thank you{donation.donorName !== "Anonymous" ? `, ${donation.donorName}` : ""}.
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-[17px] text-ink-2">
            {formatPKR(donation.amountPKR)}
            {donation.matchedPKR
              ? `, doubled to ${formatPKR(donation.amountPKR + donation.matchedPKR)} by ${donation.sponsorName},`
              : ""}{" "}
            is on its way to {donation.ripple.direct} {campaign.beneficiaryNoun} in {campaign.region}.
          </p>
          {donation.recurring && <p className="mt-2 text-[13px] text-ink-2">Your monthly gift renews automatically.</p>}
          <Link href={`/impact/${donation.id}`} className="btn-primary mt-7 w-full">
            See your Impact Wrapped
          </Link>
          <div className="mt-4 flex items-center justify-center gap-6 text-[15px]">
            <Link href={`/receipt/${donation.id}`} className="link">
              View receipt ›
            </Link>
            <button onClick={onClose} className="link">
              Done
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
