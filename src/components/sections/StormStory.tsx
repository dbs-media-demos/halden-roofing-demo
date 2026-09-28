"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { HouseArt } from "@/components/house/HouseArt";
import { HailCanvas } from "@/components/fx/HailCanvas";
import { stormSteps } from "@/content/company";
import { ScrollTrigger, useIdleGSAP } from "@/lib/gsap";
import { SplitReveal, Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

const OLD = { material: "shingle" as const, color: "#5d5850", key: "old" };
const NEW = { material: "shingle" as const, color: "#353a40", key: "new" };

const skies = [
  { from: "#1b2a2a", to: "#4c5c5a", steps: [0] }, // green-grey hail sky
  { from: "#3a4855", to: "#8391a0", steps: [1, 2, 3] }, // overcast
  { from: "#6f93b3", to: "#c9d6de", steps: [4, 5] }, // clearing
  { from: "#3d4f6b", to: "#e8a66d", steps: [6] }, // golden dusk
];

const logs = [
  "INSPECTION · 21-POINT · SLOPES 4/4",
  "IMG_0412.JPG · 14:02 · HIT #37 CIRCLED",
  "CLAIM FILED · SCOPE REVIEWED LINE BY LINE",
  "TEST SQUARE 10×10 · 11 HITS · ADJUSTER ✓",
  "DAY 1 · 07:00 TEAR-OFF · 16:40 DRIED-IN",
  "SWEEP #2 COMPLETE · 1,284 NAILS COLLECTED",
  "WARRANTY #HR-10482 · 25 YRS · REGISTERED",
];

const hits: [number, number][] = [
  [228, 268],
  [352, 236],
  [418, 262],
  [486, 228],
  [560, 276],
  [612, 284],
  [300, 290],
  [458, 284],
];

/**
 * Signature #3 — "Storm damage? Here's exactly what happens."
 * A sticky house illustration whose sky, weather and roof change as seven
 * numbered steps scroll past.
 */
export function StormStory() {
  const root = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [step, setStep] = useState(0);

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

  const showHits = step >= 1 && step <= 3;

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
          <div className="sticky top-2 z-10 h-[44svh] lg:top-[calc(var(--header-h)+1.5rem)] lg:col-span-7 lg:h-[calc(100svh-var(--header-h)-3rem)]">
            <div className="relative h-full overflow-hidden rounded-[2px] border border-line">
              {skies.map((s, i) => (
                <div
                  key={i}
                  aria-hidden
                  className="absolute inset-0 transition-opacity duration-[1400ms]"
                  style={{ background: `linear-gradient(to bottom, ${s.from}, ${s.to})`, opacity: s.steps.includes(step) ? 1 : 0 }}
                />
              ))}
              {/* clouds */}
              <div aria-hidden className={clsx("absolute inset-0 transition-opacity duration-1000", step >= 6 && "opacity-40")}>
                <div className="absolute -left-20 top-[8%] h-24 w-[70%] rounded-full bg-[#0e1620]/35 blur-3xl [animation:drift_18s_ease-in-out_infinite_alternate]" />
                <div className="absolute right-[-10%] top-[18%] h-20 w-[55%] rounded-full bg-[#0e1620]/30 blur-3xl [animation:drift_24s_ease-in-out_infinite_alternate-reverse]" />
              </div>
              {/* lightning */}
              <div aria-hidden className={clsx("absolute inset-0 bg-white opacity-0", step === 0 && "[animation:flash_5s_linear_infinite]")} />
              {/* sun at dusk */}
              <div
                aria-hidden
                className="absolute right-[14%] top-[12%] h-24 w-24 rounded-full bg-[#ffd4a1] blur-md transition-[opacity,transform] duration-[1600ms]"
                style={{ opacity: step === 6 ? 0.9 : 0, transform: step === 6 ? "translateY(0)" : "translateY(60px)" }}
              />

              {/* horizon: far skyline + tree line (tinted by the sky) */}
              <svg aria-hidden viewBox="0 0 800 200" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-[8%] h-[38%] w-full text-ink transition-opacity duration-1000" style={{ opacity: step === 6 ? 0.55 : 0.35 }}>
                <path d="M0 150 C120 128 220 140 330 132 S560 120 800 138 V200 H0Z" fill="currentColor" opacity="0.6" />
                <g fill="currentColor" opacity="0.8">
                  <rect x="520" y="86" width="16" height="50" />
                  <rect x="540" y="64" width="14" height="72" />
                  <rect x="558" y="96" width="20" height="40" />
                  <rect x="582" y="74" width="12" height="62" />
                  <polygon points="598,136 598,80 606,70 614,80 614,136" />
                  <rect x="618" y="104" width="18" height="32" />
                </g>
                {[40, 90, 150, 230, 300, 360, 690, 740].map((x, i) => (
                  <ellipse key={x} cx={x} cy={140 - (i % 3) * 4} rx={18 + (i % 2) * 8} ry={14 + (i % 3) * 4} fill="currentColor" />
                ))}
              </svg>

              <div className="absolute bottom-0 left-1/2 w-[112%] -translate-x-1/2 md:w-[104%]">
                <HouseArt
                  svgRef={svg}
                  base={OLD}
                  incoming={step >= 4 ? NEW : null}
                  installFrom="eave"
                  strips={10}
                  stagger={120}
                  glow={step === 6}
                  className="h-auto w-full"
                  title="Illustration of a house moving through each step of a storm-damage roof replacement"
                >
                  {/* inspection scan + ladder */}
                  <g className="transition-opacity duration-700" opacity={step === 0 ? 1 : 0}>
                    <line x1="140" x2="680" y1="222" y2="222" stroke="var(--copper)" strokeWidth="2.5" style={{ animation: "scan-y 3s ease-in-out infinite" }} />
                  </g>
                  <g className="transition-opacity duration-700" opacity={step <= 4 ? 1 : 0} stroke="#0e1620" strokeWidth="3">
                    <line x1="706" y1="440" x2="676" y2="286" />
                    <line x1="724" y1="440" x2="694" y2="286" />
                    {[420, 392, 364, 336, 308].map((y, i) => (
                      <line key={y} x1={702 - i * 5.4} x2={720 - i * 5.4} y1={y} y2={y} />
                    ))}
                  </g>
                  {/* hits */}
                  <g className="transition-opacity duration-500" opacity={showHits ? 1 : 0}>
                    {hits.map(([x, y], i) => (
                      <circle key={i} cx={x} cy={y} r="9" fill="none" stroke="var(--copper)" strokeWidth="2.5" className="hit" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </g>
                  {/* test square */}
                  <g className="transition-opacity duration-500" opacity={step === 3 ? 1 : 0}>
                    <rect x="388" y="232" width="84" height="46" fill="rgba(255,255,255,.08)" stroke="#f2eee7" strokeWidth="2" strokeDasharray="6 5" />
                    <text x="392" y="226" fill="#f2eee7" style={{ fontFamily: "var(--font-plex-mono)", fontSize: 11, letterSpacing: "0.1em" }}>
                      10×10 TEST SQUARE
                    </text>
                  </g>
                  {/* nails + magnet sweeper */}
                  <g>
                    {Array.from({ length: 14 }, (_, i) => (
                      <rect
                        key={i}
                        x={110 + i * 44 + (i % 3) * 7}
                        y={436 - (i % 2) * 2}
                        width="6"
                        height="1.8"
                        fill="#c9ccd0"
                        className="transition-opacity duration-300"
                        opacity={step === 4 ? 1 : 0}
                      />
                    ))}
                    {step === 5 && (
                      <g style={{ animation: "sweep-x 3.2s ease-in-out infinite alternate" }}>
                        <rect x="100" y="424" width="44" height="10" rx="2" fill="var(--copper)" stroke="#0e1620" strokeWidth="2" />
                        <circle cx="108" cy="436" r="4" fill="#0e1620" />
                        <circle cx="136" cy="436" r="4" fill="#0e1620" />
                        <line x1="140" y1="424" x2="162" y2="392" stroke="#0e1620" strokeWidth="3" />
                      </g>
                    )}
                  </g>
                  {/* warranty seal */}
                  <g
                    style={{
                      transform: step === 6 ? "scale(1)" : "scale(0)",
                      transformOrigin: "700px 150px",
                      transition: "transform 900ms var(--ease-out-expo)",
                    }}
                  >
                    <circle cx="700" cy="150" r="48" fill="var(--copper)" stroke="#0e1620" strokeWidth="2.5" />
                    <circle cx="700" cy="150" r="39" fill="none" stroke="#0e1620" strokeWidth="1.2" strokeDasharray="3 3" />
                    <text x="700" y="148" textAnchor="middle" fill="#0e1620" style={{ fontFamily: "var(--font-archivo)", fontWeight: 800, fontSize: 22 }}>
                      25 YR
                    </text>
                    <text x="700" y="166" textAnchor="middle" fill="#0e1620" style={{ fontFamily: "var(--font-plex-mono)", fontSize: 9, letterSpacing: "0.14em" }}>
                      WARRANTY
                    </text>
                  </g>
                </HouseArt>
              </div>

              <HailCanvas active={step === 0} svgRef={svg} className="pointer-events-none absolute inset-0 h-full w-full" />

              {/* camera flash for the photo report */}
              <div aria-hidden className={clsx("pointer-events-none absolute inset-0 bg-white opacity-0", step === 1 && "[animation:flash_2.4s_linear_infinite]")} />

              {/* HUD */}
              <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4 md:p-6">
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
                  "flex min-h-[78svh] flex-col justify-end border-l pb-[8svh] pl-6 pt-10 transition-[border-color,opacity] duration-700 md:pl-10 lg:min-h-[78vh] lg:justify-center lg:py-10",
                  i === step ? "border-copper" : "border-line",
                )}
              >
                <p className="t-eyebrow text-accent">
                  Step 0{i + 1} · {s.time}
                </p>
                <h3 className={clsx("t-h2 mt-4 !text-[clamp(1.8rem,3.2vw,3.2rem)] transition-colors duration-700", i === step ? "text-stone" : "text-stone/55")}>{s.title}</h3>
                <p className="t-lead mt-5 max-w-md text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-line pt-10">
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
