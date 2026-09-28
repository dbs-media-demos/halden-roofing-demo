export type MaterialId = "shingle" | "metal" | "tile" | "slate";

export type Material = {
  id: MaterialId;
  name: string;
  short: string;
  blurb: string;
  lifespan: [number, number];
  wind: number;
  hail: string;
  cost: 1 | 2 | 3 | 4;
  priceNote: string;
  swatches: { name: string; hex: string }[];
};

export const materials: Material[] = [
  {
    id: "shingle",
    name: "Architectural shingle",
    short: "Asphalt",
    blurb: "The Texas standard. Dimensional shingles with Class 4 impact-rated options that can lower your insurance premium.",
    lifespan: [25, 30],
    wind: 130,
    hail: "Class 3–4",
    cost: 2,
    priceNote: "$9.5k – $18k typical home",
    swatches: [
      { name: "Charcoal", hex: "#3b4046" },
      { name: "Weathered Wood", hex: "#6f655a" },
      { name: "Driftwood", hex: "#8b8378" },
      { name: "Onyx", hex: "#202428" },
    ],
  },
  {
    id: "metal",
    name: "Standing-seam metal",
    short: "Metal",
    blurb: "Concealed fasteners, reflective finishes and a Class 4 hail rating. The last roof most homeowners buy.",
    lifespan: [40, 70],
    wind: 140,
    hail: "Class 4",
    cost: 3,
    priceNote: "$22k – $45k typical home",
    swatches: [
      { name: "Matte Black", hex: "#25282c" },
      { name: "Galvalume", hex: "#a6acb1" },
      { name: "Dark Bronze", hex: "#4b3c31" },
      { name: "Colonial Red", hex: "#7c3027" },
    ],
  },
  {
    id: "tile",
    name: "Clay barrel tile",
    short: "Tile",
    blurb: "Hand-set two-piece clay. Cool under the Texas sun and good for most of a century.",
    lifespan: [50, 100],
    wind: 125,
    hail: "Class 3",
    cost: 3,
    priceNote: "$35k – $60k typical home",
    swatches: [
      { name: "Terracotta", hex: "#b4582f" },
      { name: "Adobe Blend", hex: "#a8704a" },
      { name: "Mission Red", hex: "#8c3b27" },
      { name: "Sandstone", hex: "#c7a37c" },
    ],
  },
  {
    id: "slate",
    name: "Natural slate",
    short: "Slate",
    blurb: "Quarried stone, laid by hand. Heavy, quiet, fireproof and nearly permanent.",
    lifespan: [75, 125],
    wind: 120,
    hail: "Class 4",
    cost: 4,
    priceNote: "$50k+ typical home",
    swatches: [
      { name: "Vermont Black", hex: "#2c3036" },
      { name: "Grey Green", hex: "#56625b" },
      { name: "Unfading Purple", hex: "#4d4352" },
      { name: "Mottled Grey", hex: "#646b74" },
    ],
  },
];
