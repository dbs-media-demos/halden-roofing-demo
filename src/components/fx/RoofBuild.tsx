"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { isPhone } from "@/lib/gsap";

/** The self-installing roof over the stats (see roofBuildScene). Desktop only: its own chunk, so phones never fetch it. */
export function RoofBuild({ className }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    const box = wrap.current;
    if (!cv || !box || isPhone()) return;
    let dead = false;
    let stop: void | (() => void);
    import("./roofBuildScene").then(({ startRoofBuild }) => {
      if (!dead) stop = startRoofBuild(cv, box, label.current);
    });
    return () => {
      dead = true;
      stop?.();
    };
  }, []);

  return (
    <div ref={wrap} className={clsx("fx-desk relative", className)}>
      <p aria-hidden className="t-spec mb-3 flex justify-between gap-4 text-muted">
        <span>
          Laid by hand<span className="max-sm:hidden"> · 6 nails a shingle</span>
        </span>
        <span ref={label} className="whitespace-nowrap text-accent-text">
          Course 00/10
        </span>
      </p>
      <canvas ref={canvas} aria-hidden className="block h-[clamp(84px,12.5vw,190px)] w-full touch-pan-y" />
    </div>
  );
}
