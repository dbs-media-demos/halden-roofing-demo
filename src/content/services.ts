import type { PhotoKey } from "@/lib/photos";

export type Service = {
  slug: string;
  title: string;
  /** Short name for nav + cards. */
  short: string;
  /** One-line promise used on cards and the services list. */
  tagline: string;
  metaDescription: string;
  hero: PhotoKey;
  images: [PhotoKey, PhotoKey, PhotoKey];
  intro: string;
  /** Three quick facts shown under the hero. */
  facts: { label: string; value: string }[];
  includes: string[];
  whenYouNeedIt: string[];
  process: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
  serviceType: string;
};

export const services: Service[] = [
  {
    slug: "roof-replacement",
    title: "Roof Replacement",
    short: "Replacement",
    tagline: "A new roof in one or two days, with the mess gone before we leave.",
    metaDescription:
      "Full roof replacement in Fort Worth with Class 4 impact-rated shingles, metal, tile or slate. Free inspection, written estimate, 1–2 day installs and up to a 25-year workmanship warranty.",
    hero: "crew-shingles-1",
    images: ["crew-nailer", "shingle-architectural", "house-modern-farmhouse"],
    intro:
      "Most Fort Worth homes need a new roof every 18 to 25 years, sooner after a bad hail season. We tear off down to the deck, replace every soft board we find, and install a complete roof system: underlayment, ice-and-water at valleys, drip edge, ridge vent and the shingles or metal you picked. Most homes are done in a day or two.",
    facts: [
      { label: "Typical price", value: "$9,500 – $18,000" },
      { label: "Install time", value: "1 – 2 days" },
      { label: "Workmanship warranty", value: "Up to 25 years" },
    ],
    includes: [
      "Complete tear-off down to the decking — no layovers",
      "Rotten decking replaced at a pre-agreed per-sheet price (no surprises)",
      "Synthetic underlayment + ice-and-water shield in every valley",
      "New drip edge, pipe boots, flashing and balanced ridge ventilation",
      "Class 4 impact-rated shingle options (many insurers discount your premium)",
      "Magnetic nail sweep of the yard, driveway and beds — twice",
      "Final photo report and warranty registration in your inbox",
    ],
    whenYouNeedIt: [
      "Your roof is 18+ years old or shingles are curling and cupping",
      "Granules pile up at the bottom of your downspouts",
      "Hail or wind damage your insurer has agreed to replace",
      "You see daylight or stains in the attic",
    ],
    process: [
      { title: "Free inspection", text: "We walk every slope, check the attic and send you a photo report the same day." },
      { title: "Straight estimate", text: "One written price with options — no 'today-only' discounts, no pressure." },
      { title: "Pick your roof", text: "Bring home real samples. We'll show you houses nearby with the same shingle." },
      { title: "Install day", text: "Crew arrives at 7 am, tarps protect your landscaping, the old roof comes off." },
      { title: "Cleanup & walkthrough", text: "Magnet sweep, haul-off, then we walk the job with you before we invoice." },
    ],
    faqs: [
      {
        q: "How long does a roof replacement take?",
        a: "Most single-family homes in Fort Worth take one day; larger or steeper roofs take two. Metal, tile and slate can take three to five days.",
      },
      {
        q: "Do I need to be home during the install?",
        a: "No. We'll need access to power outside and your driveway kept clear. Most homeowners work from home or leave for the day — we text photos as we go.",
      },
      {
        q: "Will you find rotten decking?",
        a: "Sometimes. Our estimate lists a fixed price per sheet so you know the cost upfront, and we photograph every board before we replace it.",
      },
    ],
    serviceType: "Roof replacement",
  },
  {
    slug: "roof-repair",
    title: "Roof Repair",
    short: "Repair",
    tagline: "Leaks, missing shingles and flashing fixed fast, not upsold.",
    metaDescription:
      "Fast roof repair in Fort Worth: leaks, missing shingles, flashing, pipe boots and storm tarping. Most repairs $350–$1,800. Same-week scheduling and a written warranty.",
    hero: "crew-gloves",
    images: ["crew-drill", "before-shingle-edge", "crew-ridge"],
    intro:
      "Not every problem needs a new roof. If a repair will honestly buy you years, we'll tell you — and we'll fix it properly: matched shingles, sealed flashing, new pipe boots, and a photo of every step. Leaking right now? We tarp same-day across Tarrant County.",
    facts: [
      { label: "Typical price", value: "$350 – $1,800" },
      { label: "Scheduling", value: "Same week" },
      { label: "Emergency tarping", value: "Same day" },
    ],
    includes: [
      "Leak tracing from the attic side, not just the shingles",
      "Replacement of missing, creased or lifted shingles (color-matched)",
      "Chimney, wall and valley flashing re-sealed or replaced",
      "Cracked pipe boots and vents replaced",
      "Emergency tarping when rain is on the way",
      "Written 2-year warranty on every repair",
    ],
    whenYouNeedIt: [
      "A stain on the ceiling that grows after rain",
      "Shingles in the yard after a windstorm",
      "Dripping around a chimney, skylight or vent",
      "You're selling and the inspector flagged the roof",
    ],
    process: [
      { title: "Call or book online", text: "Tell us what you're seeing. Photos help — you can upload them with the form." },
      { title: "Diagnose", text: "We find the actual entry point — water often travels feet before it shows." },
      { title: "Fix & document", text: "Most repairs are done the same visit, with before and after photos." },
    ],
    faqs: [
      {
        q: "Can you match my existing shingles?",
        a: "Usually, yes. We keep common colors from the last 15 years on hand. If an exact match is discontinued, we'll show you the closest options before we start.",
      },
      {
        q: "Is a repair worth it on an old roof?",
        a: "Sometimes it's the right call to buy a year or two. We'll tell you plainly if the roof is at the end of its life so you can plan instead of paying for repeated repairs.",
      },
    ],
    serviceType: "Roof repair",
  },
  {
    slug: "storm-hail-damage",
    title: "Storm & Hail Damage",
    short: "Storm & hail",
    tagline: "Free inspection, a photo report and honest help with your insurance claim.",
    metaDescription:
      "Hail and storm damage roofing in Fort Worth. Free inspection with a photo report, help with your insurance claim, we meet your adjuster, 1–2 day installs. We never waive deductibles — that's illegal in Texas.",
    hero: "storm-supercell-road",
    images: ["hail-hand", "hail-grass", "storm-house"],
    intro:
      "North Texas sits in one of the busiest hail corridors in the country. After a storm, you'll get door-knockers from three states away. We've been here since 1998, and we'll be here when your warranty matters. We inspect for free, document every hit, help you file, meet your adjuster on the roof, and only then talk about a new roof.",
    facts: [
      { label: "Inspection", value: "Free, within 48 hrs" },
      { label: "Your cost", value: "Usually your deductible" },
      { label: "Callback", value: "Within 2 hours" },
    ],
    includes: [
      "Full-roof inspection including soft metals, vents, gutters and siding",
      "Timestamped photo report you can send straight to your insurer",
      "Help filing the claim and reading the scope line by line",
      "We meet the adjuster on your roof so nothing is missed",
      "Supplements filed for code items the first scope left out",
      "Install in 1–2 days once the claim is approved",
    ],
    whenYouNeedIt: [
      "Hail larger than a quarter hit your neighborhood",
      "Dents on gutters, vents, AC fins or your car",
      "Neighbors are getting new roofs after the same storm",
      "Shingles missing or creased after high winds",
    ],
    process: [
      { title: "Free inspection", text: "A certified inspector walks every slope and marks every hit." },
      { title: "Photo report", text: "Dozens of timestamped photos, every hit circled, same day." },
      { title: "Claim help", text: "We help you file and explain the scope in plain English." },
      { title: "Adjuster meeting", text: "We meet your adjuster on the roof — nothing gets missed." },
      { title: "Install", text: "One or two days, magnetic sweep, then your warranty." },
    ],
    faqs: [
      {
        q: "Can you cover my deductible?",
        a: "No — and anyone who offers to is breaking Texas law. Since 2019, the Texas Insurance Code makes it illegal for a contractor to waive, rebate or 'absorb' a homeowner's deductible. It's the number one sign of a storm chaser.",
      },
      {
        q: "Will filing a claim raise my premium?",
        a: "In Texas, an insurer can't cancel or refuse to renew your policy just because you filed a claim for weather damage. Rates can still change with area-wide increases, so ask your agent if you're unsure.",
      },
      {
        q: "How long do I have to file after a storm?",
        a: "Most Texas policies give you one to two years from the date of loss, but damage gets harder to prove as time passes. Get it inspected while the storm date is fresh.",
      },
    ],
    serviceType: "Storm damage roof repair and insurance claim assistance",
  },
  {
    slug: "metal-roofing",
    title: "Metal Roofing",
    short: "Metal",
    tagline: "Standing-seam metal that shrugs off hail and outlives your mortgage.",
    metaDescription:
      "Standing-seam and exposed-fastener metal roofing in Fort Worth. Class 4 hail rating, 140+ mph wind rating, 40–70 year lifespan and cooler attics. Free estimates.",
    hero: "metal-peak",
    images: ["metal-twin-peaks", "ranch-metal-roof", "metal-dormers"],
    intro:
      "A standing-seam metal roof is the last roof most Texas homeowners ever buy. Concealed fasteners, Class 4 impact rating, reflective finishes that keep your attic cooler in August, and a look that works on everything from a Benbrook ranch to a modern farmhouse in Keller.",
    facts: [
      { label: "Typical price", value: "$22,000 – $45,000" },
      { label: "Lifespan", value: "40 – 70 years" },
      { label: "Hail rating", value: "UL 2218 Class 4" },
    ],
    includes: [
      "24- and 26-gauge standing-seam panels, roll-formed on site",
      "High-temperature synthetic underlayment rated for metal",
      "Concealed clips that let panels expand and contract in the heat",
      "Matching trim, ridge caps, snow-and-debris guards where needed",
      "Kynar 500 finishes in 20+ colors with a 40-year finish warranty",
    ],
    whenYouNeedIt: [
      "You're tired of replacing shingles after every big hail year",
      "You want lower cooling bills and a quieter attic",
      "You're building or remodeling a modern farmhouse or ranch",
    ],
    process: [
      { title: "Design visit", text: "We measure, talk colors and panel profiles, and show local examples." },
      { title: "Fabrication", text: "Panels are roll-formed on your driveway to the exact length." },
      { title: "Install", text: "Three to five days for most homes, with daily cleanup." },
    ],
    faqs: [
      {
        q: "Is a metal roof loud in the rain?",
        a: "Not over a solid deck with underlayment and an insulated attic. It sounds about the same as shingles from inside the house.",
      },
      {
        q: "Will hail dent it?",
        a: "Large hail can leave cosmetic dimples, but a Class 4 metal roof won't leak because of them. Ask your insurer about a cosmetic-damage exclusion discount.",
      },
    ],
    serviceType: "Metal roof installation",
  },
  {
    slug: "gutters",
    title: "Seamless Gutters",
    short: "Gutters",
    tagline: "Seamless gutters sized for Texas downpours, installed in one visit.",
    metaDescription:
      "Seamless aluminum gutters, downspouts and gutter guards in Fort Worth. Formed on site, sized for Texas downpours. Typical home $1,400–$3,200.",
    hero: "gutter-drip",
    images: ["downspout", "gutter-rain", "house-white-classic"],
    intro:
      "When two inches of rain lands in an hour, undersized gutters overflow straight into your foundation. We form 6-inch seamless aluminum gutters on site, pitch them properly, and put oversized downspouts where the water actually goes.",
    facts: [
      { label: "Typical home", value: "$1,400 – $3,200" },
      { label: "Install time", value: "Half a day" },
      { label: "Warranty", value: "10 years on labor" },
    ],
    includes: [
      "5\" and 6\" seamless aluminum, formed on site to exact lengths",
      "3×4\" oversized downspouts for heavy North Texas rain",
      "Hidden hangers every 24\" — rated for ladders and hail",
      "Optional micro-mesh gutter guards",
      "Colors matched to your trim",
    ],
    whenYouNeedIt: [
      "Water pours over the gutters during storms",
      "Gutters are dented from hail or pulling away",
      "Soil is washing away near your foundation",
    ],
    process: [
      { title: "Measure", text: "We check roof area and pitch to size gutters and downspouts correctly." },
      { title: "Form & hang", text: "Seamless runs formed on your driveway, hung the same day." },
    ],
    faqs: [
      {
        q: "Are gutter guards worth it?",
        a: "Under live oaks and pecans, yes. Micro-mesh guards stop leaves and shingle granules; they add about $7–$12 per linear foot.",
      },
    ],
    serviceType: "Seamless gutter installation",
  },
  {
    slug: "commercial-roofing",
    title: "Commercial Roofing",
    short: "Commercial",
    tagline: "TPO, metal and roof coatings for shops, offices and churches.",
    metaDescription:
      "Commercial roofing in Fort Worth: TPO and PVC single-ply, metal retrofits, silicone roof coatings, maintenance plans and storm claims for small commercial buildings.",
    hero: "commercial-flat",
    images: ["commercial-rooftop", "crew-metal-roll", "metal-abstract"],
    intro:
      "We roof the kinds of buildings that keep Fort Worth running — retail strips, medical offices, churches, shops and warehouses under 60,000 sq ft. Single-ply TPO, metal retrofits and silicone restoration coatings, scheduled around your business hours.",
    facts: [
      { label: "Building size", value: "Up to 60,000 sq ft" },
      { label: "Systems", value: "TPO · PVC · Metal · Coatings" },
      { label: "Maintenance plans", value: "From $450 / visit" },
    ],
    includes: [
      "Core cuts and moisture surveys before we quote",
      "TPO and PVC single-ply, mechanically fastened or fully adhered",
      "Silicone restoration coatings that can add 10–15 years",
      "Metal roof retrofits and re-screws",
      "Twice-yearly maintenance plans with written reports",
    ],
    whenYouNeedIt: [
      "Ponding water or recurring leaks over tenants",
      "Hail or wind claim on a commercial policy",
      "You need a roof report for a sale or refinance",
    ],
    process: [
      { title: "Survey", text: "Moisture scan, core cuts and a written condition report." },
      { title: "Options", text: "Repair, restore or replace — with a cost-per-year comparison." },
      { title: "Scheduled install", text: "Night and weekend work available to keep you open." },
    ],
    faqs: [
      {
        q: "Can you work while we're open?",
        a: "Yes. We stage materials away from entrances, keep noisy work to agreed hours and can work nights or weekends.",
      },
    ],
    serviceType: "Commercial roofing",
  },
  {
    slug: "roof-inspections",
    title: "Roof Inspections",
    short: "Inspections",
    tagline: "A free 21-point inspection and a photo report you can actually read.",
    metaDescription:
      "Free roof inspections in Fort Worth with a same-day photo report. Real-estate, insurance and post-storm inspections. No pressure, no door-knocking.",
    hero: "roofer-clouds",
    images: ["ladder-sky", "crew-ridge", "aerial-house-grey"],
    intro:
      "Every Halden job starts on the roof, not on your doorstep. Our inspectors check 21 points — shingles, flashing, vents, decking, attic ventilation and gutters — and send you a photo report the same day. If your roof is fine, we'll say so.",
    facts: [
      { label: "Price", value: "Free" },
      { label: "Report", value: "Same day" },
      { label: "Checkpoints", value: "21" },
    ],
    includes: [
      "Walk of every slope (drones only where it isn't safe to walk)",
      "Attic check for leaks, ventilation and daylight",
      "Soft-metal check for hail: vents, gutters, AC fins",
      "Estimated remaining life, in years — not a sales pitch",
      "Photo report you can share with your insurer or buyer",
    ],
    whenYouNeedIt: [
      "After any hailstorm or 60+ mph winds",
      "Before buying or selling a home",
      "Every two years once your roof is 10+ years old",
    ],
    process: [
      { title: "Book a time", text: "Pick a slot online or call — we're there within 48 hours." },
      { title: "On the roof", text: "About 45 minutes; you don't need to be home." },
      { title: "Your report", text: "Photos, findings and honest next steps, same day." },
    ],
    faqs: [
      {
        q: "Is the inspection really free?",
        a: "Yes. No catch, no obligation. It's how we earn your trust — and most of our work comes from neighbors we inspected for years ago.",
      },
    ],
    serviceType: "Roof inspection",
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
