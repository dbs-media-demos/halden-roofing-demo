"use client";

import clsx from "clsx";
import { useBiz } from "@/components/preview/BizContext";

/**
 * The Halden mark: a single-line gable at a true 6/12 pitch whose walls and
 * crossbar read as an "H". The copper chimney is the only warm note.
 * Path data is shared with icon.svg and the OG image.
 */
export const MARK = {
  roof: "M6 31 L32 18 L58 31",
  h: "M14 27 V56 M50 27 V56 M14 42 H50",
  chimney: { x: 40.5, y: 13, w: 6, h: 9 },
};

export function Mark({ className, animated = false, title }: { className?: string; animated?: boolean; title?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={clsx("shrink-0", animated && "mark-draw", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect x={MARK.chimney.x} y={MARK.chimney.y} width={MARK.chimney.w} height={MARK.chimney.h} fill="var(--copper)" />
      <path
        d={MARK.roof}
        fill="none"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
        pathLength={1}
        className="mark-roof"
      />
      <path d={MARK.h} fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="square" pathLength={1} className="mark-h" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  const biz = useBiz();
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <Mark className="h-9 w-9" animated />
      <span className="flex flex-col leading-none">
        <span className={clsx("block max-w-[11rem] truncate font-display font-extrabold uppercase tracking-[-0.02em] xl:max-w-[18rem]", biz.preview && biz.shortName.length > 14 ? "text-[0.95rem]" : "text-[1.15rem]")}>
          {biz.preview ? biz.shortName : "HALDEN"}
        </span>
        {!compact && (
          <span className="mt-1 hidden font-mono text-[0.56rem] tracking-[0.22em] text-muted sm:block">{biz.preview ? "ROOFING" : "ROOFING CO. · EST. 1998"}</span>
        )}
      </span>
    </span>
  );
}
