/**
 * Renders the phone + fallback stills in public/images/3d from the live three.js scene
 * (src/components/fx/roof3d), so phones see exactly what desktops see, without the 3D.
 * Re-run after changing the scene, a camera or the roof materials.
 *
 *   npm i --no-save esbuild playwright   # tools only, not site dependencies
 *   node _src/stills/render.mjs [filter]  # e.g. "roofs", "story", "hero"
 *
 * Uses the installed Google Chrome (real GPU) via Playwright's "chrome" channel.
 */
import { build } from "esbuild";
import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const here = path.dirname(url.fileURLToPath(import.meta.url));
const OUT = path.join(here, "../../public/images/3d");
const tmp = fs.mkdtempSync(path.join(fs.realpathSync(process.env.TEMP || "/tmp"), "roof3d-"));

const swatches = {
  shingle: ["3b4046", "6f655a", "8b8378", "202428"],
  metal: ["25282c", "a6acb1", "4b3c31", "7c3027"],
  tile: ["b4582f", "a8704a", "8c3b27", "c7a37c"],
  slate: ["2c3036", "56625b", "4d4352", "646b74"],
};
const jobs = [
  { name: "hero-storm", q: "mode=hero", w: 2560, h: 1440, warm: 6, sizes: [2560, 1920, 1280], avif: 48, webp: 70 },
  ...[0, 1, 4, 6].map((s) => ({ name: `story/s${s}`, q: `mode=story&step=${s}`, w: 1100, h: 1100, warm: 5, avif: 50, webp: 72 })),
  ...[0, 6].map((s) => ({ name: `story/s${s}-phone`, q: `mode=story&step=${s}`, w: 1000, h: 500, zoom: 1.55, warm: 5, avif: 52, webp: 74 })),
  ...Object.entries(swatches).flatMap(([k, hs]) =>
    hs.map((h, i) => ({ name: `roofs/${k}-${i}`, q: `mode=explorer&kind=${k}&hex=${h}`, w: 1100, h: 756, warm: 0, avif: 52, webp: 76, alpha: true })),
  ),
];

await build({ entryPoints: [path.join(here, "entry.mjs")], bundle: true, format: "iife", outfile: path.join(tmp, "scene.js"), logLevel: "warning" });
fs.writeFileSync(path.join(tmp, "index.html"), '<!doctype html><body style="margin:0"><canvas></canvas><script src="scene.js"></script></body>');

const filter = process.argv[2];
const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
try {
  for (const j of jobs) {
    if (filter && !j.name.includes(filter)) continue;
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    await page.goto(url.pathToFileURL(path.join(tmp, "index.html")).href + "?" + j.q);
    await page.waitForFunction(() => window.__ready, null, { timeout: 60000 });
    const data = await page.evaluate(
      ([w, h, warm, zoom]) => {
        window.__scene.warm(warm);
        return window.__scene.snapshot(w, h, zoom);
      },
      [j.w, j.h, j.warm, j.zoom || 1],
    );
    await page.close();
    const png = Buffer.from(data.split(",")[1], "base64");
    fs.mkdirSync(path.dirname(path.join(OUT, j.name)), { recursive: true });
    for (const w of j.sizes || [j.w]) {
      const file = path.join(OUT, j.name + (j.sizes ? `-${w}` : ""));
      const img = j.alpha ? sharp(png).resize({ width: w }) : sharp(png).resize({ width: w }).flatten({ background: "#0e1620" });
      await img.clone().avif({ quality: j.avif, effort: 6 }).toFile(file + ".avif");
      await img.clone().webp({ quality: j.webp, effort: 6, alphaQuality: 80 }).toFile(file + ".webp");
      console.log(path.relative(OUT, file), `${(fs.statSync(file + ".avif").size / 1024).toFixed(1)} KB avif`);
    }
  }
} finally {
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
