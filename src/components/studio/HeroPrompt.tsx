"use client";

import { ArrowRight, WandSparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Typewriter } from "@/components/ui/primitives";
import { EXAMPLE_PROMPTS } from "@/components/studio/examples";
import { useAppStore } from "@/store/useAppStore";

/** Landing-page prompt bar: one click from the homepage straight into generation. */
export function HeroPrompt() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const setDraftPrompt = useAppStore((s) => s.setDraftPrompt);
  const user = useAppStore((s) => s.user);
  const loginAsGuest = useAppStore((s) => s.loginAsGuest);

  const go = (prompt: string) => {
    if (!user) loginAsGuest();
    setDraftPrompt(prompt);
    router.push("/create");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        go(value.trim() || EXAMPLE_PROMPTS[0].prompt);
      }}
      className="group relative mx-auto w-full max-w-2xl"
    >
      <div className="absolute -inset-px rounded-full bg-[linear-gradient(110deg,var(--c3),var(--c1),var(--c2),var(--c3))] opacity-60 blur-md transition group-focus-within:opacity-100" />
      <div className="relative flex items-center gap-2 rounded-full border border-white/15 bg-ink/90 p-2 pl-5 backdrop-blur-xl">
        <WandSparkles className="h-5 w-5 shrink-0 text-[var(--c1)]" />
        <div className="relative flex-1">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label="Describe your cause"
            className="h-11 w-full bg-transparent text-[15px] text-white outline-none"
          />
          {!value && !focused && (
            <span className="pointer-events-none absolute inset-0 flex items-center truncate text-[15px] text-white/40">
              <Typewriter phrases={EXAMPLE_PROMPTS.map((p) => p.prompt)} />
            </span>
          )}
        </div>
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ink transition hover:bg-white/90 sm:px-5"
        >
          <span className="hidden sm:inline">Forge campaign</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
