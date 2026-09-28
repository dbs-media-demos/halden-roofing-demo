import Image from "next/image";
import { photos, type PhotoKey } from "@/lib/photos";
import { site, telHref } from "@/lib/site";
import { Parallax, SplitReveal, Reveal } from "@/components/ui/Reveal";
import { Button, PhoneIcon } from "@/components/ui/Button";
import { OpenBadge } from "@/components/ui/OpenBadge";

/** Closing call-to-action on a full-bleed photo. */
export function CtaBand({
  image = "house-ranch-dusk",
  title = "Straight answers about your roof. Free.",
  text = "Book a free inspection and get a photo report the same day. We call back within 2 hours during business hours.",
}: {
  image?: PhotoKey;
  title?: string;
  text?: string;
}) {
  return (
    <section aria-labelledby="cta-title" className="theme-ink gable-top relative overflow-hidden">
      <Parallax className="absolute inset-0" reveal={false} amount={14}>
        <Image src={photos[image]} alt="" fill sizes="100vw" className="object-cover" />
      </Parallax>
      <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/20" />
      <div className="wrap relative py-28 md:py-44">
        <OpenBadge className="text-stone/80" />
        <SplitReveal id="cta-title" className="t-h1 mt-6 max-w-5xl text-stone">
          {title}
        </SplitReveal>
        <Reveal>
          <p className="t-lead mt-6 max-w-xl text-stone/85">{text}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/free-inspection" size="lg">
              Book a free inspection
            </Button>
            <Button href={telHref} variant="light" size="lg" icon={<PhoneIcon />}>
              {site.phoneDisplay}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
