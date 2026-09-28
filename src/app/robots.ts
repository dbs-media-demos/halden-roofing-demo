import type { MetadataRoute } from "next";
import { noindex, siteUrl } from "@/lib/site";

/** Concept site: blocked from crawlers unless NEXT_PUBLIC_NOINDEX=false. */
export default function robots(): MetadataRoute.Robots {
  if (noindex) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
