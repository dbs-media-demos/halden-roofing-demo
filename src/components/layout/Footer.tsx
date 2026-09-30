import Link from "next/link";
import { Mark } from "@/components/brand/Logo";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { services } from "@/content/services";
import { cities } from "@/content/cities";
import { site, telHref, mailHref, addressLine, agencyName, agencyUrl } from "@/lib/site";
import { FooterWordmark } from "./FooterWordmark";

const company = [
  { href: "/about", label: "About the Haldens" },
  { href: "/projects", label: "Projects" },
  { href: "/reviews", label: "Reviews" },
  { href: "/financing", label: "Financing & warranties" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
];

export function Footer() {
  return (
    <footer className="theme-ink relative overflow-hidden border-t border-line pb-28 pt-20 md:pb-10">
      <div className="wrap">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Mark className="h-14 w-14" />
            <p className="t-h3 mt-6 max-w-sm">Built for the next storm. Here for the one after that.</p>
            <div className="mt-8 flex flex-col gap-2 text-[0.98rem]">
              <a href={telHref} className="font-display text-2xl font-bold tracking-[-0.02em] hover:text-copper-2">
                {site.phoneDisplay}
              </a>
              <a href={mailHref} className="text-muted hover:text-stone">
                {site.email}
              </a>
              <p className="text-muted">{addressLine}</p>
            </div>
          </div>

          <nav aria-label="Services" className="md:col-span-3">
            <p className="t-eyebrow text-faint">Services</p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="text-muted transition-colors hover:text-stone">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Service areas" className="md:col-span-2">
            <p className="t-eyebrow text-faint">Service areas</p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {cities.map((c) => (
                <li key={c.slug}>
                  <Link href={`/service-areas/${c.slug}`} className="text-muted transition-colors hover:text-stone">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company" className="md:col-span-3">
            <p className="t-eyebrow text-faint">Company</p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {company.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted transition-colors hover:text-stone">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 border-t border-line pt-6">
              <OpenBadge className="text-stone" />
              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
                {site.hoursDisplay.map((h) => (
                  <div key={h.label} className="contents">
                    <dt className="text-faint">{h.label}</dt>
                    <dd className="text-muted">{h.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </nav>
        </div>
      </div>

      <FooterWordmark />

      <div className="wrap mt-6 flex flex-col gap-3 border-t border-line pt-6 text-sm text-faint md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {site.legalName} · Fully insured · A fictional business —{" "}
          <span className="text-muted">this is a concept site.</span>
        </p>
        <p>
          Design &amp; development:{" "}
          <a href={agencyUrl} target="_blank" rel="noopener" className="text-muted underline decoration-line underline-offset-4 hover:text-stone">
            {agencyName}
          </a>
        </p>
      </div>
    </footer>
  );
}
