"use client";

import { motion } from "motion/react";
import { LogoMark } from "@/components/layout/Navbar";
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
    <div className="relative flex min-h-[85vh] items-center justify-center px-4 pt-20">
      <div className="pointer-events-none absolute left-1/2 top-[-10rem] -z-10 h-[40rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,106,61,0.25),transparent)]" />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="card w-full max-w-sm p-8 text-center shadow-[0_40px_100px_-30px_rgba(255,106,61,0.35)]"
      >
        <LogoMark className="mx-auto mb-6 h-14 w-14" />
        <h2 className="text-3xl font-semibold tracking-tight">
          Jump <span className="serif text-ember">right in.</span>
        </h2>
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
