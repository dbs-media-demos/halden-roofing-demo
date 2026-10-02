import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import clsx from "clsx";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { CtaBand } from "@/components/sections/CtaBand";
import { Marquee } from "@/components/sections/Marquee";
import { projects } from "@/content/projects";
import { photos, type PhotoKey } from "@/lib/photos";
import { buildMetadata } from "@/lib/seo";
import { graph, breadcrumbSchema, itemListSchema, webPageSchema } from "@/lib/schema";

const description = "Recent Halden Roofing projects across Fort Worth, Keller, Southlake, Arlington and Benbrook — hail claims, metal retrofits, slate and tile, with before & after photos.";

export const metadata: Metadata = buildMetadata({ title: "Roofing Projects & Case Studies", description, path: "/projects", eyebrow: "Projects" });

const moreWork: { key: PhotoKey; caption: string }[] = [
  { key: "house-modern-farmhouse", caption: "Keller · Class 4 shingle" },
  { key: "metal-twin-peaks", caption: "Southlake · Standing seam" },
  { key: "house-black", caption: "Burleson · Matte black metal" },
  { key: "aerial-house-grey", caption: "Arlington · Hail replacement" },
  { key: "house-white-classic", caption: "Benbrook · Galvalume" },
  { key: "tile-dormers", caption: "Fort Worth · Clay tile" },
  { key: "house-timber-porch", caption: "Keller · Metal porch" },
  { key: "commercial-flat", caption: "Fort Worth · TPO" },
];

export default function ProjectsPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
  ];
  return (
    <PageShell>
      <JsonLd
        data={graph(
          webPageSchema({ path: "/projects", name: "Roofing Projects & Case Studies", description, type: "CollectionPage" }),
          itemListSchema(projects.map((p) => ({ name: p.title, path: `/projects/${p.slug}` }))),
          breadcrumbSchema(crumbs),
        )}
      />
      <PageHero
        crumbs={crumbs}
        eyebrow="Projects"
        title={
          <>
            Roofs we&rsquo;d <span className="text-copper">sign our name to.</span>
          </>
        }
        lead="Five case studies with the numbers, the before & after and what the homeowners said — plus a few more roofs from around Tarrant County."
      />

      <section aria-label="Case studies" className="theme-ink pb-24 pt-16 md:pb-32">
        <div className="wrap grid gap-x-6 gap-y-16 md:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal key={p.slug} className={clsx(i % 2 === 1 && "md:mt-32")}>
              <Link href={`/projects/${p.slug}`} className="group block">
                <ViewTransition name={`project-${p.slug}`} share="morph" default="none">
                  <div className="relative aspect-[4/5] overflow-hidden bg-slate transition-[clip-path] duration-700 ease-[var(--ease-out-expo)] [clip-path:polygon(0_10%,50%_0,100%_10%,100%_100%,0_100%)] group-hover:[clip-path:polygon(0_0,50%_0,100%_0,100%_100%,0_100%)]">
                    <Image
                      src={photos[p.hero]}
                      alt={`${p.title} — ${p.material}`}
                      fill
                      sizes="(min-width: 768px) 48vw, 100vw"
                      className="object-cover transition-transform duration-1000 ease-[var(--ease-out-expo)] group-hover:scale-105"
                    />
                  </div>
                </ViewTransition>
                <div className="mt-6 flex items-start justify-between gap-6">
                  <div>
                    <p className="t-eyebrow text-faint">
                      0{i + 1} · {p.neighborhood}, {p.city} · {p.year}
                    </p>
                    <h2 className="mt-3 font-display text-[clamp(1.5rem,2.6vw,2.4rem)] font-extrabold uppercase leading-none tracking-[-0.03em]">{p.title}</h2>
                    <p className="mt-3 max-w-md text-muted">{p.summary}</p>
                  </div>
                  <span aria-hidden className="mt-1 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line transition-colors group-hover:border-copper group-hover:bg-copper group-hover:text-ink">
                    →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="theme-ink border-y border-line py-7">
        <Marquee items={["Hail claims", "Metal retrofits", "Slate restoration", "Clay tile", "Seamless gutters", "Commercial TPO"]} className="font-display text-[clamp(1.4rem,3vw,2.6rem)] font-extrabold uppercase tracking-[-0.03em] text-stone/85" />
      </div>

      <section aria-labelledby="more-title" className="theme-stone py-24 md:py-32">
        <div className="wrap">
          <p className="t-eyebrow text-accent">More from the field</p>
          <h2 id="more-title" className="t-h2 mt-5">
            A few more roofs.
          </h2>
          <Reveal stagger={0.06} className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-4">
            {moreWork.map((m, i) => (
              <figure key={m.key} className="mb-4 break-inside-avoid">
                <div className={clsx("relative overflow-hidden bg-stone-3", i % 3 === 0 ? "aspect-[4/5]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/3]")}>
                  <Image src={photos[m.key]} alt={m.caption} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-1000 hover:scale-105" />
                </div>
                <figcaption className="t-spec mt-2 text-muted">{m.caption}</figcaption>
              </figure>
            ))}
          </Reveal>
        </div>
      </section>

      <CtaBand image="house-lit-windows" title="Your roof could be next. (In a good way.)" />
    </PageShell>
  );
}
