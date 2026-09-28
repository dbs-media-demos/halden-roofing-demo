"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion, isCoarse } from "@/lib/gsap";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Lenis smooth scrolling driven by GSAP's ticker. Off on touch and for reduced motion. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion() || isCoarse()) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: { offset: -90 } });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  // New page: re-measure every trigger once the new layout settles.
  useEffect(() => {
    window.__lenis?.resize();
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 350);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
