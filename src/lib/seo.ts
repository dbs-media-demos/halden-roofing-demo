import type { Metadata } from "next";
import { site, noindex } from "./site";

type BuildMetadataInput = {
  /** Page title without the brand suffix (the root template adds it). */
  title: string;
  description: string;
  path: string;
  /** Short label above the title on the generated share image. */
  eyebrow?: string;
  /** Use the title as-is (home page). */
  absoluteTitle?: boolean;
  image?: string;
  type?: "website" | "article";
};

export const ogImageUrl = (title: string, eyebrow?: string) => {
  const params = new URLSearchParams({ title });
  if (eyebrow) params.set("eyebrow", eyebrow);
  return `/api/og?${params.toString()}`;
};

export function buildMetadata({ title, description, path, eyebrow, absoluteTitle, image, type = "website" }: BuildMetadataInput): Metadata {
  const og = image ?? ogImageUrl(title, eyebrow);
  const fullTitle = absoluteTitle ? title : `${title} | ${site.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      siteName: site.name,
      title: fullTitle,
      description,
      locale: "en_US",
      images: [{ url: og, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [og],
    },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}
