"use client";

import { ArrowUp, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EXAMPLE_PROMPTS } from "@/components/studio/examples";
import { Typewriter } from "@/components/ui/primitives";
import { useAppStore } from "@/store/useAppStore";

/** The signature element: a prompt field wrapped in the Intelligence glow. One click into generation. */
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
      className="group relative mx-auto w-full max-w-[640px]"
    >
      <div
        aria-hidden
        className="intel-ring absolute -inset-1 rounded-full opacity-50 blur-xl transition duration-500 group-focus-within:opacity-80"
      />
      <div className="intel-ring relative rounded-full p-[2px]">
        <div className="flex items-center gap-2 rounded-full bg-raised py-1.5 pl-5 pr-1.5">
          <Sparkles className="h-[18px] w-[18px] shrink-0 text-ink-2" aria-hidden />
          <div className="relative min-w-0 flex-1">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              aria-label="Describe your cause in one sentence"
              className="h-11 w-full bg-transparent text-[17px] text-ink outline-none"
            />
            {!value && !focused && (
              <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center truncate text-[17px] text-ink-2">
                <Typewriter phrases={EXAMPLE_PROMPTS.map((p) => p.prompt)} />
              </span>
            )}
          </div>
          <button
            type="submit"
            aria-label="Create campaign"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue text-white transition hover:bg-[var(--blue-hover)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue/30"
          >
            <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </form>
  );
}
