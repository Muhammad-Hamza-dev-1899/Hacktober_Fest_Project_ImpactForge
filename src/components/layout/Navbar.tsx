"use client";

import { LayoutDashboard, LogOut, Sparkles, WandSparkles } from "lucide-react";
import Link from "next/link";
import { GithubIcon } from "@/components/ui/GithubIcon";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight", className)}>
      <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--c3),var(--c1),var(--c2))] shadow-[0_0_24px_-4px_var(--glow)] transition-transform group-hover:rotate-12">
        <Sparkles className="h-4 w-4 text-ink" strokeWidth={2.5} />
      </span>
      ImpactForge
    </Link>
  );
}

const LINKS = [
  { href: "/create", label: "Create", icon: WandSparkles },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Navbar() {
  const user = useAppStore((s) => s.user);
  const hydrated = useAppStore((s) => s.hydrated);
  const logout = useAppStore((s) => s.logout);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-ink/60 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-1 sm:gap-2">
          {LINKS.map(({ href, label, icon: I }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              <I className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
          <a
            href={SITE.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition hover:bg-white/5 hover:text-white"
            aria-label="View source on GitHub"
          >
            <GithubIcon className="h-[18px] w-[18px]" />
          </a>
          {hydrated && user && (
            <button
              onClick={logout}
              title="Log out"
              className="ml-1 hidden h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-1 pr-3 text-sm text-white/80 transition hover:bg-white/10 sm:inline-flex"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[linear-gradient(135deg,var(--c1),var(--c2))] text-xs font-bold text-ink">
                {user.name[0]}
              </span>
              {user.name}
              <LogOut className="h-3.5 w-3.5 opacity-60" />
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[0.06]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-white/50 sm:flex-row sm:px-6">
        <p>
          Open source under the <span className="text-white/80">MIT License</span> · Built for {SITE.hackathon} with Kiro
        </p>
        <p className="text-xs">Prototype: payments, auth & impact data are simulated.</p>
      </div>
    </footer>
  );
}
