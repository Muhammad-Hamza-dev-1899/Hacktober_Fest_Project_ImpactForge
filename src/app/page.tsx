import Link from "next/link";
import { BusinessSection, Featured, FinalCTA, HowItWorks, WrappedSection } from "@/components/landing/Sections";
import { Showcase } from "@/components/landing/Showcase";
import { FeatureTiles } from "@/components/landing/Tiles";
import { HeroPrompt } from "@/components/studio/HeroPrompt";
import { EXAMPLE_PROMPTS } from "@/components/studio/examples";
import { BlurText, FadeUp, Marquee, Reveal } from "@/components/ui/primitives";

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden pt-28 sm:pt-36">
        <div className="mx-auto flex max-w-[1080px] flex-col items-center px-6 text-center">
          <Reveal>
            <p className="t-eyebrow text-ink-2">ImpactForge</p>
          </Reveal>
          <h1 className="t-hero mt-3 max-w-4xl">
            <BlurText text="Turn one sentence" />
            <br />
            <FadeUp delay={0.25} className="text-intel inline-block pb-[0.08em]">
              into a movement.
            </FadeUp>
          </h1>
          <Reveal delay={0.45}>
            <p className="t-lede mx-auto mt-6 max-w-[640px]">
              Describe a cause. Get a designed campaign, the story and a day-by-day launch plan. Every donor sees exactly where their money
              went.
            </p>
          </Reveal>
          <Reveal delay={0.6} className="mt-10 w-full">
            <HeroPrompt />
          </Reveal>
          <Reveal delay={0.75} className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[17px]">
            <Link href="/impact/demo" className="link">
              Watch an Impact Wrapped ›
            </Link>
            <Link href="/c/warmth-for-gilgit" className="link">
              See a live campaign ›
            </Link>
          </Reveal>
        </div>

        <Showcase />

        <div className="mx-auto mt-16 max-w-[1080px] px-4">
          <Marquee>
            {EXAMPLE_PROMPTS.map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-mist px-4 py-2 text-[15px] text-ink-2"
              >
                <span aria-hidden>{p.emoji}</span> {p.label}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      <FeatureTiles />
      <WrappedSection />
      <HowItWorks />
      <BusinessSection />
      <Featured />
      <FinalCTA />
    </>
  );
}
