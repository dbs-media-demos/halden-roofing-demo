import type { Metadata, Viewport } from "next";
import "./display-font.css";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { site, siteUrl, noindex, agencyName, agencyUrl } from "@/lib/site";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Cursor } from "@/components/layout/Chrome";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${site.name} — Fort Worth Roofers Since 1998`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: agencyName, url: agencyUrl }],
  creator: agencyName,
  formatDetection: { telephone: false },
  robots: noindex ? { index: false, follow: false, googleBot: { index: false, follow: false } } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#0e1620",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className={fontVariables} suppressHydrationWarning>
      <body className="theme-ink min-h-screen">
        <a
          href="#main"
          className="t-eyebrow fixed left-4 top-4 z-[300] -translate-y-24 rounded-full bg-copper px-5 py-3 text-ink focus:translate-y-0"
        >
          Skip to content
        </a>
        <SmoothScroll />
        {/* Header, footer and the rest come from (site)/layout or for/[token]/layout (SiteChrome) */}
        {children}
        <Cursor />
      </body>
    </html>
  );
}
