"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Ember = { x: number; y: number; r: number; vx: number; vy: number; life: number; max: number; hue: number; flicker: number };

/**
 * Forge embers: glowing particles drifting upward. Canvas 2D, capped particle count,
 * paused when off-screen or when the user prefers reduced motion.
 */
export function Embers({ className, density = 1 }: { className?: string; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const embers: Ember[] = [];

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (initial = false): Ember => {
      const max = 260 + Math.random() * 420;
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : h + 10,
        r: 0.6 + Math.random() * 1.9,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(0.25 + Math.random() * 0.75),
        life: initial ? Math.random() * max : 0,
        max,
        hue: 12 + Math.random() * 30,
        flicker: Math.random() * Math.PI * 2,
      };
    };

    resize();
    const count = Math.round(Math.min(90, (w * h) / 14000) * density);
    for (let i = 0; i < count; i++) embers.push(spawn(true));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.life++;
        e.flicker += 0.08;
        e.x += e.vx + Math.sin(e.life * 0.02 + e.flicker) * 0.15;
        e.y += e.vy;
        const t = e.life / e.max;
        if (t >= 1 || e.y < -10) {
          embers[i] = spawn();
          continue;
        }
        const alpha = Math.sin(t * Math.PI) * (0.55 + Math.sin(e.flicker) * 0.25);
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 6);
        g.addColorStop(0, `hsla(${e.hue + 20}, 100%, 75%, ${alpha})`);
        g.addColorStop(0.3, `hsla(${e.hue}, 100%, 60%, ${alpha * 0.5})`);
        g.addColorStop(1, `hsla(${e.hue}, 100%, 50%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      if (visible) raf = requestAnimationFrame(draw);
    };

    if (reduce) {
      draw();
      cancelAnimationFrame(raf);
      return;
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(draw);
    });
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [density]);

  return <canvas ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} />;
}
