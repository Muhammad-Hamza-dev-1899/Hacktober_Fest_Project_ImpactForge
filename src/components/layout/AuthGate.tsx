"use client";

import { motion } from "motion/react";
import { UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { ShimmerButton } from "@/components/ui/primitives";
import { useAppStore } from "@/store/useAppStore";

/** MOCK auth: a one-click guest login stands in for real authentication. */
export function AuthGate({ children }: { children: ReactNode }) {
  const hydrated = useAppStore((s) => s.hydrated);
  const user = useAppStore((s) => s.user);
  const loginAsGuest = useAppStore((s) => s.loginAsGuest);
  const [name, setName] = useState("");

  if (!hydrated) return <div className="min-h-[60vh]" />;
  if (user) return <>{children}</>;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass w-full max-w-sm rounded-3xl p-8 text-center"
      >
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--c1),var(--c2))]">
          <UserRound className="h-7 w-7 text-ink" />
        </div>
        <h2 className="font-display text-2xl font-semibold">Jump right in</h2>
        <p className="mt-2 text-sm text-white/60">No sign-up for the demo. We&apos;ll keep your campaigns on this device.</p>
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            loginAsGuest(name.trim() || "Guest");
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your first name (optional)"
            maxLength={24}
            className="h-11 w-full rounded-full border border-white/10 bg-white/5 px-5 text-sm outline-none placeholder:text-white/35 focus:border-white/30"
          />
          <ShimmerButton type="submit" className="w-full">
            Login as Guest
          </ShimmerButton>
        </form>
      </motion.div>
    </div>
  );
}
