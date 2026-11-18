import { notFound } from "next/navigation";
import { HomeContent } from "@/components/sections/HomeContent";
import { previewBiz } from "@/lib/preview";

// The personalised preview without 3D: /for/<token> with the 2D storm hero (same business, same page)
export const dynamic = "force-dynamic";
export { generateMetadata } from "../page";

type Props = { params: Promise<{ token: string }> };

export default async function PreviewPageV2({ params }: Props) {
  const biz = await previewBiz((await params).token);
  if (!biz) notFound();
  return <HomeContent biz={biz} hero="2d" />;
}
