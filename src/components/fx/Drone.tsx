"use client";

import { useRef } from "react";
import { useRun } from "@/components/fx/useRun";

const ROTORS: [number, number][] = [
  [9, 9],
  [39, 9],
  [9, 39],
  [39, 39],
];

/**
 * An inspection drone that crosses its (relative) parent — the map — stopping twice to scan
 * a roof (a dashed copper footprint) before flying on. Pointer-transparent, paused off-screen,
 * gone with reduced motion.
 */
export function Drone() {
  const root = useRef<HTMLDivElement>(null);
  useRun(root);

  return (
    <div ref={root} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden">
      <div className="drone fx-loop">
        <span className="drone-scan fx-loop absolute left-0 top-[46px] h-24 w-24 rounded-[3px] border-2 border-dashed border-copper bg-copper/10 md:h-32 md:w-32" />
        {/* shadow on the ground, offset like late-afternoon sun */}
        <svg viewBox="0 0 48 48" className="absolute left-0 top-[46px] h-11 w-11 -translate-x-1/2 -translate-y-1/2 opacity-25 blur-[2px] md:h-14 md:w-14">
          <rect x="16" y="16" width="16" height="16" rx="4" fill="#0e1620" />
          {ROTORS.map(([cx, cy]) => (
            <circle key={`${cx}${cy}`} cx={cx} cy={cy} r="8" fill="#0e1620" />
          ))}
        </svg>
        <svg viewBox="0 0 48 48" className="absolute left-0 top-0 h-11 w-11 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_2px_3px_rgba(14,22,32,.45)] md:h-14 md:w-14">
          <path d="M12 12 L36 36 M36 12 L12 36" stroke="#1c2a38" strokeWidth="3.4" strokeLinecap="round" />
          <rect x="16" y="16" width="16" height="16" rx="4" fill="#1c2a38" />
          <circle cx="24" cy="27" r="3.2" fill="#0e1620" stroke="#d98a52" strokeWidth="1.4" />
          <circle cx="24" cy="19.5" r="1.3" fill="#d98a52" />
          {ROTORS.map(([cx, cy]) => (
            <g key={`${cx}${cy}`}>
              <circle cx={cx} cy={cy} r="8.5" fill="#f2eee7" fillOpacity="0.28" stroke="#1c2a38" strokeOpacity="0.5" />
              <path d={`M${cx - 8} ${cy} L${cx + 8} ${cy}`} stroke="#1c2a38" strokeWidth="1.8" strokeLinecap="round" className="drone-rotor fx-loop" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
