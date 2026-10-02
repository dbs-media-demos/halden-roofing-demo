import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceMap } from "@/components/sections/ServiceMap";
import { CtaBand } from "@/components/sections/CtaBand";
import { cities } from "@/content/cities";
import { photos } from "@/lib/photos";
import { buildMetadata } from "@/lib/seo";
import { graph, breadcrumbSchema, itemListSchema, webPageSchema } from "@/lib/schema";

const description = "Halden Roofing serves Fort Worth, Arlington, Keller, Southlake, Benbrook and Burleson — free inspections within 48 hours anywhere in our service area.";

export const metadata: Metadata = buildMetadata({ title: "Service Areas — Tarrant County Roofing", description, path: "/service-areas", eyebrow: "Service areas" });

export default function ServiceAreasPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Service areas", path: "/service-areas" },
  ];
  return (
    <PageShell>
      <JsonLd
        data={graph(
          webPageSchema({ path: "/service-areas", name: "Service Areas", description, type: "CollectionPage" }),
          itemListSchema(cities.map((c) => ({ name: `Roofing in ${c.name}, TX`, path: `/service-areas/${c.slug}` }))),
          breadcrumbSchema(crumbs),
        )}
      />
      <PageHero
        crumbs={crumbs}
        eyebrow="Service areas"
        title={
          <>
            Tarrant County <span className="text-copper">&amp; close by.</span>
          </>
        }
        lead="Six cities, one crew, the same warranty. If you're within 30 minutes of our Fort Worth shop, we're on your roof within 48 hours."
        image={photos["aerial-suburb-curve"]}
        imageAlt="Aerial view of a curving North Texas suburban neighborhood"
      />
      <ServiceMap heading="Where we work." />
      <section aria-label="Cities we serve" className="theme-ink py-24 md:py-32">
        <Reveal stagger={0.07} className="wrap grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((c) => (
            <Link key={c.slug} href={`/service-areas/${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-slate">
              <Image src={photos[c.image]} alt={`Homes in ${c.name}, TX`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-1000 ease-[var(--ease-out-expo)] group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="t-eyebrow text-copper-2">
                  {c.roofs.toLocaleString("en-US")} roofs · {c.driveTime}
                </p>
                <h2 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-[-0.03em]">{c.name}</h2>
                <p className="mt-2 text-sm text-stone/80">{c.neighborhoods.slice(0, 3).join(" · ")}</p>
              </div>
            </Link>
          ))}
        </Reveal>
      </section>
      <CtaBand image="aerial-houses-trees" />
    </PageShell>
  );
}
