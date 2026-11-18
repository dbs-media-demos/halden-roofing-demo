import type { ReactNode } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Hero } from "@/components/sections/Hero";
import { HeroV2 } from "@/components/sections/HeroV2";
import { No3D } from "@/lib/no-3d";
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
import { EstimateForm } from "@/components/sections/EstimateForm";
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
 * Phones show the same sections in the order a homeowner with a problem needs them (globals.css,
 * "phone pass"), plus the estimate form; desktop's order is this one.
 *
 * Two versions, one tree: `hero="3d"` is / (the real-time 3D storm), `hero="2d"` is /v2 (the same
 * page for a slow laptop or a lead who doesn't want 3D): a 2D storm hero, and every 3D scene
 * further down keeps its still. Zero three.js on /v2 at any width. Phones see the same page on both.
 */
export function HomeContent({ biz = defaultBiz, hero = "3d", children }: { biz?: Biz; hero?: "3d" | "2d"; children?: ReactNode }) {
  const page = (
    <PageShell>
      {children}
      <div data-home className="contents">
      {hero === "3d" ? <Hero /> : <HeroV2 />}
      <Intro biz={biz} />
      <ServicesList />
      {!biz.preview && (
        <div data-marquee className="theme-ink border-y border-line py-7">
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
      <EstimateForm />
      <FaqSection items={homeFaqs} />
      <CtaBand biz={biz} />
      </div>
    </PageShell>
  );
  return hero === "3d" ? page : <No3D>{page}</No3D>;
}
