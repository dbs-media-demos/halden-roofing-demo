import { absoluteUrl, site, siteUrl } from "./site";
import { cities } from "@/content/cities";
import { reviews } from "@/content/reviews";

/** schema.org builders. Every node links back to one RoofingContractor via @id. */

export const businessId = `${siteUrl}/#business`;
export const websiteId = `${siteUrl}/#website`;

type Json = Record<string, unknown>;

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function businessSchema(): Json {
  return {
    "@type": "RoofingContractor",
    "@id": businessId,
    name: site.name,
    legalName: site.legalName,
    url: siteUrl,
    logo: absoluteUrl("/brand/icon-512.png"),
    image: absoluteUrl("/brand/og-default.jpg"),
    description: site.description,
    slogan: site.tagline,
    foundingDate: String(site.founded),
    telephone: site.phone,
    email: site.email,
    priceRange: site.priceRange,
    currenciesAccepted: "USD",
    paymentAccepted: "Cash, Check, Credit Card, Financing",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: "https://www.google.com/maps/place/Fort+Worth,+TX",
    openingHoursSpecification: site.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days.map((d) => dayNames[d]),
      opens: h.open,
      closes: h.close,
    })),
    areaServed: cities.map((c) => ({
      "@type": "City",
      name: `${c.name}, TX`,
      url: absoluteUrl(`/service-areas/${c.slug}`),
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: site.rating.value,
      reviewCount: site.rating.count,
      bestRating: 5,
      worstRating: 1,
    },
    review: reviews.slice(0, 6).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      datePublished: r.date,
      reviewBody: r.text,
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    })),
    knowsAbout: ["Roof replacement", "Roof repair", "Hail damage", "Insurance claims", "Metal roofing", "Gutters", "Commercial roofing"],
  };
}

export function websiteSchema(): Json {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    url: siteUrl,
    name: site.name,
    description: site.description,
    publisher: { "@id": businessId },
    inLanguage: "en-US",
  };
}

export function webPageSchema(opts: { path: string; name: string; description: string; type?: string; image?: string }): Json {
  return {
    "@type": opts.type ?? "WebPage",
    "@id": `${absoluteUrl(opts.path)}#webpage`,
    url: absoluteUrl(opts.path),
    name: opts.name,
    description: opts.description,
    inLanguage: "en-US",
    isPartOf: { "@id": websiteId },
    about: { "@id": businessId },
    ...(opts.image ? { primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(opts.image) } } : {}),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceSchema(opts: { name: string; description: string; path: string; serviceType: string; offers?: string[]; areaName?: string }): Json {
  return {
    "@type": "Service",
    "@id": `${absoluteUrl(opts.path)}#service`,
    name: opts.name,
    serviceType: opts.serviceType,
    description: opts.description,
    url: absoluteUrl(opts.path),
    provider: { "@id": businessId },
    areaServed: opts.areaName
      ? { "@type": "City", name: opts.areaName }
      : cities.map((c) => ({ "@type": "City", name: `${c.name}, TX` })),
    ...(opts.offers?.length
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: opts.name,
            itemListElement: opts.offers.map((o) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: o } })),
          },
        }
      : {}),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]): Json {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function itemListSchema(items: { name: string; path: string }[]): Json {
  return {
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, url: absoluteUrl(item.path) })),
  };
}

/** Wrap nodes in a single @graph document. */
export const graph = (...nodes: Json[]) => ({ "@context": "https://schema.org", "@graph": nodes });
