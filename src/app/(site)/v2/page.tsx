import type { Metadata } from "next";
import { HomeContent } from "@/components/sections/HomeContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { graph, webPageSchema, faqSchema } from "@/lib/schema";
import { homeFaqs } from "@/content/faqs";

const base = buildMetadata({
  title: `${site.name} — Fort Worth Roofers Since 1998`,
  absoluteTitle: true,
  description:
    "Family-owned Fort Worth roofing company since 1998. Free roof inspections with a same-day photo report, hail & insurance claim help, 1–2 day installs, 25-year workmanship warranty.",
  path: "/",
  eyebrow: "Fort Worth, TX · Since 1998",
});

/** The homepage without 3D (a 2D storm hero, stills further down): the same page, so it points Google at /. */
export const metadata: Metadata = { ...base, robots: { index: false, follow: true } };

export default function HomePageV2() {
  return (
    <HomeContent hero="2d">
      <JsonLd
        data={graph(
          webPageSchema({ path: "/", name: `${site.name} — Fort Worth Roofers`, description: site.description }),
          faqSchema(homeFaqs),
        )}
      />
    </HomeContent>
  );
}
