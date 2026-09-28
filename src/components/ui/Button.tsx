"use client";

import Link from "next/link";
import { useRef, type ReactNode, type MouseEvent } from "react";
import clsx from "clsx";

type Variant = "copper" | "ghost" | "light" | "dark";

const styles: Record<Variant, string> = {
  copper: "bg-copper text-ink hover:bg-copper-2",
  ghost: "border border-line text-fg hover:border-fg",
  light: "bg-stone text-ink hover:bg-white",
  dark: "bg-ink text-stone hover:bg-slate",
};

type Props = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  /** Icon on the right (defaults to a roof chevron arrow). */
  icon?: ReactNode | false;
  size?: "md" | "lg";
  ariaLabel?: string;
  external?: boolean;
};

/** Pill button with a magnetic pull on desktop and a chevron that climbs on hover. */
export function Button({ href, children, variant = "copper", className, icon, size = "md", ariaLabel, external }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el || window.matchMedia("(hover: none)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.22;
    const y = (e.clientY - r.top - r.height / 2) * 0.32;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  const cls = clsx(
    "group relative inline-flex items-center justify-center gap-3 rounded-full font-semibold tracking-[-0.01em] transition-[background-color,border-color,color,transform] duration-300 ease-[var(--ease-out-expo)] will-change-transform",
    size === "lg" ? "min-h-14 px-7 text-[1.02rem]" : "min-h-12 px-6 text-[0.95rem]",
    styles[variant],
    className,
  );

  const inner = (
    <>
      <span>{children}</span>
      {icon !== false && (
        <span aria-hidden className="relative -mr-1 grid h-5 w-5 place-items-center overflow-hidden">
          {icon ?? (
            <>
              <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-5">
                <path d="M3 13 L10 6.5 L17 13" fill="none" stroke="currentColor" strokeWidth="2.2" />
              </svg>
              <svg viewBox="0 0 20 20" className="absolute h-4 w-4 translate-y-5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0">
                <path d="M3 13 L10 6.5 L17 13" fill="none" stroke="currentColor" strokeWidth="2.2" />
              </svg>
            </>
          )}
        </span>
      )}
    </>
  );

  if (external || href.startsWith("tel:") || href.startsWith("mailto:")) {
    return (
      <a ref={ref} href={href} className={cls} onMouseMove={onMove} onMouseLeave={onLeave} aria-label={ariaLabel}>
        {inner}
      </a>
    );
  }
  return (
    <Link ref={ref} href={href} className={cls} onMouseMove={onMove} onMouseLeave={onLeave} aria-label={ariaLabel}>
      {inner}
    </Link>
  );
}

export function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={clsx("h-4 w-4", className)} aria-hidden>
      <path
        d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z"
        fill="currentColor"
      />
    </svg>
  );
}
