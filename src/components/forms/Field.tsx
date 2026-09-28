import clsx from "clsx";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const base =
  "w-full rounded-[2px] border bg-transparent px-4 py-3.5 text-[1.02rem] text-fg outline-none transition-colors placeholder:text-faint focus:border-copper";

type Common = { label: string; name: string; error?: string; hint?: string; className?: string; optional?: boolean };

function Wrap({ label, name, error, hint, className, optional, children }: Common & { children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="t-eyebrow mb-2 flex justify-between text-muted">
        <span>{label}</span>
        {optional && <span className="text-faint">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="mt-2 text-sm font-medium text-[#f08a6a]" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${name}-hint`} className="mt-2 text-sm text-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({ label, name, error, hint, className, optional, ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrap label={label} name={name} error={error} hint={hint} className={className} optional={optional}>
      <input
        id={name}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        className={clsx(base, error ? "border-[#f08a6a]" : "border-line")}
        {...rest}
      />
    </Wrap>
  );
}

export function SelectField({ label, name, error, className, optional, children, ...rest }: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Wrap label={label} name={name} error={error} className={className} optional={optional}>
      <select
        id={name}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={clsx(base, "appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat", error ? "border-[#f08a6a]" : "border-line")}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2 4.5 6 8l4-3.5' fill='none' stroke='%23c4713c' stroke-width='1.6'/%3E%3C/svg%3E\")",
        }}
        {...rest}
      >
        {children}
      </select>
    </Wrap>
  );
}

export function TextArea({ label, name, error, className, optional, ...rest }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Wrap label={label} name={name} error={error} className={className} optional={optional}>
      <textarea
        id={name}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={clsx(base, "min-h-36 resize-y", error ? "border-[#f08a6a]" : "border-line")}
        {...rest}
      />
    </Wrap>
  );
}

/** Radio group rendered as big selectable chips/cards. */
export function ChoiceGroup({
  legend,
  name,
  options,
  value,
  onChange,
  error,
  columns = 2,
  large,
}: {
  legend: string;
  name: string;
  options: { value: string; label: string; sub?: string; icon?: ReactNode }[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
  columns?: 2 | 3 | 4;
  large?: boolean;
}) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="t-eyebrow mb-3 text-muted">{legend}</legend>
      <div className={clsx("grid gap-2", columns === 2 && "sm:grid-cols-2", columns === 3 && "grid-cols-2 sm:grid-cols-3", columns === 4 && "grid-cols-2 sm:grid-cols-4")}>
        {options.map((o) => {
          const on = value === o.value;
          return (
            <label
              key={o.value}
              className={clsx(
                "group relative flex cursor-pointer items-center gap-3 rounded-[2px] border transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-copper",
                large ? "min-h-20 p-4" : "min-h-12 px-4 py-2.5",
                on ? "border-copper bg-copper/10" : "border-line hover:border-fg/30",
              )}
            >
              <input type="radio" name={name} value={o.value} checked={on} onChange={() => onChange(o.value)} className="sr-only" />
              {o.icon && <span className={clsx("shrink-0 transition-colors", on ? "text-copper" : "text-faint")}>{o.icon}</span>}
              <span className="leading-tight">
                <span className="block font-semibold">{o.label}</span>
                {o.sub && <span className="mt-0.5 block text-sm text-muted">{o.sub}</span>}
              </span>
              <span aria-hidden className={clsx("chev ml-auto text-copper transition-transform duration-300", on ? "scale-100" : "scale-0")} />
            </label>
          );
        })}
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-2 text-sm font-medium text-[#f08a6a]" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
