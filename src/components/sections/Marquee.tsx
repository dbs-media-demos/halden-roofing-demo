import clsx from "clsx";

/** Endless strip of words separated by roof chevrons. Pure CSS; pauses on hover. */
export function Marquee({ items, className, reverse, duration = 45 }: { items: string[]; className?: string; reverse?: boolean; duration?: number }) {
  const row = (hidden?: boolean) => (
    <ul aria-hidden={hidden} className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <li key={i} className="flex items-center">
          <span className="px-6 md:px-10">{t}</span>
          <span className="chev text-copper" aria-hidden />
        </li>
      ))}
    </ul>
  );
  return (
    <div className={clsx("marquee-wrap overflow-hidden", className)}>
      <div className={clsx("marquee flex w-max", reverse && "marquee-rev")} style={{ "--dur": `${duration}s` } as React.CSSProperties}>
        {row()}
        {row(true)}
      </div>
    </div>
  );
}
