"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight, LogOut } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { GithubIcon } from "@/components/ui/GithubIcon";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="lm-g" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffd18a" />
          <stop offset="0.45" stopColor="#ff6a3d" />
          <stop offset="1" stopColor="#ff3d77" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#lm-g)" />
      <path
        d="M16.4 6.5c1.1 3 4.9 5.2 4.9 9.7a5.3 5.3 0 0 1-10.6.3c0-2 .9-3.5 2.1-4.6.1 1.8 1 2.8 2.1 3.2-.3-3.4.9-6.1 1.5-8.6Z"
        fill="#1c0700"
      />
      <circle cx="16" cy="22.4" r="1.6" fill="#1c0700" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5 text-[15px] font-semibold tracking-tight", className)}>
      <LogoMark className="h-7 w-7 transition-transform duration-500 group-hover:rotate-[14deg]" />
      <span>
        Impact<span className="serif text-[17px] font-normal">Forge</span>
      </span>
    </Link>
  );
}

const LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/impact/demo", label: "Impact Wrapped" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const user = useAppStore((s) => s.user);
  const hydrated = useAppStore((s) => s.hydrated);
  const logout = useAppStore((s) => s.logout);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:pt-4">
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "pointer-events-auto flex h-14 w-full max-w-5xl items-center justify-between gap-2 rounded-full border pl-4 pr-2 transition-all duration-500",
          scrolled
            ? "border-white/[0.09] bg-[#0d0c10]/75 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
            : "border-transparent bg-transparent",
        )}
      >
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-[13px] text-white/60 transition hover:bg-white/[0.05] hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <a
            href={SITE.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="grid h-10 w-10 place-items-center rounded-full text-white/60 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="View source on GitHub"
          >
            <GithubIcon className="h-[18px] w-[18px]" />
          </a>
          {hydrated && user && (
            <button
              onClick={logout}
              title="Log out"
              className="hidden h-10 items-center gap-2 rounded-full pl-1.5 pr-3 text-[13px] text-white/70 transition hover:bg-white/[0.06] hover:text-white sm:inline-flex"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[linear-gradient(135deg,#ffc061,#ff6a3d,#ff3d77)] text-xs font-bold text-[#1c0700]">
                {user.name[0]}
              </span>
              <LogOut className="h-3.5 w-3.5 opacity-60" />
            </button>
          )}
          <Link
            href="/create"
            className="group inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-semibold text-[#09080b] transition hover:bg-white/90"
          >
            <span className="hidden sm:inline">Start a campaign</span>
            <span className="sm:hidden">Start</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </motion.nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-white/[0.06]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-10 pt-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
            An open-source philanthropy engine for students. Built for {SITE.hackathon}, spec-first with Kiro.
          </p>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-4 text-white/35">Product</p>
          <ul className="space-y-2.5 text-white/60">
            <li>
              <Link href="/create" className="hover:text-white">
                Campaign-in-a-Box
              </Link>
            </li>
            <li>
              <Link href="/impact/demo" className="hover:text-white">
                Impact Wrapped
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-white">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-4 text-white/35">Open source</p>
          <ul className="space-y-2.5 text-white/60">
            <li>
              <a href={SITE.repoUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                GitHub repository
              </a>
            </li>
            <li>
              <a href={`${SITE.repoUrl}/blob/main/LICENSE`} target="_blank" rel="noreferrer" className="hover:text-white">
                MIT License
              </a>
            </li>
            <li>
              <a href={`${SITE.repoUrl}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer" className="hover:text-white">
                Contributing
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 border-t border-white/[0.06] px-5 py-6 text-xs text-white/35 sm:flex-row sm:px-6">
        <p>© 2026 ImpactForge contributors · MIT</p>
        <p>Prototype: payments, auth & impact data are simulated.</p>
      </div>
      <p
        aria-hidden
        className="pointer-events-none select-none text-center text-[22vw] font-semibold leading-[0.8] tracking-tighter text-white/[0.025] md:text-[15rem]"
      >
        forge
      </p>
    </footer>
  );
}
