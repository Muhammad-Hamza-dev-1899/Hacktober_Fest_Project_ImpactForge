"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Donation flows from campus (Islamabad) to the places campaigns reach. */
const CAMPUS: [number, number] = [33.64, 72.99];
export const IMPACT_SITES: { name: string; location: [number, number] }[] = [
  { name: "Gilgit", location: [35.92, 74.31] },
  { name: "Skardu", location: [35.3, 75.63] },
  { name: "Tharparkar", location: [24.74, 70.18] },
  { name: "Dadu", location: [26.73, 67.78] },
  { name: "Kech", location: [26.0, 63.05] },
  { name: "Peshawar", location: [34.01, 71.58] },
  { name: "Lahore", location: [31.52, 74.36] },
];

const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/** WebGL dotted globe (cobe), slowly drifting around Pakistan, draggable. */
export function Globe({ className, color = "#ff6a3d", light = false }: { className?: string; color?: string; light?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pointer = useRef<number | null>(null);
  const drag = useRef(0);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let width = el.offsetWidth;
    // Center on Pakistan (~70°E, 30°N) using cobe's mapping: phi = π − (lon − π/2).
    const base = Math.PI - ((70 * Math.PI) / 180 - Math.PI / 2);
    let phi = 0;
    let raf = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rgb = hexToRgb(color);

    const globe = createGlobe(el, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: base,
      theta: 0.45,
      dark: light ? 0 : 1,
      diffuse: light ? 1.2 : 1.4,
      mapSamples: 18000,
      mapBrightness: light ? 6 : 5,
      mapBaseBrightness: light ? 0 : 0.02,
      baseColor: light ? [1, 1, 1] : [0.16, 0.14, 0.18],
      markerColor: rgb,
      glowColor: light ? [0.92, 0.93, 0.96] : [0.35, 0.18, 0.14],
      markers: [{ location: CAMPUS, size: 0.09, color: [1, 1, 1] }, ...IMPACT_SITES.map((s) => ({ location: s.location, size: 0.05 }))],
      arcs: IMPACT_SITES.map((s) => ({ from: CAMPUS, to: s.location })),
      arcColor: rgb,
      arcWidth: 0.6,
      arcHeight: 0.25,
      markerElevation: 0.02,
      scale: 1.05,
      opacity: 0.9,
    });

    const tick = () => {
      if (pointer.current === null && !reduce) phi += 0.0016;
      const swing = Math.sin(phi) * 0.25;
      globe.update({ phi: base + swing + drag.current / 220 });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      width = el.offsetWidth;
      globe.update({ width: width * 2, height: width * 2 });
    };
    window.addEventListener("resize", onResize);
    requestAnimationFrame(() => (el.style.opacity = "1"));
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      globe.destroy();
    };
  }, [color, light]);

  return (
    <div className={cn("relative aspect-square w-full", className)}>
      <canvas
        ref={canvas}
        className="h-full w-full cursor-grab opacity-0 transition-opacity duration-1000 [contain:layout_paint_size] active:cursor-grabbing"
        onPointerDown={(e) => (pointer.current = e.clientX - drag.current)}
        onPointerUp={() => (pointer.current = null)}
        onPointerOut={() => (pointer.current = null)}
        onPointerMove={(e) => {
          if (pointer.current !== null) drag.current = e.clientX - pointer.current;
        }}
      />
    </div>
  );
}
