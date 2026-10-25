import confetti from "canvas-confetti";

/** Reads the current theme colors so confetti always matches the campaign. */
function themeColors(el?: HTMLElement | null) {
  const s = getComputedStyle(el ?? document.documentElement);
  return ["--c1", "--c2", "--c3"]
    .map((v) => s.getPropertyValue(v).trim())
    .filter(Boolean)
    .concat("#ffffff");
}

export function celebrate(el?: HTMLElement | null) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = themeColors(el);
  const end = Date.now() + 1200;
  confetti({ particleCount: 140, spread: 90, startVelocity: 48, origin: { y: 0.65 }, colors, zIndex: 9999 });
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors, zIndex: 9999 });
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors, zIndex: 9999 });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
