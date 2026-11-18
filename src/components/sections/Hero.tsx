"use client";

import { getImageProps } from "next/image";
import { useRef } from "react";
import clsx from "clsx";
import { useHouseScene } from "@/lib/use-house-scene";
import heroPhone from "@/assets/photos/hero-phone.jpg";
import { useBiz } from "@/components/preview/BizContext";
import { HeroCopy, heroAlt, useHeroScroll } from "@/components/sections/HeroCopy";

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
 * it once lib/three-gate passes after load and the scene is compiled (lib/use-house-scene). Narrow,
 * reduced-motion and slow desktops keep the still.
 *
 * Phones get none of that: a sharp photo under the same gable, the service and town in the
 * headline, rating, and a Call button with the number, all there on first paint. Zero three.js.
 */
export function Hero() {
  const biz = useBiz();
  const root = useRef<HTMLElement>(null);
  const win = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const lastFlash = useRef(0);

  // The 3D storm: warmed first after load, revealed once compiled; a slow computer keeps the still.
  const { scene, live } = useHouseScene({
    mode: "hero",
    canvas,
    host: root,
    holdQueue: true,
    // lightning lights the headline too
    onFlash: (f) => {
      if (Math.abs(f - lastFlash.current) < 0.015) return;
      lastFlash.current = f;
      root.current?.style.setProperty("--flash", f.toFixed(3));
    },
    attach: (h) => {
      const host = root.current!;
      const r0 = host.getBoundingClientRect();
      h.setProgress(Math.min(1, Math.max(0, -r0.top / Math.max(1, r0.height - window.innerHeight))));
      const onMove = (e: PointerEvent) => h.setPointer((e.clientX / window.innerWidth) * 2 - 1, 1 - (e.clientY / window.innerHeight) * 2);
      const onLeave = () => h.setPointer(0, 0);
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
      return () => {
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerleave", onLeave);
        lastFlash.current = 0;
        host.style.setProperty("--flash", "0");
      };
    },
  });

  useHeroScroll(root, win, (p) => scene.current?.setProgress(p));

  const alt = heroAlt(!!biz.preview);
  const {
    props: { srcSet: phoneSet },
  } = getImageProps({ src: heroPhone, alt, fill: true, sizes: "100vw", quality: 60 });

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

        <HeroCopy />
      </div>
    </section>
  );
}
