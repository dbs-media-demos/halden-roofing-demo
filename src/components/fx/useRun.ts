"use client";

import { useEffect, type RefObject } from "react";

/** Sets data-run="1" while the element is on screen, "0" off it — CSS loops inside pause (see .fx-loop). */
export function useRun(ref: RefObject<Element | null>, onChange?: (on: boolean) => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute("data-run", "0");
    const io = new IntersectionObserver(([e]) => {
      el.setAttribute("data-run", e.isIntersecting ? "1" : "0");
      onChange?.(e.isIntersecting);
    });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}
