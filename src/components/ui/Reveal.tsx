"use client";

import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import clsx from "clsx";
import { gsap, ScrollTrigger, useIdleGSAP, loadSplitText, prefersReducedMotion, belowFold } from "@/lib/gsap";

/*
 * Scroll-driven reveals.
 *
 * Content is always visible in the HTML. `immediate` variants (top of the page)
 * animate with pure CSS so they paint instantly (LCP). Everything else is hidden
 * by JavaScript only while it is still below the fold, and only via opacity.
 */

const delayStyle = (d: number) => ({ "--d": `${d}s` }) as CSSProperties;

type SplitProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  immediate?: boolean;
  stagger?: number;
  id?: string;
};

/** Headline that rises line by line out of a mask as it scrolls into view. */
export function SplitReveal({ children, as: Tag = "h2", className, delay = 0, immediate, stagger = 0.09, id }: SplitProps) {
  const ref = useRef<HTMLElement>(null);

  useIdleGSAP(
    () => {
      const el = ref.current;
      if (!el || immediate || prefersReducedMotion() || !belowFold(el)) return;
      gsap.set(el, { opacity: 0 });
      let split: { revert: () => void } | null = null;
      let dead = false;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          Promise.all([loadSplitText(), document.fonts.ready]).then(([SplitText]) => {
            if (dead) return;
            split = SplitText.create(el, {
              type: "lines",
              mask: "lines",
              linesClass: "split-line",
              autoSplit: true,
              onSplit(self) {
                gsap.set(el, { opacity: 1 });
                return gsap.from(self.lines, { yPercent: 118, rotate: 2, duration: 1.25, stagger, delay, ease: "expo.out" });
              },
            });
          });
        },
        { rootMargin: "0px 0px -8% 0px" },
      );
      io.observe(el);
      return () => {
        dead = true;
        io.disconnect();
        split?.revert();
      };
    },
    ref,
  );

  return (
    <Tag ref={ref} id={id} className={clsx(immediate && "anim-heading", className)} style={immediate ? delayStyle(delay) : undefined}>
      {children}
    </Tag>
  );
}

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  y?: number;
  stagger?: number;
  immediate?: boolean;
  id?: string;
};

/** Fade + rise when scrolled into view (optionally staggering direct children). */
export function Reveal({ children, as: Tag = "div", className, delay = 0, y = 36, stagger, immediate, id }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useIdleGSAP(
    () => {
      const el = ref.current;
      if (!el || immediate || prefersReducedMotion() || !belowFold(el)) return;
      const targets = stagger ? Array.from(el.children) : [el];
      gsap.set(targets, { opacity: 0, y });
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () =>
          gsap.to(targets, { opacity: 1, y: 0, duration: 1.2, delay, stagger: stagger ?? 0, ease: "expo.out", clearProps: "transform" }),
      });
    },
    ref,
  );

  return (
    <Tag ref={ref} id={id} className={clsx(immediate && "anim-fade", className)} style={immediate ? delayStyle(delay) : undefined}>
      {children}
    </Tag>
  );
}

/** Paragraph whose words brighten one by one as you scroll through it. */
export function ScrubWords({ text, className, as: Tag = "p" }: { text: string; className?: string; as?: ElementType }) {
  const ref = useRef<HTMLElement>(null);

  useIdleGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const words = el.querySelectorAll<HTMLElement>("[data-w]");
      // Starts at ≥3:1 (large text) so it stays readable and passes contrast checks before scrolling.
      gsap.fromTo(
        words,
        { opacity: (_: number, el: Element) => (el.classList.contains("text-accent") ? 0.82 : 0.5) },
        { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 50%", scrub: 0.6 } },
      );
    },
    ref,
  );

  return (
    <Tag ref={ref} className={className}>
      {text.split(" ").map((w, i) => (
        <span key={i} data-w className={clsx("inline", w.startsWith("*") && "text-accent")}>
          {w.replace(/^\*/, "")}{" "}
        </span>
      ))}
    </Tag>
  );
}

/**
 * Image frame that opens from a narrow gable slit (the roof motif) on enter,
 * then drifts with scroll (parallax).
 */
export function Parallax({
  children,
  className,
  amount = 12,
  reveal = true,
  style,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
  reveal?: boolean;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIdleGSAP(
    () => {
      const el = ref.current;
      const inner = el?.firstElementChild as HTMLElement | null;
      if (!el || !inner || prefersReducedMotion()) return;
      gsap.set(inner, { scale: 1 + amount / 100 });
      gsap.fromTo(
        inner,
        { yPercent: -amount / 2 },
        { yPercent: amount / 2, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
      );
      if (reveal && belowFold(el)) {
        gsap.fromTo(
          el,
          { clipPath: "polygon(0% 100%, 50% 62%, 100% 100%, 100% 100%, 0% 100%)" },
          {
            clipPath: "polygon(0% 0%, 50% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1.5,
            ease: "expo.inOut",
            clearProps: "clipPath",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      }
    },
    ref,
  );

  return (
    <div ref={ref} className={clsx("overflow-hidden", !/(^| )absolute( |$)/.test(className ?? "") && "relative", className)} style={style}>
      {children}
    </div>
  );
}

/** Number that counts up when it enters the viewport. */
export function Counter({ value, decimals = 0, suffix = "", className }: { value: number; decimals?: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  useIdleGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const obj = { n: 0 };
      const num = el.querySelector<HTMLElement>("[data-n]");
      if (!num) return;
      ScrollTrigger.create({
        trigger: el,
        start: "top 92%",
        once: true,
        onEnter: () =>
          gsap.fromTo(obj, { n: 0 }, { n: value, duration: 2.2, ease: "expo.out", onUpdate: () => (num.textContent = format(obj.n)) }),
      });
    },
    ref,
  );

  return (
    <span ref={ref} className={className}>
      <span data-n>{format(value)}</span>
      {suffix}
    </span>
  );
}

export { ScrollTrigger };
