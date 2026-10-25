import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { Bento } from "@/components/landing/Bento";
import { FinalCTA, Featured, HowItWorks, Pulse } from "@/components/landing/Sections";
import { Showcase } from "@/components/landing/Showcase";
import { HeroPrompt } from "@/components/studio/HeroPrompt";
import { EXAMPLE_PROMPTS } from "@/components/studio/examples";
import { Embers } from "@/components/ui/Embers";
import { BlurText, Marquee, Reveal } from "@/components/ui/primitives";
import { SITE } from "@/lib/site";

export default function Home() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative isolate overflow-hidden pt-28 sm:pt-36">
        {/* light */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-18rem] h-[42rem] w-[70rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,106,61,0.32),rgba(255,61,119,0.12)_55%,transparent)] blur-2xl" />
          <div className="absolute left-1/2 top-0 h-[38rem] w-[min(90vw,64rem)] -translate-x-1/2 bg-[conic-gradient(from_180deg_at_50%_0%,transparent_38%,rgba(255,200,150,0.10)_47%,rgba(255,220,180,0.16)_50%,rgba(255,200,150,0.10)_53%,transparent_62%)]" />
          <div className="bg-grid mask-radial absolute inset-x-0 top-0 h-[60rem] opacity-60" />
          <Embers />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#09080b]" />
        </div>

        <div className="mx-auto flex max-w-5xl flex-col items-center px-4 text-center sm:px-6">
          <Reveal>
            <Link
              href={SITE.repoUrl}
              target="_blank"
              className="group mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-4 text-xs text-white/70 backdrop-blur transition hover:border-white/25"
            >
              <span className="rounded-full bg-[linear-gradient(110deg,#ffc061,#ff6a3d,#ff3d77)] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#1c0700]">
                Open source
              </span>
              {SITE.hackathon}
              <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </Link>
          </Reveal>

          <h1 className="text-[3.1rem] font-semibold leading-[0.95] tracking-[-0.045em] sm:text-7xl md:text-[6rem]">
            <BlurText text="Turn one sentence" wordClassName="text-silver pb-[0.06em]" />
            <br />
            <BlurText text="into a movement." delay={0.3} gradient className="serif tracking-[-0.02em]" />
          </h1>

          <Reveal delay={0.55}>
            <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg">
              The AI philanthropy engine for students. Describe a cause and get a designed campaign, the story and a day-by-day launch plan.
              Then every donor sees exactly where their money went.
            </p>
          </Reveal>

          <Reveal delay={0.7} className="mt-10 w-full">
            <HeroPrompt />
          </Reveal>

          <Reveal delay={0.85} className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            <Link href="/impact/demo" className="group inline-flex items-center gap-2 text-white/70 transition hover:text-white">
              <span className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-white/5 transition group-hover:border-white/40">
                <Play className="h-3 w-3 fill-current" />
              </span>
              Watch an Impact Wrapped
            </Link>
            <span className="hidden h-4 w-px bg-white/15 sm:block" />
            <Link href="/c/warmth-for-gilgit" className="text-white/70 transition hover:text-white">
              Browse a live campaign →
            </Link>
          </Reveal>
        </div>

        <Showcase />

        <div className="mx-auto mt-20 max-w-5xl px-4 sm:mt-28">
          <p className="eyebrow mb-5 text-center text-white/30">Causes students are forging right now</p>
          <Marquee>
            {EXAMPLE_PROMPTS.map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/[0.07] bg-white/[0.025] px-4 py-2 text-sm text-white/55"
              >
                <span>{p.emoji}</span> {p.label}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      <Bento />
      <HowItWorks />
      <Pulse />
      <Featured />
      <FinalCTA />
    </>
  );
}
