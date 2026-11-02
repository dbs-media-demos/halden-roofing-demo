"use client";

import { useRef, useState } from "react";
import { gsap, useIdleGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * Copper flashing along a .gable-top section's roofline: as the section scrolls in it's run
 * from the peak down both slopes, then a glint of light slides down to the eaves now and then.
 * Must sit directly inside the .gable-top element (uses its --rise).
 */
export function RoofFlashing() {
  const root = useRef<SVGSVGElement>(null);
  const [glint, setGlint] = useState(false);

  useIdleGSAP(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    setGlint(true);
    gsap.fromTo(
      el,
      { clipPath: "inset(0 50% 0 50%)" },
      { clipPath: "inset(0 0% 0 0%)", ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "top 35%", scrub: 0.6 } },
    );
  }, root);

  return (
    <svg
      ref={root}
      aria-hidden
      viewBox="0 0 1000 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[var(--rise)] w-full overflow-visible"
    >
      <defs>
        {(["l", "r"] as const).map((side) => (
          <linearGradient key={side} id={`flash-glint-${side}`} gradientUnits="userSpaceOnUse" x1="-90" x2="90" y1="0" y2="0">
            <stop offset="0" stopColor="#ffe2c8" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff4ea" stopOpacity="1" />
            <stop offset="1" stopColor="#ffe2c8" stopOpacity="0" />
            {glint && (
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                values={side === "l" ? "500 0; -100 0; -100 0" : "500 0; 1100 0; 1100 0"}
                keyTimes="0; 0.4; 1"
                dur="6s"
                begin="1.5s"
                repeatCount="indefinite"
              />
            )}
          </linearGradient>
        ))}
      </defs>
      <polyline points="0,101 500,1 1000,101" fill="none" stroke="var(--copper)" strokeWidth="5" vectorEffect="non-scaling-stroke" />
      {glint && (
        <>
          <polyline points="500,1 0,101" fill="none" stroke="url(#flash-glint-l)" strokeWidth="5" vectorEffect="non-scaling-stroke" />
          <polyline points="500,1 1000,101" fill="none" stroke="url(#flash-glint-r)" strokeWidth="5" vectorEffect="non-scaling-stroke" />
        </>
      )}
    </svg>
  );
}
