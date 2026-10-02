import { site, addressLine } from "./site";
import { type Biz, type DayHours } from "./biz-core";

export type { Biz } from "./biz-core";

/** The fictional company as a Biz: what the concept site shows (previews swap in a real one). */
export const defaultBiz: Biz = {
  lang: "en",
  name: site.name,
  shortName: site.shortName,
  tagline: null,
  area: site.address.city,
  phone: site.phone,
  phoneDisplay: site.phoneDisplay,
  address: { street: site.address.street, city: site.address.city, region: site.address.region, postal: site.address.postalCode, full: addressLine },
  timezone: site.timezone,
  hours: [0, 1, 2, 3, 4, 5, 6].map((day): DayHours => {
    const h = site.hours.find((x) => (x.days as readonly number[]).includes(day));
    return { day, open: h?.open ?? null, close: h?.close ?? null };
  }),
  hoursSummary: "Mon – Fri 7 am – 6 pm",
  rating: { ...site.rating },
  preview: false,
};
