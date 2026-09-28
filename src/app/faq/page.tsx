import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button, PhoneIcon } from "@/components/ui/Button";
import { FaqItems } from "@/components/sections/Faq";
import { CtaBand } from "@/components/sections/CtaBand";
import { faqGroups, allFaqs } from "@/content/faqs";
import { buildMetadata } from "@/lib/seo";
import { site, telHref } from "@/lib/site";
import { graph, breadcrumbSchema, webPageSchema, faqSchema } from "@/lib/schema";

const description = "Answers about roof insurance claims, deductibles, install timelines, warranties, cost and financing from Fort Worth roofers Halden Roofing Co.";

export const metadata: Metadata = buildMetadata({ title: "Roofing FAQ — Insurance, Timelines, Warranties", description, path: "/faq", eyebrow: "FAQ" });

export default function FaqPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "FAQ", path: "/faq" },
  ];
  return (
    <PageShell>
      <JsonLd data={graph(webPageSchema({ path: "/faq", name: "Roofing FAQ", description }), breadcrumbSchema(crumbs), faqSchema(allFaqs))} />
      <PageHero
        crumbs={crumbs}
        eyebrow="FAQ"
        title={
          <>
            Straight answers <span className="text-copper">to real questions.</span>
          </>
        }
        lead="Insurance, timelines, warranties and money — the things homeowners actually ask us on the driveway."
      />
      <section aria-label="Questions" className="theme-ink pb-24 pt-10 md:pb-32">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <nav aria-label="FAQ topics" className="lg:col-span-3">
            <ul className="sticky top-28 flex flex-wrap gap-2 lg:flex-col lg:gap-0">
              {faqGroups.map((g) => (
                <li key={g.id}>
                  <a href={`#${g.id}`} className="block rounded-full border border-line px-4 py-2 text-sm text-muted hover:text-stone lg:rounded-none lg:border-0 lg:border-b lg:px-0 lg:py-3">
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-col gap-20 lg:col-span-9">
            {faqGroups.map((g) => (
              <section key={g.id} id={g.id} aria-labelledby={`${g.id}-h`} className="scroll-mt-28">
                <h2 id={`${g.id}-h`} className="t-h2 mb-8 !text-[clamp(1.6rem,3vw,2.8rem)]">
                  {g.title}
                </h2>
                <FaqItems items={g.items} />
              </section>
            ))}
            <div className="rounded-[2px] bg-slate p-8 md:p-10">
              <p className="t-h3">Still wondering about something?</p>
              <p className="mt-3 text-muted">Call us — you&rsquo;ll get a person in Fort Worth, not a call center.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href={telHref} icon={<PhoneIcon />}>
                  {site.phoneDisplay}
                </Button>
                <Button href="/contact" variant="ghost">
                  Send a message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CtaBand image="storm-wheat" />
    </PageShell>
  );
}
