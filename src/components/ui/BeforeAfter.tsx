"use client";

import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import clsx from "clsx";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type Props = {
  before: StaticImageData;
  after: StaticImageData;
  beforeAlt: string;
  afterAlt: string;
  className?: string;
  sizes?: string;
  label?: string;
};

/**
 * Signature #4 — storm-damaged vs. new, drag to compare.
 * Pointer, touch and keyboard (←/→, Home/End, PageUp/PageDown). Nudges itself once on first view.
 */
export function BeforeAfter({ before, after, beforeAlt, afterAlt, className, sizes = "(min-width: 1024px) 60vw, 100vw", label = "Before and after comparison" }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const posRef = useRef(50);

  const set = useCallback((v: number) => {
    const c = Math.max(0, Math.min(100, v));
    posRef.current = c;
    setPos(c);
  }, []);

  const fromPointer = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    set(((clientX - r.left) / r.width) * 100);
  };

  const onDown = (e: PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    fromPointer(e.clientX);
  };
  const onMove = (e: PointerEvent) => dragging && fromPointer(e.clientX);
  const onUp = () => setDragging(false);

  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, number> = { ArrowLeft: -2, ArrowRight: 2, PageDown: -10, PageUp: 10 };
    if (e.key in map) {
      e.preventDefault();
      set(posRef.current + map[e.key]);
    } else if (e.key === "Home") {
      e.preventDefault();
      set(0);
    } else if (e.key === "End") {
      e.preventDefault();
      set(100);
    }
  };

  // One-time nudge so people notice it moves.
  useEffect(() => {
    const el = box.current;
    if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const o = { v: 50 };
        gsap
          .timeline({ delay: 0.3 })
          .to(o, { v: 28, duration: 0.9, ease: "power2.inOut", onUpdate: () => set(o.v) })
          .to(o, { v: 68, duration: 1.1, ease: "power2.inOut", onUpdate: () => set(o.v) })
          .to(o, { v: 50, duration: 0.8, ease: "power2.inOut", onUpdate: () => set(o.v) });
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [set]);

  return (
    <div
      ref={box}
      data-cursor="drag"
      className={clsx("relative select-none overflow-hidden bg-slate touch-pan-y", className)}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <Image src={after} alt={afterAlt} fill sizes={sizes} className="pointer-events-none object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src={before} alt={beforeAlt} fill sizes={sizes} className="pointer-events-none object-cover" draggable={false} />
        <div className="absolute inset-0 bg-ink/10" />
      </div>

      <span className="t-eyebrow pointer-events-none absolute left-4 top-4 rounded-full bg-ink/75 px-3 py-1.5 text-stone backdrop-blur">Before</span>
      <span className="t-eyebrow pointer-events-none absolute right-4 top-4 rounded-full bg-copper px-3 py-1.5 text-ink">After</span>

      {/* Divider + gable handle */}
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 -left-px w-0.5 bg-stone shadow-[0_0_12px_rgba(0,0,0,.4)]" />
        <div
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          aria-valuetext={`${Math.round(pos)}% before`}
          onKeyDown={onKey}
          className="pointer-events-auto absolute left-0 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center"
        >
          <svg viewBox="0 0 64 64" className={clsx("h-14 w-14 drop-shadow-lg transition-transform duration-300", dragging && "scale-110")} aria-hidden>
            <rect x="40" y="20" width="6" height="14" fill="var(--copper)" stroke="var(--ink)" strokeWidth="1.5" />
            <path d="M8 40 L32 22 L56 40 V52 H8 Z" fill="var(--stone)" stroke="var(--ink)" strokeWidth="2" />
            <path d="M22 38 l-6 5 6 5 M42 38 l6 5 -6 5" fill="none" stroke="var(--ink)" strokeWidth="2.4" />
          </svg>
        </div>
      </div>
    </div>
  );
}
