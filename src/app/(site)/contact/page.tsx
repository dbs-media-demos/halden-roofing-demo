import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Breadcrumbs } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContactForm } from "@/components/forms/ContactForm";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { ServiceMap } from "@/components/sections/ServiceMap";
import { buildMetadata } from "@/lib/seo";
import { addressLine, mailHref, site, telHref } from "@/lib/site";
import { graph, breadcrumbSchema, webPageSchema } from "@/lib/schema";

const description = `Contact Halden Roofing Co. in Fort Worth, TX. Call ${site.phoneDisplay}, email ${site.email} or visit us at ${addressLine}.`;

export const metadata: Metadata = buildMetadata({ title: "Contact Us", description, path: "/contact", eyebrow: "Contact" });

export default function ContactPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ];
  return (
    <PageShell>
      <JsonLd data={graph(webPageSchema({ path: "/contact", name: "Contact Halden Roofing", description, type: "ContactPage" }), breadcrumbSchema(crumbs))} />
      <section className="theme-ink pb-24 pt-[calc(var(--header-h)+4.5rem)] md:pb-32">
        <div className="wrap">
          <Breadcrumbs items={crumbs} className="anim-fade" />
          <p className="t-eyebrow anim-fade mt-10 text-accent">Contact</p>
          <h1 className="t-h1 anim-heading mt-5 max-w-5xl" style={{ "--d": "0.1s" } as React.CSSProperties}>
            Talk to a person <span className="text-copper">in Fort Worth.</span>
          </h1>

          <div className="mt-16 grid gap-12 lg:grid-cols-12">
            <div className="flex flex-col gap-10 lg:col-span-5">
              <div className="anim-fade" style={{ "--d": "0.2s" } as React.CSSProperties}>
                <OpenBadge className="text-stone" />
                <a href={telHref} className="mt-4 block font-display text-[clamp(2rem,4vw,3.4rem)] font-black tracking-[-0.04em] hover:text-copper-2">
                  {site.phoneDisplay}
                </a>
                <a href={mailHref} className="mt-2 block text-lg text-muted hover:text-stone">
                  {site.email}
                </a>
              </div>
              <dl className="grid gap-6 border-t border-line pt-8 sm:grid-cols-2">
                <div>
                  <dt className="t-eyebrow text-faint">Shop &amp; office</dt>
                  <dd className="mt-3 text-muted">
                    {site.address.street}
                    <br />
                    {site.address.city}, {site.address.region} {site.address.postalCode}
                  </dd>
                </div>
                <div>
                  <dt className="t-eyebrow text-faint">Hours</dt>
                  <dd className="mt-3">
                    <ul className="flex flex-col gap-1 text-muted">
                      {site.hoursDisplay.map((h) => (
                        <li key={h.label}>
                          <span className="text-stone">{h.label}</span> · {h.value}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
              <div className="rounded-[2px] border border-copper/40 bg-copper/10 p-6">
                <p className="font-semibold">Storm damage or an active leak?</p>
                <p className="mt-2 text-muted">
                  Call us for same-day tarping, or{" "}
                  <Link href="/free-inspection" className="font-semibold text-accent underline underline-offset-4">
                    book a free inspection
                  </Link>
                  .
                </p>
              </div>
              <div className="rounded-[2px] border border-line p-4">
                <ServiceMap compact />
              </div>
            </div>
            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
