"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { services } from "@/content/services";
import { photos } from "@/lib/photos";
import { SplitReveal, Reveal } from "@/components/ui/Reveal";
import { ScrollTrigger, useIdleGSAP, prefersReducedMotion } from "@/lib/gsap";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Big numbered service rows; on desktop a gable-framed photo follows the cursor.
 * An inspection laser rides down the list with the scroll: the row under it lights up,
 * the band it has just passed glows thermal copper, every row it clears is ticked off,
 * and clearing the last one stamps the roof check complete.
 */
export function ServicesList({ heading = "Everything overhead.", headingAs = "h2" }: { heading?: string; headingAs?: "h1" | "h2" }) {
  const section = useRef<HTMLElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const beam = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  // -1 = the laser hasn't reached the list yet, services.length = every row inspected
  const [scan, setScan] = useState(-1);

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

  useIdleGSAP(() => {
    const ul = list.current;
    const b = beam.current;
    const g = glow.current;
    if (!ul || !b || !g || prefersReducedMotion()) return;
    let bottoms: number[] = [];
    let height = 0;
    let last = -2;
    const measure = () => {
      height = ul.offsetHeight;
      bottoms = Array.from(ul.children as HTMLCollectionOf<HTMLElement>, (li) => li.offsetTop + li.offsetHeight);
    };
    const update = (progress: number) => {
      const y = progress * height;
      b.style.transform = `translate3d(0, ${y}px, 0)`;
      g.style.transform = `translate3d(0, ${y}px, 0) translateY(-100%)`;
      const i = progress <= 0 ? -1 : progress >= 1 ? bottoms.length : bottoms.findIndex((bottom) => y < bottom);
      if (i !== last) {
        last = i;
        setScan(i);
      }
    };
    measure();
    const st = ScrollTrigger.create({
      trigger: ul,
      start: "top 62%",
      end: "bottom 62%",
      onRefresh: (self) => {
        measure();
        update(self.progress);
      },
      onUpdate: (self) => update(self.progress),
    });
    update(st.progress);
  }, list);

  return (
    <section ref={section} aria-labelledby="services-title" className="theme-ink relative isolate overflow-hidden py-24 md:py-36">
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

        <div className="relative mt-16">
          <ul ref={list} className="border-t border-line" onMouseLeave={() => setHover(null)}>
            {services.map((s, i) => {
              const active = i === scan;
              const done = i < scan;
              return (
                <li key={s.slug} onMouseEnter={() => setHover(i)} className="border-b border-line">
                  <Link
                    href={`/services/${s.slug}`}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-6 md:grid-cols-[4rem_1.2fr_1fr_auto] md:gap-8 md:py-8"
                  >
                    <span className="relative">
                      <span
                        className={clsx(
                          "t-eyebrow block transition-[color,opacity] duration-500 group-hover:text-copper-2",
                          active ? "text-copper-2" : "text-faint",
                          done && "opacity-0",
                        )}
                      >
                        0{i + 1}
                      </span>
                      <svg
                        aria-hidden
                        viewBox="0 0 20 20"
                        className={clsx(
                          "absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-copper-2 transition-[opacity,scale] duration-500 ease-[var(--ease-out-expo)]",
                          done ? "scale-100 opacity-100" : "scale-50 opacity-0",
                        )}
                      >
                        <path d="M3 10.5 L8 15 L17 5" fill="none" stroke="currentColor" strokeWidth="2.4" />
                      </svg>
                    </span>
                    <span
                      className={clsx(
                        "font-display text-[clamp(1.5rem,3.6vw,3.6rem)] font-extrabold uppercase leading-none tracking-[-0.04em] transition-transform duration-700 ease-[var(--ease-out-expo)] md:group-hover:translate-x-4",
                        active && "translate-x-2 md:translate-x-4",
                      )}
                    >
                      {s.title}
                    </span>
                    <span className={clsx("hidden transition-colors duration-500 md:block", active ? "text-stone" : "text-muted")}>{s.tagline}</span>
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden md:hidden">
                      <Image src={photos[s.hero]} alt="" fill sizes="56px" className="gable-frame object-cover" />
                    </span>
                    <span
                      aria-hidden
                      className={clsx(
                        "hidden h-12 w-12 place-items-center rounded-full border transition-[background-color,border-color,color] duration-500 group-hover:border-copper group-hover:bg-copper group-hover:text-ink md:grid",
                        active ? "border-copper text-copper-2" : "border-line",
                      )}
                    >
                      <svg viewBox="0 0 20 20" className="h-4 w-4 rotate-90">
                        <path d="M3 13 L10 6.5 L17 13" fill="none" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* inspection laser (scroll-driven). The thermal glow sits outside the beam's stacking context so it can blend with the type. */}
          <div
            ref={glow}
            aria-hidden
            className={clsx(
              "scan-glow pointer-events-none absolute inset-x-0 top-0 h-24 transition-opacity duration-500 md:h-36",
              scan >= 0 && scan < services.length ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            ref={beam}
            aria-hidden
            className={clsx(
              "pointer-events-none absolute inset-x-0 top-0 z-[1] h-0 transition-opacity duration-500 will-change-transform",
              scan >= 0 && scan < services.length ? "opacity-100" : "opacity-0",
            )}
          >
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-copper/15 to-transparent md:h-24" />
            <div className="absolute inset-x-0 top-0 h-px bg-copper-2 shadow-[0_0_14px_2px_rgba(217,138,82,0.55)]" />
            <div className="absolute inset-x-0 -top-px h-[3px] overflow-hidden">
              <div className="scan-spark h-full w-full" />
            </div>
            <p className="t-spec absolute right-0 top-2 flex items-center gap-2 rounded-full bg-ink/85 px-2.5 py-1 text-[0.68rem] text-copper-2">
              <span className="h-1.5 w-1.5 rounded-full bg-copper-2" />
              Inspecting {pad(Math.min(Math.max(scan, 0) + 1, services.length))}/{pad(services.length)}
            </p>
          </div>
        </div>

        <p
          aria-hidden
          className={clsx(
            "t-spec mt-5 flex justify-between gap-4 text-[0.72rem] text-muted transition-[opacity,translate] duration-700 ease-[var(--ease-out-expo)]",
            scan >= services.length ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          )}
        >
          <span>Roof check complete</span>
          <span className="text-copper-2">
            {pad(services.length)}/{pad(services.length)} ✓ Photo report ready
          </span>
        </p>
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
