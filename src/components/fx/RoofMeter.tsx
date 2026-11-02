"use client";

import { useEffect, useId, useState, type RefObject } from "react";
import clsx from "clsx";

/**
 * Progress for the case-study rail: one little gable roof per project. As each card comes
 * into view its roof is shingled course by course and the ridge cap snaps on.
 */
export function RoofMeter({ scope, count, className }: { scope: RefObject<HTMLElement | null>; count: number; className?: string }) {
  const id = useId();
  const [reached, setReached] = useState(-1);

  useEffect(() => {
    const cards = scope.current?.querySelectorAll<HTMLElement>("[data-rail-card]");
    if (!cards?.length) return;
    const seen = new Set<number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = Number((e.target as HTMLElement).dataset.railCard);
          if (e.isIntersecting) seen.add(i);
          else seen.delete(i);
        }
        if (seen.size) setReached(Math.max(...seen));
      },
      { threshold: 0.6 },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [scope]);

  return (
    <div aria-hidden className={clsx("flex items-center gap-5", className)}>
      <div className="flex gap-2.5">
        {Array.from({ length: count }, (_, i) => {
          const on = i <= reached;
          const clip = `${id}-${i}`;
          return (
            <svg key={i} viewBox="0 0 40 22" className="h-[18px] w-[33px] overflow-visible md:h-[22px] md:w-10">
              <clipPath id={clip}>
                <polygon points="1,21 20,2 39,21" />
              </clipPath>
              <g clipPath={`url(#${clip})`}>
                {[0, 1, 2].map((k) => (
                  <rect
                    key={k}
                    x="0"
                    y={15 - k * 6.2}
                    width="40"
                    height="6.6"
                    fill={k % 2 ? "#33393f" : "#2c3238"}
                    style={{
                      transform: on ? "none" : "translateY(-7px)",
                      opacity: on ? 1 : 0,
                      transition: `transform 520ms var(--ease-out-expo) ${k * 110}ms, opacity 300ms ${k * 110}ms`,
                    }}
                  />
                ))}
              </g>
              <polyline points="1,21 20,2 39,21" fill="none" stroke="currentColor" strokeOpacity={on ? 0 : 0.35} strokeWidth="1.4" className="transition-[stroke-opacity] duration-500" />
              <polyline
                points="9,13 20,2 31,13"
                fill="none"
                stroke="var(--copper)"
                strokeWidth="2.6"
                strokeLinecap="round"
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "50% 0",
                  transform: on ? "none" : "translateY(-6px) scale(0.6)",
                  opacity: on ? 1 : 0,
                  transition: "transform 600ms cubic-bezier(.34,1.8,.5,1) 380ms, opacity 200ms 380ms",
                }}
              />
            </svg>
          );
        })}
      </div>
      <p className="t-spec text-muted">
        Roof {String(Math.max(reached + 1, 1)).padStart(2, "0")} of {String(count).padStart(2, "0")}
      </p>
    </div>
  );
}
