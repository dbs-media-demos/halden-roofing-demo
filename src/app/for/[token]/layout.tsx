import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { BizProvider } from "@/components/preview/BizContext";
import { PreviewGuard } from "@/components/preview/PreviewGuard";
import { Translate } from "@/components/preview/Translate";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { LeadLoader } from "@/components/preview/LeadLoader";
import { previewBiz } from "@/lib/preview";
import { sr } from "@/i18n/sr";
import { enPreview } from "@/i18n/en-preview";

/**
 * A personalised preview made in the Scale by Noon CRM: this demo's homepage with a real
 * business's name, phone, address, hours and rating, in its language. The token is the key;
 * removing the demo in the CRM makes the page 404.
 * Serbian businesses get the page translated (i18n/sr); English ones get the concept site's
 * local lines made general (i18n/en-preview), e.g. its home city's weather.
 */
export default async function PreviewLayout({ children, params }: { children: ReactNode; params: Promise<{ token: string }> }) {
  const { token } = await params;
  const biz = await previewBiz(token);
  if (!biz) notFound();
  const dict = biz.lang === "sr" ? sr : enPreview;
  return (
    <BizProvider biz={biz}>
      {Object.keys(dict).length > 0 && <Translate dict={dict} />}
      {/* the lead's logo as a page loader (first view of this token in the tab) */}
      {biz.logo && <LeadLoader svg={biz.logo.svg} token={token} />}
      <SiteChrome biz={biz}>{children}</SiteChrome>
      <PreviewGuard />
    </BizProvider>
  );
}
