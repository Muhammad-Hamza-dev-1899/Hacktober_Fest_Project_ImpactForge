"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Campaign } from "@/lib/schema";
import { PALETTE_TOKENS, themeVars } from "@/lib/themes";
import { cn, seededRandom } from "@/lib/utils";

/**
 * Generative cover art. Every campaign gets a unique poster derived from its id,
 * palette and hero variant: mesh-gradient light, a variant-specific pattern,
 * film grain and a glass medallion with the cause's icon.
 */
export function CoverArt({
  campaign,
  className,
  medallion = true,
  animated = true,
  size = "md",
}: {
  campaign: Pick<Campaign, "id" | "theme" | "impactUnits">;
  className?: string;
  medallion?: boolean;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const t = PALETTE_TOKENS[campaign.theme.palette];
  const rand = seededRandom(campaign.id);
  const blobs = [t.c1, t.c2, t.c3, t.c1].map((color, i) => ({
    color,
    cx: 40 + rand() * 320,
    cy: 40 + rand() * 420,
    r: 120 + rand() * 120 - i * 10,
  }));
  const variant = campaign.theme.heroVariant;
  const icon = campaign.impactUnits[0]?.icon ?? "heart";

  return (
    <div style={themeVars(campaign.theme.palette)} className={cn("relative isolate overflow-hidden bg-[#0c0b10]", className)}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <filter id={`blur${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="48" />
          </filter>
          <filter id={`grain${uid}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0" />
          </filter>
          <radialGradient id={`vig${uid}`} cx="50%" cy="45%" r="75%">
            <stop offset="55%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.65" />
          </radialGradient>
          <linearGradient id={`line${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor={t.c3} stopOpacity="0.9" />
            <stop offset="1" stopColor={t.c2} stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* mesh light */}
        <g filter={`url(#blur${uid})`}>
          {blobs.map((b, i) => (
            <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={b.color} opacity={i === 3 ? 0.45 : 0.75} />
          ))}
        </g>

        {/* variant pattern */}
        <g opacity="0.55" fill="none" stroke={`url(#line${uid})`}>
          {variant === "orbit" &&
            [70, 110, 150, 195, 245, 300].map((r, i) => (
              <circle key={r} cx="200" cy="250" r={r} strokeWidth={i % 2 ? 0.6 : 1.1} strokeDasharray={i % 2 ? "2 6" : undefined} />
            ))}
          {variant === "beams" &&
            Array.from({ length: 22 }, (_, i) => {
              const a = (Math.PI * 2 * i) / 22;
              return <line key={i} x1="200" y1="250" x2={200 + Math.cos(a) * 420} y2={250 + Math.sin(a) * 420} strokeWidth="0.8" />;
            })}
          {variant === "aurora" &&
            Array.from({ length: 9 }, (_, i) => (
              <path
                key={i}
                d={`M-20 ${150 + i * 32} C 90 ${100 + i * 32 + (i % 2 ? 50 : -30)}, 260 ${220 + i * 30}, 420 ${140 + i * 34}`}
                strokeWidth={1.2 - i * 0.08}
              />
            ))}
          {variant === "spotlight" &&
            Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1={-40 + i * 44} y1="-20" x2={140 + i * 30} y2="540" strokeWidth={i % 3 === 0 ? 1.4 : 0.5} />
            ))}
        </g>

        <rect width="400" height="500" fill={`url(#vig${uid})`} />
        <rect width="400" height="500" filter={`url(#grain${uid})`} opacity="0.1" />
      </svg>

      {medallion && (
        <div className="absolute inset-0 grid place-items-center">
          <motion.div
            initial={animated ? { scale: 0.6, opacity: 0, rotate: -12 } : false}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 14, stiffness: 120, delay: 0.15 }}
            className={cn(
              "relative grid place-items-center rounded-full border border-white/30 bg-white/10 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-md",
              size === "sm" ? "h-14 w-14" : size === "lg" ? "h-36 w-36" : "h-24 w-24",
            )}
          >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.45),transparent_55%)]" />
            <Icon
              name={icon}
              strokeWidth={1.5}
              className={cn(
                "relative text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]",
                size === "sm" ? "h-6 w-6" : size === "lg" ? "h-16 w-16" : "h-10 w-10",
              )}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
