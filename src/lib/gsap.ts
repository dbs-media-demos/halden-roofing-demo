"use client";

import { useEffect } from "react";

/** Same test as the phone block in globals.css: below 768 px or a touch screen. */
export const PHONE_QUERY = "(max-width: 767px), (pointer: coarse)";

export const isPhone = () => typeof window !== "undefined" && window.matchMedia(PHONE_QUERY).matches;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isCoarse = () => typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches;

/** Element starts below the fold → safe to hide it for a JS reveal. */
export const belowFold = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.92;

/**
 * GSAP is desktop-only and arrives in its own chunk, so phones never download it.
 * These live bindings are filled in by loadGsap(); only touch them inside useIdleGSAP or after loadGsap().
 */
export let gsap: typeof import("gsap").gsap;
export let ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;

let loading: Promise<void> | undefined;
export const loadGsap = () =>
  (loading ??= import("./gsap-core").then((m) => {
    gsap = m.gsap;
    ScrollTrigger = m.ScrollTrigger;
  }));

if (typeof window !== "undefined" && !isPhone()) loadGsap();

/** SplitText is only needed once a headline scrolls into view — load it on demand. */
export const loadSplitText = () =>
  import("gsap/SplitText").then(({ SplitText }) => {
    gsap.registerPlugin(SplitText);
    return SplitText;
  });

/**
 * Desktop animation wiring: runs once GSAP has loaded and the browser is idle (lower TBT), or as
 * soon as it has loaded with `immediate`. Tweens stay in a gsap.context, so they're reverted on
 * unmount. Phones skip it entirely: they get the static, stacked page.
 */
export function useIdleGSAP(setup: () => void | (() => void), scope: React.RefObject<Element | null>, { immediate = false } = {}) {
  useEffect(() => {
    if (isPhone()) return;
    let dead = false;
    let idle: number | undefined;
    let cleanup: void | (() => void);
    let ctx: { revert: () => void } | undefined;
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 250));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const run = () => {
      ctx = gsap.context(() => {
        cleanup = setup();
      }, scope.current ?? undefined);
    };
    loadGsap().then(() => {
      if (dead) return;
      if (immediate) run();
      else idle = ric(run, { timeout: 1200 });
    });
    return () => {
      dead = true;
      if (idle !== undefined) cancel(idle);
      cleanup?.();
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
