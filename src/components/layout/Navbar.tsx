"use client";

import { AnimatePresence, motion } from "motion/react";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GithubIcon } from "@/components/ui/GithubIcon";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useAppStore, usePlan } from "@/store/useAppStore";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="lm-g" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ff9f0a" />
          <stop offset="0.35" stopColor="#ff375f" />
          <stop offset="0.7" stopColor="#bf5af2" />
          <stop offset="1" stopColor="#0a84ff" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#lm-g)" />
      <path
        d="M16.4 6.5c1.1 3 4.9 5.2 4.9 9.7a5.3 5.3 0 0 1-10.6.3c0-2 .9-3.5 2.1-4.6.1 1.8 1 2.8 2.1 3.2-.3-3.4.9-6.1 1.5-8.6Z"
        fill="#fff"
      />
      <circle cx="16" cy="22.4" r="1.6" fill="#fff" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em] text-ink", className)}>
      <LogoMark className="h-[22px] w-[22px]" />
      ImpactForge
    </Link>
  );
}

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/explore", label: "Explore" },
  { href: "/create", label: "Create" },
  { href: "/impact/demo", label: "Impact Wrapped" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" },
];

/** Apple-style global navigation: 48px, frosted, small type, centered links. */
export function Navbar() {
  const user = useAppStore((s) => s.user);
  const hydrated = useAppStore((s) => s.hydrated);
  const logout = useAppStore((s) => s.logout);
  const { plan } = usePlan();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 print:hidden">
      <nav className="relative z-10 border-b border-line/60 bg-[var(--nav)] backdrop-blur-xl backdrop-saturate-[1.8]">
        <div className="mx-auto flex h-12 max-w-[1024px] items-center justify-between px-4 sm:px-6">
          <Logo />
          <ul className="hidden items-center gap-7 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[12px] tracking-[-0.01em] text-ink/80 transition hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <a
              href={SITE.repoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Source on GitHub"
              className="hidden p-1.5 text-ink/70 hover:text-ink sm:block"
            >
              <GithubIcon className="h-4 w-4" />
            </a>
            {hydrated && user && (
              <button
                onClick={logout}
                title="Log out"
                className="hidden items-center gap-1.5 rounded-full py-1 pl-1 pr-2 text-[12px] text-ink/70 hover:bg-mist sm:inline-flex"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-[11px] font-semibold text-canvas">
                  {user.name[0]}
                </span>
                {plan.id !== "free" && (
                  <span className="rounded-full bg-blue/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue">PRO</span>
                )}
                <LogOut className="h-3 w-3" />
              </button>
            )}
            <Link
              href="/create"
              className="rounded-full bg-blue px-3.5 py-1.5 text-[12px] text-white transition hover:bg-[var(--blue-hover)] max-sm:px-4 max-sm:py-2.5 max-sm:text-[14px]"
            >
              Start
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              className="grid h-11 w-11 place-items-center text-ink md:hidden"
              aria-label="Menu"
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed inset-x-0 bottom-0 top-12 bg-canvas px-8 pt-6 md:hidden"
          >
            <ul className="space-y-1">
              {LINKS.map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block py-2 text-[28px] font-semibold tracking-[-0.01em] text-ink"
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  const cols = [
    {
      h: "Product",
      items: [
        ["Campaign-in-a-Box", "/create"],
        ["Explore campaigns", "/explore"],
        ["Impact Wrapped", "/impact/demo"],
        ["Dashboard", "/dashboard"],
      ],
    },
    {
      h: "Business",
      items: [
        ["Pricing", "/pricing"],
        ["Sponsor matching", "/pricing#campus"],
        ["For universities", "/pricing#campus"],
      ],
    },
    {
      h: "Open source",
      items: [
        ["GitHub", SITE.repoUrl],
        ["MIT License", `${SITE.repoUrl}/blob/main/LICENSE`],
        ["Contributing", `${SITE.repoUrl}/blob/main/CONTRIBUTING.md`],
      ],
    },
  ];
  return (
    <footer className="mt-auto bg-mist text-[12px] leading-[1.33] text-ink-2 print:hidden">
      <div className="mx-auto max-w-[1024px] px-4 py-10 sm:px-6">
        <p className="border-b border-line pb-4">
          ImpactForge is a prototype built for {SITE.hackathon}. Payments run in demo mode unless a payment provider key is configured.
          Impact data shown in Wrapped stories is illustrative. Beneficiary names are changed for privacy.
        </p>
        <div className="grid gap-8 py-6 sm:grid-cols-3">
          {cols.map((c) => (
            <div key={c.h}>
              <p className="mb-2 font-semibold text-ink">{c.h}</p>
              <ul className="space-y-1.5">
                {c.items.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-ink hover:underline">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-between gap-2 border-t border-line pt-4 sm:flex-row">
          <p>Copyright © 2026 ImpactForge contributors. MIT Licensed.</p>
          <p>Pakistan · PKR</p>
        </div>
      </div>
    </footer>
  );
}
