import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Breadcrumbs } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { site, mailHref } from "@/lib/site";
import { graph, breadcrumbSchema, webPageSchema } from "@/lib/schema";

const description = "How Halden Roofing Co. collects, uses and protects the information you share with us.";

export const metadata: Metadata = buildMetadata({ title: "Privacy Policy", description, path: "/privacy", eyebrow: "Privacy" });

export default function PrivacyPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Privacy", path: "/privacy" },
  ];
  return (
    <PageShell>
      <JsonLd data={graph(webPageSchema({ path: "/privacy", name: "Privacy Policy", description }), breadcrumbSchema(crumbs))} />
      <section className="theme-stone pb-24 pt-[calc(var(--header-h)+4.5rem)] md:pb-32">
        <div className="wrap max-w-4xl">
          <Breadcrumbs items={crumbs} />
          <h1 className="t-h1 anim-heading mt-10">Privacy policy</h1>
          <p className="t-spec mt-6 text-muted">Last updated September 28, 2026</p>
          <div className="prose-halden mt-12">
            <p>
              <strong>This is a concept website.</strong> {site.name} is a fictional business created by DBS Media to demonstrate a
              roofing website. The forms on this site do not send, store or share any information. The policy below shows what a
              real roofing company&rsquo;s policy would cover.
            </p>
            <h2>What we collect</h2>
            <ul>
              <li>Details you give us in forms: your name, phone number, email, property address and information about your roof.</li>
              <li>Photos you choose to upload with an inspection request.</li>
              <li>Basic, anonymous analytics about how the site is used (pages visited, device type).</li>
            </ul>
            <h2>How we use it</h2>
            <ul>
              <li>To contact you about your inspection, estimate or question.</li>
              <li>To prepare your inspection photo report and, if you ask us to, share it with your insurance company.</li>
              <li>To register your workmanship warranty to your address.</li>
            </ul>
            <p>We never sell your information, and we don&rsquo;t share it with other contractors or lead-generation companies.</p>
            <h2>Texting and calls</h2>
            <p>
              If you give us your phone number, we&rsquo;ll call or text you about your request only. Reply STOP to any text to opt out.
            </p>
            <h2>How long we keep it</h2>
            <p>
              Job records are kept for the length of your warranty so we can honor it. Inquiries that don&rsquo;t become jobs are deleted
              after 24 months.
            </p>
            <h2>Your choices</h2>
            <p>
              You can ask us to see, correct or delete the information we hold about you at any time by emailing{" "}
              <a href={mailHref}>{site.email}</a> or calling {site.phoneDisplay}.
            </p>
            <h2>Cookies</h2>
            <p>
              This site uses only what&rsquo;s needed to work (for example, remembering that you dismissed a banner). We don&rsquo;t use
              advertising cookies.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
