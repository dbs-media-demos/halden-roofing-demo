"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { ScrollTrigger, useIdleGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useRun } from "@/components/fx/useRun";

const pipe = { borderColor: "color-mix(in oklab, var(--fg) 28%, transparent)" };

/**
 * A gutter along the top of its parent and a downspout down its right side.
 * Scrolling fills the gutter with flowing water, then the downspout, then it drips;
 * scrolling back drains it. Reduced motion: an empty gutter.
 */
export function Gutter() {
  const root = useRef<HTMLDivElement>(null);
  const run = useRef<HTMLSpanElement>(null);
  const fall = useRef<HTMLSpanElement>(null);
  const [dripping, setDripping] = useState(false);
  useRun(root);

  useIdleGSAP(() => {
    const el = root.current;
    const r = run.current;
    const f = fall.current;
    if (!el || !r || !f || prefersReducedMotion()) return;
    const clamp = (n: number) => Math.min(1, Math.max(0, n));
    let wasFull = false;
    const update = (p: number) => {
      r.style.transform = `scaleX(${clamp(p / 0.4)})`;
      f.style.transform = `scaleY(${clamp((p - 0.4) / 0.55)})`;
      const full = p > 0.97;
      if (full !== wasFull) {
        wasFull = full;
        setDripping(full);
      }
    };
    const st = ScrollTrigger.create({
      trigger: el.parentElement,
      start: "top 80%",
      end: "bottom 55%",
      onUpdate: (self) => update(self.progress),
    });
    update(st.progress);
  }, root);

  return (
    <div ref={root} aria-hidden className="fx-desk pointer-events-none absolute inset-0">
      {/* gutter trough */}
      <span className="absolute -right-[13px] -top-[9px] left-0 h-[9px] overflow-hidden rounded-b-[5px] border-x border-b p-px" style={pipe}>
        <span ref={run} className="gutter-water fx-loop block h-full w-full origin-left rounded-b-[4px]" style={{ transform: "scaleX(0)" }} />
      </span>
      {/* downspout */}
      <span className="absolute -right-[13px] bottom-6 top-0 w-[7px] rounded-b-[2px] border-x border-b p-px" style={pipe}>
        <span ref={fall} data-dir="down" className="gutter-water fx-loop block h-full w-full origin-top" style={{ transform: "scaleY(0)" }} />
        <span className={clsx("transition-opacity duration-500", dripping ? "opacity-100" : "opacity-0")}>
          <span className="gutter-drip fx-loop" />
          <span className="gutter-drip fx-loop" style={{ "--d": "0.55s" } as React.CSSProperties} />
        </span>
      </span>
    </div>
  );
}
