"use client";

import { useRef, useState, type FormEvent } from "react";
import { SelectField, TextArea, TextField } from "./Field";

type Errors = Partial<Record<"name" | "contact" | "topic" | "message", string>>;

/** Simple contact form — validates, shows a success state, sends nothing (demo). */
export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    const contact = String(f.get("contact") ?? "").trim();
    const topic = String(f.get("topic") ?? "");
    const message = String(f.get("message") ?? "").trim();
    const errs: Errors = {};
    if (name.length < 2) errs.name = "Please tell us your name.";
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact);
    const isPhone = contact.replace(/\D/g, "").length === 10;
    if (!isEmail && !isPhone) errs.contact = "Enter an email or a 10-digit phone number.";
    if (!topic) errs.topic = "Pick a topic.";
    if (message.length < 10) errs.message = "A sentence or two helps us help you.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setSent(true);
    }, 800);
  };

  if (sent) {
    return (
      <div role="status" className="rounded-[2px] border border-line bg-slate p-8 md:p-12">
        <svg viewBox="0 0 120 70" className="h-14 w-24 text-copper" aria-hidden>
          <path d="M6 64 L60 12 L114 64" fill="none" stroke="currentColor" strokeWidth="8" pathLength={1} className="success-roof" />
        </svg>
        <h2 className="t-h2 mt-8">Message received.</h2>
        <p className="t-lead mt-4 max-w-lg text-muted">We reply to every message within one business day — usually the same afternoon.</p>
        <p className="t-spec mt-6 text-faint">Concept site: this form is a demo and nothing was sent.</p>
      </div>
    );
  }

  return (
    <form ref={form} noValidate onSubmit={submit} className="flex flex-col gap-6 rounded-[2px] border border-line bg-slate p-6 md:p-10">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Name" name="name" autoComplete="name" error={errors.name} />
        <TextField label="Email or phone" name="contact" autoComplete="email" error={errors.contact} />
      </div>
      <SelectField label="Topic" name="topic" defaultValue="" error={errors.topic}>
        <option value="">Choose…</option>
        <option>Question about a quote</option>
        <option>Warranty or past job</option>
        <option>Commercial roofing</option>
        <option>Careers</option>
        <option>Something else</option>
      </SelectField>
      <TextArea label="Message" name="message" error={errors.message} />
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <p className="text-sm text-faint">Need an inspection? Use the free inspection form instead.</p>
        <button type="submit" disabled={busy} className="inline-flex min-h-14 items-center rounded-full bg-copper px-8 font-semibold text-ink hover:bg-copper-2 disabled:opacity-70">
          {busy ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
