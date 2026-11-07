import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { DemoPill, MobileBar, PhoneRise } from "./Chrome";
import { services } from "@/content/services";
import { photos, slimPhoto, type SlimPhoto } from "@/lib/photos";
import type { Biz } from "@/lib/biz-core";

export type ServiceNavItem = { slug: string; title: string; tagline: string; photo: SlimPhoto };

const serviceNav: ServiceNavItem[] = services.map((s) => ({ slug: s.slug, title: s.title, tagline: s.tagline, photo: slimPhoto(photos[s.hero]) }));

/** Header, the page, footer, the phone bar and the demo pill. Client parts read the business from BizProvider. */
export function SiteChrome({ children, biz }: { children: ReactNode; biz?: Biz }) {
  return (
    <>
      <Header services={serviceNav} />
      {children}
      <Footer biz={biz} />
      <MobileBar />
      <DemoPill />
      <PhoneRise />
    </>
  );
}
