import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Parallax, Reveal, SplitReveal } from "@/components/ui/Reveal";
import { BeforeAfter } from "@/components/ui/BeforeAfter";
import { CtaBand } from "@/components/sections/CtaBand";
import { projects, projectBySlug } from "@/content/projects";
import { serviceBySlug } from "@/content/services";
import { photos } from "@/lib/photos";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { graph, breadcrumbSchema, webPageSchema, businessId } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) return {};
  return buildMetadata({
    title: `${p.title} — ${p.city}, TX`,
    description: `${p.summary} ${p.material}. Case study by Halden Roofing Co.`,
    path: `/projects/${p.slug}`,
    eyebrow: `Case study · ${p.city}`,
    type: "article",
  });
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) notFound();

  const path = `/projects/${p.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: p.title, path },
  ];
  const idx = projects.indexOf(p);
  const next = projects[(idx + 1) % projects.length];
  const service = serviceBySlug(p.service);

  return (
    <PageShell>
      <JsonLd
        data={graph(
          webPageSchema({ path, name: p.title, description: p.summary, type: "WebPage" }),
          {
            "@type": "CreativeWork",
            "@id": `${absoluteUrl(path)}#case-study`,
            name: `${p.title} — ${p.city}, TX`,
            about: p.material,
            description: p.summary,
            dateCreated: String(p.year),
            creator: { "@id": businessId },
            locationCreated: { "@type": "Place", name: `${p.neighborhood}, ${p.city}, TX` },
          },
          breadcrumbSchema(crumbs),
        )}
      />
      <PageHero
        crumbs={crumbs}
        eyebrow={`Case study · ${p.neighborhood}, ${p.city} · ${p.year}`}
        title={p.title}
        lead={p.summary}
        media={
          <ViewTransition name={`project-${p.slug}`} share="morph" default="none">
            <div className="absolute inset-0">
              <Image src={photos[p.hero]} alt={`${p.title} — finished roof`} fill loading="eager" sizes="100vw" quality={60} className="object-cover" />
            </div>
          </ViewTransition>
        }
        aside={<p className="t-spec text-muted">{p.material}</p>}
      />

      <section aria-label="Project numbers" className="theme-ink">
        <div className="wrap">
          <dl className="grid border-b border-line md:grid-cols-3">
            {p.stats.map((s, i) => (
              <div key={s.label} className={`py-8 md:px-8 md:py-12 ${i > 0 ? "border-t border-line md:border-l md:border-t-0" : ""} ${i === 0 ? "md:pl-0" : ""}`}>
                <dt className="t-eyebrow text-faint">{s.label}</dt>
                <dd className="mt-3 font-display text-[clamp(1.6rem,2.8vw,2.6rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="story-title" className="theme-ink py-24 md:py-32">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="t-eyebrow text-accent">The job</p>
            <SplitReveal id="story-title" className="t-h2 mt-5">
              What happened.
            </SplitReveal>
            {service && (
              <Link href={`/services/${service.slug}`} className="mt-8 inline-flex font-semibold text-accent underline-offset-4 hover:underline">
                About our {service.title.toLowerCase()} →
              </Link>
            )}
          </div>
          <Reveal as="div" stagger={0.1} className="flex flex-col gap-10 lg:col-span-8">
            {[
              { h: "The challenge", t: p.challenge },
              { h: "What we did", t: p.solution },
              { h: "The result", t: p.result },
            ].map((b, i) => (
              <div key={b.h} className="grid gap-4 border-t border-line pt-8 md:grid-cols-[12rem_1fr]">
                <h3 className="t-eyebrow text-muted">
                  0{i + 1} — {b.h}
                </h3>
                <p className="t-lead text-stone/90">{b.t}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="ba-title" className="theme-stone py-24 md:py-32">
        <div className="wrap">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <h2 id="ba-title" className="t-h2">
              Before &amp; after.
            </h2>
            <p className="t-spec text-muted">Drag the handle, or use ← → keys</p>
          </div>
          <BeforeAfter
            before={photos[p.before]}
            after={photos[p.after]}
            beforeAlt={`${p.title}: damaged roof before Halden`}
            afterAlt={`${p.title}: new roof after Halden`}
            className="mt-10 aspect-[4/3] w-full md:aspect-[21/9]"
            sizes="100vw"
            label={`${p.title}: before and after`}
          />

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {p.gallery.map((g, i) => (
              <Parallax key={g} className="aspect-[4/3]" amount={10 + i * 4}>
                <Image src={photos[g]} alt={`${p.title} — photo ${i + 1}`} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
              </Parallax>
            ))}
          </div>

          <Reveal as="figure" className="mx-auto mt-24 max-w-4xl text-center">
            <svg viewBox="0 0 64 40" className="mx-auto h-8 w-14 text-copper" aria-hidden>
              <path d="M4 36 L32 6 L60 36" fill="none" stroke="currentColor" strokeWidth="5" />
            </svg>
            <blockquote className="mt-8 font-display text-[clamp(1.5rem,3vw,2.8rem)] font-bold leading-[1.12] tracking-[-0.03em]">
              &ldquo;{p.quote.text}&rdquo;
            </blockquote>
            <figcaption className="t-eyebrow mt-8 text-muted">— {p.quote.author}</figcaption>
          </Reveal>
        </div>
      </section>

      <Link href={`/projects/${next.slug}`} className="theme-ink group relative block overflow-hidden">
        <div className="absolute inset-0">
          <Image src={photos[next.hero]} alt="" fill sizes="100vw" className="object-cover opacity-40 transition-[transform,opacity] duration-1000 group-hover:scale-105 group-hover:opacity-55" />
        </div>
        <div className="wrap relative py-24 md:py-36">
          <p className="t-eyebrow text-copper-2">Next case study</p>
          <p className="t-h1 mt-5 max-w-5xl transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-4">{next.title} →</p>
          <p className="mt-4 text-stone/80">
            {next.neighborhood}, {next.city}
          </p>
        </div>
      </Link>

      <CtaBand />
    </PageShell>
  );
}
