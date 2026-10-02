import type { ReactNode } from "react";
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
import { PreviewMap } from "@/components/preview/PreviewMap";
import { homeFaqs } from "@/content/faqs";
import { cities } from "@/content/cities";
import { defaultBiz } from "@/lib/biz";
import type { Biz } from "@/lib/biz-core";

const neighborhoods = cities.flatMap((c) => c.neighborhoods.slice(0, 3));

/**
 * The homepage sections. The concept site renders them as they are; a personalised preview
 * (/for/<token>) passes a real business: its name, phone, hours, rating and a map of its address
 * replace Halden's, and the Fort Worth neighbourhood marquee and Tarrant County map step aside.
 */
export function HomeContent({ biz = defaultBiz, children }: { biz?: Biz; children?: ReactNode }) {
  return (
    <PageShell>
      {children}
      <Hero />
      <Intro biz={biz} />
      <ServicesList />
      {!biz.preview && (
        <div className="theme-ink border-y border-line py-7">
          <Marquee items={neighborhoods} className="font-display text-[clamp(1.4rem,3vw,2.6rem)] font-extrabold uppercase tracking-[-0.03em] text-stone/85" />
        </div>
      )}
      <ProjectsRail />
      <StormStory />
      <StormChaser />
      <MaterialExplorer />
      <Warranty />
      <Reviews biz={biz} />
      {biz.preview ? <PreviewMap biz={biz} /> : <ServiceMap />}
      <FaqSection items={homeFaqs} />
      <CtaBand biz={biz} />
    </PageShell>
  );
}
