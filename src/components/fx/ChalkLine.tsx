"use client";

import { useRef } from "react";
import { gsap, useIdleGSAP, prefersReducedMotion, belowFold } from "@/lib/gsap";

const DUST = [0.12, 0.27, 0.41, 0.55, 0.7, 0.86];

/**
 * A roofer's chalk line along the bottom of its (relative) parent: when it scrolls into view
 * it's pulled out sagging, snaps taut with a twang and leaves a puff of red chalk dust.
 */
export function ChalkLine({ delay = 0 }: { delay?: number }) {
  const root = useRef<HTMLSpanElement>(null);

  useIdleGSAP(() => {
    const el = root.current;
    const path = el?.querySelector("path");
    if (!el || !path || prefersReducedMotion() || !belowFold(el)) return;
    const dust = el.querySelectorAll<HTMLElement>("[data-dust]");
    const s = { len: 0, sag: 9 };
    const draw = () => path.setAttribute("d", `M0 6 Q ${s.len * 500} ${6 + s.sag} ${s.len * 1000} 6`);
    draw();
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        gsap
          .timeline({ delay: 0.25 + delay, onUpdate: draw })
          .to(s, { len: 1, duration: 0.55, ease: "power2.out" })
          .to(s, { sag: 0, duration: 0.9, ease: "elastic.out(1.4, 0.18)" }, ">-0.05")
          .fromTo(
            dust,
            { opacity: 0.9, y: 0, scale: 0.6 },
            { opacity: 0, y: () => -6 - Math.random() * 10, x: () => (Math.random() - 0.5) * 14, scale: 1.6, duration: 1.1, stagger: 0.02, ease: "power2.out" },
            "<",
          );
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, root);

  return (
    <span ref={root} aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-[6px] h-3">
      <svg viewBox="0 0 1000 12" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
        <path d="M0 6 Q 500 6 1000 6" fill="none" stroke="#b5482e" strokeOpacity="0.6" strokeWidth="1.5" strokeDasharray="5 2.5" vectorEffect="non-scaling-stroke" />
      </svg>
      {DUST.map((x) => (
        <span key={x} data-dust className="absolute top-1/2 h-1.5 w-1.5 rounded-full bg-[#c4604a]/45 opacity-0 blur-[1px]" style={{ left: `${x * 100}%` }} />
      ))}
    </span>
  );
}
