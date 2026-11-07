"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import { gsap, ScrollTrigger, loadGsap, prefersReducedMotion, isCoarse, isPhone } from "@/lib/gsap";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Lenis smooth scrolling driven by GSAP's ticker. Desktop only: phones never download it. Off for reduced motion. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion() || isCoarse() || isPhone()) return;
    let dead = false;
    let stop: (() => void) | undefined;
    Promise.all([import("lenis"), loadGsap()]).then(([{ default: LenisClass }]) => {
      if (dead) return;
      const lenis = new LenisClass({ lerp: 0.1, wheelMultiplier: 1, anchors: { offset: -90 } });
      window.__lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      stop = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        delete window.__lenis;
      };
    });
    return () => {
      dead = true;
      stop?.();
    };
  }, []);

  // New page: re-measure every trigger once the new layout settles.
  useEffect(() => {
    if (isPhone()) return;
    window.__lenis?.resize();
    const id = window.setTimeout(() => ScrollTrigger?.refresh(), 350);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
