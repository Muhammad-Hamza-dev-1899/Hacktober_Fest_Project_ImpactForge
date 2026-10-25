"use client";

import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { LogoMark } from "@/components/layout/Navbar";
import { useAppStore } from "@/store/useAppStore";

/** MOCK auth: a one-click guest sign-in stands in for real accounts (swap for NextAuth / Clerk). */
export function AuthGate({ children }: { children: ReactNode }) {
  const hydrated = useAppStore((s) => s.hydrated);
  const user = useAppStore((s) => s.user);
  const loginAsGuest = useAppStore((s) => s.loginAsGuest);
  const [name, setName] = useState("");

  if (!hydrated) return <div className="min-h-[60vh]" />;
  if (user) return <>{children}</>;

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-6 pt-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
        <LogoMark className="mx-auto h-14 w-14" />
        <h1 className="t-title mt-6">Sign in to ImpactForge.</h1>
        <p className="mt-3 text-[17px] text-ink-2">No account needed for the demo. Your campaigns are saved on this device.</p>
        <form
          className="mt-8 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            loginAsGuest(name.trim() || "Guest");
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name (optional)"
            maxLength={24}
            autoComplete="given-name"
            className="field"
          />
          <button type="submit" className="btn-primary w-full">
            Continue as guest
          </button>
        </form>
      </motion.div>
    </div>
  );
}
