"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, ViewTransition } from "react";
import { projects } from "@/content/projects";
import { photos } from "@/lib/photos";
import { gsap, useIdleGSAP, prefersReducedMotion } from "@/lib/gsap";
import { SplitReveal } from "@/components/ui/Reveal";
import { BeforeAfter } from "@/components/ui/BeforeAfter";
import { Button } from "@/components/ui/Button";

/** Featured before/after + a horizontal, scroll-driven rail of case studies. */
export function ProjectsRail() {
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const featured = projects[0];

  useIdleGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const t = track.current!;
        const distance = () => Math.max(0, t.scrollWidth - window.innerWidth);
        gsap.to(t, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pin.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        gsap.utils.toArray<HTMLElement>("[data-card-img]", t).forEach((img) => {
          gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: "none", scrollTrigger: { trigger: pin.current, start: "top top", end: () => `+=${distance()}`, scrub: true } });
        });
      });
      return () => mm.revert();
    },
    pin,
  );

  return (
    <section aria-labelledby="projects-title" className="theme-stone relative">
      <div className="wrap pb-16 pt-24 md:pt-36">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="t-eyebrow text-accent">Recent work</p>
            <SplitReveal id="projects-title" className="t-h2 mt-5 max-w-4xl">
              Drag the line. See the difference.
            </SplitReveal>
          </div>
          <Button href="/projects" variant="dark">
            All projects
          </Button>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:items-end">
          <BeforeAfter
            before={photos[featured.before]}
            after={photos[featured.after]}
            beforeAlt="Hail-damaged shingle edge with granule loss before replacement"
            afterAlt="New Class 4 architectural shingles after replacement"
            className="aspect-[4/3] w-full lg:col-span-8 lg:aspect-[16/10]"
            label={`${featured.title}: before and after`}
          />
          <div className="lg:col-span-4">
            <p className="t-eyebrow text-muted">
              {featured.neighborhood}, {featured.city} · {featured.year}
            </p>
            <h3 className="t-h3 mt-3">{featured.title}</h3>
            <p className="mt-4 text-muted">{featured.summary}</p>
            <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-6">
              {featured.stats.map((s) => (
                <div key={s.label}>
                  <dt className="t-spec text-muted">{s.label}</dt>
                  <dd className="mt-1 font-display text-lg font-extrabold leading-tight">{s.value}</dd>
                </div>
              ))}
            </dl>
            <Link href={`/projects/${featured.slug}`} className="mt-6 inline-flex items-center gap-2 font-semibold text-accent underline-offset-4 hover:underline">
              Read the case study →
            </Link>
          </div>
        </div>
      </div>

      <div ref={pin} className="overflow-hidden pb-24 lg:flex lg:h-[100svh] lg:items-center lg:pb-0">
        <div
          ref={track}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-[var(--gutter)] lg:snap-none lg:gap-8 lg:overflow-visible"
        >
          <div className="flex w-[70vw] shrink-0 snap-start flex-col justify-center sm:w-[42vw] lg:w-[30vw]">
            <p className="t-eyebrow text-accent">Case studies</p>
            <p className="t-h2 mt-5">
              Five roofs.
              <br />
              Five stories.
            </p>
            <p className="mt-5 max-w-sm text-muted">Hail claims, metal retrofits, slate restorations — each with the numbers and the before &amp; after.</p>
          </div>
          {projects.map((p, i) => (
            <Link key={p.slug} href={`/projects/${p.slug}`} className="group relative w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[34vw]">
              <ViewTransition name={`project-${p.slug}`} share="morph" default="none">
                <div className="relative aspect-[4/5] overflow-hidden bg-stone-3 transition-[clip-path] duration-700 ease-[var(--ease-out-expo)] [clip-path:polygon(0_12%,50%_0,100%_12%,100%_100%,0_100%)] group-hover:[clip-path:polygon(0_0,50%_0,100%_0,100%_100%,0_100%)]">
                  <div data-card-img className="absolute inset-[-6%]">
                    <Image
                      src={photos[p.hero]}
                      alt={`${p.title} — ${p.material}`}
                      fill
                      sizes="(min-width: 1024px) 34vw, 78vw"
                      className="object-cover transition-transform duration-1000 ease-[var(--ease-out-expo)] group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-stone md:p-7">
                    <p className="t-eyebrow text-stone/80">
                      0{i + 1} · {p.city}
                    </p>
                    <p className="mt-2 font-display text-[clamp(1.3rem,2vw,1.9rem)] font-extrabold uppercase leading-none tracking-[-0.03em]">{p.title}</p>
                  </div>
                </div>
              </ViewTransition>
              <p className="t-spec mt-4 text-muted">{p.material}</p>
            </Link>
          ))}
          <div className="w-[2vw] shrink-0" aria-hidden />
        </div>
      </div>
    </section>
  );
}
