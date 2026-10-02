"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { photos } from "@/lib/photos";
import { useBiz } from "@/components/preview/BizContext";
import { telOf } from "@/lib/biz-core";
import { Button, PhoneIcon } from "@/components/ui/Button";
import { OpenBadge } from "@/components/ui/OpenBadge";

/**
 * Signature #1 — the roofline hero.
 * The drone film sits inside a house-shaped window (true 6/12 pitch). The window
 * opens from a CSS-only intro (LCP-safe), then scroll widens it to full-bleed while
 * the headline splits apart like two roof slopes.
 */
export function Hero() {
  const biz = useBiz();
  const root = useRef<HTMLElement>(null);
  const win = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  // Load the film only after the page is idle, never on reduced motion / save-data.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (prefersReducedMotion() || conn?.saveData) return;
    const start = () => {
      v.src = "/video/hero-drone.mp4";
      v.load();
      v.play().catch(() => {});
    };
    // Phones: wait for the first scroll or touch so the poster stays the LCP and data isn't spent up front.
    // Desktop: start once the page is idle.
    const small = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    let started = false;
    const once = () => {
      if (started) return;
      started = true;
      start();
    };
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const id = small ? 0 : ric(once, { timeout: 2500 } as IdleRequestOptions);
    if (small) {
      window.addEventListener("scroll", once, { once: true, passive: true });
      window.addEventListener("touchstart", once, { once: true, passive: true });
    }
    const io = new IntersectionObserver(([e]) => {
      if (!v.src) return;
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", once);
      window.removeEventListener("touchstart", once);
      if (id && window.cancelIdleCallback) window.cancelIdleCallback(id);
    };
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });
      tl.to(win.current, { "--p": 1, duration: 1 }, 0)
        .to("[data-hero-dim]", { opacity: 0.15, duration: 1 }, 0)
        .to("[data-hero-left]", { xPercent: -18, opacity: 0, duration: 0.7 }, 0.05)
        .to("[data-hero-right]", { xPercent: 18, opacity: 0, duration: 0.7 }, 0.05)
        .to("[data-hero-fade]", { opacity: 0, y: -30, duration: 0.4 }, 0)
        .fromTo("[data-hero-caption]", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3 }, 0.72);
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="hero-title" className="theme-ink relative h-[175svh] motion-reduce:!h-[100svh] md:h-[210vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div ref={win} className="hero-window absolute inset-0 bg-slate">
          <Image
            src={photos["poster-hero-drone"]}
            alt="Drone view over a Fort Worth-area street of brick homes with new shingle roofs at golden hour"
            fill
            preload
            decoding="sync"
            sizes="100vw"
            quality={60}
            className="object-cover"
          />
          <video
            ref={video}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-1000"
            onPlaying={(e) => (e.currentTarget.style.opacity = "1")}
          />
          <div data-hero-dim className="absolute inset-0 bg-ink/45" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/80 to-transparent" />
        </div>

        <div className="wrap relative z-10 flex h-full flex-col pb-7 pt-[calc(var(--header-h)+3.5rem)] md:pb-9">
          <div data-hero-fade>
          <div className="anim-fade flex items-start justify-between gap-6">
            <p className="t-eyebrow text-muted">
              {biz.preview ? (
                [biz.address.city || biz.area, biz.address.region].filter(Boolean).join(", ")
              ) : (
                <>
                  Fort Worth, TX <span className="text-copper">/</span> Est. 1998
                </>
              )}
            </p>
            <div className="hidden flex-col items-end gap-2 md:flex">
              <OpenBadge className="text-muted" />
              {biz.rating && (
                <p className="t-eyebrow text-muted">
                  <span className="text-copper-2">★★★★★</span> {biz.rating.value} · {biz.rating.count} Google reviews
                </p>
              )}
            </div>
          </div>
          </div>

          <h1 id="hero-title" className="t-mega mt-auto text-stone">
            <span data-hero-left className="block">
              <span className="anim-heading block" style={{ "--d": "0.15s" } as React.CSSProperties}>
                Built for
              </span>
            </span>
            <span data-hero-right className="block">
              <span className="anim-heading block text-right md:pr-[4vw]" style={{ "--d": "0.3s" } as React.CSSProperties}>
                the next <span className="text-copper">storm.</span>
              </span>
            </span>
          </h1>

          <div data-hero-fade className="mt-8 md:mt-10">
          <div className="anim-fade grid gap-6 md:grid-cols-[1fr_auto] md:items-end" style={{ "--d": "0.5s" } as React.CSSProperties}>
            <p className="t-lead max-w-xl text-stone/85">
              Family-owned Fort Worth roofers. Free inspections with a photo report, honest help with your insurance claim,
              and a new roof in one or two days.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href="/free-inspection" size="lg">
                Book a free inspection
              </Button>
              <span className="hidden sm:block">
                {biz.phone && (
                  <Button href={telOf(biz)!} variant="ghost" size="lg" icon={<PhoneIcon className="text-copper" />}>
                    {biz.phoneDisplay}
                  </Button>
                )}
              </span>
            </div>
          </div>
          </div>
        </div>

        <p
          data-hero-caption
          aria-hidden
          className="t-eyebrow pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-stone/80 opacity-0"
        >
          4,800 roofs and counting — Tarrant County
        </p>
      </div>
    </section>
  );
}
