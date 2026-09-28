// Contact sheet builder: node sheet.mjs <list> <out.jpg> <urlPrefix> [cols]
import { createRequire } from "node:module";
const sharp = createRequire(import.meta.url)("../node_modules/sharp");
import { readFileSync, writeFileSync } from "node:fs";

const [, , list, out, prefix, colsArg] = process.argv;
const cols = Number(colsArg ?? 6);
const W = 320, H = 180;
const rows = readFileSync(list, "utf8").trim().split(/\r?\n/).map((l) => l.split("|"));

const tiles = await Promise.all(
  rows.map(async ([label, path]) => {
    try {
      const url = path.startsWith("http") || path.startsWith("file:") ? path : prefix + path;
      let buf;
      if (url.startsWith("file:")) buf = readFileSync(url.slice(5));
      else buf = Buffer.from(await (await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })).arrayBuffer());
      const img = await sharp(buf).resize(W, H, { fit: "cover" }).toBuffer();
      const tag = Buffer.from(
        `<svg width="${W}" height="${H}"><rect width="${label.length * 11 + 10}" height="24" fill="black" opacity=".75"/><text x="5" y="18" font-family="monospace" font-size="18" fill="yellow">${label}</text></svg>`,
      );
      return sharp(img).composite([{ input: tag }]).toBuffer();
    } catch (e) {
      return sharp({ create: { width: W, height: H, channels: 3, background: "#400" } }).jpeg().toBuffer();
    }
  }),
);

const nRows = Math.ceil(tiles.length / cols);
const canvas = sharp({ create: { width: cols * W, height: nRows * H, channels: 3, background: "#111" } });
const composites = tiles.map((input, i) => ({ input, left: (i % cols) * W, top: Math.floor(i / cols) * H }));
writeFileSync(out, await canvas.composite(composites).jpeg({ quality: 80 }).toBuffer());
console.log("wrote", out, tiles.length);
