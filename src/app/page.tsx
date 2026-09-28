import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { ServicesList } from "@/components/sections/ServicesList";
import { Marquee } from "@/components/sections/Marquee";
import { ProjectsRail } from "@/components/sections/ProjectsRail";
import { StormStory } from "@/components/sections/StormStory";
import { StormChaser } from "@/components/sections/StormChaser";
import { MaterialExplorer } from "@/components/sections/MaterialExplorer";
import { Warranty } from "@/components/sections/Warranty";
import { Reviews } from "@/components/sections/Reviews";
import { ServiceMap } from "@/components/sections/ServiceMap";
import { FaqSection } from "@/components/sections/Faq";
import { CtaBand } from "@/components/sections/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { graph, webPageSchema, faqSchema } from "@/lib/schema";
import { homeFaqs } from "@/content/faqs";
import { cities } from "@/content/cities";

export const metadata: Metadata = buildMetadata({
  title: `${site.name} — Fort Worth Roofers Since 1998`,
  absoluteTitle: true,
  description:
    "Family-owned Fort Worth roofing company since 1998. Free roof inspections with a same-day photo report, hail & insurance claim help, 1–2 day installs, 25-year workmanship warranty.",
  path: "/",
  eyebrow: "Fort Worth, TX · Since 1998",
});

const neighborhoods = cities.flatMap((c) => c.neighborhoods.slice(0, 3));

export default function HomePage() {
  return (
    <PageShell>
      <JsonLd
        data={graph(
          webPageSchema({ path: "/", name: `${site.name} — Fort Worth Roofers`, description: site.description }),
          faqSchema(homeFaqs),
        )}
      />
      <Hero />
      <Intro />
      <ServicesList />
      <div className="theme-ink border-y border-line py-7">
        <Marquee items={neighborhoods} className="font-display text-[clamp(1.4rem,3vw,2.6rem)] font-extrabold uppercase tracking-[-0.03em] text-stone/85" />
      </div>
      <ProjectsRail />
      <StormStory />
      <StormChaser />
      <MaterialExplorer />
      <Warranty />
      <Reviews />
      <ServiceMap />
      <FaqSection items={homeFaqs} />
      <CtaBand />
    </PageShell>
  );
}
