import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { ReviewCard, Stars } from "@/components/sections/Reviews";
import { CtaBand } from "@/components/sections/CtaBand";
import { reviews } from "@/content/reviews";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { graph, breadcrumbSchema, webPageSchema } from "@/lib/schema";

const description = `Halden Roofing is rated ${site.rating.value}/5 from ${site.rating.count} Google reviews by homeowners in Fort Worth, Arlington, Keller, Southlake, Benbrook and Burleson.`;

export const metadata: Metadata = buildMetadata({ title: "Customer Reviews", description, path: "/reviews", eyebrow: `${site.rating.value} ★ · ${site.rating.count} reviews` });

const distribution = [
  { stars: 5, pct: 92 },
  { stars: 4, pct: 6 },
  { stars: 3, pct: 1 },
  { stars: 2, pct: 0.5 },
  { stars: 1, pct: 0.5 },
];

export default function ReviewsPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Reviews", path: "/reviews" },
  ];
  return (
    <PageShell>
      <JsonLd data={graph(webPageSchema({ path: "/reviews", name: "Customer Reviews", description }), breadcrumbSchema(crumbs))} />
      <PageHero
        crumbs={crumbs}
        eyebrow="Reviews"
        title={
          <>
            {site.rating.count} reviews. <span className="text-copper">One phone number.</span>
          </>
        }
        lead="Real names, real neighborhoods, real roofs. Here's what Tarrant County homeowners say after the crew has gone home."
        aside={
          <div className="flex flex-col gap-4 border-l border-line pl-6">
            <div className="flex items-end gap-4">
              <p className="font-display text-7xl font-black leading-[0.8] tracking-[-0.06em]">{site.rating.value}</p>
              <div>
                <Stars n={5} />
                <p className="t-spec mt-1 text-muted">{site.rating.count} Google reviews</p>
              </div>
            </div>
            <dl className="flex flex-col gap-1.5">
              {distribution.map((d) => (
                <div key={d.stars} className="grid grid-cols-[1.5rem_1fr_3rem] items-center gap-3 text-sm">
                  <dt className="text-muted">{d.stars}★</dt>
                  <dd className="h-1.5 overflow-hidden rounded-full bg-stone/10">
                    <span className="block h-full rounded-full bg-copper" style={{ width: `${d.pct}%` }} />
                  </dd>
                  <dd className="t-spec text-right text-faint">{d.pct}%</dd>
                </div>
              ))}
            </dl>
          </div>
        }
      />
      <section aria-label="All reviews" className="theme-ink pb-24 pt-20 md:pb-32">
        <Reveal stagger={0.05} className="wrap columns-1 gap-5 md:columns-2 lg:columns-3">
          {reviews.map((r) => (
            <div key={r.author} className="mb-5 break-inside-avoid">
              <ReviewCard r={r} />
            </div>
          ))}
        </Reveal>
        <p className="wrap t-spec mt-10 text-faint">Reviews shown are fictional examples for this concept site.</p>
      </section>
      <CtaBand image="house-pink-sky" title="Be our next five-star review." />
    </PageShell>
  );
}
