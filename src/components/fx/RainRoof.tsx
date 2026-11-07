"use client";

import { useRef } from "react";
import { gsap, useIdleGSAP, prefersReducedMotion, belowFold } from "@/lib/gsap";
import { useRun } from "@/components/fx/useRun";

const drops = [
  { side: "l", x: "46%", d: "0s", t: "2.6s" },
  { side: "r", x: "40%", d: "0.9s", t: "2.4s" },
  { side: "l", x: "30%", d: "1.7s", t: "2.2s" },
  { side: "r", x: "47%", d: "2.3s", t: "2.8s" },
  { side: "l", x: "38%", d: "3.1s", t: "2.5s" },
  { side: "r", x: "28%", d: "3.8s", t: "2.1s" },
];

const streaks = [
  { x: 17, d: "0.2s" },
  { x: 36, d: "1.1s" },
  { x: 58, d: "0.6s" },
  { x: 81, d: "1.6s" },
  { x: 47, d: "2.2s" },
];

/**
 * A low gable roof that sits on top of a card (the card is the house): it snaps on
 * when it scrolls into view, then rain keeps sliding down both slopes and dripping off the eaves.
 */
export function RainRoof() {
  const root = useRef<HTMLDivElement>(null);
  useRun(root);

  useIdleGSAP(() => {
    const el = root.current;
    if (!el || prefersReducedMotion() || !belowFold(el)) return;
    const roof = el.querySelector("svg");
    gsap.set(roof, { scaleY: 0, scaleX: 0.86, transformOrigin: "50% 100%" });
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        gsap.to(roof, { scaleY: 1, scaleX: 1, duration: 0.9, delay: 0.35, ease: "back.out(2.4)" });
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, root);

  return (
    <div ref={root} aria-hidden className="fx-desk pointer-events-none absolute inset-x-0 bottom-full h-6 lg:h-9">
      <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
        <polygon points="0,24 50,0 100,24" fill="var(--ink)" />
        <polyline points="0,24 50,0 100,24" fill="none" stroke="var(--copper)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
      </svg>
      {streaks.map((r) => (
        <span
          key={r.x}
          className="rain-fall fx-loop"
          style={{ left: `${r.x}%`, top: `${100 - 2 * Math.min(r.x, 100 - r.x)}%`, "--d": r.d } as React.CSSProperties}
        />
      ))}
      {drops.map((d, i) => (
        <span
          key={i}
          data-side={d.side}
          className="rain-drop fx-loop"
          style={{ "--x": d.x, "--d": d.d, "--t": d.t } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
