import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { Reveal, SplitReveal } from "@/components/ui/Reveal";
import { PaymentCalculator } from "@/components/forms/PaymentCalculator";
import { Warranty } from "@/components/sections/Warranty";
import { FaqSection } from "@/components/sections/Faq";
import { CtaBand } from "@/components/sections/CtaBand";
import { faqGroups } from "@/content/faqs";
import { photos } from "@/lib/photos";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { graph, breadcrumbSchema, webPageSchema, faqSchema } from "@/lib/schema";

const description = `Roof financing from $${site.financingFrom}/mo with approved credit, 12-month same-as-cash options and a soft credit check. Plus workmanship warranties up to 25 years.`;

export const metadata: Metadata = buildMetadata({ title: "Roof Financing & Warranties", description, path: "/financing", eyebrow: `From $${site.financingFrom}/mo` });

const perks = [
  { t: "Soft credit check", d: "See your rate in about two minutes. It won't touch your credit score." },
  { t: "0% for 12 months", d: "Same-as-cash if you're waiting on an insurance check or tax refund." },
  { t: "Terms up to 144 months", d: "Keep payments low on a full replacement or metal upgrade." },
  { t: "No prepayment penalty", d: "Pay it off early whenever you like." },
];

export default function FinancingPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Financing", path: "/financing" },
  ];
  const faqs = faqGroups.find((g) => g.id === "cost")!.items;
  return (
    <PageShell>
      <JsonLd data={graph(webPageSchema({ path: "/financing", name: "Roof Financing & Warranties", description }), breadcrumbSchema(crumbs), faqSchema(faqs))} />
      <PageHero
        crumbs={crumbs}
        eyebrow="Financing"
        title={
          <>
            A new roof from <span className="text-copper">${site.financingFrom}/mo.</span>
          </>
        }
        lead="Roofs don't wait for a convenient month. Spread the cost with fixed monthly payments, or bridge the gap until your insurance check lands."
        image={photos["house-lit-windows"]}
        imageAlt="Farmhouse with warm lit windows at dusk"
      >
        <Button href="#calculator" size="lg">
          Estimate your payment
        </Button>
      </PageHero>

      <section id="calculator" aria-labelledby="calc-title" className="theme-ink py-24 md:py-32">
        <div className="wrap">
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="t-eyebrow text-accent">Payment estimator</p>
              <SplitReveal id="calc-title" className="t-h2 mt-5">
                Slide to your number.
              </SplitReveal>
            </div>
            <p className="text-muted md:col-span-5">
              Most asphalt replacements in Fort Worth land between $9,500 and $18,000. Metal runs $22,000–$45,000. Your written
              estimate will give you the real figure.
            </p>
          </div>
          <div className="mt-12">
            <PaymentCalculator />
          </div>
          <Reveal stagger={0.07} className="mt-16 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((p) => (
              <div key={p.t} className="bg-ink py-6 sm:pr-6">
                <span aria-hidden className="chev text-copper" />
                <h3 className="mt-4 text-lg font-bold">{p.t}</h3>
                <p className="mt-2 text-muted">{p.d}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <Warranty showFinancing={false} />
      <FaqSection items={faqs} title="Money questions." theme="theme-ink" />
      <CtaBand image="house-dusk-glow" />
    </PageShell>
  );
}
