"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { services } from "@/content/services";
import { photos } from "@/lib/photos";
import { SplitReveal, Reveal } from "@/components/ui/Reveal";

/** Big numbered service rows; on desktop a gable-framed photo follows the cursor. */
export function ServicesList({ heading = "Everything overhead.", headingAs = "h2" }: { heading?: string; headingAs?: "h1" | "h2" }) {
  const section = useRef<HTMLElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const sec = section.current;
    const f = float.current;
    if (!sec || !f || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let x = 0,
      y = 0,
      cx = 0,
      cy = 0,
      raf = 0;
    const move = (e: PointerEvent) => {
      const r = sec.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
    };
    const loop = () => {
      cx += (x - cx) * 0.14;
      cy += (y - cy) * 0.14;
      const tilt = (x - cx) * 0.05;
      f.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -55%) rotate(${Math.max(-8, Math.min(8, tilt))}deg)`;
      raf = requestAnimationFrame(loop);
    };
    sec.addEventListener("pointermove", move);
    raf = requestAnimationFrame(loop);
    return () => {
      sec.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={section} aria-labelledby="services-title" className="theme-ink relative overflow-hidden py-24 md:py-36">
      <div className="wrap">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="t-eyebrow text-accent">What we do</p>
            <SplitReveal as={headingAs} id="services-title" className="t-h2 mt-5">
              {heading}
            </SplitReveal>
          </div>
          <Reveal className="md:col-span-5">
            <p className="t-lead text-muted">
              Seven services, one crew, one warranty. From a single missing shingle to a 60,000 sq ft warehouse.
            </p>
          </Reveal>
        </div>

        <ul className="mt-16 border-t border-line" onMouseLeave={() => setHover(null)}>
          {services.map((s, i) => (
            <li key={s.slug} onMouseEnter={() => setHover(i)} className="border-b border-line">
              <Link
                href={`/services/${s.slug}`}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-6 md:grid-cols-[4rem_1.2fr_1fr_auto] md:gap-8 md:py-8"
              >
                <span className="t-eyebrow text-faint transition-colors group-hover:text-copper-2">0{i + 1}</span>
                <span className="font-display text-[clamp(1.5rem,3.6vw,3.6rem)] font-extrabold uppercase leading-none tracking-[-0.04em] transition-transform duration-700 ease-[var(--ease-out-expo)] md:group-hover:translate-x-4">
                  {s.title}
                </span>
                <span className="hidden text-muted md:block">{s.tagline}</span>
                <span className="relative h-14 w-14 shrink-0 overflow-hidden md:hidden">
                  <Image src={photos[s.hero]} alt="" fill sizes="56px" className="gable-frame object-cover" />
                </span>
                <span
                  aria-hidden
                  className="hidden h-12 w-12 place-items-center rounded-full border border-line transition-[background-color,border-color,color] duration-500 group-hover:border-copper group-hover:bg-copper group-hover:text-ink md:grid"
                >
                  <svg viewBox="0 0 20 20" className="h-4 w-4 rotate-90">
                    <path d="M3 13 L10 6.5 L17 13" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* cursor-follow preview (desktop only) */}
      <div
        ref={float}
        aria-hidden
        className={clsx(
          "pointer-events-none absolute left-0 top-0 z-10 hidden h-[300px] w-[240px] transition-opacity duration-500 [@media(hover:hover)_and_(pointer:fine)]:block",
          hover === null ? "opacity-0" : "opacity-100",
        )}
      >
        <div className="gable-frame relative h-full w-full overflow-hidden bg-slate" style={{ "--g": "24%" } as React.CSSProperties}>
          {services.map((s, i) => (
            <Image
              key={s.slug}
              src={photos[s.hero]}
              alt=""
              fill
              sizes="240px"
              className={clsx(
                "object-cover transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)]",
                hover === i ? "scale-100 opacity-100" : "scale-110 opacity-0",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
