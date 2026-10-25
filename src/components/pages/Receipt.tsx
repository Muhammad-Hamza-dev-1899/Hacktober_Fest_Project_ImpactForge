"use client";

import { Printer } from "lucide-react";
import Link from "next/link";
import { LogoMark } from "@/components/layout/Navbar";
import { formatPKR } from "@/lib/utils";
import { findCampaignById, useAppStore } from "@/store/useAppStore";

/** Printable donation receipt. Uses the browser's print-to-PDF; chrome hides via print: variants. */
export function Receipt({ donationId }: { donationId: string }) {
  const hydrated = useAppStore((s) => s.hydrated);
  const donation = useAppStore((s) => s.donations.find((d) => d.id === donationId));
  const campaign = donation ? findCampaignById(donation.campaignId) : undefined;

  if (!hydrated) return <div className="min-h-[60vh]" />;
  if (!donation || !campaign) {
    return (
      <div className="mx-auto max-w-md px-6 pt-40 text-center">
        <h1 className="t-title">Receipt not found on this device.</h1>
        <Link href="/dashboard" className="link mt-4 text-[17px]">
          Go to your dashboard ›
        </Link>
      </div>
    );
  }

  const total = donation.totalPKR ?? donation.amountPKR;
  const date = new Date(donation.createdAt);
  const rows: [string, number][] = [
    ["Donation", donation.amountPKR],
    ["Tip to ImpactForge", donation.tipPKR ?? 0],
    ["Processing fee covered", donation.feeCoveredPKR ?? 0],
  ];

  return (
    <div className="mx-auto max-w-[640px] px-6 pb-24 pt-28 print:p-0">
      <div className="rounded-[28px] bg-mist p-8 sm:p-10 print:bg-white print:p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <span className="text-[17px] font-semibold">ImpactForge</span>
          </div>
          <span className="text-[13px] text-ink-2">Receipt</span>
        </div>

        <h1 className="mt-10 text-[40px] font-semibold leading-none tracking-[-0.02em]">{formatPKR(total)}</h1>
        <p className="mt-2 text-[17px] text-ink-2">
          {donation.recurring ? "Monthly gift" : "One-time gift"} to {campaign.title}
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-y-4 text-[15px]">
          <dt className="text-ink-2">Donor</dt>
          <dd className="text-right">{donation.donorName}</dd>
          <dt className="text-ink-2">Date</dt>
          <dd className="text-right">{date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</dd>
          <dt className="text-ink-2">Transaction</dt>
          <dd className="text-right font-mono text-[13px]">{donation.txId}</dd>
          <dt className="text-ink-2">Campaign region</dt>
          <dd className="text-right">{campaign.region}</dd>
        </dl>

        <div className="mt-8 border-t border-line pt-4">
          {rows
            .filter(([, v]) => v > 0)
            .map(([l, v]) => (
              <div key={l} className="flex justify-between py-1.5 text-[15px]">
                <span>{l}</span>
                <span className="tabular-nums">{formatPKR(v)}</span>
              </div>
            ))}
          <div className="mt-2 flex justify-between border-t border-line pt-3 text-[17px] font-semibold">
            <span>Total charged</span>
            <span className="tabular-nums">{formatPKR(total)}</span>
          </div>
          {donation.matchedPKR ? (
            <p className="mt-4 text-[14px] text-ink-2">
              {donation.sponsorName} matched your gift with {formatPKR(donation.matchedPKR)}. The sponsor&apos;s match is not part of your
              charge.
            </p>
          ) : null}
        </div>

        <div className="mt-8 border-t border-line pt-4">
          <p className="text-[13px] font-semibold text-ink-2">Allocated by the published budget</p>
          {donation.allocation.map((a) => (
            <div key={a.category} className="flex justify-between py-1 text-[14px]">
              <span>{a.category}</span>
              <span className="tabular-nums text-ink-2">{formatPKR(a.amountPKR)}</span>
            </div>
          ))}
        </div>

        <p className="mt-8 text-[12px] leading-relaxed text-ink-2">
          Prototype receipt generated in demo mode. In production, receipts are issued by the registered partner organization and emailed
          after payment confirmation.
        </p>
      </div>

      <div className="mt-8 flex items-center justify-center gap-6 print:hidden">
        <button className="btn-primary" onClick={() => window.print()}>
          <Printer className="h-4 w-4" aria-hidden /> Print or save as PDF
        </button>
        <Link href={`/impact/${donation.id}`} className="link text-[17px]">
          See your Wrapped ›
        </Link>
      </div>
    </div>
  );
}
