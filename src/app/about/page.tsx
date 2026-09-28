import type { Metadata } from "next";
import Image from "next/image";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { Counter, Parallax, Reveal, ScrubWords, SplitReveal } from "@/components/ui/Reveal";
import { CtaBand } from "@/components/sections/CtaBand";
import { team, badges, stats } from "@/content/company";
import { photos } from "@/lib/photos";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { graph, breadcrumbSchema, webPageSchema, businessId } from "@/lib/schema";

const description = "Halden Roofing is a family-owned Fort Worth roofing company founded by Ray Halden in 1998. Meet the family and the crew behind 4,800+ Tarrant County roofs.";

export const metadata: Metadata = buildMetadata({ title: "About the Haldens", description, path: "/about", eyebrow: "Family-owned since 1998" });

const timeline = [
  { y: "1998", t: "One truck, one ladder", d: "Ray Halden goes out on his own after twelve years on other people's crews. First job: a ranch house in Wedgwood." },
  { y: "2003", t: "Slate & tile", d: "We start restoring slate and clay tile roofs in Southlake and Fort Worth's historic districts." },
  { y: "2012", t: "The photo report", d: "After one too many 'he said, she said' insurance claims, we start photographing every hit. Adjusters notice." },
  { y: "2016", t: "Second generation", d: "Cody Halden takes over day-to-day and builds our inspection process and in-house metal shop." },
  { y: "2021", t: "Class 4 everything", d: "Impact-rated shingles become our default recommendation — and many clients' insurance premiums drop." },
  { y: "2026", t: "4,800 roofs", d: "Same phone number, same family, same 12-minute drive to downtown." },
];

const values = [
  { t: "Roof first, then money", d: "Nobody talks price until someone has been on your roof and shown you photos." },
  { t: "Our crews, not subs", d: "Every installer is a Halden employee with workers' comp and years on our crews." },
  { t: "Dry by dark", d: "We never tear off more than we can dry-in the same day." },
  { t: "Leave it cleaner", d: "Two magnetic sweeps, full haul-off, and a walkthrough before we invoice." },
];

export default function AboutPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ];
  return (
    <PageShell>
      <JsonLd
        data={graph(
          webPageSchema({ path: "/about", name: "About the Haldens", description, type: "AboutPage" }),
          breadcrumbSchema(crumbs),
          ...team.map((m) => ({ "@type": "Person", name: m.name, jobTitle: m.role, worksFor: { "@id": businessId } })),
        )}
      />
      <PageHero
        crumbs={crumbs}
        eyebrow={`Family-owned since ${site.founded}`}
        title={
          <>
            The Haldens. <span className="text-copper">And the crew.</span>
          </>
        }
        lead="We're a Fort Worth family business that happens to roof houses. Twenty-seven years, two generations and one simple rule: get on the roof before you talk money."
        image={photos["roofer-clouds"]}
        imageAlt="Halden roofer standing on a roof under big Texas clouds"
      />

      <section aria-labelledby="story-title" className="theme-stone gable-top pb-24 md:pb-32">
        <div className="wrap pt-16 md:pt-24">
          <h2 id="story-title" className="t-eyebrow text-accent">
            Our story
          </h2>
          <ScrubWords
            className="mt-8 max-w-5xl font-display text-[clamp(1.6rem,3.1vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.03em]"
            text="Ray started Halden Roofing out of a pickup truck in 1998 because he was tired of watching good homeowners get *sold instead of *served. Twenty-seven years later, his son Cody runs the company — and the rule hasn't changed."
          />
          <ol className="mt-20 grid gap-px border-y border-line bg-line md:grid-cols-2 lg:grid-cols-3">
            {timeline.map((e) => (
              <Reveal as="li" key={e.y} className="bg-stone p-6 md:p-8">
                <p className="font-display text-5xl font-black tracking-[-0.05em] text-accent">{e.y}</p>
                <h3 className="t-h3 mt-4">{e.t}</h3>
                <p className="mt-3 text-muted">{e.d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="team-title" className="theme-ink py-24 md:py-32">
        <div className="wrap">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="t-eyebrow text-accent">The people</p>
              <SplitReveal id="team-title" className="t-h2 mt-5">
                Who&rsquo;ll be on your roof.
              </SplitReveal>
            </div>
            <p className="max-w-md text-muted">Plus 38 installers, inspectors and office staff — every one of them a Halden employee.</p>
          </div>
          <Reveal stagger={0.08} className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <figure key={m.name}>
                <div className="gable-frame relative aspect-[4/5] overflow-hidden bg-slate" style={{ "--g": "14%" } as React.CSSProperties}>
                  <Image src={photos[m.photo]} alt={`${m.name}, ${m.role}`} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover grayscale-[35%] transition-[filter] duration-700 hover:grayscale-0" />
                </div>
                <figcaption className="mt-5">
                  <p className="font-display text-xl font-extrabold uppercase tracking-[-0.02em]">{m.name}</p>
                  <p className="t-eyebrow mt-1 text-accent">{m.role}</p>
                  <p className="mt-3 text-sm text-muted">{m.bio}</p>
                </figcaption>
              </figure>
            ))}
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="values-title" className="theme-slate py-24 md:py-32">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="t-eyebrow text-accent">How we work</p>
            <SplitReveal id="values-title" className="t-h2 mt-5">
              Four rules. No exceptions.
            </SplitReveal>
            <Parallax className="mt-10 aspect-[4/3]">
              <Image src={photos["crew-ridge"]} alt="Two Halden roofers working on a ridge line" fill sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover" />
            </Parallax>
          </div>
          <Reveal as="ol" stagger={0.08} className="lg:col-span-7">
            {values.map((v, i) => (
              <li key={v.t} className="grid grid-cols-[4rem_1fr] gap-4 border-t border-line py-8">
                <span className="font-display text-4xl font-black tracking-[-0.05em] text-accent">0{i + 1}</span>
                <div>
                  <h3 className="t-h3">{v.t}</h3>
                  <p className="mt-2 text-muted">{v.d}</p>
                </div>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section aria-label="Numbers and credentials" className="theme-stone py-20">
        <div className="wrap">
          <div className="grid grid-cols-2 gap-px border-y border-line bg-line md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-stone py-8 md:px-6">
                <p className="font-display text-[clamp(2.2rem,4vw,3.8rem)] font-black leading-none tracking-[-0.05em]">
                  <Counter value={s.value} suffix={s.suffix} decimals={"decimals" in s ? s.decimals : 0} />
                </p>
                <p className="t-spec mt-3 text-muted">{s.label}</p>
              </div>
            ))}
          </div>
          <ul className="mt-10 flex flex-wrap gap-3">
            {badges.map((b) => (
              <li key={b.title} className="rounded-full border border-line px-5 py-3 text-sm">
                <strong>{b.title}</strong> <span className="text-muted">· {b.sub}</span>
              </li>
            ))}
          </ul>
          <p className="t-spec mt-6 text-faint">Badges shown are illustrative for this concept site.</p>
          <div className="mt-10">
            <Button href="/reviews" variant="dark">
              Read our reviews
            </Button>
          </div>
        </div>
      </section>

      <CtaBand image="trusses-golden" title="Meet us on your roof." />
    </PageShell>
  );
}
