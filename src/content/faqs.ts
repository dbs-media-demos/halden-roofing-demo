export type Faq = { q: string; a: string };
export type FaqGroup = { id: string; title: string; items: Faq[] };

export const faqGroups: FaqGroup[] = [
  {
    id: "insurance",
    title: "Insurance & storm claims",
    items: [
      {
        q: "Do you help with insurance claims?",
        a: "Yes. We inspect for free, send a timestamped photo report you can forward to your insurer, help you file, meet your adjuster on the roof and file supplements for code items the first scope missed. You stay in control of the claim; we make sure nothing's overlooked.",
      },
      {
        q: "Can you waive or cover my deductible?",
        a: "No. Since 2019 it's been illegal in Texas for a roofer to waive, rebate or 'absorb' a homeowner's insurance deductible. Anyone offering to is either breaking the law or planning to cut corners on your roof.",
      },
      {
        q: "What if my claim was denied?",
        a: "It's often worth a second look. We've helped homeowners get claims reopened with better documentation, weather data for the storm date and a re-inspection request. We'll tell you honestly if we don't think there's a case.",
      },
      {
        q: "How soon should I get inspected after a storm?",
        a: "Within a few weeks is ideal. Most policies give you one to two years to file, but damage is easiest to prove when the storm date is fresh — and small leaks get worse fast.",
      },
    ],
  },
  {
    id: "timelines",
    title: "Timelines & the install",
    items: [
      {
        q: "How long does a new roof take?",
        a: "One day for most single-story homes, two for larger or steeper roofs. Metal takes three to five days; clay tile and slate one to three weeks.",
      },
      {
        q: "How far out are you booking?",
        a: "Inspections: within 48 hours, year-round. Installs: usually one to three weeks after you sign, a little longer right after a major hailstorm.",
      },
      {
        q: "What happens if it rains on install day?",
        a: "We watch the radar hourly and never tear off more than we can dry-in the same day. If weather turns, the roof is covered in underlayment and tarps before we leave.",
      },
      {
        q: "Do you clean up?",
        a: "Twice. Tarps protect your beds, a dump trailer sits on the driveway, and we run magnetic sweepers across the lawn, driveway and street at the end of every day and again at final walkthrough.",
      },
    ],
  },
  {
    id: "warranty",
    title: "Warranties",
    items: [
      {
        q: "What warranty do I get?",
        a: "Every roof gets our 10-year workmanship warranty plus the manufacturer's material warranty. Our Storm Plus and Ironclad 25 tiers extend workmanship coverage to 15 and 25 years, with a non-prorated system warranty on Ironclad.",
      },
      {
        q: "What's the difference between a material and a workmanship warranty?",
        a: "The material warranty covers defects in the shingles or panels. The workmanship warranty covers how they were installed — which is where almost all roof failures actually come from. Ours is in writing and registered to your address.",
      },
      {
        q: "Is the warranty transferable if I sell?",
        a: "Yes — Storm Plus and Ironclad 25 transfer once to the next owner at no charge, which is a real selling point on a listing.",
      },
    ],
  },
  {
    id: "cost",
    title: "Cost & financing",
    items: [
      {
        q: "How much does a new roof cost in Fort Worth?",
        a: "Most asphalt-shingle replacements on a typical 2,000–2,500 sq ft home land between $9,500 and $18,000. Metal runs about $22,000–$45,000. Roof size, pitch, layers to remove and material all move the number — your written estimate spells it out line by line.",
      },
      {
        q: "Do you offer financing?",
        a: "Yes, from about $89 a month with approved credit, including 12-month same-as-cash options. Checking your rate is a soft credit pull and won't affect your score.",
      },
      {
        q: "Do you ask for a deposit?",
        a: "No money down for insurance jobs. On retail jobs we invoice for materials only once they're delivered to your house, and the balance when you've signed off the walkthrough.",
      },
    ],
  },
];

export const allFaqs = faqGroups.flatMap((g) => g.items);
export const homeFaqs = [faqGroups[0].items[1], faqGroups[1].items[0], faqGroups[2].items[0], faqGroups[3].items[0], faqGroups[3].items[1]];
