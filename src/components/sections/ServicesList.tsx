import { services } from "@/content/services";
import { photos, slimPhoto } from "@/lib/photos";
import { ServicesListClient, type ServiceRow } from "./ServicesListClient";

const rows: ServiceRow[] = services.map((s) => ({ slug: s.slug, title: s.title, tagline: s.tagline, photo: slimPhoto(photos[s.hero]) }));

export function ServicesList({ heading = "Everything overhead.", headingAs = "h2" }: { heading?: string; headingAs?: "h1" | "h2" }) {
  return <ServicesListClient services={rows} heading={heading} headingAs={headingAs} />;
}
