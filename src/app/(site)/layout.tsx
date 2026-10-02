import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { graph, businessSchema, websiteSchema } from "@/lib/schema";

/** The concept site: the fictional company's chrome and structured data around every page. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={graph(businessSchema(), websiteSchema())} />
      <SiteChrome>{children}</SiteChrome>
    </>
  );
}
