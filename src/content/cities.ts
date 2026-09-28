import type { PhotoKey } from "@/lib/photos";

export type City = {
  slug: string;
  name: string;
  county: string;
  lat: number;
  lng: number;
  image: PhotoKey;
  headline: string;
  intro: string;
  neighborhoods: string[];
  roofs: number;
  driveTime: string;
  localNotes: { title: string; text: string }[];
  zips: string[];
};

export const cities: City[] = [
  {
    slug: "fort-worth",
    name: "Fort Worth",
    county: "Tarrant County",
    lat: 32.755,
    lng: -97.331,
    image: "fw-skyline-trees",
    headline: "Fort Worth's roofers, since 1998.",
    intro:
      "Our shop is on Copperline Drive, twelve minutes from downtown. We've roofed Tudor revivals in Berkeley Place, brick ranches in Wedgwood and new builds out in Walsh — and we still answer the phone ourselves.",
    neighborhoods: ["Tanglewood", "Fairmount", "Arlington Heights", "Ridglea", "Berkeley Place", "Wedgwood", "Ryan Place", "Monticello", "Walsh", "Westover Hills"],
    roofs: 2140,
    driveTime: "Home base",
    localNotes: [
      {
        title: "Historic districts",
        text: "Fairmount and Ryan Place have design guidelines for visible roofing. We handle the Certificate of Appropriateness paperwork with the city's historic preservation office.",
      },
      {
        title: "City permits",
        text: "Fort Worth requires a permit for full re-roofs. We pull it, schedule the inspection and hand you the final sign-off.",
      },
    ],
    zips: ["76107", "76109", "76110", "76116", "76132", "76133"],
  },
  {
    slug: "arlington",
    name: "Arlington",
    county: "Tarrant County",
    lat: 32.736,
    lng: -97.108,
    image: "house-brick-ranch",
    headline: "Arlington roofs, done straight.",
    intro:
      "Arlington sits right in the path of the storms that roll off the Metroplex's western edge. We've replaced hundreds of hail-damaged roofs here, from mid-century ranches near UTA to newer two-stories in Viridian.",
    neighborhoods: ["Viridian", "Randol Mill", "Parkway Central", "Southwest Arlington", "Fielder", "Lake Arlington", "Arlington Highlands"],
    roofs: 780,
    driveTime: "25 min",
    localNotes: [
      {
        title: "Hail alley",
        text: "Many Arlington neighborhoods have been hit by significant hail more than once in the last decade. Class 4 shingles are worth it here — many insurers discount your premium for them.",
      },
      {
        title: "HOA color rules",
        text: "Several Arlington HOAs restrict shingle colors. Send us your HOA guidelines and we'll only show approved options.",
      },
    ],
    zips: ["76001", "76006", "76012", "76013", "76016", "76017"],
  },
  {
    slug: "keller",
    name: "Keller",
    county: "Tarrant County",
    lat: 32.934,
    lng: -97.229,
    image: "house-modern-farmhouse",
    headline: "Keller roofs built for big skies.",
    intro:
      "Keller homes are bigger, steeper and more complex than average — lots of valleys, dormers and standing-seam accents. That's exactly the work our crews like best.",
    neighborhoods: ["Bear Creek", "Hidden Lakes", "Marshall Ridge", "Heritage Estates", "Keller Town Center", "Estates of Oak Run"],
    roofs: 520,
    driveTime: "30 min",
    localNotes: [
      {
        title: "Steep & complex roofs",
        text: "Many Keller homes have 10/12 or steeper pitches. Our crews use full fall protection and roof jacks, and we price steep sections separately so you can see why.",
      },
      {
        title: "Metal accents",
        text: "Standing-seam porches and bay windows are common here. We fabricate them on site to match your main roof.",
      },
    ],
    zips: ["76244", "76248", "76262"],
  },
  {
    slug: "southlake",
    name: "Southlake",
    county: "Tarrant County",
    lat: 32.941,
    lng: -97.134,
    image: "house-stone-ranch",
    headline: "Premium roofs for Southlake homes.",
    intro:
      "Slate, clay tile, designer shingles and copper details — Southlake homeowners ask for materials most roofers avoid. We've installed and restored them for over twenty years.",
    neighborhoods: ["Timarron", "Carillon", "Stone Lakes", "Southlake Woods", "Estes Park", "Monticello Estates"],
    roofs: 410,
    driveTime: "30 min",
    localNotes: [
      {
        title: "Premium materials",
        text: "Natural slate, clay and synthetic slate need specialist installers. We've been setting slate since 2003 and keep a quarry-matched stock for repairs.",
      },
      {
        title: "Architectural review",
        text: "Many Southlake neighborhoods have architectural review committees. We prepare the sample boards and spec sheets they ask for.",
      },
    ],
    zips: ["76092"],
  },
  {
    slug: "benbrook",
    name: "Benbrook",
    county: "Tarrant County",
    lat: 32.673,
    lng: -97.46,
    image: "tx-ranch-porch",
    headline: "Benbrook ranch roofs & more.",
    intro:
      "From 1970s ranch homes near the lake to newer builds in Whitestone Ranch, Benbrook is fifteen minutes down I-20 from our shop — and we've been roofing here since the beginning.",
    neighborhoods: ["Whitestone Ranch", "Benbrook Lake", "Westpark", "Mary's Creek", "Timber Creek", "Dutch Branch"],
    roofs: 470,
    driveTime: "15 min",
    localNotes: [
      {
        title: "Lake-side wind",
        text: "Homes near Benbrook Lake see stronger straight-line winds. We use six-nail patterns and high-wind starter strips on every roof here.",
      },
      {
        title: "Ranch-home ventilation",
        text: "Many older ranch homes have poor attic ventilation. We balance intake and exhaust on every re-roof to cut attic heat.",
      },
    ],
    zips: ["76109", "76116", "76126", "76132"],
  },
  {
    slug: "burleson",
    name: "Burleson",
    county: "Johnson & Tarrant Counties",
    lat: 32.542,
    lng: -97.321,
    image: "house-long-drive",
    headline: "Burleson roofing, close to home.",
    intro:
      "Burleson is growing fast, and so are its roofs. We replace builder-grade shingles that didn't make it through their first big storm and install new roofs on acreage homes just outside town.",
    neighborhoods: ["Hidden Creek", "Mountain Valley", "Chisholm Summit", "Wakefield Heights", "Old Town Burleson", "Stone River"],
    roofs: 380,
    driveTime: "25 min",
    localNotes: [
      {
        title: "Builder-grade upgrades",
        text: "Many newer Burleson homes were built with thin, entry-level shingles. We'll show you what a Class 4 upgrade costs versus a like-for-like replacement.",
      },
      {
        title: "Acreage homes",
        text: "Metal roofs on shops, barns and main houses — we can quote all of them in one visit.",
      },
    ],
    zips: ["76028", "76058"],
  },
];

export const cityBySlug = (slug: string) => cities.find((c) => c.slug === slug);
