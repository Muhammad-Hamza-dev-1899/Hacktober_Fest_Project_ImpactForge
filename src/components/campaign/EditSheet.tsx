"use client";

import { useState } from "react";
import { Sheet } from "@/components/billing/Sheet";
import type { Campaign } from "@/lib/schema";
import { formatNumber } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

/** Organizer editing for the parts people most often need to correct after AI generation. */
export function EditSheet({ campaign, open, onClose }: { campaign: Campaign; open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} label="Edit campaign">
      {open && <EditForm campaign={campaign} onClose={onClose} />}
    </Sheet>
  );
}

function EditForm({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const updateCampaign = useAppStore((s) => s.updateCampaign);
  const [title, setTitle] = useState(campaign.title);
  const [tagline, setTagline] = useState(campaign.tagline);
  const [goal, setGoal] = useState(campaign.goalPKR);
  const [region, setRegion] = useState(campaign.region);
  const [story, setStory] = useState(campaign.story[0]);

  const valid = title.trim().length >= 2 && tagline.trim().length >= 2 && goal >= 10_000 && goal <= 5_000_000;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        updateCampaign(campaign.id, {
          title: title.trim().slice(0, 70),
          tagline: tagline.trim().slice(0, 160),
          goalPKR: Math.round(goal),
          region: region.trim().slice(0, 60) || campaign.region,
          story: [story.trim() || campaign.story[0], ...campaign.story.slice(1)],
        });
        onClose();
      }}
    >
      <h2 className="pr-10 text-[24px] font-semibold tracking-[-0.01em]">Edit campaign</h2>
      <p className="mt-1 text-[15px] text-ink-2">Check names, numbers and claims before you share.</p>
      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">Title</span>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={70} required />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">Tagline</span>
          <textarea
            className="field h-auto py-3"
            rows={2}
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            maxLength={160}
            required
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">Goal (PKR)</span>
            <input
              className="field"
              inputMode="numeric"
              value={formatNumber(goal)}
              onChange={(e) => setGoal(Number(e.target.value.replace(/\D/g, "")) || 0)}
              aria-invalid={goal < 10_000 || goal > 5_000_000}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">Region</span>
            <input className="field" value={region} onChange={(e) => setRegion(e.target.value)} maxLength={60} />
          </label>
        </div>
        {(goal < 10_000 || goal > 5_000_000) && (
          <p className="text-[13px] text-[#d70015]">Choose a goal between PKR 10,000 and PKR 5,000,000.</p>
        )}
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">Opening paragraph</span>
          <textarea className="field h-auto py-3" rows={4} value={story} onChange={(e) => setStory(e.target.value)} maxLength={600} />
        </label>
      </div>
      <div className="mt-6 flex gap-3">
        <button type="button" className="btn-secondary flex-1" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn-primary flex-1" disabled={!valid}>
          Save changes
        </button>
      </div>
    </form>
  );
}
