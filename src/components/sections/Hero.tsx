"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef } from "react";
import clsx from "clsx";
import { gsap, useIdleGSAP, prefersReducedMotion, isPhone } from "@/lib/gsap";
import poster from "@/assets/photos/poster-hero-drone.jpg";
import heroPhone from "@/assets/photos/hero-phone.jpg";
import { useBiz } from "@/components/preview/BizContext";
import { telOf } from "@/lib/biz-core";
import { Button, PhoneIcon } from "@/components/ui/Button";
import { OpenBadge } from "@/components/ui/OpenBadge";

/**
 * Signature #1 — the roofline hero.
 * The drone film sits inside a house-shaped window (true 6/12 pitch). The window
 * opens from a CSS-only intro (LCP-safe), then scroll widens it to full-bleed while
 * the headline splits apart like two roof slopes.
 * Phones get none of that: a sharp still under the same gable, the service and town in the
 * headline, rating, and a Call button with the number, all there on first paint.
 */
export function Hero() {
  const biz = useBiz();
  const root = useRef<HTMLElement>(null);
  const win = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  // Load the film only after the page is idle, never on phones / reduced motion / save-data.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (prefersReducedMotion() || conn?.saveData || isPhone()) return;
    const start = () => {
      v.src = "/video/hero-drone.mp4";
      v.load();
      v.play().catch(() => {});
    };
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const id = ric(start, { timeout: 2500 } as IdleRequestOptions);
    const io = new IntersectionObserver(([e]) => {
      if (!v.src) return;
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => {
      io.disconnect();
      if (id && window.cancelIdleCallback) window.cancelIdleCallback(id);
    };
  }, []);

  useIdleGSAP(
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
    root,
    { immediate: true },
  );

  const alt = biz.preview ? "A home with a new roof at golden hour" : "A Fort Worth-area home with a new roof at golden hour";
  const {
    props: { srcSet: deskSet, ...img },
  } = getImageProps({ src: poster, alt, fill: true, sizes: "100vw", quality: 60, loading: "eager", fetchPriority: "high", decoding: "sync", className: "object-cover" });
  const {
    props: { srcSet: phoneSet },
  } = getImageProps({ src: heroPhone, alt, fill: true, sizes: "100vw", quality: 60 });
  const tel = telOf(biz);

  return (
    <section ref={root} aria-labelledby="hero-title" className="hero-root theme-ink relative h-[175svh] motion-reduce:!h-[100svh] md:h-[210vh]">
      <link rel="preload" as="image" imageSrcSet={phoneSet} imageSizes="100vw" media="(max-width: 767px)" fetchPriority="high" />
      <link rel="preload" as="image" imageSrcSet={deskSet} imageSizes="100vw" media="(min-width: 768px)" fetchPriority="high" />
      <div className="hero-stage sticky top-0 h-[100svh] overflow-hidden">
        <div ref={win} className="hero-window absolute inset-0 bg-slate">
          <picture>
            <source media="(max-width: 767px)" srcSet={phoneSet} sizes="100vw" />
            {/* eslint-disable-next-line jsx-a11y/alt-text -- getImageProps art direction: alt is in the spread */}
            <img {...img} srcSet={deskSet} />
          </picture>
          <video
            ref={video}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden
            className="ph-hide absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-1000"
            onPlaying={(e) => (e.currentTarget.style.opacity = "1")}
          />
          <div data-hero-dim className="absolute inset-0 bg-ink/45" />
          <div className="hero-shade absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/80 to-transparent" />
        </div>

        <div className="hero-copy wrap relative z-10 flex h-full flex-col pb-7 pt-[calc(var(--header-h)+3.5rem)] md:pb-9">
          <div data-hero-fade className="ph-hide">
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

          <p className="ph-only t-eyebrow mt-auto flex items-center gap-2 text-stone">
            <svg viewBox="0 0 40 40" className="h-4 w-4 shrink-0 text-copper-2" aria-hidden>
              <path d="M20 3 L36 11 V22 C36 30 29 35 20 38 C11 35 4 30 4 22 V11 Z" fill="none" stroke="currentColor" strokeWidth="3" />
              <path d="M12 23 L20 16 L28 23" fill="none" stroke="currentColor" strokeWidth="3.4" />
            </svg>
            Licensed &amp; fully insured{!biz.preview && " · Est. 1998"}
          </p>

          <h1 id="hero-title" className="hero-title t-mega mt-auto text-stone">
            <span className={clsx("hero-ph-title ph-only block", biz.area.length > 16 && "hero-ph-long")}>
              <span className="block">{biz.area} roofers.</span>
              <span className="hero-ph-sub block">
                Built for the next <span className="text-copper">storm.</span>
              </span>
            </span>
            <span data-hero-left className="ph-hide block">
              <span className="anim-heading block" style={{ "--d": "0.15s" } as React.CSSProperties}>
                Built for
              </span>
            </span>
            <span data-hero-right className="ph-hide block">
              <span className="anim-heading block text-right md:pr-[4vw]" style={{ "--d": "0.3s" } as React.CSSProperties}>
                the next <span className="text-copper">storm.</span>
              </span>
            </span>
          </h1>

          {biz.rating && (
            <p className="ph-only mt-3 flex flex-wrap items-center gap-x-2 text-[0.9rem] font-semibold text-stone">
              <span className="tracking-[0.08em] text-[#f4b400]" aria-hidden>
                ★★★★★
              </span>
              <span>
                {biz.rating.value} · {biz.rating.count} reviews on Google
              </span>
            </p>
          )}

          <div data-hero-cta className="ph-only mt-4 flex flex-wrap gap-2">
            {tel && (
              <Button href={tel} size="lg" icon={<PhoneIcon />} ariaLabel={`Call ${biz.phoneDisplay}`} className="hero-ph-btn grow whitespace-nowrap">
                {biz.phoneDisplay}
              </Button>
            )}
            <a href="#estimate" className="hero-ph-btn inline-flex min-h-14 grow items-center justify-center whitespace-nowrap rounded-full border border-stone/30 px-5 font-semibold text-stone">
              Free estimate
            </a>
          </div>

          <div data-hero-fade className="hero-lead mt-8 md:mt-10">
          <div className="anim-fade grid gap-6 md:grid-cols-[1fr_auto] md:items-end" style={{ "--d": "0.5s" } as React.CSSProperties}>
            <p className="t-lead max-w-xl text-stone/85">
              {biz.preview ? "Local roofers." : "Family-owned Fort Worth roofers."} Free inspections with a photo report, honest help with your insurance claim,
              and a new roof in one or two days.
            </p>
            <div className="ph-hide flex flex-wrap gap-3">
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
          className="ph-hide t-eyebrow pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-stone/80 opacity-0"
        >
          4,800 roofs and counting — Tarrant County
        </p>
      </div>
    </section>
  );
}
