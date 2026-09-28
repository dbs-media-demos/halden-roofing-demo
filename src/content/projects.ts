import type { PhotoKey } from "@/lib/photos";

export type Project = {
  slug: string;
  title: string;
  city: string;
  neighborhood: string;
  year: number;
  material: string;
  service: string;
  summary: string;
  hero: PhotoKey;
  before: PhotoKey;
  after: PhotoKey;
  gallery: PhotoKey[];
  stats: { label: string; value: string }[];
  challenge: string;
  solution: string;
  result: string;
  quote: { text: string; author: string };
};

export const projects: Project[] = [
  {
    slug: "tanglewood-hail-rebuild",
    title: "Tanglewood hail rebuild",
    city: "Fort Worth",
    neighborhood: "Tanglewood",
    year: 2025,
    material: "Class 4 architectural shingle · Weathered Wood",
    service: "storm-hail-damage",
    summary: "Golf-ball hail, a first scope that missed half the damage, and a full replacement approved after we met the adjuster.",
    hero: "house-brick-suburb",
    before: "before-shingle-edge",
    after: "shingle-rows",
    gallery: ["crew-shingles-2", "hail-hand", "aerial-house-grey"],
    stats: [
      { label: "Roof size", value: "38 squares" },
      { label: "Install", value: "2 days" },
      { label: "Claim", value: "Approved in full" },
    ],
    challenge:
      "A spring hailstorm left bruised shingles, dented vents and cracked skylight flashing on this two-story brick home. The first insurance scope covered only the south and west slopes.",
    solution:
      "Our inspector documented 140+ hits across all four slopes with a timestamped photo report. We met the adjuster on the roof, walked every test square together, and filed a supplement for drip edge and starter course required by code.",
    result:
      "Full replacement approved. We installed Class 4 impact-rated shingles — which cut the homeowners' premium — in two days, with a 25-year workmanship warranty.",
    quote: {
      text: "Two other companies knocked on our door. Halden was the only one who got on the roof before talking money.",
      author: "Megan & Tom R., Tanglewood",
    },
  },
  {
    slug: "keller-standing-seam",
    title: "Keller standing-seam retrofit",
    city: "Keller",
    neighborhood: "Bear Creek",
    year: 2025,
    material: "24-ga standing seam · Matte Black",
    service: "metal-roofing",
    summary: "A worn three-tab roof swapped for matte-black standing seam — and a 21% drop in summer cooling bills.",
    hero: "ranch-metal-roof",
    before: "before-old-shingles",
    after: "metal-seams",
    gallery: ["metal-peak", "metal-dormers", "crew-metal-roll"],
    stats: [
      { label: "Panels", value: "112 × 24-ga" },
      { label: "Install", value: "4 days" },
      { label: "Cooling bill", value: "−21%" },
    ],
    challenge:
      "The homeowners had replaced this roof twice in 14 years after hail. They wanted something that would outlast their time in the house and look sharp on a brick ranch.",
    solution:
      "We roll-formed 24-gauge standing-seam panels on site in a low-gloss matte black, over high-temp underlayment with concealed clips to handle Texas heat expansion.",
    result:
      "A Class 4 roof rated for 140 mph winds, a 40-year finish warranty, and an insurance premium discount for impact resistance.",
    quote: {
      text: "It looks like a new house. And the upstairs is finally cool in August.",
      author: "Priya S., Keller",
    },
  },
  {
    slug: "southlake-slate-restoration",
    title: "Southlake slate restoration",
    city: "Southlake",
    neighborhood: "Timarron",
    year: 2024,
    material: "Natural slate · Grey Green blend",
    service: "roof-replacement",
    summary: "A slow leak had rotted the decking under a slate roof. We rebuilt the deck and re-laid the slate, piece by piece.",
    hero: "house-stone-ranch",
    before: "before-roof-hole",
    after: "slate-grey",
    gallery: ["slate-fishscale", "slate-dark", "crew-steep-roof"],
    stats: [
      { label: "Slate reused", value: "72%" },
      { label: "Project", value: "3 weeks" },
      { label: "Life added", value: "75+ years" },
    ],
    challenge:
      "A failed valley flashing had leaked for years, rotting about 400 sq ft of decking under the slate. Two contractors quoted a full tear-off to synthetic.",
    solution:
      "We hand-removed and numbered the good slate, rebuilt the decking, installed copper valleys and re-laid the original slate — topping up with a matched quarry blend.",
    result:
      "The home kept its original character, the leak is gone, and the homeowners saved roughly $38,000 against full replacement.",
    quote: {
      text: "They treated our roof like a restoration, not a demolition. Every piece was labeled.",
      author: "Harold W., Southlake",
    },
  },
  {
    slug: "arlington-storm-claim",
    title: "Arlington wind claim, reopened",
    city: "Arlington",
    neighborhood: "Randol Mill",
    year: 2025,
    material: "Architectural shingle · Charcoal",
    service: "storm-hail-damage",
    summary: "The first claim was denied. Our photo report got it reopened — and a full roof approved.",
    hero: "house-brick-ranch",
    before: "before-moss-shingles",
    after: "shingle-grey",
    gallery: ["poster-tear-off", "crew-ridge", "storm-shelf"],
    stats: [
      { label: "Initial claim", value: "Denied" },
      { label: "After re-inspection", value: "Approved" },
      { label: "Homeowner paid", value: "Deductible" },
    ],
    challenge:
      "After a 70 mph wind event, the homeowner's claim was denied as 'wear and tear'. Shingles were creased and unsealed across the north slope.",
    solution:
      "We lift-tested and photographed every creased shingle, documented the storm date with local weather data, and requested a re-inspection with a different adjuster.",
    result:
      "The claim was reopened and a full replacement approved. We installed a new roof in a single day.",
    quote: {
      text: "I'd given up on the claim. Marcus explained exactly what to ask for, and he was right.",
      author: "Denise K., Arlington",
    },
  },
  {
    slug: "benbrook-tile-reroof",
    title: "Benbrook clay tile re-roof",
    city: "Benbrook",
    neighborhood: "Whitestone Ranch",
    year: 2024,
    material: "Two-piece clay barrel tile · Terracotta",
    service: "roof-replacement",
    summary: "Forty-year-old concrete tile replaced with true clay barrel tile — lighter, brighter and built for another century.",
    hero: "tile-barrel",
    before: "before-worn-roof",
    after: "tile-terracotta",
    gallery: ["tile-dark", "tile-dormers", "crew-steep-roof"],
    stats: [
      { label: "Tiles set", value: "9,400" },
      { label: "Project", value: "9 days" },
      { label: "Lifespan", value: "75–100 yrs" },
    ],
    challenge:
      "Cracked concrete tile, lichen and failed underlayment on a Mediterranean-style home. The owners wanted to keep the look, not switch to shingles.",
    solution:
      "We stripped to the deck, installed a double layer of high-temp underlayment and battens, then hand-set two-piece clay barrel tile with storm clips on every tile.",
    result:
      "A roof that will likely outlast the house, with a 25-year workmanship warranty and a clean terracotta color that finally matches the stucco.",
    quote: {
      text: "Nine days of work and they swept up every single day. The roof is gorgeous.",
      author: "Luis & Ana M., Benbrook",
    },
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
