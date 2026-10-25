import type { CSSProperties } from "react";
import type { Palette } from "./schema";

/**
 * Theme tokens. The AI may only choose a palette name; this file decides what it
 * looks like. Components read colors through CSS variables (var(--c1) etc.) so a
 * campaign page re-skins itself without any per-component logic.
 */
export type PaletteTokens = {
  name: string;
  c1: string; // primary
  c2: string; // secondary
  c3: string; // tertiary / highlight
  accent: string; // CTA background
  accentText: string;
  glow: string; // rgba for shadows
  d1: string; // deep tones for text/gradients on light surfaces
  d2: string;
};

export const PALETTE_TOKENS: Record<Palette, PaletteTokens> = {
  aurora: {
    name: "Aurora",
    c1: "#2dd4bf",
    c2: "#8b5cf6",
    c3: "#38bdf8",
    accent: "#5eead4",
    accentText: "#042f2e",
    glow: "rgba(45, 212, 191, 0.45)",
    d1: "#0d9488",
    d2: "#7c3aed",
  },
  ember: {
    name: "Ember",
    c1: "#fb923c",
    c2: "#ef4444",
    c3: "#fde047",
    accent: "#fb923c",
    accentText: "#2a0a00",
    glow: "rgba(251, 146, 60, 0.45)",
    d1: "#ea580c",
    d2: "#e11d48",
  },
  glacier: {
    name: "Glacier",
    c1: "#7dd3fc",
    c2: "#6366f1",
    c3: "#e0f2fe",
    accent: "#bae6fd",
    accentText: "#082f49",
    glow: "rgba(125, 211, 252, 0.45)",
    d1: "#0284c7",
    d2: "#4f46e5",
  },
  forest: {
    name: "Forest",
    c1: "#4ade80",
    c2: "#14b8a6",
    c3: "#bef264",
    accent: "#86efac",
    accentText: "#052e16",
    glow: "rgba(74, 222, 128, 0.4)",
    d1: "#16a34a",
    d2: "#0d9488",
  },
  sunrise: {
    name: "Sunrise",
    c1: "#fbbf24",
    c2: "#ec4899",
    c3: "#fb7185",
    accent: "#fcd34d",
    accentText: "#3b0a1e",
    glow: "rgba(236, 72, 153, 0.45)",
    d1: "#d97706",
    d2: "#db2777",
  },
  midnight: {
    name: "Midnight",
    c1: "#a5b4fc",
    c2: "#4f46e5",
    c3: "#fcd34d",
    accent: "#fcd34d",
    accentText: "#1e1b4b",
    glow: "rgba(129, 140, 248, 0.45)",
    d1: "#4f46e5",
    d2: "#9333ea",
  },
};

export function themeVars(palette: Palette): CSSProperties {
  const t = PALETTE_TOKENS[palette];
  return {
    "--c1": t.c1,
    "--c2": t.c2,
    "--c3": t.c3,
    "--accent": t.accent,
    "--accent-text": t.accentText,
    "--glow": t.glow,
    "--d1": t.d1,
    "--d2": t.d2,
  } as CSSProperties;
}

/**
 * Categorical data colors for charts (budget categories, fund flows).
 * Fixed order, validated for colorblind separation and >= 3:1 contrast on the
 * dark surface (adjacent pairs). Theme colors stay decorative; data colors stay
 * consistent across every campaign so slot N always means "budget line N".
 */
export const SERIES = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181"] as const;

/** ImpactForge's own brand palette (molten ember), used outside campaign pages. */
export const FORGE: PaletteTokens = {
  name: "Forge",
  c1: "#ff6a3d",
  c2: "#ff3d77",
  c3: "#ffc061",
  accent: "#ff7a45",
  accentText: "#1c0700",
  glow: "rgba(255, 106, 61, 0.45)",
  d1: "#ea580c",
  d2: "#db2777",
};

/** Light-surface steps of the same categorical hues (validated set; always paired with labels). */
export const SERIES_LIGHT = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"] as const;

/** Appearance-aware chart colors (resolve to the light or dark validated steps). */
export const SERIES_VAR = ["var(--s1)", "var(--s2)", "var(--s3)", "var(--s4)", "var(--s5)"] as const;
