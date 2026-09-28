import clsx from "clsx";
import { warrantyTiers } from "@/content/company";
import { site } from "@/lib/site";
import { Reveal, SplitReveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

/** Workmanship-warranty tiers + the "from $89/mo" financing band. */
export function Warranty({ showFinancing = true, headingAs = "h2" }: { showFinancing?: boolean; headingAs?: "h2" | "h1" }) {
  return (
    <section aria-labelledby="warranty-title" className="theme-stone relative py-24 md:py-36">
      <div className="wrap">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="t-eyebrow text-accent">Warranties</p>
            <SplitReveal as={headingAs} id="warranty-title" className="t-h2 mt-5">
              Pick how long we&rsquo;ve got your back.
            </SplitReveal>
          </div>
          <Reveal className="md:col-span-5">
            <p className="t-lead text-muted">
              Material warranties cover the shingles. Workmanship warranties cover how they were installed — which is where
              almost every roof failure comes from. Ours are in writing.
            </p>
          </Reveal>
        </div>

        <Reveal stagger={0.1} className="mt-14 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {warrantyTiers.map((t) => (
            <article
              key={t.id}
              className={clsx(
                "relative flex flex-col rounded-[2px] p-7 md:p-9",
                t.featured ? "theme-ink lg:-my-6 lg:py-14" : "border border-line bg-stone-2",
              )}
            >
              {t.featured && (
                <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-copper [clip-path:polygon(0_100%,50%_0,100%_100%)]" />
              )}
              <p className="t-eyebrow text-accent">{t.note}</p>
              <h3 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-[-0.03em]">{t.name}</h3>
              <p className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-6xl font-black tracking-[-0.05em]">{t.workmanship.split(" ")[0]}</span>
                <span className="text-muted">year workmanship</span>
              </p>
              <ul className="mt-8 flex flex-1 flex-col gap-3 border-t border-line pt-6">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-3 text-[0.97rem]">
                    <span aria-hidden className="chev mt-2 shrink-0 text-copper" />
                    <span className={t.featured ? "text-stone/85" : "text-muted"}>{f}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </Reveal>

        {showFinancing && (
          <Reveal className="mt-20 grid gap-8 border-t border-line pt-12 md:grid-cols-12 md:items-center">
            <p className="font-display leading-none tracking-[-0.05em] md:col-span-5">
              <span className="block text-[0.95rem] font-semibold uppercase tracking-[0.02em] text-muted">New roofs from</span>
              <span className="text-[clamp(4.5rem,11vw,10rem)] font-black">${site.financingFrom}</span>
              <span className="text-2xl font-bold text-muted">/mo</span>
            </p>
            <div className="md:col-span-4">
              <p className="text-muted">
                Financing with approved credit, including 12-month same-as-cash. Checking your rate is a soft pull — it won&rsquo;t
                touch your score.
              </p>
              <p className="t-spec mt-3 text-faint">Example: $8,200 over 144 months at 7.99% APR ≈ $89/mo.</p>
            </div>
            <div className="md:col-span-3 md:text-right">
              <Button href="/financing" variant="dark">
                Estimate your payment
              </Button>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
