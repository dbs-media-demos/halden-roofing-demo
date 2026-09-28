import type { Metadata } from "next";
import Image from "next/image";
import { PageShell } from "@/components/layout/PageShell";
import { Breadcrumbs } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { InspectionForm } from "@/components/forms/InspectionForm";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { Stars } from "@/components/sections/Reviews";
import { photos } from "@/lib/photos";
import { buildMetadata } from "@/lib/seo";
import { site, telHref } from "@/lib/site";
import { graph, breadcrumbSchema, webPageSchema, serviceSchema } from "@/lib/schema";

const description = "Book a free roof inspection in Fort Worth and Tarrant County. Inspector on your roof within 48 hours, photo report the same day, callback within 2 hours.";

export const metadata: Metadata = buildMetadata({ title: "Book a Free Roof Inspection", description, path: "/free-inspection", eyebrow: "Free · within 48 hours" });

const expect = [
  { t: "We call within 2 hours", d: "During business hours — to confirm a time that suits you." },
  { t: "45 minutes on your roof", d: "Every slope, the attic, gutters and vents. You don't need to be home." },
  { t: "Photo report, same day", d: "Every finding photographed and explained. Forward it to your insurer if you need to." },
  { t: "An honest answer", d: "Repair, replace or leave it alone. Your call — no pressure, ever." },
];

export default function FreeInspectionPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Free inspection", path: "/free-inspection" },
  ];
  return (
    <PageShell>
      <JsonLd
        data={graph(
          webPageSchema({ path: "/free-inspection", name: "Book a Free Roof Inspection", description }),
          serviceSchema({ name: "Free roof inspection", description, path: "/free-inspection", serviceType: "Roof inspection" }),
          breadcrumbSchema(crumbs),
        )}
      />
      <section className="theme-ink relative overflow-hidden pb-24 pt-[calc(var(--header-h)+4.5rem)] md:pb-32">
        <div aria-hidden className="absolute inset-y-0 right-0 hidden w-[38%] lg:block">
          <Image src={photos["storm-house"]} alt="" fill preload sizes="38vw" className="object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/40 to-transparent" />
        </div>
        <div className="wrap relative grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Breadcrumbs items={crumbs} className="anim-fade" />
            <p className="t-eyebrow anim-fade mt-10 text-accent">Free · No obligation · Within 48 hours</p>
            <h1 className="t-h1 anim-heading mt-5" style={{ "--d": "0.1s" } as React.CSSProperties}>
              Book your free <span className="text-copper">roof inspection.</span>
            </h1>
            <p className="t-lead anim-fade mt-6 max-w-2xl text-muted" style={{ "--d": "0.25s" } as React.CSSProperties}>
              Hail season is here. Tell us about your roof — it takes a minute — and we&rsquo;ll call you back within 2 hours.
            </p>
            <div className="anim-fade mt-10" style={{ "--d": "0.35s" } as React.CSSProperties}>
              <InspectionForm />
            </div>
          </div>
          <aside className="flex flex-col gap-10 lg:col-span-4 lg:col-start-9 lg:pt-40">
            <div className="rounded-[2px] border border-line bg-ink/70 p-6 backdrop-blur">
              <OpenBadge className="text-stone" />
              <p className="mt-4 text-muted">Rather talk now?</p>
              <a href={telHref} className="mt-1 block font-display text-3xl font-extrabold tracking-[-0.03em] hover:text-copper-2">
                {site.phoneDisplay}
              </a>
              <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                <Stars n={5} />
                <span className="text-sm text-muted">
                  {site.rating.value} from {site.rating.count} reviews
                </span>
              </div>
            </div>
            <div>
              <h2 className="t-eyebrow text-accent">What happens next</h2>
              <ol className="mt-5 flex flex-col">
                {expect.map((e, i) => (
                  <li key={e.t} className="grid grid-cols-[2.5rem_1fr] gap-3 border-t border-line py-5">
                    <span className="font-display text-xl font-black text-accent">0{i + 1}</span>
                    <div>
                      <p className="font-semibold">{e.t}</p>
                      <p className="mt-1 text-sm text-muted">{e.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}
