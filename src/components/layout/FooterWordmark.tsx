"use client";

import { useRef } from "react";
import { gsap, useIdleGSAP, prefersReducedMotion } from "@/lib/gsap";

/** Giant outlined HALDEN that fills with copper, letter by letter, as the footer arrives. */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);

  useIdleGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const letters = el.querySelectorAll("[data-l]");
      gsap.fromTo(
        letters,
        { yPercent: 40, "--fill": "0%" },
        {
          yPercent: 0,
          "--fill": "100%",
          stagger: 0.06,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: 0.8 },
        },
      );
    },
    ref,
  );

  return (
    <div ref={ref} aria-hidden className="wrap mt-16 select-none overflow-hidden">
      <div className="flex justify-between font-display text-[19.5vw] font-black leading-[0.8] tracking-[-0.06em] md:text-[18.5vw]">
        {"HALDEN".split("").map((l, i) => (
          <span
            key={i}
            data-l
            className="inline-block bg-clip-text text-transparent [-webkit-text-stroke:1px_var(--line)]"
            style={{
              backgroundImage: "linear-gradient(to top, var(--copper) var(--fill, 100%), transparent var(--fill, 100%))",
            }}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
