// Generates apple-icon.png, favicon.ico, public/brand/* and the OG background from icon.svg + photos.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const sharp = createRequire(import.meta.url)("../node_modules/sharp");

const root = new URL("../", import.meta.url);
const p = (rel) => decodeURIComponent(new URL(rel, root).pathname.slice(1));
const svg = readFileSync(p("src/app/icon.svg"));

mkdirSync(p("public/brand"), { recursive: true });
mkdirSync(p("src/assets/og"), { recursive: true });

// Apple touch icon: square, no rounding (iOS masks it), a little padding.
const appleSvg = Buffer.from(svg.toString().replace('rx="14"', 'rx="0"'));
await sharp(appleSvg, { density: 600 }).resize(180, 180).png().toFile(p("src/app/apple-icon.png"));
await sharp(svg, { density: 900 }).resize(512, 512).png().toFile(p("public/brand/icon-512.png"));
await sharp(svg, { density: 600 }).resize(192, 192).png().toFile(p("public/brand/icon-192.png"));

// favicon.ico with embedded PNGs (16, 32, 48).
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => sharp(svg, { density: 300 }).resize(s, s).png().toBuffer()));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const dir = Buffer.alloc(16 * sizes.length);
pngs.forEach((buf, i) => {
  const s = sizes[i];
  dir.writeUInt8(s, i * 16);
  dir.writeUInt8(s, i * 16 + 1);
  dir.writeUInt8(0, i * 16 + 2);
  dir.writeUInt8(0, i * 16 + 3);
  dir.writeUInt16LE(1, i * 16 + 4);
  dir.writeUInt16LE(32, i * 16 + 6);
  dir.writeUInt32LE(buf.length, i * 16 + 8);
  dir.writeUInt32LE(offset, i * 16 + 12);
  offset += buf.length;
});
writeFileSync(p("src/app/favicon.ico"), Buffer.concat([header, dir, ...pngs]));

// OG background photo (right half of the card) + a default OG image for schema.org.
await sharp(p("src/assets/photos/poster-hero-drone.jpg")).resize(640, 630, { fit: "cover" }).modulate({ brightness: 0.85 }).jpeg({ quality: 72, mozjpeg: true }).toFile(p("src/assets/og/og-photo.jpg"));
await sharp(p("src/assets/photos/house-ranch-dusk.jpg")).resize(1200, 630, { fit: "cover" }).jpeg({ quality: 78, mozjpeg: true }).toFile(p("public/brand/og-default.jpg"));
console.log("brand assets written");
