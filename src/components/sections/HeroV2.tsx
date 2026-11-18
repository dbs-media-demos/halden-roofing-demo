"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { isPhone, prefersReducedMotion } from "@/lib/gsap";
import heroPhone from "@/assets/photos/hero-phone.jpg";
import { useBiz } from "@/components/preview/BizContext";
import { HeroCopy, heroAlt, useHeroScroll } from "@/components/sections/HeroCopy";
import type { HailStorm } from "@/components/fx/hailStorm2d";
import { whenLoaderDone } from "@/lib/loader";

/** The storm scene's plate, rendered from the 3D house without its rain and hail (_src/stills). */
const PLATE = (ext: string) => [1280, 1920, 2560].map((w) => `/images/3d/hero-plate-${w}.${ext} ${w}w`).join(", ");

/**
 * The roofline hero without 3D (/v2: for a slow laptop, or a lead who doesn't want it).
 * The same gable window, words and scroll as /, around the same house at dusk: a plate rendered from
 * the 3D scene, with the storm drawn live over it in canvas 2D (fx/hailStorm2d). Hail strikes the
 * real roof planes and bounces off the eaves, gathers on the lawn and melts; lightning lights the sky
 * and the headline; the pointer turns the wind. The scroll pushes in on the roof as the storm
 * passes and the light warms, and a counter keeps score of the hits the roof took.
 *
 * Phones get exactly the / hero (the photo, zero animation code: the storm is its own chunk, loaded
 * only on a desktop). No three.js, no WebGL, at any width.
 */
export function HeroV2() {
  const biz = useBiz();
  const root = useRef<HTMLElement>(null);
  const win = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const sky = useRef<HTMLDivElement>(null);
  const warm = useRef<HTMLDivElement>(null);
  const hits = useRef<HTMLSpanElement>(null);
  const storm = useRef<HailStorm | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const cv = canvas.current;
    const host = root.current;
    if (!cv || !host || isPhone()) return;
    let dead = false;
    let count = 0;
    let shown = -1;
    let lastFlash = 0;
    const tick = window.setInterval(() => {
      if (count === shown || !hits.current) return;
      shown = count;
      hits.current.textContent = String(count).padStart(4, "0");
    }, 160);
    const onFlash = (f: number) => {
      if (Math.abs(f - lastFlash) < 0.015 && f !== 0) return;
      lastFlash = f;
      host.style.setProperty("--flash", f.toFixed(3));
      if (sky.current) sky.current.style.opacity = (f * 0.6).toFixed(3);
    };
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      storm.current?.setPointer(x);
      if (stage.current) stage.current.style.translate = `${(-x * 10).toFixed(1)}px ${(-y * 6).toFixed(1)}px`;
    };
    // a preview's logo loader first: the storm starts as it lifts off, not hidden behind it
    const unwait = whenLoaderDone(() => import("@/components/fx/hailStorm2d").then(({ startHailStorm }) => {
      if (dead) return;
      // where the lightning lights the clouds this time
      if (sky.current) sky.current.style.setProperty("--fx", `${Math.round(20 + Math.random() * 60)}%`);
      storm.current = startHailStorm(cv, {
        still: prefersReducedMotion(),
        onHit: () => count++,
        onFlash: (f) => {
          if (f > 0.9 && sky.current) sky.current.style.setProperty("--fx", `${Math.round(15 + Math.random() * 70)}%`);
          onFlash(f);
        },
      });
      setLive(true);
      if (!prefersReducedMotion()) host.addEventListener("pointermove", onMove);
    }));
    return () => {
      dead = true;
      unwait();
      window.clearInterval(tick);
      host.removeEventListener("pointermove", onMove);
      storm.current?.stop();
      storm.current = null;
      host.style.setProperty("--flash", "0");
    };
  }, []);

  // the scroll: the window opens, the camera pushes in on the roof, the storm passes and the light warms
  useHeroScroll(root, win, (p) => {
    storm.current?.setProgress(p);
    if (stage.current) stage.current.style.scale = String(1 + p * 0.16);
    if (warm.current) warm.current.style.opacity = String(Math.min(1, Math.max(0, (p - 0.3) / 0.55)).toFixed(3));
  });

  const alt = heroAlt(!!biz.preview);
  const {
    props: { srcSet: phoneSet },
  } = getImageProps({ src: heroPhone, alt, fill: true, sizes: "100vw", quality: 60 });

  return (
    <section ref={root} aria-labelledby="hero-title" data-hero="2d" className="hero-root theme-ink relative h-[175svh] motion-reduce:!h-[100svh] md:h-[210vh]">
      <link rel="preload" as="image" imageSrcSet={phoneSet} imageSizes="100vw" media="(max-width: 767px)" fetchPriority="high" />
      <link rel="preload" as="image" imageSrcSet={PLATE("avif")} imageSizes="100vw" type="image/avif" media="(min-width: 768px)" fetchPriority="high" />
      <div className="hero-stage sticky top-0 h-[100svh] overflow-hidden">
        <div ref={win} className="hero-window absolute inset-0 bg-slate">
          <div ref={stage} className="hero2-stage absolute inset-[-12px]">
            <picture>
              <source media="(max-width: 767px)" srcSet={phoneSet} sizes="100vw" />
              <source type="image/avif" srcSet={PLATE("avif")} sizes="100vw" />
              {/* the plate, pre-sized (next/image would only re-encode it) */}
              <img
                src="/images/3d/hero-plate-1920.webp"
                srcSet={PLATE("webp")}
                sizes="100vw"
                alt={alt}
                width={1920}
                height={1080}
                fetchPriority="high"
                decoding="sync"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </picture>
            {/* lightning behind the clouds, and the warm light after the storm */}
            <div ref={sky} aria-hidden className="hero2-sky ph-hide pointer-events-none absolute inset-0 opacity-0" />
            <div ref={warm} aria-hidden className="hero2-warm ph-hide pointer-events-none absolute inset-0 opacity-0" />
            <canvas
              ref={canvas}
              aria-hidden
              className={clsx("ph-hide pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-700", live ? "opacity-100" : "opacity-0")}
            />
          </div>
          <div data-hero-dim className="absolute inset-0 bg-ink/30" />
          <div className="hero-shade absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/80 to-transparent" />
        </div>

        <HeroCopy
          aside={
            <p aria-hidden className="t-eyebrow flex items-center gap-2 text-muted">
              <span className="hero2-dot" />
              1¾″ hail · <span ref={hits} className="tabular-nums text-stone">0000</span> hits on this roof
            </p>
          }
        />
      </div>
    </section>
  );
}
