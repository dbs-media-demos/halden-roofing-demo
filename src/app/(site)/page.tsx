import type { Metadata } from "next";
import { HomeContent } from "@/components/sections/HomeContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { graph, webPageSchema, faqSchema } from "@/lib/schema";
import { homeFaqs } from "@/content/faqs";

export const metadata: Metadata = buildMetadata({
  title: `${site.name} — Fort Worth Roofers Since 1998`,
  absoluteTitle: true,
  description:
    "Family-owned Fort Worth roofing company since 1998. Free roof inspections with a same-day photo report, hail & insurance claim help, 1–2 day installs, 25-year workmanship warranty.",
  path: "/",
  eyebrow: "Fort Worth, TX · Since 1998",
});

export default function HomePage() {
  return (
    <HomeContent>
      <JsonLd
        data={graph(
          webPageSchema({ path: "/", name: `${site.name} — Fort Worth Roofers`, description: site.description }),
          faqSchema(homeFaqs),
        )}
      />
    </HomeContent>
  );
}
