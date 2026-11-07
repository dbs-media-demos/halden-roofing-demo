"use client";

import { useRef, useState } from "react";
import { ScrollTrigger, useIdleGSAP, prefersReducedMotion } from "@/lib/gsap";

const rnd = (i: number, k: number) => {
  const s = Math.sin(i * 91.7 + k * 47.3) * 24634.6345;
  return s - Math.floor(s);
};

// A street of low Texas houses (gables and hips), deterministic so SSR and client match.
const HOUSES = (() => {
  const out: { x: number; w: number; h: number; rise: number; hip: number; ridge: number }[] = [];
  let x = -10;
  for (let i = 0; x < 1210; i++) {
    const w = 70 + Math.round(rnd(i, 1) * 70);
    const h = 22 + Math.round(rnd(i, 2) * 16);
    const rise = Math.min(w / 4, 14 + rnd(i, 3) * 14);
    const hip = rnd(i, 4) > 0.5 ? rise * 1.6 : 0;
    const ridge = 0.35 + rnd(i, 5) * 0.5;
    out.push({ x, w, h, rise, hip, ridge });
    x += w + 6 + Math.round(rnd(i, 6) * 18);
  }
  return out;
})();

/**
 * The neighbors behind the reviews: a quiet street along the bottom of the section whose
 * roofs are replaced one house at a time — new copper-toned roofs snap on as you scroll.
 */
export function Neighborhood() {
  const root = useRef<SVGSVGElement>(null);
  const [done, setDone] = useState(-1);

  useIdleGSAP(() => {
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setDone(HOUSES.length);
      return;
    }
    const st = ScrollTrigger.create({
      trigger: el.closest("section"),
      start: "top 55%",
      end: "bottom bottom",
      onUpdate: (self) => setDone(Math.floor(self.progress * (HOUSES.length + 0.99)) - 1),
    });
    setDone(Math.floor(st.progress * (HOUSES.length + 0.99)) - 1);
  }, root);

  return (
    <svg
      ref={root}
      aria-hidden
      viewBox="0 0 1200 90"
      preserveAspectRatio="xMidYMax slice"
      className="fx-desk pointer-events-none absolute inset-x-0 bottom-0 h-[64px] w-full md:h-[96px]"
    >
      <line x1="0" x2="1200" y1="89.5" y2="89.5" stroke="var(--stone)" strokeOpacity="0.12" />
      {HOUSES.map((hs, i) => {
        const base = 90;
        const top = base - hs.h;
        const peak = top - hs.rise;
        const { x, w } = hs;
        const roof = hs.hip
          ? `M${x - 4} ${top} L${x + hs.hip} ${peak} L${x + w - hs.hip} ${peak} L${x + w + 4} ${top} Z`
          : `M${x - 4} ${top} L${x + w * hs.ridge} ${peak} L${x + w + 4} ${top} Z`;
        const on = i <= done;
        return (
          <g key={i}>
            <rect x={x} y={top} width={w} height={hs.h} fill="var(--stone)" fillOpacity="0.045" />
            <rect x={x + w * 0.22} y={top + hs.h * 0.4} width="7" height="8" fill="var(--copper-2)" fillOpacity={on ? 0.5 : 0.08} className="transition-[fill-opacity] duration-700" />
            <path
              d={roof}
              fill={on ? "var(--copper)" : "var(--stone)"}
              fillOpacity={on ? 0.6 : 0.1}
              className={on ? "roof-snap" : undefined}
              style={{ transition: "fill 500ms, fill-opacity 500ms" }}
            />
          </g>
        );
      })}
    </svg>
  );
}
