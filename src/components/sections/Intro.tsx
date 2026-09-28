import Image from "next/image";
import { photos } from "@/lib/photos";
import { stats, badges } from "@/content/company";
import { Counter, Parallax, Reveal, ScrubWords } from "@/components/ui/Reveal";
import { Mark } from "@/components/brand/Logo";

export function Intro() {
  return (
    <section aria-labelledby="intro-title" className="theme-stone gable-top relative z-10 pb-24 md:pb-36">
      <div className="wrap pt-16 md:pt-24">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 id="intro-title" className="t-eyebrow text-accent">
              The Halden way
            </h2>
            <ScrubWords
              className="mt-8 font-display text-[clamp(1.6rem,3.1vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.03em]"
              text="We're the Haldens. We've put roofs over Tarrant County since 1998 — no door-knocking, no pressure, no surprise bills. Just a photo report of what we find and a *straight *answer about what you need."
            />
            <Reveal className="mt-10 flex max-w-lg gap-4 text-muted">
              <Mark className="mt-1 h-8 w-8 text-ink" />
              <p>
                Two generations of roofers, one phone number. When you call, you get someone in Fort Worth — and the crew
                on your roof is ours, not a subcontractor from out of state.
              </p>
            </Reveal>
          </div>
          <div className="relative lg:col-span-5">
            <Parallax className="aspect-[4/5] w-full">
              <Image
                src={photos["team-founder"]}
                alt="Ray Halden, founder of Halden Roofing, in a high-visibility jacket"
                fill
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="object-cover"
              />
            </Parallax>
            <p className="t-spec mt-3 text-muted">Ray Halden, founder — still on job sites most mornings.</p>
            <Parallax className="absolute -bottom-10 -left-10 hidden aspect-square w-[42%] border-8 border-stone md:block" amount={18}>
              <Image src={photos["crew-nailer"]} alt="" fill sizes="18vw" className="object-cover" />
            </Parallax>
          </div>
        </div>

        <Reveal stagger={0.08} className="mt-24 grid grid-cols-2 gap-px border-y border-line bg-line md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-stone py-8 md:px-6 md:py-10">
              <p className="font-display text-[clamp(2.4rem,4.6vw,4.4rem)] font-black leading-none tracking-[-0.05em]">
                <Counter value={s.value} suffix={s.suffix} decimals={"decimals" in s ? s.decimals : 0} />
              </p>
              <p className="t-spec mt-3 text-muted">{s.label}</p>
            </div>
          ))}
        </Reveal>

        <ul className="mt-10 flex flex-wrap gap-x-10 gap-y-5">
          {badges.map((b) => (
            <li key={b.title} className="flex items-center gap-3">
              <svg viewBox="0 0 40 40" className="h-10 w-10 text-accent" aria-hidden>
                <path d="M20 3 L36 11 V22 C36 30 29 35 20 38 C11 35 4 30 4 22 V11 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M12 23 L20 16 L28 23" fill="none" stroke="currentColor" strokeWidth="2.4" />
              </svg>
              <span className="leading-tight">
                <span className="block text-[0.95rem] font-bold">{b.title}</span>
                <span className="t-spec text-muted">{b.sub}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
