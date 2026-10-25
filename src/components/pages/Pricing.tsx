"use client";

import { Check, LoaderCircle, Minus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Segmented, Toggle } from "@/components/billing/Sheet";
import { Reveal } from "@/components/ui/primitives";
import { celebrate } from "@/lib/confetti";
import { computeCheckout, PLANS, PROCESSING, SPONSOR_LISTING_FEE, TIP_OPTIONS, type BillingCycle } from "@/lib/monetization";
import { checkoutSubscription } from "@/lib/payments/client";
import { cn, formatNumber, formatPKR } from "@/lib/utils";
import { useAppStore, usePlan } from "@/store/useAppStore";

export function Pricing() {
  const [cycle, setCycle] = useState<BillingCycle>("yearly");
  const { plan: current } = usePlan();
  const subscribe = useAppStore((s) => s.subscribe);
  const cancel = useAppStore((s) => s.cancelSubscription);
  const user = useAppStore((s) => s.user);
  const loginAsGuest = useAppStore((s) => s.loginAsGuest);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const upgrade = async () => {
    if (!user) loginAsGuest();
    setBusy(true);
    setMsg(null);
    try {
      const r = await checkoutSubscription(cycle);
      if (r.redirected) return;
      subscribe("pro", cycle, r.txId);
      setMsg("You're on Society Pro. Demo mode: no real charge was made.");
      celebrate();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Upgrade failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pt-28 sm:pt-36">
      <section className="mx-auto max-w-[1080px] px-6 text-center">
        <p className="t-eyebrow text-ink-2">Pricing</p>
        <h1 className="t-hero mt-2">Free to raise. Pro to grow.</h1>
        <p className="t-lede mx-auto mt-5 max-w-[640px]">
          Students never pay to raise money. Societies that run drives every semester can go further with Pro.
        </p>
        <Segmented
          className="mx-auto mt-10 max-w-xs"
          label="Billing period"
          value={cycle}
          onChange={setCycle}
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "yearly", label: "Yearly · save 17%" },
          ]}
        />
      </section>

      <section className="mx-auto mt-12 grid max-w-[1080px] gap-5 px-6 md:grid-cols-3">
        {PLANS.map((p) => {
          const isCurrent = current.id === p.id;
          const price = p.pricePKR ? (cycle === "monthly" ? p.pricePKR.monthly : p.pricePKR.yearly) : null;
          return (
            <div
              key={p.id}
              id={p.id === "campus" ? "campus" : undefined}
              className={cn("relative flex scroll-mt-28 flex-col rounded-[28px] p-8", p.highlight ? "bg-ink text-canvas" : "bg-mist")}
            >
              {p.highlight && (
                <span className="absolute right-6 top-6 rounded-full bg-blue px-2.5 py-1 text-[12px] font-semibold text-white">
                  Most popular
                </span>
              )}
              <h2 className="text-[28px] font-semibold tracking-[-0.01em]">{p.name}</h2>
              <p className={cn("mt-1 text-[15px]", p.highlight ? "opacity-70" : "text-ink-2")}>{p.tagline}</p>
              <p className="mt-6 text-[40px] font-semibold leading-none tracking-[-0.02em]">
                {price === null ? "Custom" : price === 0 ? "Free" : formatPKR(price)}
              </p>
              <p className={cn("mt-2 h-5 text-[14px]", p.highlight ? "opacity-70" : "text-ink-2")}>
                {price
                  ? `per ${cycle === "monthly" ? "month" : "year"} · ${formatPKR(cycle === "yearly" ? Math.round(price / 12) : price)}/mo`
                  : price === 0
                    ? "forever"
                    : "for universities and CSR teams"}
              </p>
              <ul className="mt-7 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-[15px]">
                    <Check
                      className={cn("mt-0.5 h-4 w-4 shrink-0", p.highlight ? "text-[#2997ff]" : "text-blue")}
                      strokeWidth={3}
                      aria-hidden
                    />{" "}
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {p.id === "free" &&
                  (isCurrent ? (
                    <p className="text-center text-[15px] text-ink-2">Your current plan</p>
                  ) : (
                    <button className="btn-secondary w-full" onClick={cancel}>
                      Switch to Starter
                    </button>
                  ))}
                {p.id === "pro" &&
                  (isCurrent ? (
                    <p className="text-center text-[15px] opacity-80">Your current plan</p>
                  ) : (
                    <button className="btn-primary w-full" onClick={upgrade} disabled={busy}>
                      {busy && <LoaderCircle className="h-4 w-4 animate-spin" />} Upgrade to Pro
                    </button>
                  ))}
                {p.id === "campus" && (
                  <a className="btn-secondary w-full" href="mailto:partners@impactforge.app?subject=ImpactForge%20Campus">
                    Contact us
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </section>
      {msg && (
        <p role="status" className="mx-auto mt-6 max-w-[1080px] px-6 text-center text-[15px] text-ink-2">
          {msg}
        </p>
      )}

      <FeeCalculator />
      <Comparison />

      <section className="mx-auto max-w-[760px] px-6 pb-28">
        <h2 className="t-headline mb-10">Fees, plainly.</h2>
        <dl className="divide-y divide-line border-y border-line">
          {[
            [
              "Does ImpactForge take a cut of donations?",
              "No. There's no platform fee. Donors can add an optional tip, and that's how the platform is funded alongside Pro plans and sponsor listings.",
            ],
            [
              "What does the payment processor charge?",
              `About ${(PROCESSING.rate * 100).toFixed(1)}% + PKR ${PROCESSING.fixedPKR} per transaction. Donors can choose to cover it so the cause receives 100% of the gift.`,
            ],
            [
              "How does sponsor matching work?",
              `Companies pledge a matching budget through the Campus marketplace. Matched funds go to the cause; the sponsor pays a ${SPONSOR_LISTING_FEE * 100}% listing fee.`,
            ],
            ["Can I cancel Pro?", "Yes, anytime from your dashboard. Your campaigns stay live on Starter."],
          ].map(([q, a]) => (
            <div key={q} className="py-6">
              <dt className="text-[19px] font-semibold">{q}</dt>
              <dd className="mt-2 text-[17px] leading-relaxed text-ink-2">{a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

/** Transparent, interactive breakdown of one gift. */
function FeeCalculator() {
  const [amount, setAmount] = useState(5000);
  const [tipRate, setTipRate] = useState<number>(0.1);
  const [cover, setCover] = useState(true);
  const b = computeCheckout({ amountPKR: amount, tipRate, coverFees: cover });
  const rows = [
    { label: "The cause receives", value: b.netToCausePKR, tone: "bg-[#34c759]" },
    { label: "Payment processor", value: b.feePKR, tone: "bg-ink-2" },
    { label: "ImpactForge (your tip)", value: b.tipPKR, tone: "bg-blue" },
  ];
  const total = b.totalPKR || 1;
  return (
    <section className="mx-auto max-w-[1080px] px-6 py-24 sm:py-32">
      <Reveal>
        <h2 className="t-headline max-w-2xl">Where every rupee goes.</h2>
        <p className="t-lede mt-5 max-w-xl">Move the slider. This is the exact math the checkout uses.</p>
      </Reveal>
      <div className="mt-12 grid gap-8 rounded-[28px] bg-mist p-6 sm:p-10 md:grid-cols-2">
        <div className="space-y-6">
          <label className="block">
            <span className="flex items-baseline justify-between text-[15px]">
              <span>Gift</span>
              <span className="text-[24px] font-semibold tabular-nums">{formatPKR(amount)}</span>
            </span>
            <input
              type="range"
              min={500}
              max={50000}
              step={500}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-3 w-full accent-[var(--blue)]"
              aria-valuetext={formatPKR(amount)}
            />
          </label>
          <div>
            <p className="mb-2 text-[15px]">Tip</p>
            <Segmented
              label="Tip"
              value={tipRate}
              onChange={setTipRate}
              options={TIP_OPTIONS.map((t) => ({ value: t, label: t === 0 ? "None" : `${t * 100}%` }))}
            />
          </div>
          <div className="border-t border-line">
            <Toggle checked={cover} onChange={setCover} label="Donor covers processing fees" />
          </div>
        </div>
        <div>
          <p className="text-[15px] text-ink-2">Donor pays</p>
          <p className="text-[40px] font-semibold leading-tight tracking-[-0.02em] tabular-nums">{formatPKR(b.totalPKR)}</p>
          <div className="mt-5 flex h-3 overflow-hidden rounded-full" aria-hidden>
            {rows.map((r) => (
              <div key={r.label} className={cn(r.tone, "transition-all")} style={{ width: `${(r.value / total) * 100}%` }} />
            ))}
          </div>
          <ul className="mt-5 space-y-3">
            {rows.map((r) => (
              <li key={r.label} className="flex items-center gap-3 text-[17px]">
                <span className={cn("h-2.5 w-2.5 rounded-full", r.tone)} aria-hidden />
                <span className="flex-1">{r.label}</span>
                <span className="font-semibold tabular-nums">{formatPKR(r.value)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[13px] text-ink-2">
            Processing estimated at {(PROCESSING.rate * 100).toFixed(1)}% + PKR {formatNumber(PROCESSING.fixedPKR)}. Rounded to the nearest
            rupee.
          </p>
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  const rows: [string, (boolean | string)[]][] = [
    ["Live campaigns", ["1", "Unlimited", "Unlimited"]],
    ["AI generations", ["3 / month", "Unlimited", "Unlimited"]],
    ["Impact Wrapped & receipts", [true, true, true]],
    ["AI rewrite with undo", [false, true, true]],
    ["Monthly giving", [false, true, true]],
    ["Analytics & CSV export", [false, true, true]],
    ["Remove ImpactForge badge", [false, true, true]],
    ["Team members", ["1", "10", "Unlimited"]],
    ["Sponsor-matching marketplace", [false, false, true]],
    ["Verified NGO network, SSO", [false, false, true]],
  ];
  return (
    <section className="mx-auto max-w-[1080px] px-6 pb-24">
      <h2 className="t-headline mb-10">Compare plans.</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-[15px]">
          <thead>
            <tr className="border-b border-line">
              <th className="py-4 font-normal text-ink-2">Feature</th>
              {PLANS.map((p) => (
                <th key={p.id} className="py-4 text-center font-semibold">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, vals]) => (
              <tr key={label} className="border-b border-line/70">
                <td className="py-4">{label}</td>
                {vals.map((v, i) => (
                  <td key={i} className="py-4 text-center">
                    {v === true ? (
                      <Check className="mx-auto h-4 w-4 text-blue" strokeWidth={3} aria-label="Included" />
                    ) : v === false ? (
                      <Minus className="mx-auto h-4 w-4 text-ink-2" aria-label="Not included" />
                    ) : (
                      v
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 text-[15px] text-ink-2">
        Prices in PKR. Cancel anytime.{" "}
        <Link href="/create" className="link">
          Start free ›
        </Link>
      </p>
    </section>
  );
}
