"use client";

import { useId, useState } from "react";
import clsx from "clsx";

const terms = [
  { months: 12, apr: 0, label: "12 mo · 0% same-as-cash" },
  { months: 60, apr: 6.99, label: "60 mo · 6.99% APR" },
  { months: 120, apr: 7.49, label: "120 mo · 7.49% APR" },
  { months: 144, apr: 7.99, label: "144 mo · 7.99% APR" },
];

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function payment(principal: number, apr: number, months: number) {
  if (apr === 0) return principal / months;
  const r = apr / 100 / 12;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

/** Illustrative monthly-payment estimator. Not a credit offer. */
export function PaymentCalculator() {
  const id = useId();
  const [amount, setAmount] = useState(12500);
  const [down, setDown] = useState(0);
  const [term, setTerm] = useState(3);
  const t = terms[term];
  const principal = Math.max(0, amount - down);
  const monthly = payment(principal, t.apr, t.months);

  return (
    <div className="grid gap-px overflow-hidden rounded-[2px] bg-line lg:grid-cols-2">
      <div className="bg-slate p-6 md:p-10">
        <div>
          <label htmlFor={`${id}-amount`} className="flex items-baseline justify-between">
            <span className="t-eyebrow text-faint">Project cost</span>
            <span className="font-display text-2xl font-extrabold">{money(amount)}</span>
          </label>
          <input
            id={`${id}-amount`}
            type="range"
            min={3000}
            max={60000}
            step={250}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="range mt-4 w-full"
            style={{ "--v": `${((amount - 3000) / 57000) * 100}%` } as React.CSSProperties}
          />
          <div className="t-spec mt-2 flex justify-between text-faint">
            <span>$3k repair</span>
            <span>$60k slate</span>
          </div>
        </div>
        <div className="mt-10">
          <label htmlFor={`${id}-down`} className="flex items-baseline justify-between">
            <span className="t-eyebrow text-faint">Down payment</span>
            <span className="font-display text-2xl font-extrabold">{money(down)}</span>
          </label>
          <input
            id={`${id}-down`}
            type="range"
            min={0}
            max={Math.min(20000, amount)}
            step={250}
            value={Math.min(down, amount)}
            onChange={(e) => setDown(Number(e.target.value))}
            className="range mt-4 w-full"
            style={{ "--v": `${(Math.min(down, amount) / Math.min(20000, amount)) * 100}%` } as React.CSSProperties}
          />
        </div>
        <fieldset className="mt-10">
          <legend className="t-eyebrow text-faint">Term</legend>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {terms.map((x, i) => (
              <button
                key={x.months}
                type="button"
                aria-pressed={i === term}
                onClick={() => setTerm(i)}
                className={clsx(
                  "min-h-12 rounded-full border px-4 text-sm font-semibold transition-colors",
                  i === term ? "border-copper bg-copper text-ink" : "border-line text-muted hover:border-stone/40 hover:text-stone",
                )}
              >
                {x.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="flex flex-col justify-between bg-ink p-6 md:p-10" aria-live="polite">
        <div>
          <p className="t-eyebrow text-faint">Estimated monthly payment</p>
          <p className="mt-4 font-display text-[clamp(4rem,9vw,7.5rem)] font-black leading-none tracking-[-0.06em]">
            {money(Math.round(monthly))}
            <span className="text-2xl font-bold tracking-normal text-muted">/mo</span>
          </p>
          <p className="mt-4 text-muted">
            {money(principal)} financed over {t.months} months{t.apr ? ` at ${t.apr}% APR` : " with 0% interest if paid in full"}.
          </p>
        </div>
        <p className="t-spec mt-10 text-faint">
          Illustrative estimate only — not a credit offer. Rates and terms depend on credit approval through our lending partners.
        </p>
      </div>
    </div>
  );
}
