/** Business facts for the fictional Halden Roofing Co. (a DBS Media concept site). */

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://halden-roofing-demo.vercel.app").replace(/\/$/, "");

/** Demos stay out of search engines unless NEXT_PUBLIC_NOINDEX is explicitly "false". */
export const noindex = process.env.NEXT_PUBLIC_NOINDEX !== "false";

export const site = {
  name: "Halden Roofing Co.",
  shortName: "Halden Roofing",
  legalName: "Halden Roofing Co., LLC",
  tagline: "Built for the next storm.",
  description:
    "Family-owned Fort Worth roofers since 1998. Free roof inspections with a photo report, honest insurance-claim help, 1–2 day installs and a 25-year workmanship warranty.",
  founded: 1998,
  phone: "+18175550142",
  phoneDisplay: "(817) 555-0142",
  email: "hello@haldenroofing.com",
  address: {
    street: "4410 Copperline Dr",
    city: "Fort Worth",
    region: "TX",
    postalCode: "76109",
    country: "US",
  },
  geo: { lat: 32.7098, lng: -97.3812 },
  priceRange: "$$",
  rating: { value: 4.9, count: 612 },
  roofsCompleted: 4800,
  callbackHours: 2,
  financingFrom: 89,
  /** Opening hours, America/Chicago. Days: 0 = Sunday. */
  hours: [
    { days: [1, 2, 3, 4, 5], open: "07:00", close: "18:00" },
    { days: [6], open: "08:00", close: "14:00" },
  ],
  hoursDisplay: [
    { label: "Mon – Fri", value: "7 am – 6 pm" },
    { label: "Saturday", value: "8 am – 2 pm" },
    { label: "Sunday", value: "Emergency tarping only" },
  ],
  timezone: "America/Chicago",
  social: [] as string[],
} as const;

export const absoluteUrl = (path = "/") => `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;

export const telHref = `tel:${site.phone}`;
export const mailHref = `mailto:${site.email}`;
export const addressLine = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`;
