export type Review = {
  author: string;
  city: string;
  rating: 5 | 4;
  date: string; // ISO
  ago: string;
  job: string;
  text: string;
};

/** Fictional reviews for the concept site. */
export const reviews: Review[] = [
  {
    author: "Megan R.",
    city: "Fort Worth · Tanglewood",
    rating: 5,
    date: "2026-05-14",
    ago: "4 months ago",
    job: "Hail replacement",
    text: "After the April hail, three companies knocked on our door. Halden was the only one who got on the roof before talking money. Marcus met our adjuster, got the whole roof approved and the crew was done in two days.",
  },
  {
    author: "Priya S.",
    city: "Keller",
    rating: 5,
    date: "2026-03-02",
    ago: "6 months ago",
    job: "Standing-seam metal",
    text: "Our matte black metal roof looks incredible. They formed the panels right in the driveway. Upstairs is noticeably cooler and the insurance discount paid for itself.",
  },
  {
    author: "James T.",
    city: "Benbrook",
    rating: 5,
    date: "2026-08-19",
    ago: "5 weeks ago",
    job: "Leak repair",
    text: "Called at 8am with water coming through the kitchen ceiling. They had a tarp on by noon and fixed the flashing two days later for less than I expected. Honest people.",
  },
  {
    author: "Denise K.",
    city: "Arlington",
    rating: 5,
    date: "2025-11-08",
    ago: "10 months ago",
    job: "Insurance claim",
    text: "My claim was denied as wear and tear. Halden's photo report got it reopened and approved. I only paid my deductible, and they explained every line of the scope.",
  },
  {
    author: "Harold W.",
    city: "Southlake",
    rating: 5,
    date: "2025-09-21",
    ago: "1 year ago",
    job: "Slate restoration",
    text: "Everyone else wanted to tear off our slate. Cody's team numbered every piece, rebuilt the rotten decking and put it back. Saved us a fortune and the house kept its character.",
  },
  {
    author: "Ashley P.",
    city: "Burleson",
    rating: 5,
    date: "2026-07-03",
    ago: "3 months ago",
    job: "Roof replacement",
    text: "Our builder-grade roof didn't survive its first big storm. Halden upgraded us to Class 4 shingles, and the magnet sweep found nails in the flower beds I'd never have spotted.",
  },
  {
    author: "Robert G.",
    city: "Fort Worth · Fairmount",
    rating: 5,
    date: "2026-01-16",
    ago: "8 months ago",
    job: "Historic re-roof",
    text: "They handled the historic district paperwork for us, which I was dreading. Beautiful work on a 1915 bungalow, and the crew was respectful of the neighbors.",
  },
  {
    author: "Luis M.",
    city: "Benbrook",
    rating: 5,
    date: "2025-06-30",
    ago: "1 year ago",
    job: "Clay tile",
    text: "Nine days of tile work and they cleaned up every single day. The terracotta tile finally matches our stucco. Ray himself came by to check the job.",
  },
  {
    author: "Kim N.",
    city: "Arlington",
    rating: 4,
    date: "2026-04-11",
    ago: "5 months ago",
    job: "Gutters",
    text: "Great seamless gutters and they sized the downspouts for our huge back roof. Install got pushed a day for rain, but they kept me posted the whole time.",
  },
  {
    author: "Tyler B.",
    city: "Keller",
    rating: 5,
    date: "2026-06-05",
    ago: "4 months ago",
    job: "Inspection",
    text: "Booked the free inspection expecting a sales pitch. Instead they told me my roof had 6–8 good years left and fixed two pipe boots. Guess who I'm calling when it's time.",
  },
  {
    author: "Grace O.",
    city: "Fort Worth · Ridglea",
    rating: 5,
    date: "2026-02-22",
    ago: "7 months ago",
    job: "Roof replacement",
    text: "The photo report was so clear I forwarded it straight to my insurance company. Crew showed up at 7, finished by 5, and the yard looked cleaner than before.",
  },
  {
    author: "Daniel F.",
    city: "Southlake",
    rating: 5,
    date: "2025-12-02",
    ago: "10 months ago",
    job: "Commercial",
    text: "They coated the flat roof over our dental office on two weekends so we never closed. Clear pricing and a maintenance plan that actually happens.",
  },
];
