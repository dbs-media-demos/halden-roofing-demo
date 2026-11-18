"use client";

import type { ReactNode, RefObject } from "react";
import clsx from "clsx";
import { gsap, useIdleGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useBiz } from "@/components/preview/BizContext";
import { telOf } from "@/lib/biz-core";
import { Button, PhoneIcon } from "@/components/ui/Button";
import { OpenBadge } from "@/components/ui/OpenBadge";

/**
 * The roofline hero's scroll, shared by both heroes (3D on /, 2D on /v2): the gable window opens to
 * full-bleed while the headline splits apart like two roof slopes and the caption rises in.
 * `onProgress` gets 0 → 1 (the 3D camera crane, or the 2D storm passing). Desktop only.
 */
export function useHeroScroll(root: RefObject<HTMLElement | null>, win: RefObject<HTMLDivElement | null>, onProgress: (p: number) => void) {
  useIdleGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
        onUpdate: () => onProgress(tl.progress()),
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
}

/**
 * Everything in the hero that isn't the picture: place, rating, the headline, the lead and the
 * Call button (all on the first paint, never animated in), and the caption the scroll reveals.
 * The same words on / and /v2; `aside` adds a line under the rating (the 2D hero's hail count).
 */
export function HeroCopy({ aside }: { aside?: ReactNode }) {
  const biz = useBiz();
  const tel = telOf(biz);
  return (
    <>
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
              {aside}
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
            <span className="block">Built for</span>
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
    </>
  );
}

/** The hero picture's alt text, the same on both heroes. */
export const heroAlt = (preview: boolean) => (preview ? "A family home and its roof" : "A Fort Worth-area family home and its roof");
