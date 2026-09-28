"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import clsx from "clsx";
import { ChoiceGroup, SelectField, TextField } from "./Field";
import { cities } from "@/content/cities";
import { site, telHref } from "@/lib/site";

type Data = {
  issue: string;
  age: string;
  street: string;
  city: string;
  zip: string;
  name: string;
  phone: string;
  email: string;
  time: string;
  claim: string;
};

const empty: Data = { issue: "", age: "", street: "", city: "", zip: "", name: "", phone: "", email: "", time: "", claim: "" };

const steps = ["Your roof", "The address", "How to reach you"];

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
    <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const issues = [
  { value: "hail", label: "Hail or wind damage", sub: "Recent storm, dents, missing shingles", icon: <Icon d="M7 16a5 5 0 0 1 1-9.9A7 7 0 0 1 21 7a5 5 0 0 1 3 9H7z M10 21l-1 3 M16 21l-1 4 M22 21l-1 3" /> },
  { value: "leak", label: "A leak", sub: "Stains, drips or damp attic", icon: <Icon d="M16 4c5 7 8 11 8 15a8 8 0 0 1-16 0c0-4 3-8 8-15z" /> },
  { value: "old", label: "Old roof / replacement", sub: "Curling, granule loss, 18+ years", icon: <Icon d="M4 17 16 7l12 10 M8 14v12h16V14" /> },
  { value: "checkup", label: "Just a check-up", sub: "Buying, selling or peace of mind", icon: <Icon d="M6 16l6 6L26 8" /> },
];

const ages = ["0–5 yrs", "6–10 yrs", "11–15 yrs", "16–20 yrs", "20+ yrs", "Not sure"].map((v) => ({ value: v, label: v }));
const times = ["Morning", "Afternoon", "Evening"].map((v) => ({ value: v, label: v }));
const claims = [
  { value: "none", label: "Not yet" },
  { value: "filed", label: "Already filed" },
  { value: "denied", label: "Filed & denied" },
];

function validate(step: number, d: Data): Partial<Record<keyof Data, string>> {
  const e: Partial<Record<keyof Data, string>> = {};
  if (step === 0) {
    if (!d.issue) e.issue = "Pick the option that fits best.";
    if (!d.age) e.age = "Roughly how old is the roof? “Not sure” is fine.";
  }
  if (step === 1) {
    if (d.street.trim().length < 5) e.street = "Please enter the street address.";
    if (!d.city) e.city = "Choose a city.";
    if (!/^\d{5}$/.test(d.zip.trim())) e.zip = "ZIP should be 5 digits.";
  }
  if (step === 2) {
    if (d.name.trim().length < 2) e.name = "Please tell us your name.";
    if (d.phone.replace(/\D/g, "").length !== 10) e.phone = "Enter a 10-digit phone number so we can call you back.";
    if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) e.email = "That email doesn't look right.";
    if (!d.time) e.time = "When's best to call?";
  }
  return e;
}

const formatPhone = (v: string) => {
  const n = v.replace(/\D/g, "").slice(0, 10);
  if (n.length < 4) return n;
  if (n.length < 7) return `(${n.slice(0, 3)}) ${n.slice(3)}`;
  return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
};

/**
 * Free-inspection request: three steps, photo upload (preview only — nothing is sent),
 * inline validation and a success state promising a callback within 2 hours.
 */
export function InspectionForm({ compact }: { compact?: boolean }) {
  const uid = useId();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Data, string>>>({});
  const [files, setFiles] = useState<{ url: string; name: string }[]>([]);
  const [drag, setDrag] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Revoke blob URLs only when the form unmounts (removals revoke their own).
  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);
  useEffect(() => () => filesRef.current.forEach((f) => URL.revokeObjectURL(f.url)), []);

  const set = (k: keyof Data) => (v: string) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const onInput = (k: keyof Data) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    set(k)(k === "phone" ? formatPhone(e.target.value) : e.target.value);

  const focusFirstError = () =>
    requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>("[aria-invalid=true], fieldset[aria-describedby] input")?.focus());

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const imgs = Array.from(list)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 6 - files.length)
      .map((f) => ({ url: URL.createObjectURL(f), name: f.name }));
    setFiles((prev) => [...prev, ...imgs]);
  };

  const next = (e?: FormEvent) => {
    e?.preventDefault();
    const errs = validate(step, data);
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstError();
    if (step < 2) {
      setStep(step + 1);
      requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>("input, select")?.focus());
      return;
    }
    setSending(true);
    // Demo: nothing leaves the browser.
    window.setTimeout(() => {
      setSending(false);
      setDone(`HR-${Math.floor(10000 + Math.random() * 89999)}`);
    }, 900);
  };

  if (done) {
    return (
      <div className="relative overflow-hidden rounded-[2px] border border-line bg-slate p-7 md:p-12" role="status" aria-live="polite">
        <svg viewBox="0 0 120 70" className="h-16 w-28 text-copper" aria-hidden>
          <path d="M6 64 L60 12 L114 64" fill="none" stroke="currentColor" strokeWidth="8" pathLength={1} className="success-roof" />
        </svg>
        <p className="t-eyebrow mt-8 text-accent">Request {done} received</p>
        <h3 className="t-h2 mt-4">We&rsquo;ll call within 2 hours.</h3>
        <p className="t-lead mt-5 max-w-xl text-muted">
          Thanks{data.name ? `, ${data.name.split(" ")[0]}` : ""}. A Halden inspector will call {data.phone} this {data.time.toLowerCase()} to book a time that
          suits you. {files.length > 0 && `We've attached your ${files.length} photo${files.length > 1 ? "s" : ""} to the request.`}
        </p>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-[2px] bg-line md:grid-cols-3">
          {[
            ["Within 2 hours", "We call to confirm a time"],
            ["Within 48 hours", "Inspector on your roof"],
            ["Same day", "Photo report in your inbox"],
          ].map(([t, d], i) => (
            <li key={t} className="bg-ink p-5">
              <p className="t-eyebrow text-faint">0{i + 1}</p>
              <p className="mt-2 font-display text-lg font-extrabold uppercase">{t}</p>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm text-muted">
          Leaking right now? Call{" "}
          <a href={telHref} className="font-semibold text-stone underline underline-offset-4">
            {site.phoneDisplay}
          </a>{" "}
          for same-day tarping.
        </p>
        <p className="t-spec mt-6 text-faint">Concept site: this form is a demo and nothing was sent.</p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={next} className={clsx("rounded-[2px] border border-line bg-slate", compact ? "p-5 md:p-8" : "p-6 md:p-10")} aria-labelledby={`${uid}-title`}>
      <div className="flex items-center justify-between gap-4">
        <p id={`${uid}-title`} className="t-eyebrow text-muted">
          Step {step + 1} of 3 · <span className="text-stone">{steps[step]}</span>
        </p>
        <p className="t-spec text-faint">Takes 60 seconds</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-1.5" aria-hidden>
        {steps.map((s, i) => (
          <span key={s} className="relative h-1 overflow-hidden rounded-full bg-stone/15">
            <span className={clsx("absolute inset-y-0 left-0 bg-copper transition-[width] duration-700 ease-[var(--ease-out-expo)]", i <= step ? "w-full" : "w-0")} />
          </span>
        ))}
      </div>

      <div ref={panel} key={step} className="anim-fade mt-8 flex flex-col gap-7">
        {step === 0 && (
          <>
            <ChoiceGroup legend="What's going on?" name="issue" options={issues} value={data.issue} onChange={set("issue")} error={errors.issue} large />
            <ChoiceGroup legend="How old is the roof?" name="age" options={ages} value={data.age} onChange={set("age")} error={errors.age} columns={3} />
          </>
        )}

        {step === 1 && (
          <>
            <TextField label="Street address" name="street" autoComplete="street-address" value={data.street} onChange={onInput("street")} error={errors.street} placeholder="1234 Main St" />
            <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
              <SelectField label="City" name="city" value={data.city} onChange={onInput("city")} error={errors.city}>
                <option value="">Choose…</option>
                {cities.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
                <option value="Other">Other (nearby)</option>
              </SelectField>
              <TextField label="ZIP" name="zip" inputMode="numeric" autoComplete="postal-code" maxLength={5} value={data.zip} onChange={onInput("zip")} error={errors.zip} placeholder="76109" />
            </div>
            <div>
              <p className="t-eyebrow mb-2 flex justify-between text-muted">
                <span>Photos of the damage</span>
                <span className="text-faint">Optional</span>
              </p>
              <div
                onDragOver={(e: DragEvent) => {
                  e.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e: DragEvent) => {
                  e.preventDefault();
                  setDrag(false);
                  addFiles(e.dataTransfer.files);
                }}
                className={clsx("rounded-[2px] border border-dashed p-5 transition-colors", drag ? "border-copper bg-copper/10" : "border-line")}
              >
                <input ref={fileInput} id={`${uid}-files`} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addFiles(e.target.files)} />
                <label htmlFor={`${uid}-files`} className="flex cursor-pointer flex-col items-center gap-2 py-3 text-center">
                  <svg viewBox="0 0 32 32" className="h-8 w-8 text-copper" aria-hidden>
                    <path d="M6 22 16 12l10 10 M16 12v16 M4 8h24" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span className="font-semibold">Drop photos here or tap to upload</span>
                  <span className="text-sm text-muted">Ceiling stains, shingles in the yard, dented gutters — up to 6 photos.</span>
                </label>
                {files.length > 0 && (
                  <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {files.map((f, i) => (
                      <li key={f.url} className="group relative aspect-square overflow-hidden rounded-[2px] bg-ink">
                        {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                        <img src={f.url} alt={`Upload ${i + 1}: ${f.name}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            URL.revokeObjectURL(f.url);
                            setFiles((prev) => prev.filter((x) => x.url !== f.url));
                          }}
                          aria-label={`Remove ${f.name}`}
                          className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-ink/80 text-xs text-stone"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Your name" name="name" autoComplete="name" value={data.name} onChange={onInput("name")} error={errors.name} />
              <TextField label="Phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" value={data.phone} onChange={onInput("phone")} error={errors.phone} placeholder="(817) 555-0100" />
            </div>
            <TextField label="Email" name="email" type="email" autoComplete="email" value={data.email} onChange={onInput("email")} error={errors.email} optional hint="For your photo report." />
            <ChoiceGroup legend="Best time to call" name="time" options={times} value={data.time} onChange={set("time")} error={errors.time} columns={3} />
            <ChoiceGroup legend="Insurance claim?" name="claim" options={claims} value={data.claim} onChange={set("claim")} columns={3} />
          </>
        )}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        {step > 0 ? (
          <button type="button" onClick={() => setStep(step - 1)} className="min-h-12 px-2 font-semibold text-muted hover:text-stone">
            ← Back
          </button>
        ) : (
          <span className="text-sm text-faint">No obligation. No door-knocking.</span>
        )}
        <button
          type="submit"
          disabled={sending}
          className="inline-flex min-h-14 items-center gap-3 rounded-full bg-copper px-8 font-semibold text-ink transition-colors hover:bg-copper-2 disabled:opacity-70"
        >
          {sending ? "Sending…" : step < 2 ? "Continue" : "Request my free inspection"}
          <svg viewBox="0 0 20 20" className="h-4 w-4 rotate-90" aria-hidden>
            <path d="M3 13 L10 6.5 L17 13" fill="none" stroke="currentColor" strokeWidth="2.2" />
          </svg>
        </button>
      </div>
    </form>
  );
}
