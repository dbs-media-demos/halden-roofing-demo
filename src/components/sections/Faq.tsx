import type { Faq } from "@/content/faqs";
import { Reveal, SplitReveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export function FaqItems({ items }: { items: Faq[] }) {
  return (
    <div className="border-t border-line">
      {items.map((f) => (
        <details key={f.q} className="faq group border-b border-line">
          <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-6 py-5 text-left">
            <span className="text-[1.08rem] font-semibold md:text-[1.2rem]">{f.q}</span>
            <span aria-hidden className="faq-icon grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line transition-transform duration-500 group-hover:border-copper">
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 rotate-180">
                <path d="M3 13 L10 6.5 L17 13" fill="none" stroke="currentColor" strokeWidth="2.2" />
              </svg>
            </span>
          </summary>
          <p className="max-w-3xl pb-7 pr-14 text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/** Home / service-page FAQ block. */
export function FaqSection({ items, title = "Straight answers.", theme = "theme-stone" }: { items: Faq[]; title?: string; theme?: string }) {
  return (
    <section aria-labelledby="faq-title" className={`${theme} relative py-24 md:py-36`}>
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="t-eyebrow text-accent">FAQ</p>
          <SplitReveal id="faq-title" className="t-h2 mt-5">
            {title}
          </SplitReveal>
          <Reveal className="mt-8">
            <Button href="/faq" variant="ghost">
              All questions
            </Button>
          </Reveal>
        </div>
        <div className="lg:col-span-8">
          <FaqItems items={items} />
        </div>
      </div>
    </section>
  );
}
