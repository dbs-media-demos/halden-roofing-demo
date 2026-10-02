import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button, PhoneIcon } from "@/components/ui/Button";
import { Reveal, SplitReveal } from "@/components/ui/Reveal";
import { ServiceMap } from "@/components/sections/ServiceMap";
import { ReviewCard } from "@/components/sections/Reviews";
import { FaqSection } from "@/components/sections/Faq";
import { CtaBand } from "@/components/sections/CtaBand";
import { cities, cityBySlug } from "@/content/cities";
import { services } from "@/content/services";
import { reviews } from "@/content/reviews";
import { projects } from "@/content/projects";
import { photos } from "@/lib/photos";
import { buildMetadata } from "@/lib/seo";
import { site, telHref } from "@/lib/site";
import { graph, breadcrumbSchema, serviceSchema, webPageSchema, faqSchema } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return cities.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/service-areas/[city]">): Promise<Metadata> {
  const { city } = await params;
  const c = cityBySlug(city);
  if (!c) return {};
  return buildMetadata({
    title: `Roofing Company in ${c.name}, TX`,
    description: `Roof replacement, repair and hail damage help in ${c.name}, TX. ${c.roofs.toLocaleString("en-US")} local roofs since 1998, free inspections within 48 hours, 25-year workmanship warranty.`,
    path: `/service-areas/${c.slug}`,
    eyebrow: `${c.name}, TX`,
  });
}

export default async function CityPage({ params }: PageProps<"/service-areas/[city]">) {
  const { city } = await params;
  const c = cityBySlug(city);
  if (!c) notFound();

  const path = `/service-areas/${c.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Service areas", path: "/service-areas" },
    { name: c.name, path },
  ];
  const local = reviews.filter((r) => r.city.startsWith(c.name));
  const shown = (local.length >= 2 ? local : [...local, ...reviews.filter((r) => !local.includes(r))]).slice(0, 3);
  const localProject = projects.find((p) => p.city === c.name);
  const faqs = [
    {
      q: `Do you charge extra to come out to ${c.name}?`,
      a: `No. ${c.name} is ${c.driveTime === "Home base" ? "our home base" : `about ${c.driveTime} from our shop`}, and inspections, estimates and travel are always free.`,
    },
    {
      q: `How fast can you inspect a roof in ${c.name} after a storm?`,
      a: "Within 48 hours, and usually sooner. During big hail events we triage active leaks first and tarp same-day.",
    },
    {
      q: `Do you pull permits in ${c.name}?`,
      a: `Yes. Where ${c.name} requires a permit for re-roofing, we pull it, schedule the inspection and give you the final sign-off.`,
    },
  ];
  const desc = `Roofing in ${c.name}, TX by ${site.name}.`;

  return (
    <PageShell>
      <JsonLd
        data={graph(
          webPageSchema({ path, name: `Roofing in ${c.name}, TX`, description: desc }),
          serviceSchema({ name: `Roofing in ${c.name}, TX`, description: c.intro, path, serviceType: "Roofing contractor", areaName: `${c.name}, TX`, offers: services.map((s) => s.title) }),
          breadcrumbSchema(crumbs),
          faqSchema(faqs),
        )}
      />
      <PageHero
        crumbs={crumbs}
        eyebrow={`${c.name}, TX · ${c.county}`}
        title={c.headline}
        lead={c.intro}
        image={photos[c.image]}
        imageAlt={`Homes in ${c.name}, Texas`}
      >
        <Button href="/free-inspection" size="lg">
          Free inspection in {c.name}
        </Button>
        <Button href={telHref} variant="ghost" size="lg" icon={<PhoneIcon className="text-copper" />}>
          {site.phoneDisplay}
        </Button>
      </PageHero>

      <section aria-label={`${c.name} at a glance`} className="theme-ink">
        <div className="wrap">
          <dl className="grid border-b border-line md:grid-cols-3">
            {[
              { l: `Roofs in ${c.name}`, v: c.roofs.toLocaleString("en-US") },
              { l: "From our shop", v: c.driveTime },
              { l: "ZIP codes", v: c.zips.join(" · ") },
            ].map((s, i) => (
              <div key={s.l} className={`py-8 md:px-8 md:py-12 ${i > 0 ? "border-t border-line md:border-l md:border-t-0" : ""} ${i === 0 ? "md:pl-0" : ""}`}>
                <dt className="t-eyebrow text-faint">{s.l}</dt>
                <dd className="mt-3 font-display text-[clamp(1.4rem,2.6vw,2.4rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="local-title" className="theme-ink py-24 md:py-32">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="t-eyebrow text-accent">Local knowledge</p>
            <SplitReveal id="local-title" className="t-h2 mt-5">
              Roofing, the {c.name} way.
            </SplitReveal>
            <p className="t-eyebrow mt-10 text-faint">Neighborhoods we roof</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {c.neighborhoods.map((n) => (
                <li key={n} className="rounded-full border border-line px-4 py-2 text-sm text-muted">
                  {n}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7">
            <Reveal stagger={0.1} className="flex flex-col">
              {c.localNotes.map((n, i) => (
                <div key={n.title} className="grid gap-3 border-t border-line py-8 md:grid-cols-[4rem_1fr]">
                  <span className="font-display text-3xl font-black text-accent">0{i + 1}</span>
                  <div>
                    <h3 className="t-h3">{n.title}</h3>
                    <p className="mt-3 text-muted">{n.text}</p>
                  </div>
                </div>
              ))}
            </Reveal>
            <div className="mt-6 border-t border-line pt-8">
              <p className="t-eyebrow text-faint">Services in {c.name}</p>
              <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {services.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`} className="group flex items-center justify-between border-b border-line py-3 text-stone/90 hover:text-stone">
                      {s.title} <span className="text-copper transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="city-map-title" className="theme-slate py-24 md:py-32">
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p className="t-eyebrow text-accent">On the map</p>
            <h2 id="city-map-title" className="t-h2 mt-5">
              {c.driveTime === "Home base" ? "Right here." : `${c.driveTime} from our shop.`}
            </h2>
            {localProject && (
              <p className="mt-6 text-muted">
                Recent job nearby:{" "}
                <Link href={`/projects/${localProject.slug}`} className="font-semibold text-accent underline-offset-4 hover:underline">
                  {localProject.title}
                </Link>
              </p>
            )}
          </div>
          <div className="lg:col-span-7">
            <ServiceMap compact activeSlug={c.slug} />
          </div>
        </div>
      </section>

      <section aria-labelledby="city-reviews-title" className="theme-ink py-24 md:py-32">
        <div className="wrap">
          <h2 id="city-reviews-title" className="t-h2">
            What neighbors say.
          </h2>
          <Reveal stagger={0.08} className="mt-12 grid gap-5 md:grid-cols-3">
            {shown.map((r) => (
              <ReviewCard key={r.author} r={r} />
            ))}
          </Reveal>
        </div>
      </section>

      <FaqSection items={faqs} title={`${c.name} questions.`} />
      <CtaBand image={c.image} title={`Free roof inspections in ${c.name}.`} />
    </PageShell>
  );
}
