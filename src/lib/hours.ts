import { site } from "./site";

export type OpenStatus = { open: boolean; label: string };

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const fmt = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, "0")} ${suffix}` : `${h12} ${suffix}`;
};

const dayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Live "Open now · closes 6 pm" status in the business's own time zone. */
export function getOpenStatus(now = new Date()): OpenStatus {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: site.timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const day = dayShort.indexOf(weekday);
  const minutes = Number(parts.find((p) => p.type === "hour")?.value) * 60 + Number(parts.find((p) => p.type === "minute")?.value);

  const today = site.hours.find((h) => (h.days as readonly number[]).includes(day));
  if (today && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close)) {
    return { open: true, label: `Open now · closes ${fmt(today.close)}` };
  }

  // Find the next opening.
  for (let i = 0; i < 8; i++) {
    const d = (day + i) % 7;
    const h = site.hours.find((x) => (x.days as readonly number[]).includes(d));
    if (!h) continue;
    if (i === 0 && minutes >= toMinutes(h.open)) continue;
    const when = i === 0 ? "today" : i === 1 ? "tomorrow" : dayShort[d];
    return { open: false, label: `Closed · opens ${when} ${fmt(h.open)}` };
  }
  return { open: false, label: "Closed" };
}
