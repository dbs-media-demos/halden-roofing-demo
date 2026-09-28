"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { cities } from "@/content/cities";
import { site } from "@/lib/site";
import { SplitReveal, Reveal } from "@/components/ui/Reveal";

/** Equirectangular projection (cos-lat corrected) into a 1000 × 1109 viewBox. */
const project = (lat: number, lng: number) => ({ x: ((lng + 97.58) / 0.58) * 1000, y: (33.02 - lat) * 2053.7 });

const lakes = [
  { name: "Eagle Mountain Lake", d: "M160 205 q30 -28 52 -4 q14 22 -4 48 q-10 30 -30 38 q-26 6 -30 -30 q-4 -28 12 -52z" },
  { name: "Lake Worth", d: "M250 440 q22 -18 44 -4 q16 16 -4 30 q-22 14 -40 4 q-14 -14 0 -30z" },
  { name: "Benbrook Lake", d: "M210 760 q20 -12 26 12 q6 26 -2 50 q-10 22 -24 6 q-14 -30 0 -68z" },
  { name: "Lake Arlington", d: "M655 620 q22 -12 34 6 q8 20 -10 28 q-24 8 -30 -10 q-2 -14 6 -24z" },
  { name: "Grapevine Lake", d: "M840 92 q36 -18 70 -2 q14 14 -8 26 q-34 16 -62 8 q-16 -14 0 -32z" },
];

type Props = { activeSlug?: string; headingAs?: "h1" | "h2"; heading?: string; compact?: boolean };

export function ServiceMap({ activeSlug, headingAs = "h2", heading = "Twelve minutes from downtown.", compact }: Props) {
  const [hover, setHover] = useState<string | null>(activeSlug ?? null);
  const hq = project(site.geo.lat, site.geo.lng);

  const map = (
    <svg viewBox="-20 0 1220 1109" className="h-auto w-full" role="img" aria-labelledby="map-desc">
      <desc id="map-desc">
        Stylized map of Tarrant County, Texas, showing the Halden Roofing shop in southwest Fort Worth and the six cities we serve:{" "}
        {cities.map((c) => c.name).join(", ")}.
      </desc>
      <defs>
        <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="var(--stone)" strokeOpacity="0.05" />
        </pattern>
        <linearGradient id="swath" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="var(--copper)" stopOpacity="0" />
          <stop offset="0.5" stopColor="var(--copper)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--copper)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="-20" width="1220" height="1109" fill="url(#map-grid)" />
      {/* county */}
      <path
        d="M52 60 L940 52 L944 520 L938 968 L60 972 L54 640 Z"
        fill="var(--stone)"
        fillOpacity="0.035"
        stroke="var(--stone)"
        strokeOpacity="0.28"
        strokeWidth="2"
        strokeDasharray="10 8"
      />
      <text x="70" y="94" fill="var(--stone)" fillOpacity="0.45" style={{ fontFamily: "var(--font-plex-mono)", fontSize: 18, letterSpacing: "0.2em" }}>
        TARRANT COUNTY
      </text>
      {/* highways */}
      <g fill="none" stroke="var(--stone)" strokeOpacity="0.14" strokeWidth="3">
        <path d="M440 30 C436 300 446 700 452 1100" />
        <path d="M30 705 C300 700 600 690 980 700" />
        <path d="M30 560 C300 540 600 545 980 560" />
        <ellipse cx="429" cy="560" rx="170" ry="190" />
      </g>
      {/* rivers */}
      <g fill="none" stroke="var(--sky)" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round">
        <path d="M276 460 C330 500 380 470 420 505 S520 525 600 500 S760 525 960 490" />
        <path d="M224 770 C260 700 330 650 380 600 S420 530 425 508" />
      </g>
      {lakes.map((l) => (
        <path key={l.name} d={l.d} fill="var(--sky)" fillOpacity="0.4" />
      ))}
      {/* hail swath */}
      <g className="map-swath">
        <polygon points="80,900 180,960 980,160 880,100" fill="url(#swath)" />
        <line x1="130" y1="930" x2="930" y2="130" stroke="var(--copper)" strokeOpacity="0.55" strokeWidth="2" strokeDasharray="2 14" className="map-hail" />
      </g>
      <text x="672" y="410" fill="var(--copper-2)" transform="rotate(-45 672 410)" style={{ fontFamily: "var(--font-plex-mono)", fontSize: 16, letterSpacing: "0.18em" }}>
        TYPICAL SPRING HAIL PATH
      </text>

      {/* service radius */}
      <circle cx={hq.x} cy={hq.y} r="60" fill="none" stroke="var(--copper)" strokeOpacity="0.6" className="map-ping" />

      {/* cities */}
      {cities.map((c) => {
        const p = project(c.lat, c.lng);
        const on = hover === c.slug;
        return (
          <g key={c.slug} style={{ transition: "opacity .4s" }} opacity={hover && !on ? 0.45 : 1}>
            <circle cx={p.x} cy={p.y} r={on ? 16 : 10} fill={on ? "var(--copper)" : "var(--stone)"} style={{ transition: "r .4s, fill .4s" }} />
            <circle cx={p.x} cy={p.y} r="4" fill="var(--ink)" />
            <text
              x={c.slug === "keller" ? p.x - 24 : p.x + 24}
              y={p.y + 10}
              textAnchor={c.slug === "keller" ? "end" : "start"}
              fill="var(--stone)"
              style={{ fontFamily: "var(--font-archivo)", fontVariationSettings: '"wdth" 125', fontWeight: 800, fontSize: on ? 34 : 28, transition: "font-size .4s" }}
            >
              {c.name.toUpperCase()}
            </text>
          </g>
        );
      })}

      {/* HQ */}
      <g transform={`translate(${hq.x - 22} ${hq.y - 44})`}>
        <rect x="0" y="0" width="44" height="44" fill="var(--copper)" />
        <path d="M8 24 L22 14 L36 24 M13 21 V36 M31 21 V36 M13 29 H31" fill="none" stroke="var(--ink)" strokeWidth="3.5" />
      </g>
      <text x={hq.x - 30} y={hq.y + 30} textAnchor="end" fill="var(--copper-2)" style={{ fontFamily: "var(--font-plex-mono)", fontSize: 16, letterSpacing: "0.14em" }}>
        HALDEN HQ
      </text>
    </svg>
  );

  if (compact) return map;

  return (
    <section aria-labelledby="map-title" className="theme-slate relative overflow-hidden py-24 md:py-36">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <p className="t-eyebrow text-accent">Service area</p>
          <SplitReveal as={headingAs} id="map-title" className="t-h2 mt-5">
            {heading}
          </SplitReveal>
          <Reveal>
            <p className="mt-6 max-w-md text-muted">
              Thirty from anywhere we work. Our crews live here — when a storm rolls across Tarrant County, we&rsquo;re on your roof
              within 48 hours, and still here when your warranty matters.
            </p>
          </Reveal>
          <ul className="mt-10 border-t border-line" onMouseLeave={() => setHover(activeSlug ?? null)}>
            {cities.map((c) => (
              <li key={c.slug} className="border-b border-line">
                <Link
                  href={`/service-areas/${c.slug}`}
                  onMouseEnter={() => setHover(c.slug)}
                  onFocus={() => setHover(c.slug)}
                  className="group flex items-center justify-between py-4"
                >
                  <span className={clsx("font-display text-xl font-extrabold uppercase tracking-[-0.02em] transition-colors", hover === c.slug ? "text-copper-2" : "")}>
                    {c.name}
                  </span>
                  <span className="t-spec text-faint">
                    {c.roofs.toLocaleString("en-US")} roofs · {c.driveTime}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Reveal className="lg:col-span-7">{map}</Reveal>
      </div>
    </section>
  );
}
