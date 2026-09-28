import Image from "next/image";
import { photos } from "@/lib/photos";
import { stormChaserFlags } from "@/content/company";
import { Parallax, Reveal, SplitReveal } from "@/components/ui/Reveal";

/** "How to spot a storm chaser" — red flags vs. the Halden way. */
export function StormChaser() {
  return (
    <section aria-labelledby="chaser-title" className="theme-stone relative py-24 md:py-36">
      <div className="wrap grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="t-eyebrow text-accent">Trust, but verify</p>
          <SplitReveal id="chaser-title" className="t-h2 mt-5">
            How to spot a storm chaser.
          </SplitReveal>
          <Reveal>
            <p className="t-lead mt-6 max-w-md text-muted">
              After every big hailstorm, out-of-state crews flood Tarrant County, then vanish before the first warranty claim.
              Here&rsquo;s what to watch for — whoever you hire.
            </p>
          </Reveal>
          <Parallax className="mt-10 aspect-[4/3] w-full lg:aspect-[4/5]">
            <Image src={photos["hail-hand"]} alt="A hand holding hailstones after a North Texas storm" fill sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover" />
          </Parallax>
        </div>

        <div className="lg:col-span-7 lg:pt-6">
          <div className="hidden grid-cols-2 gap-6 border-b border-line pb-4 md:grid">
            <p className="t-eyebrow text-muted">Red flag</p>
            <p className="t-eyebrow text-accent">The Halden way</p>
          </div>
          <Reveal as="ol" stagger={0.08}>
            {stormChaserFlags.map((f, i) => (
              <li key={f.flag} className="grid gap-3 border-b border-line py-6 md:grid-cols-2 md:gap-6 md:py-8">
                <p className="flex gap-4">
                  <span className="t-eyebrow pt-1.5 text-faint">0{i + 1}</span>
                  <span className="relative text-[1.08rem] font-semibold">
                    <span className="sr-only">Red flag: </span>
                    {f.flag}
                  </span>
                </p>
                <p className="flex gap-3 pl-9 text-muted md:pl-0">
                  <span aria-hidden className="chev mt-2 shrink-0 text-copper" />
                  <span>
                    <span className="sr-only">Halden: </span>
                    {f.halden}
                  </span>
                </p>
              </li>
            ))}
          </Reveal>
          <Reveal className="mt-10 flex items-start gap-5 rounded-[2px] bg-ink p-6 text-stone md:p-8">
            <span className="font-display text-5xl font-black leading-none text-copper">!</span>
            <p>
              <strong className="font-bold">Texas law is on your side.</strong>{" "}
              <span className="text-stone/80">
                Since 2019 it&rsquo;s illegal for a contractor to waive, rebate or &ldquo;cover&rdquo; your insurance deductible. If someone
                offers, walk away — they&rsquo;ll make it back by cutting corners on your roof.
              </span>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
