"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import clsx from "clsx";
import { HouseArt, type RoofLayer } from "@/components/house/HouseArt";
import { materials, type MaterialId } from "@/content/materials";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { SplitReveal, Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

function Tween({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const last = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
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

const mono = { fontFamily: "var(--font-plex-mono)", fontSize: 11, letterSpacing: "0.12em" } as const;

/** Signature #2 — swap the roof between four materials; swatches recolour it. */
export function MaterialExplorer() {
  const [active, setActive] = useState<MaterialId>("shingle");
  const [swatch, setSwatch] = useState(0);
  const mat = materials.find((m) => m.id === active)!;
  const color = mat.swatches[swatch].hex;
  const [layers, setLayers] = useState<{ base: RoofLayer; incoming: RoofLayer | null }>({
    base: { material: "shingle", color: materials[0].swatches[0].hex, key: "init" },
    incoming: null,
  });
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const install = (m: MaterialId, c: string) => {
    setLayers((prev) => ({
      base: prev.incoming ?? prev.base,
      incoming: { material: m, color: c, key: `${m}-${c}-${Date.now()}` },
    }));
  };

  const choose = (id: MaterialId) => {
    if (id === active) return;
    const m = materials.find((x) => x.id === id)!;
    setActive(id);
    setSwatch(0);
    install(id, m.swatches[0].hex);
  };

  const chooseSwatch = (i: number) => {
    if (i === swatch) return;
    setSwatch(i);
    install(active, mat.swatches[i].hex);
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
          <div className="relative flex flex-col overflow-hidden rounded-[2px] lg:col-span-7">
            <div className="absolute inset-0 bg-gradient-to-b from-[#86a8c2] via-[#b9cedc] to-[#e9e1d2]" />
            <div aria-hidden className="absolute -left-10 top-10 h-16 w-72 rounded-full bg-white/50 blur-2xl [animation:drift_24s_ease-in-out_infinite_alternate]" />
            <div aria-hidden className="absolute right-0 top-24 h-12 w-56 rounded-full bg-white/40 blur-2xl [animation:drift_30s_ease-in-out_infinite_alternate-reverse]" />
            <div className="relative flex flex-1 items-end px-2 pb-3 pt-10 md:px-8 md:pt-14">
              <HouseArt
                base={layers.base}
                incoming={layers.incoming}
                title={`House illustration with a ${mat.name.toLowerCase()} roof in ${mat.swatches[swatch].name}`}
                className="h-auto w-full"
              >
                <g style={mono} fill="#0e1620" opacity="0.75">
                  <line x1="520" y1="212" x2="600" y2="150" stroke="#0e1620" strokeWidth="1" />
                  <text x="604" y="146">RIDGE</text>
                  <line x1="126" y1="296" x2="70" y2="250" stroke="#0e1620" strokeWidth="1" />
                  <text x="30" y="242">EAVE</text>
                  <text x="330" y="196">PITCH 6/12</text>
                </g>
              </HouseArt>
            </div>
            <div className="relative flex items-center justify-between border-t border-ink/10 bg-stone/70 px-5 py-3 text-ink backdrop-blur">
              <span className="t-spec">{mat.name}</span>
              <span className="t-spec flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border border-ink/30" style={{ background: color }} />
                {mat.swatches[swatch].name}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="lg:col-span-5">
            <div role="tablist" aria-label="Roof material" aria-orientation="vertical" className="flex flex-col border-t border-line">
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

              <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[2px] bg-line">
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
