"use client";

import { Check, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PENDING_KEY, type Pending } from "@/lib/payments/client";
import { findCampaignById, useAppStore } from "@/store/useAppStore";

/** Return URL after Stripe Checkout: verifies the session server-side, then records it once. */
export function CheckoutSuccess() {
  const hydrated = useAppStore((s) => s.hydrated);
  const recordDonation = useAppStore((s) => s.recordDonation);
  const subscribe = useAppStore((s) => s.subscribe);
  const [state, setState] = useState<{ status: "working" | "done" | "error"; message?: string; donationId?: string }>({
    status: "working",
  });
  const ran = useRef(false);

  useEffect(() => {
    if (!hydrated || ran.current) return;
    ran.current = true;
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    const raw = localStorage.getItem(PENDING_KEY);
    void (async () => {
      try {
        if (!sessionId || !raw) throw new Error("We couldn't find a pending checkout on this device.");
        const r = await fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`);
        const v = (await r.json()) as { paid: boolean; txId?: string; error?: string };
        if (!v.paid) throw new Error(v.error ?? "Payment wasn't completed.");
        const pending = JSON.parse(raw!) as Pending;
        localStorage.removeItem(PENDING_KEY);
        if (pending.kind === "subscription") {
          subscribe(pending.plan, pending.cycle, v.txId ?? sessionId);
          setState({ status: "done", message: "You're on Society Pro." });
          return;
        }
        const campaign = findCampaignById(pending.campaignId);
        if (!campaign) throw new Error("The campaign isn't available on this device.");
        const { amountPKR, donorName, ...extras } = pending;
        const d = recordDonation(campaign, amountPKR, donorName, v.txId ?? sessionId, extras);
        setState({ status: "done", message: "Thank you. Your gift is confirmed.", donationId: d.id });
      } catch (e) {
        setState({ status: "error", message: e instanceof Error ? e.message : "Verification failed." });
      }
    })();
  }, [hydrated, recordDonation, subscribe]);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 pt-12 text-center">
      {state.status === "working" ? (
        <LoaderCircle className="h-8 w-8 animate-spin text-blue" aria-label="Confirming payment" />
      ) : state.status === "done" ? (
        <span className="grid h-16 w-16 place-items-center rounded-full bg-[#34c759] text-white">
          <Check className="h-8 w-8" strokeWidth={3} aria-hidden />
        </span>
      ) : null}
      <h1 className="t-title mt-6">{state.status === "working" ? "Confirming your payment…" : state.message}</h1>
      {state.status !== "working" && (
        <div className="mt-7 flex items-center gap-6">
          {state.donationId ? (
            <Link href={`/impact/${state.donationId}`} className="btn-primary">
              See your Impact Wrapped
            </Link>
          ) : (
            <Link href="/dashboard" className="btn-primary">
              Go to dashboard
            </Link>
          )}
          {state.donationId && (
            <Link href={`/receipt/${state.donationId}`} className="link text-[17px]">
              Receipt ›
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
