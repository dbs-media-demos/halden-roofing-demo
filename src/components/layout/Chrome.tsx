"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { PhoneIcon } from "@/components/ui/Button";
import { agencyName, agencyUrl } from "@/lib/site";
import { useBiz } from "@/components/preview/BizContext";
import { telOf } from "@/lib/biz-core";
import { useDismissed } from "@/lib/session-flag";

/** Sticky Call + Free inspection bar on phones. */
export function MobileBar() {
  const biz = useBiz();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 280);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={clsx(
        "fixed inset-x-0 bottom-0 z-[70] border-t border-stone/10 bg-ink/90 px-3 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] pt-2.5 backdrop-blur-xl transition-transform duration-500 ease-[var(--ease-out-expo)] md:hidden",
        show ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="grid grid-cols-[auto_1fr] gap-2">
        <a
          href={telOf(biz)}
          className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-stone/20 px-5 font-semibold text-stone"
          aria-label={`Call ${biz.phoneDisplay}`}
        >
          <PhoneIcon className="text-copper" />
          Call
        </a>
        <Link href="/free-inspection" className="flex min-h-12 items-center justify-center rounded-full bg-copper px-5 font-semibold text-ink">
          Book a free inspection
        </Link>
      </div>
    </div>
  );
}

/** "Concept site by Scale by Noon" pill — tasteful, dismissible. */
export function DemoPill() {
  const biz = useBiz();
  const [dismissed, dismiss] = useDismissed("agency-demo-pill");
  const [shown, setShown] = useState(false);
  useEffect(() => {
    // Appear once the visitor starts scrolling, so it never sits on top of the hero copy.
    const onScroll = () => window.scrollY > window.innerHeight * 0.6 && setShown(true);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  if (dismissed) return null;
  return (
    <div
      className={clsx(
        "fixed bottom-[5.6rem] left-3 z-[75] flex items-center rounded-full border border-stone/15 bg-ink/85 text-stone shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md transition-[opacity,translate] duration-700 ease-[var(--ease-out-expo)] md:bottom-4 md:left-4",
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0 focus-within:pointer-events-auto focus-within:translate-y-0 focus-within:opacity-100",
      )}
    >
      <a href={agencyUrl} target="_blank" rel="noopener" className="flex min-h-10 items-center gap-2 py-2 pl-4 pr-2 text-[0.78rem] font-medium">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-copper" />
        {biz.preview ? (
          <span className="inline-block max-w-[15rem] truncate align-bottom sm:max-w-none">
            Preview for {biz.shortName} · by {agencyName} ↗
          </span>
        ) : (
          <>Concept site by {agencyName} ↗</>
        )}
      </a>
      <button
        type="button"
        aria-label="Dismiss concept site notice"
        onClick={dismiss}
        className="mr-1 grid h-9 w-9 place-items-center rounded-full text-stone/60 hover:bg-stone/10 hover:text-stone"
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </button>
    </div>
  );
}

/** Desktop cursor: a small copper roof chevron that lifts over links. */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    let x = -100,
      y = -100,
      cx = -100,
      cy = -100,
      raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as HTMLElement | null;
      const interactive = !!t?.closest("a, button, [role=slider], input, select, textarea, label");
      el.dataset.hover = interactive ? "1" : "0";
      el.dataset.drag = t?.closest("[data-cursor=drag]") ? "1" : "0";
      el.style.opacity = "1";
    };
    const loop = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const leave = () => (el.style.opacity = "0");
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="cursor pointer-events-none fixed left-0 top-0 z-[200] hidden opacity-0 mix-blend-difference [@media(hover:hover)_and_(pointer:fine)]:block">
      <div className="cursor-inner">
        <svg viewBox="0 0 24 14" className="cursor-chev">
          <path d="M2 12 L12 3 L22 12" fill="none" stroke="#f2eee7" strokeWidth="2.4" />
        </svg>
        <span className="cursor-drag t-eyebrow">Drag</span>
      </div>
    </div>
  );
}
