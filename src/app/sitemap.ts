import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { services } from "@/content/services";
import { projects } from "@/content/projects";
import { cities } from "@/content/cities";

const UPDATED = new Date("2026-09-28");

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly") => ({
    url: absoluteUrl(path),
    lastModified: UPDATED,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "weekly"),
    page("/free-inspection", 0.95),
    page("/services", 0.9),
    ...services.map((s) => page(`/services/${s.slug}`, 0.9)),
    page("/service-areas", 0.8),
    ...cities.map((c) => page(`/service-areas/${c.slug}`, 0.8)),
    page("/projects", 0.8, "weekly"),
    ...projects.map((p) => page(`/projects/${p.slug}`, 0.7)),
    page("/financing", 0.7),
    page("/reviews", 0.7, "weekly"),
    page("/about", 0.6),
    page("/faq", 0.6),
    page("/contact", 0.7),
    page("/privacy", 0.2, "yearly"),
  ];
}
