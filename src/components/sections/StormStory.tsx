"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { stormSteps } from "@/content/company";
import { ScrollTrigger, isPhone, useIdleGSAP } from "@/lib/gsap";
import { useHouseScene } from "@/lib/use-house-scene";
import { SplitReveal, Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

const logs = [
  "INSPECTION · 21-POINT · SLOPES 4/4",
  "IMG_0412.JPG · 14:02 · HIT #37 CIRCLED",
  "CLAIM FILED · SCOPE REVIEWED LINE BY LINE",
  "TEST SQUARE 10×10 · 11 HITS · ADJUSTER ✓",
  "DAY 1 · 07:00 TEAR-OFF · 16:40 DRIED-IN",
  "SWEEP #2 COMPLETE · 1,284 NAILS COLLECTED",
  "WARRANTY #HR-10482 · 25 YRS · REGISTERED",
];

/**
 * Stills rendered from the same 3D scene (public/images/3d/story), one per look: the storm, the
 * inspection, the new roof, golden hour. Desktops without 3D cross-fade them by step; phones get the
 * storm still and, once the picture is in view, the finished roof at golden hour.
 */
const stills = [
  { id: "s0", steps: [0], phone: true },
  { id: "s1", steps: [1, 2, 3], phone: false },
  { id: "s4", steps: [4, 5], phone: false },
  { id: "s6", steps: [6], phone: true },
];

/**
 * Signature #3 — "Storm damage? Here's exactly what happens."
 * A sticky stage beside seven numbered steps. On desktop it is the Halden house in real-time 3D
 * (three.js, behind lib/three-gate): each step changes the weather, the camera and the props:
 * hail on the old roof, hits circled on the shingles, the chalked test square, tear-off and the new
 * roof course by course, nails on the drive and the magnet sweeper, then golden hour and the seal.
 */
export function StormStory() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);
  const stepRef = useRef(step);
  const [near, setNear] = useState(false);

  // The stills load only once the stage is about a screen away (on phones this section comes early,
  // and native lazy loading would fetch them with the first screen).
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: "100% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Phones: nothing pinned, the steps simply stack. This is their one roofing touch: when the
  // picture comes into view the storm gives way to the finished roof at golden hour, once.
  useEffect(() => {
    const el = stage.current;
    if (!el || !isPhone()) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        setStep(stormSteps.length - 1);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Desktop 3D: warmed in idle time after load (after the hero), so it is ready before it is reached.
  const { scene, live } = useHouseScene({
    mode: "story",
    canvas,
    host: stage,
    init: () => ({ step: stepRef.current }),
    attach: (h) => {
      const el = stage.current!;
      h.setStep(stepRef.current);
      const onMove = (ev: PointerEvent) => {
        const r = el.getBoundingClientRect();
        h.setPointer(((ev.clientX - r.left) / r.width) * 2 - 1, 1 - ((ev.clientY - r.top) / r.height) * 2);
      };
      const onLeave = () => h.setPointer(0, 0);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
  });

  useEffect(() => {
    stepRef.current = step;
    scene.current?.setStep(step);
  }, [scene, step]);

  useIdleGSAP(
    () => {
      const els = root.current?.querySelectorAll<HTMLElement>("[data-step]");
      if (!els) return;
      els.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 62%",
          end: "bottom 62%",
          onToggle: (self) => self.isActive && setStep(i),
        });
      });
    },
    root,
  );

  return (
    <section ref={root} aria-labelledby="storm-title" className="theme-ink relative py-24 md:py-36">
      <div className="wrap">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="t-eyebrow text-accent">After the storm</p>
            <SplitReveal id="storm-title" className="t-h2 mt-5">
              Storm damage? Here&rsquo;s exactly what happens.
            </SplitReveal>
          </div>
          <Reveal className="md:col-span-4">
            <p className="text-muted">
              No door-knocking, no pressure, no surprises. Seven steps from &ldquo;is that hail?&rdquo; to a warrantied roof —
              most homeowners are done in two to three weeks.
            </p>
          </Reveal>
        </div>

        <div className="relative mt-14 grid gap-10 lg:grid-cols-12">
          {/* Sticky stage */}
          <div ref={stage} data-ph-stage className="sticky top-2 z-10 h-[44svh] lg:top-[calc(var(--header-h)+1.5rem)] lg:col-span-7 lg:h-[calc(100svh-var(--header-h)-3rem)]">
            <div className="relative h-full overflow-hidden rounded-[2px] border border-line bg-slate">
              {near &&
                stills.map((s) => (
                <picture
                  key={s.id}
                  className={clsx("absolute inset-0 transition-opacity duration-[1200ms]", !s.phone && "ph-hide", s.steps.includes(step) ? "opacity-100" : "opacity-0")}
                >
                  {s.phone && <source media="(max-width: 767px), (pointer: coarse)" type="image/avif" srcSet={`/images/3d/story/${s.id}-phone.avif`} />}
                  {s.phone && <source media="(max-width: 767px), (pointer: coarse)" type="image/webp" srcSet={`/images/3d/story/${s.id}-phone.webp`} />}
                  <source type="image/avif" srcSet={`/images/3d/story/${s.id}.avif`} />
                  {/* stills rendered from the 3D scene below, pre-sized (next/image would only re-encode them) */}
                  <img
                    src={`/images/3d/story/${s.id}.webp`}
                    alt={s.id === "s0" ? "A house in a hailstorm, the first step of a storm-damage roof replacement" : ""}
                    aria-hidden={s.id !== "s0" || undefined}
                    width={1100}
                    height={1100}
                    decoding="async"
                    className="ph-stage-still h-full w-full object-cover"
                  />
                </picture>
                ))}
              <canvas
                ref={canvas}
                aria-hidden
                className={clsx("ph-hide absolute inset-0 h-full w-full transition-opacity duration-[1.4s]", live ? "opacity-100" : "opacity-0")}
              />

              {/* camera flash for the photo report */}
              <div aria-hidden className={clsx("pointer-events-none absolute inset-0 bg-white opacity-0", step === 1 && "[animation:flash_2.4s_linear_infinite]")} />

              {/* warranty seal */}
              <svg
                aria-hidden
                viewBox="0 0 100 100"
                className="ph-stage-seal pointer-events-none absolute right-[7%] top-[22%] w-[clamp(4.5rem,9vw,7.5rem)]"
                style={{
                  transform: step === 6 ? "scale(1) rotate(0deg)" : "scale(0) rotate(-40deg)",
                  transition: "transform 900ms var(--ease-out-expo)",
                }}
              >
                <circle cx="50" cy="50" r="48" fill="var(--copper)" stroke="#0e1620" strokeWidth="2.5" />
                <circle cx="50" cy="50" r="39" fill="none" stroke="#0e1620" strokeWidth="1.2" strokeDasharray="3 3" />
                <text x="50" y="50" textAnchor="middle" fill="#0e1620" style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 22 }}>
                  25 YR
                </text>
                <text x="50" y="66" textAnchor="middle" fill="#0e1620" style={{ fontFamily: "var(--font-plex-mono)", fontSize: 9, letterSpacing: "0.14em" }}>
                  WARRANTY
                </text>
              </svg>

              {/* HUD */}
              <div className="ph-hide pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-ink/55 to-transparent p-4 pb-10 md:p-6 md:pb-14">
                <p className="font-display text-[clamp(2.4rem,5vw,4.8rem)] font-black leading-none tracking-[-0.05em] text-stone" aria-hidden>
                  0{step + 1}
                  <span className="text-stone/35">/07</span>
                </p>
                <div className="flex gap-1.5 pt-2" aria-hidden>
                  {stormSteps.map((_, i) => (
                    <span key={i} className={clsx("h-1 w-5 rounded-full transition-colors duration-500 md:w-7", i <= step ? "bg-copper" : "bg-stone/25")} />
                  ))}
                </div>
              </div>
              <p
                key={step}
                aria-hidden
                className="t-spec anim-fade absolute bottom-3 right-3 max-w-[90%] rounded-full bg-ink/75 px-3 py-1.5 text-[0.64rem] text-stone backdrop-blur md:bottom-5 md:right-5 md:text-[0.72rem]"
              >
                <span className="text-copper-2">●</span> {logs[step]}
              </p>
            </div>
          </div>

          {/* Steps */}
          <ol className="relative lg:col-span-5">
            {stormSteps.map((s, i) => (
              <li
                key={s.title}
                data-step
                className={clsx(
                  "ph-step flex min-h-[78svh] flex-col justify-end border-l pb-[8svh] pl-6 pt-10 transition-[border-color,opacity] duration-700 md:pl-10 lg:min-h-[78vh] lg:justify-center lg:py-10",
                  i === step ? "border-copper" : "border-line",
                )}
              >
                <p className="t-eyebrow text-accent">
                  Step 0{i + 1} · {s.time}
                </p>
                <h3 className={clsx("t-h2 mt-4 !text-[length:var(--step-h,clamp(1.8rem,3.2vw,3.2rem))] transition-colors duration-700", i === step ? "text-stone" : "text-stone/55")}>{s.title}</h3>
                <p className="t-lead mt-5 max-w-md text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="ph-storm-cta mt-6 flex flex-wrap items-center gap-4 border-t border-line pt-10">
          <Button href="/free-inspection" size="lg">
            Start with step one — it&rsquo;s free
          </Button>
          <Button href="/services/storm-hail-damage" variant="ghost" size="lg">
            Storm &amp; insurance help
          </Button>
        </div>
      </div>
    </section>
  );
}
