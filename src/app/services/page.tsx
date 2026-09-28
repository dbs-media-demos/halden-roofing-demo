import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { ServicesList } from "@/components/sections/ServicesList";
import { MaterialExplorer } from "@/components/sections/MaterialExplorer";
import { Warranty } from "@/components/sections/Warranty";
import { CtaBand } from "@/components/sections/CtaBand";
import { services } from "@/content/services";
import { photos } from "@/lib/photos";
import { buildMetadata } from "@/lib/seo";
import { graph, breadcrumbSchema, itemListSchema, webPageSchema } from "@/lib/schema";

const description =
  "Roof replacement, repair, storm & hail damage, metal roofing, seamless gutters, commercial roofing and free inspections across Fort Worth and Tarrant County.";

export const metadata: Metadata = buildMetadata({ title: "Roofing Services in Fort Worth", description, path: "/services", eyebrow: "Services" });

export default function ServicesPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
  ];
  return (
    <PageShell>
      <JsonLd
        data={graph(
          webPageSchema({ path: "/services", name: "Roofing Services in Fort Worth", description, type: "CollectionPage" }),
          itemListSchema(services.map((s) => ({ name: s.title, path: `/services/${s.slug}` }))),
          breadcrumbSchema(crumbs),
        )}
      />
      <PageHero
        crumbs={crumbs}
        eyebrow="Services"
        title={
          <>
            Roofing, <span className="text-copper">done straight.</span>
          </>
        }
        lead="Every job starts with a free inspection and a photo report. Every job ends with a magnet sweep and a warranty in writing. Everything in between depends on what your roof actually needs."
        image={photos["crew-shingles-2"]}
        imageAlt="Halden roofer installing shingles with a nail gun on a sunny day"
      >
        <Button href="/free-inspection" size="lg">
          Book a free inspection
        </Button>
      </PageHero>
      <ServicesList heading="Seven services. One crew." />
      <MaterialExplorer />
      <Warranty />
      <CtaBand image="gable-golden" />
    </PageShell>
  );
}
