import clsx from "clsx";
import { reviews, type Review } from "@/content/reviews";
import { defaultBiz } from "@/lib/biz";
import type { Biz } from "@/lib/biz-core";
import { scrubReview } from "@/lib/scrub";
import { Reveal, SplitReveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export function Stars({ n = 5, className }: { n?: number; className?: string }) {
  return (
    <span className={clsx("inline-flex gap-0.5", className)} aria-label={`${n} out of 5 stars`} role="img">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={clsx("h-4 w-4", i <= n ? "text-[#f4b400]" : "text-current opacity-25")} aria-hidden>
          <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z" fill="currentColor" />
        </svg>
      ))}
    </span>
  );
}

export function ReviewCard({ r, className, area, shortName }: { r: Review; className?: string; area?: string; shortName?: string }) {
  return (
    <figure className={clsx("flex flex-col rounded-[2px] border border-line bg-surface p-6", className)}>
      <div className="flex items-center gap-3">
        <span aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-copper font-display text-lg font-bold text-ink">
          {r.author[0]}
        </span>
        <figcaption className="leading-tight">
          <span className="block font-semibold">{r.author}</span>
          <span className="t-spec text-muted">{area ?? r.city}</span>
        </figcaption>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Stars n={r.rating} />
        <span className="text-sm text-muted">{r.ago}</span>
      </div>
      <blockquote className="mt-3 flex-1 text-[0.97rem] leading-relaxed text-muted">{shortName ? scrubReview(r.text, shortName) : r.text}</blockquote>
      <p className="t-spec mt-5 text-accent">{r.job}</p>
    </figure>
  );
}

function Row({ items, reverse, hidden, area, shortName }: { items: Review[]; reverse?: boolean; hidden?: boolean; area?: string; shortName?: string }) {
  return (
    <div className="marquee-wrap overflow-hidden" aria-hidden={hidden}>
      <div className={clsx("marquee flex w-max gap-5 pr-5", reverse && "marquee-rev")} style={{ "--dur": "80s" } as React.CSSProperties}>
        {[...items, ...items].map((r, i) => (
          <ReviewCard key={i} r={r} area={area} shortName={shortName} className="w-[82vw] shrink-0 sm:w-[380px]" />
        ))}
      </div>
    </div>
  );
}

/** Google-style rating header + two drifting rows of review cards. */
export function Reviews({ biz = defaultBiz }: { biz?: Biz }) {
  const half = Math.ceil(reviews.length / 2);
  // Previews show the concept's sample reviews, placed in the business's area and labelled as samples
  const area = biz.preview ? biz.area : undefined;
  const shortName = biz.preview ? biz.shortName : undefined;
  return (
    <section aria-labelledby="reviews-title" className="theme-ink relative overflow-hidden py-24 md:py-36">
      <div className="wrap grid gap-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="t-eyebrow text-accent">{biz.preview ? "Reviews · samples" : "Reviews"}</p>
          <SplitReveal id="reviews-title" className="t-h2 mt-5">
            {biz.preview ? (biz.rating ? `${biz.rating.count} neighbors can’t all be wrong.` : "Neighbors, in their words.") : "612 neighbors can’t all be wrong."}
          </SplitReveal>
        </div>
        {biz.rating && (
          <Reveal className="flex items-end gap-6 md:col-span-5 md:justify-end">
            <p className="font-display text-[5.5rem] font-black leading-[0.8] tracking-[-0.06em]">{biz.rating.value}</p>
            <div>
              <Stars n={5} />
              <p className="mt-2 text-muted">
                Average from {biz.rating.count} Google reviews
                {!biz.preview && <span className="t-spec block text-faint">Updated September 2026</span>}
              </p>
            </div>
          </Reveal>
        )}
      </div>

      {/* Accessible list for screen readers; the marquees are decorative duplicates. */}
      <ul className="sr-only">
        {reviews.slice(0, 6).map((r) => (
          <li key={r.author}>
            {r.author}, {area ?? r.city}: {shortName ? scrubReview(r.text, shortName) : r.text}
          </li>
        ))}
      </ul>
      <div className="mt-16 flex flex-col gap-5" aria-hidden>
        <Row items={reviews.slice(0, half)} area={area} shortName={shortName} hidden />
        <Row items={reviews.slice(half)} area={area} shortName={shortName} reverse hidden />
      </div>

      <div className="wrap mt-12">
        <Button href="/reviews" variant="ghost">
          Read all reviews
        </Button>
      </div>
    </section>
  );
}
