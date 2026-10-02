import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { DemoPill, MobileBar } from "./Chrome";
import type { Biz } from "@/lib/biz-core";

/** Header, the page, footer, the phone bar and the demo pill. Client parts read the business from BizProvider. */
export function SiteChrome({ children, biz }: { children: ReactNode; biz?: Biz }) {
  return (
    <>
      <Header />
      {children}
      <Footer biz={biz} />
      <MobileBar />
      <DemoPill />
    </>
  );
}
