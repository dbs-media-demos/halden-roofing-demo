import type { PhotoKey } from "@/lib/photos";

export const stormSteps = [
  {
    title: "Free inspection",
    time: "Within 48 hours",
    text: "A certified inspector walks every slope, checks your attic and the soft metals hail leaves its mark on. Drones only where it isn't safe to walk.",
  },
  {
    title: "Photo report",
    time: "Same day",
    text: "Dozens of timestamped photos with every hit circled, in your inbox that evening — ready to forward to your insurer.",
  },
  {
    title: "Insurance claim help",
    time: "Day 2–3",
    text: "We help you file and explain the scope line by line. We never ask for, waive or 'cover' your deductible — that's illegal in Texas.",
  },
  {
    title: "Adjuster meeting",
    time: "Week 1–2",
    text: "We meet your adjuster on the roof, walk the test squares together and file supplements for anything the first scope missed.",
  },
  {
    title: "Install in 1–2 days",
    time: "Once approved",
    text: "Crew arrives at 7 am. Tarps protect your beds, old roof comes off, new roof system goes on — dried-in the same day, every day.",
  },
  {
    title: "Magnetic nail sweep",
    time: "Every evening",
    text: "Rolling magnets sweep the lawn, driveway, beds and street — twice. We'd rather find the nails than have your tires find them.",
  },
  {
    title: "Warranty",
    time: "In writing",
    text: "Up to 25 years of workmanship coverage, registered to your address, transferable if you sell. We're 12 minutes away when you need us.",
  },
] as const;

export const stormChaserFlags = [
  { flag: "Knocks on your door the day after a storm", halden: "We don't door-knock. You call us — or a neighbor does." },
  { flag: "Offers to 'cover' or waive your deductible", halden: "That's illegal in Texas. We never do it." },
  { flag: "Out-of-state plates, no local address", halden: "4410 Copperline Dr, Fort Worth. Since 1998." },
  { flag: "Wants a signature before an inspection", halden: "Inspection and photo report first. Always free." },
  { flag: "Asks for a big deposit up front", halden: "No money down. Materials invoiced on delivery." },
  { flag: "Pressures you to decide today", halden: "Our written estimate is good for 60 days." },
] as const;

export const warrantyTiers = [
  {
    id: "standard",
    name: "Standard",
    note: "Included on every roof",
    workmanship: "10 years",
    features: [
      "10-year workmanship warranty",
      "Manufacturer limited lifetime material warranty",
      "Architectural shingles, synthetic underlayment",
      "Magnetic nail sweep & full haul-off",
    ],
    featured: false,
  },
  {
    id: "storm-plus",
    name: "Storm Plus",
    note: "Most popular",
    workmanship: "15 years",
    features: [
      "15-year workmanship warranty",
      "Class 4 impact-rated shingles (ask your insurer about a discount)",
      "Ice-and-water shield in valleys and at every penetration",
      "Transferable once if you sell",
      "Free post-storm re-inspection for 5 years",
    ],
    featured: true,
  },
  {
    id: "ironclad",
    name: "Ironclad 25",
    note: "Our best",
    workmanship: "25 years",
    features: [
      "25-year workmanship warranty",
      "Non-prorated 50-year system warranty",
      "Class 4 shingles or standing-seam metal",
      "Upgraded ridge ventilation & high-wind starter",
      "Annual roof check-up for 5 years",
      "Transferable once if you sell",
    ],
    featured: false,
  },
] as const;

export const team: { name: string; role: string; bio: string; photo: PhotoKey }[] = [
  {
    name: "Ray Halden",
    role: "Founder",
    bio: "Started Halden Roofing out of a pickup in 1998 after twelve years on crews across Tarrant County. Still visits most job sites.",
    photo: "team-founder",
  },
  {
    name: "Cody Halden",
    role: "Owner & General Manager",
    bio: "Grew up tearing off shingles on summer breaks. Took over day-to-day in 2016 and built our inspection and photo-report process.",
    photo: "roofer-portrait",
  },
  {
    name: "Luis Ortega",
    role: "Crew Foreman",
    bio: "Twenty-two years with the company. Runs our lead install crew and still does every final walkthrough himself.",
    photo: "team-foreman",
  },
  {
    name: "Marcus Bell",
    role: "Lead Storm Inspector",
    bio: "Has walked more than 6,000 roofs and met hundreds of adjusters. Known for photo reports insurers actually read.",
    photo: "roofer-hardhat",
  },
];

export const badges = [
  { title: "Family-owned", sub: "Since 1998" },
  { title: "Manufacturer-certified", sub: "Installer" },
  { title: "Class 4 impact", sub: "Specialist" },
  { title: "Fully insured", sub: "$2M liability" },
  { title: "25-year", sub: "Workmanship warranty" },
] as const;

export const stats = [
  { value: 4800, suffix: "+", label: "Roofs in Tarrant County" },
  { value: 27, suffix: "", label: "Years, same family" },
  { value: 2, suffix: " hr", label: "Callback, guaranteed" },
  { value: 4.9, suffix: "★", label: "612 Google reviews", decimals: 1 },
] as const;
