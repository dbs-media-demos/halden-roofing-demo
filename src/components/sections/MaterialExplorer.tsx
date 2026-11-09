"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import clsx from "clsx";
import { materials, type MaterialId } from "@/content/materials";
import { gsap, prefersReducedMotion, isPhone } from "@/lib/gsap";
import { useHouseScene } from "@/lib/use-house-scene";
import { SplitReveal, Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

function Tween({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const last = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || isPhone() || !gsap) {
      el.textContent = String(value);
      last.current = value;
      return;
    }
    const o = { n: last.current };
    const t = gsap.to(o, { n: value, duration: 0.9, ease: "expo.out", onUpdate: () => (el.textContent = String(Math.round(o.n))) });
    last.current = value;
    return () => {
      t.kill();
    };
  }, [value]);
  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}

/** A still of the model rendered from the 3D scene (public/images/3d/roofs), one per material and colour. */
const still = (m: MaterialId, i: number) => `/images/3d/roofs/${m}-${i}`;

/**
 * Signature #2 — try a new roof on. The house is an architect's model on a lawn plinth in studio
 * light (three.js, desktop only, behind lib/three-gate): every material is really built, shingle tab
 * by tab, panel by panel, barrel by barrel, and a new choice tears the old roof off and lays the new
 * one course by course from the eaves. Swatches recolour it; drag to turn the house.
 * Phones and desktops without 3D get stills rendered from the same model, wiped in eave to ridge.
 */
export function MaterialExplorer() {
  const [active, setActive] = useState<MaterialId>("shingle");
  const [swatch, setSwatch] = useState(0);
  const mat = materials.find((m) => m.id === active)!;
  const color = mat.swatches[swatch].hex;
  const [shown, setShown] = useState([{ src: still("shingle", 0), key: 0 }]);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const roof = useRef({ kind: active, hex: color });
  const drag = useRef<number | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // Desktop 3D: warmed in idle time after load (after the hero and the storm story).
  const { scene, live } = useHouseScene({
    mode: "explorer",
    canvas,
    host: stage,
    init: () => ({ roof: roof.current }),
    attach: (h) => {
      h.setRoof(roof.current.kind, roof.current.hex); // a choice made while it was warming up
      return () => {};
    },
  });

  const install = (m: MaterialId, i: number) => {
    const hex = materials.find((x) => x.id === m)!.swatches[i].hex;
    roof.current = { kind: m, hex };
    scene.current?.setRoof(m, hex);
    setShown((prev) => [...prev.slice(-1), { src: still(m, i), key: (prev.at(-1)?.key ?? 0) + 1 }]);
  };

  // Drag to turn the house; hovering leans the camera a little.
  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType !== "mouse" || !scene.current) return;
    drag.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const h = scene.current;
    if (!h) return;
    if (drag.current !== null) {
      h.drag(e.clientX - drag.current);
      drag.current = e.clientX;
    }
    const r = e.currentTarget.getBoundingClientRect();
    h.setPointer(((e.clientX - r.left) / r.width) * 2 - 1, 1 - ((e.clientY - r.top) / r.height) * 2);
  };
  const onPointerUp = () => (drag.current = null);

  const choose = (id: MaterialId) => {
    if (id === active) return;
    const m = materials.find((x) => x.id === id)!;
    setActive(id);
    setSwatch(0);
    install(m.id, 0);
  };

  const chooseSwatch = (i: number) => {
    if (i === swatch) return;
    setSwatch(i);
    install(active, i);
  };

  const onTabKey = (e: KeyboardEvent, i: number) => {
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const n = (i + dir + materials.length) % materials.length;
    tabs.current[n]?.focus();
    choose(materials[n].id);
  };

  return (
    <section aria-labelledby="materials-title" className="theme-ink relative py-24 md:py-36">
      <div className="wrap">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="t-eyebrow text-accent">Material explorer</p>
            <SplitReveal id="materials-title" className="t-h2 mt-5">
              Try a new roof on for size.
            </SplitReveal>
          </div>
          <Reveal className="md:col-span-5">
            <p className="t-lead text-muted">
              Four materials we install every week. Tap one to re-roof the house, then pick a color. Every number is what we see
              on real Fort Worth roofs — not brochure math.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Stage */}
          <div className="ph-mat-stage relative flex flex-col self-start overflow-hidden rounded-[2px] border border-line lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:col-span-7">
            <div ref={stage} className="mat-studio relative aspect-[16/11] w-full">
              {shown.map((l, i) => (
                <picture key={l.key} className={clsx("absolute inset-0", i > 0 && "mat-still-in")}>
                  <source type="image/avif" srcSet={`${l.src}.avif`} />
                  {/* stills of the 3D model, pre-sized (next/image would only re-encode them) */}
                  <img
                    src={`${l.src}.webp`}
                    alt={i === shown.length - 1 ? `Model of a house with a ${mat.name.toLowerCase()} roof in ${mat.swatches[swatch].name}` : ""}
                    width={1100}
                    height={756}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                </picture>
              ))}
              <canvas
                ref={canvas}
                aria-hidden
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onPointerLeave={() => scene.current?.setPointer(0, 0)}
                className={clsx(
                  "ph-hide absolute inset-0 h-full w-full cursor-grab transition-opacity duration-[1.2s] active:cursor-grabbing",
                  live ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              />
              <p
                aria-hidden
                className={clsx("ph-hide t-eyebrow pointer-events-none absolute bottom-4 left-5 text-faint transition-opacity duration-700", live ? "opacity-100" : "opacity-0")}
              >
                ← Drag to turn the house →
              </p>
            </div>
            <div className="ph-mat-label relative flex items-center justify-between border-t border-line bg-ink px-5 py-3 text-stone">
              <span className="t-spec">{mat.name}</span>
              <span className="t-spec flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border border-stone/30" style={{ background: color }} />
                {mat.swatches[swatch].name}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="lg:col-span-5">
            <div role="tablist" aria-label="Roof material" aria-orientation="vertical" className="ph-mat-tabs flex flex-col border-t border-line">
              {materials.map((m, i) => {
                const on = m.id === active;
                return (
                  <button
                    key={m.id}
                    ref={(el) => {
                      tabs.current[i] = el;
                    }}
                    role="tab"
                    id={`mat-tab-${m.id}`}
                    aria-selected={on}
                    aria-controls="mat-panel"
                    tabIndex={on ? 0 : -1}
                    onClick={() => choose(m.id)}
                    onKeyDown={(e) => onTabKey(e, i)}
                    className={clsx(
                      "group flex min-h-16 items-center justify-between border-b border-line text-left transition-colors",
                      on ? "text-stone" : "text-faint hover:text-stone",
                    )}
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="t-eyebrow w-6">0{i + 1}</span>
                      <span className="font-display text-[clamp(1.35rem,2.3vw,2rem)] font-extrabold uppercase tracking-[-0.03em]">{m.short}</span>
                    </span>
                    <span className={clsx("chev text-copper transition-transform duration-500", on ? "scale-100" : "scale-0")} />
                  </button>
                );
              })}
            </div>

            <div id="mat-panel" role="tabpanel" aria-labelledby={`mat-tab-${active}`} className="pt-8">
              <p key={active} className="anim-fade text-muted">
                {mat.blurb}
              </p>

              <dl className="ph-mat-specs mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[2px] bg-line">
                <div className="bg-ink p-4">
                  <dt className="t-eyebrow text-faint">Lifespan</dt>
                  <dd className="mt-2 font-display text-3xl font-extrabold tracking-[-0.03em]">
                    <Tween value={mat.lifespan[0]} />–<Tween value={mat.lifespan[1]} />
                    <span className="ml-1 text-base font-semibold text-muted">yrs</span>
                  </dd>
                </div>
                <div className="bg-ink p-4">
                  <dt className="t-eyebrow text-faint">Wind rating</dt>
                  <dd className="mt-2 font-display text-3xl font-extrabold tracking-[-0.03em]">
                    <Tween value={mat.wind} />
                    <span className="ml-1 text-base font-semibold text-muted">mph</span>
                  </dd>
                </div>
                <div className="bg-ink p-4">
                  <dt className="t-eyebrow text-faint">Hail rating</dt>
                  <dd className="mt-2 font-display text-2xl font-extrabold tracking-[-0.03em]">{mat.hail}</dd>
                </div>
                <div className="bg-ink p-4">
                  <dt className="t-eyebrow text-faint">Relative cost</dt>
                  <dd className="mt-2 font-display text-3xl font-extrabold tracking-[-0.03em]" aria-label={`${mat.cost} out of 4`}>
                    {[1, 2, 3, 4].map((n) => (
                      <span key={n} className={clsx("transition-colors duration-500", n <= mat.cost ? "text-copper" : "text-stone/15")}>
                        $
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
              <p className="t-spec mt-3 text-faint">{mat.priceNote}</p>

              <fieldset className="mt-8">
                <legend className="t-eyebrow text-faint">Color</legend>
                <div className="mt-4 flex flex-wrap gap-3">
                  {mat.swatches.map((s, i) => (
                    <button
                      key={s.hex}
                      type="button"
                      aria-pressed={i === swatch}
                      aria-label={s.name}
                      title={s.name}
                      onClick={() => chooseSwatch(i)}
                      className={clsx(
                        "grid h-12 w-12 place-items-center rounded-full border transition-[border-color,transform] duration-300",
                        i === swatch ? "scale-110 border-copper" : "border-line hover:border-stone/50",
                      )}
                    >
                      <span className="h-8 w-8 rounded-full" style={{ background: s.hex, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.15)" }} />
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="mt-10">
                <Button href="/free-inspection">Get a quote in {mat.short.toLowerCase()}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
