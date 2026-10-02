import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button, PhoneIcon } from "@/components/ui/Button";
import { Parallax, Reveal, SplitReveal } from "@/components/ui/Reveal";
import { BeforeAfter } from "@/components/ui/BeforeAfter";
import { VideoLoop } from "@/components/ui/VideoLoop";
import { FaqSection } from "@/components/sections/Faq";
import { CtaBand } from "@/components/sections/CtaBand";
import { StormStory } from "@/components/sections/StormStory";
import { StormChaser } from "@/components/sections/StormChaser";
import { MaterialExplorer } from "@/components/sections/MaterialExplorer";
import { Warranty } from "@/components/sections/Warranty";
import { services, serviceBySlug } from "@/content/services";
import { projects } from "@/content/projects";
import { photos } from "@/lib/photos";
import { buildMetadata } from "@/lib/seo";
import { site, telHref } from "@/lib/site";
import { graph, serviceSchema, breadcrumbSchema, faqSchema, webPageSchema } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = serviceBySlug(slug);
  if (!s) return {};
  return buildMetadata({ title: `${s.title} in Fort Worth, TX`, description: s.metaDescription, path: `/services/${s.slug}`, eyebrow: "Services" });
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const s = serviceBySlug(slug);
  if (!s) notFound();

  const path = `/services/${s.slug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: s.title, path },
  ];
  const project = projects.find((p) => p.service === s.slug) ?? projects[0];
  const others = services.filter((x) => x.slug !== s.slug).slice(0, 3);
  const video = s.slug === "storm-hail-damage" || s.slug === "roof-replacement";

  return (
    <PageShell>
      <JsonLd
        data={graph(
          webPageSchema({ path, name: `${s.title} in Fort Worth, TX`, description: s.metaDescription }),
          serviceSchema({ name: s.title, description: s.metaDescription, path, serviceType: s.serviceType, offers: s.includes }),
          breadcrumbSchema(crumbs),
          faqSchema(s.faqs),
        )}
      />
      <PageHero
        crumbs={crumbs}
        eyebrow={`Service 0${services.indexOf(s) + 1} · Fort Worth & Tarrant County`}
        title={s.title}
        lead={s.intro}
        image={photos[s.hero]}
        imageAlt={`${s.title} by Halden Roofing in Fort Worth`}
      >
        <Button href="/free-inspection" size="lg">
          Free inspection
        </Button>
        <Button href={telHref} variant="ghost" size="lg" icon={<PhoneIcon className="text-copper" />}>
          {site.phoneDisplay}
        </Button>
      </PageHero>

      {/* Facts */}
      <section aria-label="At a glance" className="theme-ink">
        <div className="wrap">
          <dl className="grid border-b border-line md:grid-cols-3">
            {s.facts.map((f, i) => (
              <div key={f.label} className={`py-8 md:px-8 md:py-12 ${i > 0 ? "border-t border-line md:border-l md:border-t-0" : ""} ${i === 0 ? "md:pl-0" : ""}`}>
                <dt className="t-eyebrow text-faint">{f.label}</dt>
                <dd className="mt-3 font-display text-[clamp(1.6rem,2.8vw,2.6rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* What's included */}
      <section aria-labelledby="included-title" className="theme-ink py-24 md:py-32">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="t-eyebrow text-accent">What&rsquo;s included</p>
            <SplitReveal id="included-title" className="t-h2 mt-5">
              Done properly, the first time.
            </SplitReveal>
            <Reveal as="ul" stagger={0.06} className="mt-10 flex flex-col">
              {s.includes.map((item) => (
                <li key={item} className="flex gap-4 border-t border-line py-4">
                  <span aria-hidden className="chev mt-2 shrink-0 text-copper" />
                  <span className="text-stone/90">{item}</span>
                </li>
              ))}
            </Reveal>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:col-span-7 lg:pl-8">
            <Parallax className="col-span-2 aspect-[16/10]">
              <Image src={photos[s.images[0]]} alt={`${s.title} in progress`} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
            </Parallax>
            <Parallax className="aspect-[4/5]" amount={16}>
              <Image src={photos[s.images[1]]} alt={`${s.title} detail`} fill sizes="(min-width: 1024px) 27vw, 50vw" className="object-cover" />
            </Parallax>
            <Parallax className="mt-16 aspect-[4/5]" amount={20}>
              <Image src={photos[s.images[2]]} alt={`${s.title} finished work`} fill sizes="(min-width: 1024px) 27vw, 50vw" className="object-cover" />
            </Parallax>
          </div>
        </div>
      </section>

      {/* When you need it + process */}
      <section aria-labelledby="when-title" className="theme-stone gable-top pb-24 md:pb-32">
        <div className="wrap grid gap-14 pt-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="t-eyebrow text-accent">Signs it&rsquo;s time</p>
            <SplitReveal id="when-title" className="t-h2 mt-5">
              When to call us.
            </SplitReveal>
            <Reveal as="ul" stagger={0.06} className="mt-8 flex flex-col gap-3">
              {s.whenYouNeedIt.map((w) => (
                <li key={w} className="flex gap-4 text-[1.05rem]">
                  <span aria-hidden className="chev mt-2 shrink-0 text-copper" />
                  {w}
                </li>
              ))}
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <p className="t-eyebrow text-muted">How it works</p>
            <Reveal as="ol" stagger={0.08} className="mt-6 border-t border-line">
              {s.process.map((p, i) => (
                <li key={p.title} className="grid grid-cols-[3.5rem_1fr] gap-4 border-b border-line py-6 md:grid-cols-[5rem_1fr_1.4fr] md:gap-8">
                  <span className="font-display text-3xl font-black tracking-[-0.05em] text-accent">0{i + 1}</span>
                  <h3 className="t-h3">{p.title}</h3>
                  <p className="col-start-2 text-muted md:col-start-3">{p.text}</p>
                </li>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {video && (
        <section aria-label="Tear-off footage" className="theme-ink">
          <VideoLoop src="/video/tear-off.mp4" poster={photos["poster-tear-off"]} alt="Drone footage of a Halden crew tearing off an old roof" className="h-[70svh]" />
        </section>
      )}

      {s.slug === "storm-hail-damage" && (
        <>
          <StormStory />
          <StormChaser />
        </>
      )}
      {s.slug === "metal-roofing" && <MaterialExplorer />}
      {s.slug === "roof-replacement" && <Warranty />}

      {/* Related case study */}
      <section aria-labelledby="case-title" className="theme-slate py-24 md:py-32">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-4">
            <p className="t-eyebrow text-accent">Case study · {project.city}</p>
            <h2 id="case-title" className="t-h2 mt-5">
              {project.title}
            </h2>
            <p className="mt-6 text-muted">{project.summary}</p>
            <Link href={`/projects/${project.slug}`} className="mt-8 inline-flex font-semibold text-accent underline-offset-4 hover:underline">
              Read the full story →
            </Link>
          </div>
          <BeforeAfter
            before={photos[project.before]}
            after={photos[project.after]}
            beforeAlt={`${project.title}: roof before`}
            afterAlt={`${project.title}: roof after`}
            className="aspect-[4/3] lg:col-span-8 lg:aspect-[16/9]"
            label={`${project.title}: before and after`}
          />
        </div>
      </section>

      <FaqSection items={s.faqs} title={`${s.short} questions.`} />

      {/* Other services */}
      <nav aria-label="Other services" className="theme-ink border-t border-line py-16">
        <div className="wrap grid gap-4 md:grid-cols-3">
          {others.map((o) => (
            <Link key={o.slug} href={`/services/${o.slug}`} className="group relative block aspect-[16/10] overflow-hidden bg-slate">
              <Image src={photos[o.hero]} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover opacity-60 transition-[transform,opacity] duration-700 group-hover:scale-105 group-hover:opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="t-eyebrow text-copper-2">Next service</p>
                <p className="mt-2 font-display text-xl font-extrabold uppercase tracking-[-0.02em]">{o.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </nav>

      <CtaBand image={s.slug === "storm-hail-damage" ? "storm-farmhouse" : "house-ranch-dusk"} />
    </PageShell>
  );
}
