import { SplitReveal, Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { DAY_NAMES, dayRange, weekFromMonday, type Biz } from "@/lib/biz-core";

/** A preview's "where we are": the business's real address on a Google map, hours and directions. */
export function PreviewMap({ biz }: { biz: Biz }) {
  const query = [biz.name, biz.address.full].filter(Boolean).join(", ");
  const embed = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=13&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
  return (
    <section aria-labelledby="map-title" className="theme-slate relative overflow-hidden py-24 md:py-36">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <p className="t-eyebrow text-accent">Service area</p>
          <SplitReveal id="map-title" className="t-h2 mt-5">
            {`Roofs across ${biz.area}.`}
          </SplitReveal>
          <Reveal>
            {biz.address.full && <p className="mt-6 max-w-md text-muted">{biz.address.full}</p>}
            <OpenBadge className="mt-6" />
            {biz.hours && (
              <dl className="mt-8 grid max-w-sm grid-cols-[auto_1fr] gap-x-8 gap-y-1.5 border-t border-line pt-6 text-sm">
                {weekFromMonday(biz.hours).map((h) => (
                  <div key={h.day} className="contents">
                    <dt className="text-faint">{DAY_NAMES.en[h.day]}</dt>
                    <dd className="text-right text-muted">{dayRange(h, "en")}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="mt-8">
              <Button href={directions} external>
                Get directions
              </Button>
            </div>
          </Reveal>
        </div>
        <Reveal className="lg:col-span-7">
          <div className="relative aspect-square overflow-hidden rounded-[2px] border border-line sm:aspect-[4/3]">
            <iframe src={embed} title={`Map: ${query}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 h-full w-full border-0" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
