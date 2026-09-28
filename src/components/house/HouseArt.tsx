"use client";

import { useId, type ReactNode, type Ref } from "react";
import type { MaterialId } from "@/content/materials";

/*
 * The Halden house: a front elevation with a hip roof and a front-facing gable
 * wing, all at a 6/12 pitch. The roof is filled with an SVG pattern per material;
 * new roofs "install" course by course (CSS keyframes per strip, staggered).
 */

export const RIDGE_Y = 212;
export const EAVE_Y = 296;
const RIDGE_L = 300;
const RIDGE_R = 520;
const SLOPE = 174 / 84; // horizontal run per unit of rise for the hips

const xl = (y: number) => RIDGE_L - (y - RIDGE_Y) * SLOPE;
const xr = (y: number) => RIDGE_R + (y - RIDGE_Y) * SLOPE;

/** Horizontal bands of the main roof, ridge → eave. */
export function roofStrips(count: number) {
  const h = (EAVE_Y - RIDGE_Y) / count;
  return Array.from({ length: count }, (_, i) => {
    const y0 = RIDGE_Y + i * h;
    const y1 = y0 + h + 0.6; // tiny overlap hides seams
    return `${xl(y0)},${y0} ${xr(y0)},${y0} ${xr(y1)},${y1} ${xl(y1)},${y1}`;
  });
}

const MAIN_ROOF = `126,${EAVE_Y} ${RIDGE_L},${RIDGE_Y} ${RIDGE_R},${RIDGE_Y} 694,${EAVE_Y}`;
const RAKE = "170,323 290,263 410,323 394,323 290,272 186,323";

/** Mix a hex colour towards white (amt > 0) or black (amt < 0). */
export function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const c = (v: number) => Math.round(v + (t - v) * p);
  return `#${((1 << 24) | (c(r) << 16) | (c(g) << 8) | c(b)).toString(16).slice(1)}`;
}

function RoofPattern({ id, material, color }: { id: string; material: MaterialId; color: string }) {
  const dark = shade(color, -0.35);
  const darker = shade(color, -0.55);
  const light = shade(color, 0.16);
  const mid = shade(color, -0.12);

  if (material === "metal") {
    return (
      <pattern id={id} width="22" height="40" patternUnits="userSpaceOnUse">
        <rect width="22" height="40" fill={color} />
        <rect x="0" width="10" height="40" fill={light} opacity="0.18" />
        <rect x="19.5" width="2.5" height="40" fill={light} opacity="0.9" />
        <rect x="18.2" width="1.3" height="40" fill={darker} opacity="0.8" />
      </pattern>
    );
  }
  if (material === "tile") {
    return (
      <pattern id={id} width="26" height="18" patternUnits="userSpaceOnUse">
        <rect width="26" height="18" fill={darker} />
        <path d="M1 18 V8 Q6.5 0 12 8 V18 Z" fill={color} />
        <path d="M14 18 V8 Q19.5 0 25 8 V18 Z" fill={mid} />
        <path d="M2.5 17 V8.5 Q4 5 6 4.2" fill="none" stroke={light} strokeWidth="1.3" opacity="0.8" />
        <path d="M15.5 17 V8.5 Q17 5 19 4.2" fill="none" stroke={light} strokeWidth="1.3" opacity="0.6" />
        <rect y="16.8" width="26" height="1.2" fill={darker} />
      </pattern>
    );
  }
  if (material === "slate") {
    return (
      <pattern id={id} width="36" height="24" patternUnits="userSpaceOnUse">
        <rect width="36" height="24" fill={darker} />
        <rect x="0.5" y="0.5" width="11" height="10.8" fill={color} />
        <rect x="12.5" y="0.5" width="11" height="10.8" fill={mid} />
        <rect x="24.5" y="0.5" width="11" height="10.8" fill={shade(color, 0.07)} />
        <rect x="-5.5" y="12.5" width="11" height="10.8" fill={mid} />
        <rect x="6.5" y="12.5" width="11" height="10.8" fill={shade(color, 0.05)} />
        <rect x="18.5" y="12.5" width="11" height="10.8" fill={color} />
        <rect x="30.5" y="12.5" width="11" height="10.8" fill={mid} />
      </pattern>
    );
  }
  // Architectural asphalt shingle
  return (
    <pattern id={id} width="40" height="30" patternUnits="userSpaceOnUse">
      <rect width="40" height="30" fill={color} />
      <rect x="13" y="0" width="10" height="15" fill={mid} />
      <rect x="23" y="15" width="12" height="15" fill={mid} />
      <rect x="2" y="15" width="6" height="15" fill={shade(color, 0.08)} />
      <path d="M12.5 0 V14 M30.5 0 V14 M3.5 15 V29 M22.5 15 V29" stroke={dark} strokeWidth="1.1" />
      <rect y="13.8" width="40" height="1.4" fill={darker} />
      <rect y="28.8" width="40" height="1.4" fill={darker} />
      <rect y="15.2" width="40" height="0.8" fill={light} opacity="0.5" />
      <rect y="0.2" width="40" height="0.8" fill={light} opacity="0.5" />
    </pattern>
  );
}

export type RoofLayer = { material: MaterialId; color: string; key: string };

type Props = {
  /** Roof currently showing (fully drawn). */
  base: RoofLayer;
  /** A roof being installed over the base, course by course. */
  incoming?: RoofLayer | null;
  /** Direction of the incoming install. */
  installFrom?: "ridge" | "eave";
  /** Windows glow warm (dusk). */
  glow?: boolean;
  /** Extra SVG drawn on top (damage marks, ladder, badges…). */
  children?: ReactNode;
  className?: string;
  title?: string;
  strips?: number;
  /** Stagger per course, ms. */
  stagger?: number;
  svgRef?: Ref<SVGSVGElement>;
};

export function HouseArt({ base, incoming, installFrom = "ridge", glow, children, className, title, strips = 8, stagger = 55, svgRef }: Props) {
  const uid = useId().replace(/:/g, "");
  const baseId = `roof-${uid}-a`;
  const incId = `roof-${uid}-b`;
  const shadeId = `shade-${uid}`;
  const sidingId = `siding-${uid}`;
  const bands = roofStrips(strips);
  const order = (i: number) => (installFrom === "ridge" ? i : strips - 1 - i);

  const wall = "#ddd6c9";
  const wall2 = "#cfc6b6";
  const trim = "#0e1620";
  const glass = glow ? "#f1b074" : "#2c3d50";

  return (
    <svg ref={svgRef} viewBox="0 0 800 470" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <RoofPattern id={baseId} material={base.material} color={base.color} />
        {incoming && <RoofPattern id={incId} material={incoming.material} color={incoming.color} />}
        <linearGradient id={shadeId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </linearGradient>
        <pattern id={sidingId} width="20" height="9" patternUnits="userSpaceOnUse">
          <rect width="20" height="9" fill={wall2} />
          <rect y="8" width="20" height="1" fill="#000" opacity="0.12" />
        </pattern>
      </defs>

      {/* ground + shadow */}
      <ellipse cx="410" cy="446" rx="330" ry="10" fill="#000" opacity="0.18" />

      {/* chimney (behind roof) */}
      <polygon points="560,184 592,184 592,250 560,236" fill="#8f5b43" stroke={trim} strokeWidth="2" />
      <rect x="555" y="178" width="42" height="9" fill="var(--copper)" stroke={trim} strokeWidth="2" />

      {/* main walls */}
      <rect x="150" y="292" width="520" height="148" fill={wall} stroke={trim} strokeWidth="2" />
      {/* garage */}
      <rect x="532" y="350" width="112" height="90" fill="#bfb6a6" stroke={trim} strokeWidth="2" />
      {[368, 386, 404, 422].map((y) => (
        <line key={y} x1="532" x2="644" y1={y} y2={y} stroke={trim} strokeWidth="1.2" opacity="0.5" />
      ))}
      {/* windows main */}
      <g className="house-glass">
        <rect x="428" y="330" width="72" height="54" fill={glass} stroke={trim} strokeWidth="2" style={{ transition: "fill 1.2s" }} />
        <line x1="464" x2="464" y1="330" y2="384" stroke={trim} strokeWidth="2" />
        <line x1="428" x2="500" y1="357" y2="357" stroke={trim} strokeWidth="2" />
      </g>

      {/* main roof: base */}
      <polygon points={MAIN_ROOF} fill={`url(#${baseId})`} />
      {/* main roof: incoming, course by course */}
      {incoming && (
        <g key={incoming.key}>
          {bands.map((pts, i) => (
            <polygon
              key={i}
              points={pts}
              fill={`url(#${incId})`}
              className="roof-course"
              style={{ animationDelay: `${order(i) * stagger}ms` }}
            />
          ))}
        </g>
      )}
      <polygon points={MAIN_ROOF} fill={`url(#${shadeId})`} />
      <polygon points={MAIN_ROOF} fill="none" stroke={trim} strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="120" x2="700" y1={EAVE_Y + 2} y2={EAVE_Y + 2} stroke={trim} strokeWidth="5" />
      <line x1={RIDGE_L} x2={RIDGE_R} y1={RIDGE_Y} y2={RIDGE_Y} stroke={trim} strokeWidth="4" />

      {/* gable wing */}
      <rect x="190" y="318" width="200" height="122" fill={wall} stroke={trim} strokeWidth="2" />
      <polygon points="190,321 290,272 390,321" fill={`url(#${sidingId})`} stroke={trim} strokeWidth="2" />
      <circle cx="290" cy="300" r="9" fill={trim} opacity="0.85" />
      <polygon points={RAKE} fill={`url(#${baseId})`} stroke={trim} strokeWidth="2" strokeLinejoin="round" />
      {incoming && (
        <polygon
          key={`rake-${incoming.key}`}
          points={RAKE}
          fill={`url(#${incId})`}
          stroke={trim}
          strokeWidth="2"
          strokeLinejoin="round"
          className="roof-course"
          style={{ animationDelay: `${strips * stagger}ms` }}
        />
      )}
      {/* wing windows + door */}
      <rect x="208" y="346" width="40" height="46" fill={glass} stroke={trim} strokeWidth="2" style={{ transition: "fill 1.2s" }} />
      <rect x="332" y="346" width="40" height="46" fill={glass} stroke={trim} strokeWidth="2" style={{ transition: "fill 1.2s" }} />
      <rect x="268" y="360" width="44" height="80" fill="var(--slate-2)" stroke={trim} strokeWidth="2" />
      <circle cx="303" cy="402" r="2.4" fill="var(--copper)" />

      {/* shrubs */}
      <path d="M150 440 q10 -26 30 -22 q14 -18 30 4 q12 -6 16 18 z" fill="#3f5a4a" />
      <path d="M392 440 q8 -20 24 -16 q12 -14 24 4 q10 -2 10 12 z" fill="#35503f" />
      <path d="M648 440 q8 -22 26 -18 q14 -10 20 18 z" fill="#3f5a4a" />
      <line x1="70" x2="750" y1="440" y2="440" stroke={trim} strokeWidth="2.5" />

      {children}
    </svg>
  );
}
