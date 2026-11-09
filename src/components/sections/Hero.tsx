"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { gsap, useIdleGSAP, prefersReducedMotion, isPhone } from "@/lib/gsap";
import { after3DGate } from "@/lib/three-gate";
import type { HouseScene } from "@/components/fx/roof3d/HouseScene";
import heroPhone from "@/assets/photos/hero-phone.jpg";
import { useBiz } from "@/components/preview/BizContext";
import { telOf } from "@/lib/biz-core";
import { Button, PhoneIcon } from "@/components/ui/Button";
import { OpenBadge } from "@/components/ui/OpenBadge";

/** Stills rendered from the 3D storm scene (public/images/3d): the desktop LCP image and fallback. */
const STILL = (ext: string) => [1280, 1920, 2560].map((w) => `/images/3d/hero-storm-${w}.${ext} ${w}w`).join(", ");

/**
 * Signature #1 — the roofline hero.
 * A house-shaped window (true 6/12 pitch) opens from a CSS-only intro (LCP-safe), then scroll
 * widens it to full-bleed while the headline splits apart like two roof slopes.
 *
 * Through the window: the Halden house in a hailstorm at dusk, in real-time 3D (three.js, desktop
 * only). Hail bounces off wet shingles and gathers on the lawn, lightning lights the clouds and the
 * headline, the pointer leans the camera, and the scroll cranes it up onto the roof. A still
 * rendered from that scene is in the server HTML (and is the LCP image); the canvas fades in over
 * it once lib/three-gate passes after load. Narrow or reduced-motion desktops keep the still.
 *
 * Phones get none of that: a sharp photo under the same gable, the service and town in the
 * headline, rating, and a Call button with the number, all there on first paint. Zero three.js.
 */
export function Hero() {
  const biz = useBiz();
  const root = useRef<HTMLElement>(null);
  const win = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<HouseScene | null>(null);
  const [live, setLive] = useState(false);

  // The 3D storm: only after load, only past the gate, three.js fetched inside the callback.
  useEffect(() => {
    if (isPhone()) return;
    let house: HouseScene | null = null;
    let disposed = false;
    let detach = () => {};
    const cancel = after3DGate(async () => {
      const { createHouseScene } = await import("@/components/fx/roof3d/HouseScene");
      const cv = canvas.current;
      const host = root.current;
      if (disposed || !cv || !host) return;
      let lastFlash = 0;
      try {
        house = createHouseScene(cv, {
          mode: "hero",
          onFirstFrame: () => setLive(true),
          // lightning lights the headline too
          onFlash: (f) => {
            if (Math.abs(f - lastFlash) < 0.015) return;
            lastFlash = f;
            host.style.setProperty("--flash", f.toFixed(3));
          },
        });
      } catch {
        return; // no WebGL after all: the still stays
      }
      const h = house;
      scene.current = h;
      const r0 = host.getBoundingClientRect();
      h.setProgress(Math.min(1, Math.max(0, -r0.top / Math.max(1, r0.height - window.innerHeight))));
      const onMove = (e: PointerEvent) => h.setPointer((e.clientX / window.innerWidth) * 2 - 1, 1 - (e.clientY / window.innerHeight) * 2);
      const onLeave = () => h.setPointer(0, 0);
      const io = new IntersectionObserver(([en]) => h.setVisible(en.isIntersecting));
      const ro = new ResizeObserver(() => h.resize());
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
      io.observe(host);
      ro.observe(cv);
      detach = () => {
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerleave", onLeave);
        io.disconnect();
        ro.disconnect();
      };
    });
    return () => {
      disposed = true;
      cancel();
      detach();
      scene.current = null;
      house?.dispose();
    };
  }, []);

  useIdleGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
        onUpdate: () => scene.current?.setProgress(tl.progress()),
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

  const alt = biz.preview ? "A family home and its roof" : "A Fort Worth-area family home and its roof";
  const {
    props: { srcSet: phoneSet },
  } = getImageProps({ src: heroPhone, alt, fill: true, sizes: "100vw", quality: 60 });
  const tel = telOf(biz);

  return (
    <section ref={root} aria-labelledby="hero-title" className="hero-root theme-ink relative h-[175svh] motion-reduce:!h-[100svh] md:h-[210vh]">
      <link rel="preload" as="image" imageSrcSet={phoneSet} imageSizes="100vw" media="(max-width: 767px)" fetchPriority="high" />
      <link rel="preload" as="image" imageSrcSet={STILL("avif")} imageSizes="100vw" type="image/avif" media="(min-width: 768px)" fetchPriority="high" />
      <div className="hero-stage sticky top-0 h-[100svh] overflow-hidden">
        <div ref={win} className="hero-window absolute inset-0 bg-slate">
          <picture>
            <source media="(max-width: 767px)" srcSet={phoneSet} sizes="100vw" />
            <source type="image/avif" srcSet={STILL("avif")} sizes="100vw" />
            {/* a still rendered from the 3D scene, pre-sized (next/image would only re-encode it) */}
            <img
              src="/images/3d/hero-storm-1920.webp"
              srcSet={STILL("webp")}
              sizes="100vw"
              alt={alt}
              width={1920}
              height={1080}
              fetchPriority="high"
              decoding="sync"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>
          <canvas
            ref={canvas}
            aria-hidden
            className={clsx("ph-hide absolute inset-0 h-full w-full transition-opacity duration-[1.4s]", live ? "opacity-100" : "opacity-0")}
          />
          <div data-hero-dim className="absolute inset-0 bg-ink/30" />
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
              <span className="block">
                Built for
              </span>
            </span>
            <span data-hero-right className="ph-hide block">
              <span className="block text-right md:pr-[4vw]">
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
          {/* the headline, the lead and the Call button are there on the first paint: never animated in */}
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
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
