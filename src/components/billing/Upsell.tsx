"use client";

import { Check, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Segmented, Sheet } from "@/components/billing/Sheet";
import { celebrate } from "@/lib/confetti";
import { getPlan, type BillingCycle } from "@/lib/monetization";
import { checkoutSubscription } from "@/lib/payments/client";
import { formatPKR } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

/** Shown when someone reaches a Pro feature. Explains exactly what they get, with a direct upgrade. */
export function UpsellSheet({ open, onClose, reason }: { open: boolean; onClose: () => void; reason: string }) {
  const pro = getPlan("pro");
  const subscribe = useAppStore((s) => s.subscribe);
  const [cycle, setCycle] = useState<BillingCycle>("yearly");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upgrade = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await checkoutSubscription(cycle);
      if (r.redirected) return;
      subscribe("pro", cycle, r.txId);
      setDone(true);
      celebrate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upgrade failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const price = pro.pricePKR!;
  return (
    <Sheet open={open} onClose={onClose} label="Upgrade to Society Pro" busy={busy}>
      {done ? (
        <div className="pt-4 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#34c759] text-white">
            <Check className="h-8 w-8" strokeWidth={3} />
          </div>
          <h2 className="mt-5 text-[28px] font-semibold">You&apos;re on Society Pro.</h2>
          <p className="mt-2 text-[17px] text-ink-2">Every Pro feature is unlocked. Demo mode: no real charge was made.</p>
          <button className="btn-primary mt-7 w-full" onClick={onClose}>
            Continue
          </button>
        </div>
      ) : (
        <>
          <p className="pr-10 text-[13px] font-semibold text-[#bf5af2]">Society Pro</p>
          <h2 className="mt-1 pr-10 text-[24px] font-semibold leading-tight tracking-[-0.01em]">{reason}</h2>
          <ul className="mt-5 space-y-2.5">
            {pro.features.map((f) => (
              <li key={f} className="flex gap-2.5 text-[15px]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue" strokeWidth={3} /> {f}
              </li>
            ))}
          </ul>
          <Segmented
            className="mt-6"
            label="Billing period"
            value={cycle}
            onChange={setCycle}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly · 2 months free" },
            ]}
          />
          <p className="mt-4 text-center text-[17px]">
            <span className="font-semibold">{formatPKR(cycle === "monthly" ? price.monthly : price.yearly)}</span>
            <span className="text-ink-2"> / {cycle === "monthly" ? "month" : "year"}</span>
          </p>
          {error && (
            <p role="alert" className="mt-2 text-center text-[14px] text-[#d70015]">
              {error}
            </p>
          )}
          <button className="btn-primary mt-4 w-full" onClick={upgrade} disabled={busy}>
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null} Upgrade to Society Pro
          </button>
          <Link href="/pricing" className="link mt-4 flex justify-center text-[15px]" onClick={onClose}>
            Compare all plans ›
          </Link>
        </>
      )}
    </Sheet>
  );
}
