# Halden Roofing Co. (Scale by Noon demo)

- Niche: roofing         (matches www.scalebynoon.com industry id: roofing)
- Market / city: US – Fort Worth, TX (Tarrant County: Fort Worth, Arlington, Keller, Southlake, Benbrook, Burleson)
- Languages: en
- Live URL: https://halden-roofing-demo.vercel.app
- Repo: https://github.com/dbs-media-demos/halden-roofing-demo (public, branch main)
- Folder: DBS Media Portfolio/Demo Websites/roofing
- Stack: Next.js 16.3.6, React 19.2.8, Tailwind v4, GSAP 3.15 (ScrollTrigger, SplitText), Lenis, three.js 0.187 (desktop only)
- Palette: #0E1620 slate ink · #1C2A38 slate · #F2EEE7 limestone · #C4713C copper · #9A4E22 copper (text on light) · #A9C3D6 sky · #56687A storm
- Fonts: Archivo Expanded (wdth 125, 700–900, inlined), Manrope, IBM Plex Mono
- Pages: 30 routes + 404, all static. Home, Services + 7 service pages, Projects + 5 case studies, Service areas + 6 city pages, Financing, About, Reviews, FAQ, Free inspection, Contact, Privacy
- Signature features:
  - Roofline hero (3D, desktop): the Halden house in a real-time hailstorm at dusk, seen through a house-shaped window (true 6/12 pitch) that opens to full-bleed on scroll while the headline splits apart. Hail bounces off wet architectural shingles and gathers on the lawn, lightning lights the clouds and the headline, the pointer leans the camera and the scroll cranes it up onto the roof
  - "Storm damage? Here's exactly what happens" (3D, desktop): the same house beside seven steps; each step changes weather, camera and props: hail on the old roof, hits circled on the shingles with the inspector's camera flash, the chalked 10×10 test square, tear-off and the new roof course by course, nails on the drive and the magnet sweeper, golden hour and the warranty seal
  - "The Halden way": a long Texas hip roof over the stats installs itself on scroll (chalk lines snap, shingles drop course by course in a stair-step, ridge capped, copper drip edge), then sunlight glints across it and the pointer lifts shingles like wind (canvas)
  - "Everything overhead": an inspection laser scans down the service list with the scroll, the band it passes glows thermal copper, each service is ticked off and the last one stamps "Roof check complete"
  - One small roofing touch per section: case-study rail roof meter (each roof shingled + ridge-capped as its card arrives), red chalk lines snapping under the storm-chaser red flags, featured warranty tier is a house whose roof snaps on and sheds rain, review section's street gets new roofs house by house, FAQ gutter + downspout fill with water on scroll and drip, copper flashing runs down the CTA roofline with a glint, and in previews an inspection drone crosses the map
  - Material explorer (3D, desktop): an architect's model on a lawn plinth in studio light; asphalt, standing-seam metal, clay barrel tile and slate are really built piece by piece, a new choice tears the old roof off and lays the new one course by course, swatches recolour it, drag to turn the house, specs count to new values
  - 3D is one three.js scene built from primitives (no model files, ~158 KB gz, desktop only via lib/three-gate). Phones get stills rendered from it (zero bytes of three.js): the storm turning to golden hour in the story, and 16 material/colour stills in the explorer that wipe in eave to ridge
  - Draggable, keyboard-accessible before/after sliders with a roof-shaped handle on every case study
  - Hail-season banner + 3-step free-inspection form with photo upload preview, validation and a "We'll call within 2 hours" success state
  - Also: stylised Tarrant County map with an animated hail path, scroll-driven horizontal project rail with shared-element morph into case studies, gable-shaped page transitions, cursor-following service previews, payment calculator, magnetic buttons, roof-chevron cursor, live "Open now" badge
- Lighthouse (mobile, home): P 88–90 / A 100 / BP 100 / SEO 100 with indexing on (69 in the noindexed demo — "is-crawlable" only)
  - Mobile inner pages: P 90–93 / 100 / 100. Desktop: P 98–100 / 100 / 100. CLS 0.
  - Local production build, measured 2026-09-28. Observed LCP ≈ 0.3–0.5 s.

- 3D pass (2026-11-09), production build: phones load 192 KB gz of JS and zero bytes of three.js (stills instead; three.js only loads on a desktop with a mouse after load, ~158 KB gz). Phone at 375 px, 4x CPU, slow 4G: LCP 2.0 s, TBT 110–150 ms, CLS 0. Lighthouse mobile 90 (simulated LCP 3.7 s, same as before the pass), desktop 99. `next.config.ts` keeps the inlined display font and the site CSS as two parallel stylesheets (cssChunking graph, requestCost 0).
- Phone pass (2026-11-07): see README "Phones". Section order on phones: hero, proof, project photos, reviews, how the estimate works, form, FAQ, then services, storm chaser, materials, warranty, map, CTA.

## Portfolio copy
EN title: Halden Roofing Co. — roofing contractor, Fort Worth
EN one-liner (≤ 120 chars): A storm-proof roofing site: a drone film through a roof-shaped window, a scroll-told hail story and live re-roofing.
EN summary (2–3 sentences): A concept site for a family-owned Fort Worth roofer, built to turn nervous post-hail homeowners into free-inspection requests. Visitors watch an illustrated house go from hailstorm to warranty as they scroll, re-roof it in four materials, drag before/after sliders and learn how to spot a storm chaser — all backed by 30 SEO-ready pages for every service and city.
SR title: Halden Roofing Co. — krovopokrivač, Fort Worth
SR one-liner: Sajt za krovopokrivača: dron snimak kroz prozor u obliku krova, priča o gradu kroz skrol i promena krova uživo.
SR summary: Koncept sajt za porodičnu firmu za krovove iz Fort Wortha, napravljen da uplašene vlasnike kuća posle grada pretvori u zahteve za besplatan pregled. Posetioci skrolom prate ilustrovanu kuću od oluje do garancije, menjaju joj krov u četiri materijala, porede pre i posle i uče kako da prepoznaju prevarante — uz 30 SEO stranica za svaku uslugu i grad.

## Screenshots
handoff/desktop-home.png, handoff/desktop-feature.png, handoff/mobile-home.png, handoff/scroll.mp4
