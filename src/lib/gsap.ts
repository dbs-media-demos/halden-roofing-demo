"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  gsap.defaults({ ease: "expo.out", duration: 1.1 });
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isCoarse = () => typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches;

/** Element starts below the fold → safe to hide it for a JS reveal. */
export const belowFold = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.92;

export { gsap, ScrollTrigger, useGSAP };

/** SplitText is only needed once a headline scrolls into view — load it on demand. */
export const loadSplitText = () =>
  import("gsap/SplitText").then(({ SplitText }) => {
    gsap.registerPlugin(SplitText);
    return SplitText;
  });

/**
 * useGSAP, but the setup runs when the browser is idle — keeps below-the-fold
 * animation wiring off the critical path (lower TBT). Tweens stay in the
 * useGSAP context, so they're reverted on unmount.
 */
export function useIdleGSAP(setup: () => void | (() => void), scope: React.RefObject<Element | null>) {
  useGSAP(
    (_, contextSafe) => {
      let cleanup: void | (() => void);
      const run = contextSafe!(() => {
        cleanup = setup();
      });
      const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 250));
      const cancel = window.cancelIdleCallback ?? window.clearTimeout;
      const id = ric(run, { timeout: 1200 });
      return () => {
        cancel(id);
        cleanup?.();
      };
    },
    { scope },
  );
}
