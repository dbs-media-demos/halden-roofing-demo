"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef } from "react";
import clsx from "clsx";

/** Muted loop that only loads when near the viewport; never plays for reduced motion or save-data. */
export function VideoLoop({ src, poster, alt, className, sizes = "100vw" }: { src: string; poster: StaticImageData; alt: string; className?: string; sizes?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || conn?.saveData) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.src) v.src = src;
          v.play().catch(() => {});
        } else v.pause();
      },
      { rootMargin: "200px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);

  return (
    <div className={clsx("relative overflow-hidden bg-slate", className)}>
      <Image src={poster} alt={alt} fill sizes={sizes} className="object-cover" />
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700"
        onPlaying={(e) => (e.currentTarget.style.opacity = "1")}
      />
    </div>
  );
}
