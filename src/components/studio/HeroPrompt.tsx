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
      <div className="absolute -inset-3 rounded-full bg-[radial-gradient(60%_100%_at_50%_50%,rgba(255,106,61,0.35),transparent)] opacity-70 blur-2xl transition group-focus-within:opacity-100" />
      <div className="border-spin relative rounded-full p-px">
        <div className="relative flex items-center gap-2 rounded-full bg-[#0e0d12] p-1.5 pl-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <WandSparkles className="h-[18px] w-[18px] shrink-0 text-[#ff8a4c]" />
          <div className="relative flex-1">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              aria-label="Describe your cause"
              className="h-12 w-full bg-transparent text-[15px] text-white outline-none"
            />
            {!value && !focused && (
              <span className="pointer-events-none absolute inset-0 flex items-center truncate text-[15px] text-white/40">
                <Typewriter phrases={EXAMPLE_PROMPTS.map((p) => p.prompt)} />
              </span>
            )}
          </div>
          <button
            type="submit"
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(110deg,#ffc061,#ff6a3d_50%,#ff3d77)] px-4 text-sm font-semibold text-[#1c0700] shadow-[0_0_30px_-6px_rgba(255,106,61,0.8)] transition hover:brightness-110 sm:px-6"
          >
            <span className="hidden sm:inline">Forge campaign</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
