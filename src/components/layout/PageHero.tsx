import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { ReactNode, CSSProperties } from "react";
import clsx from "clsx";

export type Crumb = { name: string; path: string };

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="t-eyebrow flex flex-wrap items-center gap-2 text-faint">
        {items.map((c, i) => (
          <li key={c.path} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-copper">/</span>}
            {i === items.length - 1 ? (
              <span aria-current="page" className="text-muted">
                {c.name}
              </span>
            ) : (
              <Link href={c.path} className="transition-colors hover:text-stone">
                {c.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

type Props = {
  crumbs: Crumb[];
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  image?: StaticImageData;
  imageAlt?: string;
  children?: ReactNode;
  /** Replace the default image with custom media (e.g. a ViewTransition-wrapped image). */
  media?: ReactNode;
  aside?: ReactNode;
};

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

/**
 * Inner-page hero: breadcrumbs, a big wide headline and a full-bleed photo whose
 * top edge opens from a steep gable to a shallow one (CSS-only, LCP-safe).
 */
export function PageHero({ crumbs, eyebrow, title, lead, image, imageAlt = "", children, media, aside }: Props) {
  return (
    <section className="theme-ink relative pt-[calc(var(--header-h)+4.5rem)]">
      <div className="wrap">
        <Breadcrumbs items={crumbs} className="anim-fade" />
        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className={clsx(aside ? "lg:col-span-8" : "lg:col-span-10")}>
            <p className="t-eyebrow anim-fade text-accent" style={d(0.05)}>
              {eyebrow}
            </p>
            <h1 className="t-h1 anim-heading mt-5" style={d(0.1)}>
              {title}
            </h1>
          </div>
          {aside && (
            <div className="anim-fade lg:col-span-4" style={d(0.35)}>
              {aside}
            </div>
          )}
        </div>
        {(lead || children) && (
          <div className="anim-fade mt-8 grid gap-8 md:grid-cols-12 md:items-end" style={d(0.3)}>
            {lead && <div className="t-lead text-muted md:col-span-7">{lead}</div>}
            {children && <div className="flex flex-wrap gap-3 md:col-span-5 md:justify-end">{children}</div>}
          </div>
        )}
      </div>
      {(image || media) && (
        <div className="hero-gable relative mt-14 h-[52svh] min-h-[320px] overflow-hidden md:mt-20 md:h-[72svh]">
          {media ?? <Image src={image!} alt={imageAlt} fill loading="eager" sizes="100vw" quality={60} className="object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-b from-ink/25 via-transparent to-transparent" />
        </div>
      )}
    </section>
  );
}
