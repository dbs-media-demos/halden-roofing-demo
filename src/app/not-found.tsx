import type { Metadata } from "next";
import { SiteChrome } from "@/components/layout/SiteChrome";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

const links = [
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/service-areas", label: "Service areas" },
  { href: "/contact", label: "Contact" },
];

/** 404 — the page blew off in the storm. */
export default function NotFound() {
  return (
    <SiteChrome>
      <main id="main" className="theme-ink relative flex min-h-[100svh] items-center overflow-hidden pb-24 pt-[calc(var(--header-h)+4rem)]">
        <svg aria-hidden viewBox="0 0 800 420" className="pointer-events-none absolute -right-20 bottom-0 w-[70vw] max-w-[900px] text-stone/10">
          <path d="M60 400 V230 L400 60 L740 230 V400" fill="none" stroke="currentColor" strokeWidth="6" />
          {Array.from({ length: 9 }, (_, r) =>
            Array.from({ length: 12 }, (_, c) => {
              const missing = (r * 7 + c * 3) % 11 === 0 || (r === 3 && c > 5 && c < 9);
              const y = 100 + r * 16;
              const halfW = 2 * (y - 60) - 24;
              const x = 400 - halfW + (c / 11) * halfW * 2 - 12;
              return missing ? null : <rect key={`${r}-${c}`} x={x} y={y} width="24" height="12" fill="currentColor" />;
            }),
          )}
          <rect x="560" y="44" width="30" height="60" className="fill-copper/60" />
        </svg>
        <div className="wrap relative">
          <p className="t-eyebrow anim-fade text-accent">Error 404</p>
          <h1 className="t-mega anim-heading mt-6">
            This page blew off
            <br />
            <span className="text-copper">in the storm.</span>
          </h1>
          <p className="t-lead anim-fade mt-8 max-w-xl text-muted">
            We&rsquo;ve got a crew on it. In the meantime, here&rsquo;s where you probably meant to go.
          </p>
          <div className="anim-fade mt-10 flex flex-wrap gap-3">
            <Button href="/" size="lg">
              Back to home
            </Button>
            <Button href="/free-inspection" variant="ghost" size="lg">
              Book a free inspection
            </Button>
          </div>
          <ul className="mt-14 flex flex-wrap gap-x-8 gap-y-3">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="t-eyebrow text-muted underline-offset-4 hover:text-stone hover:underline">
                  {l.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </SiteChrome>
  );
}
