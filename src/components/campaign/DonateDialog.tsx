"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, CreditCard, LoaderCircle, Lock, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CoverArt } from "@/components/ui/CoverArt";
import { Icon } from "@/components/ui/Icon";
import { ShimmerButton } from "@/components/ui/primitives";
import { celebrate } from "@/lib/confetti";
import { mockPaymentProvider } from "@/lib/mock/payments";
import type { Campaign, Donation } from "@/lib/schema";
import { cn, formatNumber, formatPKR } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

type Step = "amount" | "pay" | "processing" | "success";

function translate(campaign: Campaign, amount: number) {
  const units = [...campaign.impactUnits].reverse();
  const u = units.find((x) => amount >= x.amountPKR) ?? campaign.impactUnits[0];
  const n = Math.floor(amount / u.amountPKR);
  if (n < 1) return { icon: u.icon, text: `${Math.round((amount / u.amountPKR) * 100)}% of ${u.label.replace(/^1\s+/, "a ")}` };
  const label = u.label.replace(/^1\s+/, "");
  return {
    icon: u.icon,
    text: n === 1 ? (/^1\s/.test(u.label) ? u.label : label.charAt(0).toLowerCase() + label.slice(1)) : `${n} × ${label}`,
  };
}

const formatCard = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();

type DialogProps = { campaign: Campaign; open: boolean; initialAmount?: number; onClose: () => void };

export function DonateDialog({ campaign, open, initialAmount, onClose }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // The panel only mounts while open, so its state resets on every open.
  return <AnimatePresence>{open && <DonatePanel campaign={campaign} initialAmount={initialAmount} onClose={onClose} />}</AnimatePresence>;
}

function DonatePanel({ campaign, initialAmount, onClose }: Omit<DialogProps, "open">) {
  const user = useAppStore((s) => s.user);
  const recordDonation = useAppStore((s) => s.recordDonation);
  const presets = [...campaign.impactUnits.map((u) => u.amountPKR), campaign.impactUnits[0].amountPKR * 4]
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => a - b);

  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState(initialAmount ?? presets[1] ?? presets[0]);
  const [name, setName] = useState(user?.name ?? "");
  const [card, setCard] = useState("4242 4242 4242 4242");
  const [error, setError] = useState<string | null>(null);
  const [donation, setDonation] = useState<Donation | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  const pay = async () => {
    setError(null);
    setStep("processing");
    const res = await mockPaymentProvider.charge({ amountPKR: amount, cardNumber: card, name });
    if (!res.ok) {
      setError(res.error);
      setStep("pay");
      return;
    }
    const d = recordDonation(campaign, amount, name.trim() || "Anonymous", res.txId);
    setDonation(d);
    setStep("success");
    celebrate(panel.current);
  };

  const t = translate(campaign, amount);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && step !== "processing" && onClose()}
    >
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={`Donate to ${campaign.title}`}
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#0f0e13] p-6 shadow-[0_0_80px_-20px_var(--glow)] sm:rounded-[2rem] sm:p-7"
      >
        {step !== "processing" && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-white/50 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <AnimatePresence mode="wait">
          {step === "amount" && (
            <motion.div key="amount" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-3 pr-8">
                <CoverArt
                  campaign={campaign}
                  size="sm"
                  animated={false}
                  medallion={false}
                  className="h-12 w-12 shrink-0 rounded-2xl border border-white/10"
                />
                <div className="min-w-0">
                  <p className="eyebrow text-[10px] text-white/40">Donate to</p>
                  <h3 className="truncate text-xl font-semibold tracking-tight">{campaign.title}</h3>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-2">
                {presets.map((p) => (
                  <button
                    key={p}
                    onClick={() => setAmount(p)}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-left transition",
                      amount === p
                        ? "border-[var(--c1)] bg-[color-mix(in_oklab,var(--c1)_14%,transparent)]"
                        : "border-white/10 hover:border-white/25",
                    )}
                  >
                    <span className="block text-lg font-semibold">{formatPKR(p)}</span>
                  </button>
                ))}
              </div>
              <label className="mt-3 flex h-12 items-center gap-2 rounded-2xl border border-white/10 px-4 focus-within:border-white/30">
                <span className="text-sm text-white/40">PKR</span>
                <input
                  inputMode="numeric"
                  value={formatNumber(amount)}
                  onChange={(e) => setAmount(Math.min(10_000_000, Number(e.target.value.replace(/\D/g, "")) || 0))}
                  className="w-full bg-transparent text-lg outline-none"
                  aria-label="Custom amount"
                />
              </label>
              <motion.div
                key={t.text}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-3 rounded-2xl bg-white/[0.04] p-4"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--c1),var(--c2))] text-ink">
                  <Icon name={t.icon} className="h-5 w-5" />
                </span>
                <p className="text-sm text-white/80">
                  Your gift covers <span className="font-semibold text-white">{t.text}</span>
                </p>
              </motion.div>
              <ShimmerButton className="mt-6 w-full" size="lg" disabled={amount < 100} onClick={() => setStep("pay")}>
                Continue <ArrowRight className="h-4 w-4" />
              </ShimmerButton>
            </motion.div>
          )}

          {(step === "pay" || step === "processing") && (
            <motion.div key="pay" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep("amount")} disabled={step === "processing"} className="text-xs text-white/50 hover:text-white">
                ← {formatPKR(amount)}
              </button>
              <h3 className="mt-2 text-xl font-semibold">Payment details</h3>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-200">
                <ShieldCheck className="h-3.5 w-3.5" /> Demo checkout, no real charge
              </p>
              <form
                className="mt-5 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void pay();
                }}
              >
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name on Wrapped (or leave blank)"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-transparent px-4 text-sm outline-none focus:border-white/30"
                />
                <label className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 px-4 focus-within:border-white/30">
                  <CreditCard className="h-4 w-4 text-white/40" />
                  <input
                    value={card}
                    onChange={(e) => setCard(formatCard(e.target.value))}
                    inputMode="numeric"
                    className="w-full bg-transparent font-mono text-sm tracking-wider outline-none"
                    aria-label="Card number"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    defaultValue="12 / 29"
                    aria-label="Expiry"
                    className="h-12 rounded-2xl border border-white/10 bg-transparent px-4 font-mono text-sm outline-none"
                  />
                  <input
                    defaultValue="123"
                    aria-label="CVC"
                    className="h-12 rounded-2xl border border-white/10 bg-transparent px-4 font-mono text-sm outline-none"
                  />
                </div>
                {error && <p className="text-sm text-rose-300">{error}</p>}
                <ShimmerButton type="submit" size="lg" className="!mt-5 w-full" disabled={step === "processing"}>
                  {step === "processing" ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" /> Securing your donation…
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" /> Donate {formatPKR(amount)}
                    </>
                  )}
                </ShimmerButton>
              </form>
            </motion.div>
          )}

          {step === "success" && donation && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-4 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[linear-gradient(135deg,var(--c3),var(--c1),var(--c2))] shadow-[0_0_60px_-4px_var(--glow)]"
              >
                <Check className="h-10 w-10 text-ink" strokeWidth={3} />
              </motion.div>
              <h3 className="mt-6 text-2xl font-semibold">
                Thank you{donation.donorName !== "Anonymous" ? `, ${donation.donorName}` : ""}!
              </h3>
              <p className="mt-2 text-white/60">
                Your <span className="text-white">{formatPKR(donation.amountPKR)}</span> is on its way to {donation.ripple.direct}{" "}
                {campaign.beneficiaryNoun} in {campaign.region}.
              </p>
              <p className="mt-2 font-mono text-[11px] text-white/30">{donation.txId}</p>
              <Link
                href={`/impact/${donation.id}`}
                className="mt-7 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white font-semibold text-ink transition hover:bg-white/90"
              >
                See your Impact Wrapped <ArrowRight className="h-4 w-4" />
              </Link>
              <button onClick={onClose} className="mt-3 text-sm text-white/50 hover:text-white">
                Back to campaign
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
