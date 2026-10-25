import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const pkr = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 });

export function formatPKR(n: number, opts: { compact?: boolean } = {}) {
  if (opts.compact && n >= 100_000) {
    if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
    return `PKR ${(n / 1000).toFixed(0)}K`;
  }
  return `PKR ${pkr.format(Math.round(n))}`;
}

export function formatNumber(n: number) {
  return pkr.format(Math.round(n));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48)
    .replace(/-$/, "");
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Small, fast, deterministic PRNG (mulberry32) seeded from a string. */
export function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * "3" + "1 insulated winter coat" → "3 insulated winter coats".
 * Falls back to "3 × label" when the label carries its own quantity ("…for 1 child").
 */
export function unitPhrase(count: number, label: string) {
  const base = label.replace(/^1\s+/, "");
  if (count === 1) return /^1\s/.test(label) ? label : `1 × ${base}`;
  if (/\b\d+\b/.test(base)) return `${count} × ${base}`;
  const [head, ...rest] = base.split(/(\s(?:for|with|of|in)\s)/);
  const plural = head.replace(/(\w+)$/, (w) => (/s$/i.test(w) ? w : /[^aeiou]y$/i.test(w) ? w.slice(0, -1) + "ies" : w + "s"));
  return `${count} ${[plural, ...rest].join("")}`;
}
