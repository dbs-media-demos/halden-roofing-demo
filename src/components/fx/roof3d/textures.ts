import * as THREE from "three";
import { rng } from "./geometry";

/*
 * Every texture is painted on a canvas at start-up: no image requests, a few milliseconds of work,
 * and the colours stay in this file's palette.
 */

function canvas(w: number, h = w) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function tex(c: HTMLCanvasElement, repeat: [number, number] = [1, 1], color = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Speckle used as the granule surface of shingles, slate and clay (white-ish, tinted per instance). */
export function grainTexture() {
  const [c, g] = canvas(256);
  const r = rng(7);
  g.fillStyle = "#d8d8d8";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 9000; i++) {
    const v = 150 + r() * 105;
    g.fillStyle = `rgb(${v},${v},${v})`;
    const s = r() < 0.85 ? 1 : 2;
    g.fillRect(r() * 256, r() * 256, s, s);
  }
  return tex(c, [1, 1]);
}

/**
 * Cream Texas limestone ("Austin stone") laid in irregular courses: mixed heights, long and short
 * stones, a few tan and rust ones, thin mortar. Comes with a bump map. One tile covers 2.4 m.
 */
export function stoneTexture() {
  const W = 1024;
  const px = W / 2.4; // pixels per metre
  const [c, g] = canvas(W);
  const [b, bg] = canvas(W);
  const r = rng(11);
  g.fillStyle = "#a99c88"; // mortar
  g.fillRect(0, 0, W, W);
  bg.fillStyle = "#202020";
  bg.fillRect(0, 0, W, W);
  const heights = [0.1, 0.14, 0.14, 0.2, 0.2, 0.26];
  let y = 0;
  while (y < W) {
    const rh = Math.min(W - y, heights[Math.floor(r() * heights.length)] * px);
    let x = -r() * 0.5 * px;
    while (x < W) {
      const w = (0.24 + r() * 0.5) * px;
      const tone = r();
      const l = tone < 0.1 ? 62 + r() * 8 : 70 + r() * 12;
      const hue = tone < 0.1 ? 28 + r() * 6 : 34 + r() * 10;
      const sat = tone < 0.1 ? 20 + r() * 10 : 12 + r() * 12;
      const draw = (xx: number) => {
        g.fillStyle = `hsl(${hue} ${sat}% ${l}%)`;
        g.fillRect(xx + 2.5, y + 2.5, w - 5, rh - 5);
        // chiselled edges and weathering
        g.fillStyle = "rgba(60,45,30,0.10)";
        g.fillRect(xx + 2.5, y + rh - 7, w - 5, 4.5);
        g.fillStyle = "rgba(255,250,240,0.08)";
        g.fillRect(xx + 2.5, y + 2.5, w - 5, 3);
        for (let k = 0; k < (w * rh) / 140; k++) {
          g.fillStyle = r() < 0.5 ? `rgba(90,70,50,${r() * 0.14})` : `rgba(255,248,235,${r() * 0.12})`;
          g.fillRect(xx + 3 + r() * (w - 8), y + 3 + r() * (rh - 8), 1 + r() * 3, 1 + r() * 2);
        }
        const v = 150 + r() * 60;
        bg.fillStyle = `rgb(${v},${v},${v})`;
        bg.fillRect(xx + 3, y + 3, w - 6, rh - 6);
        for (let k = 0; k < (w * rh) / 90; k++) {
          const q = v + (r() - 0.5) * 70;
          bg.fillStyle = `rgb(${q},${q},${q})`;
          bg.fillRect(xx + 3 + r() * (w - 8), y + 3 + r() * (rh - 8), 2 + r() * 4, 2 + r() * 4);
        }
      };
      draw(x);
      if (x + w > W) draw(x - W); // wrap seamlessly
      x += w;
    }
    y += rh;
  }
  return { map: tex(c, [1, 1]), bump: tex(b, [1, 1], false) };
}

/** Warm radial glow for the fake bloom around lit windows (additive sprite). */
export function glowTexture() {
  const [c, g] = canvas(128);
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,190,120,0.55)");
  grad.addColorStop(0.35, "rgba(255,160,90,0.18)");
  grad.addColorStop(1, "rgba(255,140,70,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return tex(c);
}

export function grassTexture() {
  const [c, g] = canvas(512);
  const r = rng(3);
  g.fillStyle = "#4a5a2f";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 26000; i++) {
    const x = r() * 512;
    const y = r() * 512;
    const l = 18 + r() * 22;
    g.strokeStyle = `hsla(${70 + r() * 30} ${30 + r() * 25}% ${l}% / 0.7)`;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + (r() - 0.5) * 3, y - 2 - r() * 4);
    g.stroke();
  }
  return tex(c, [40, 40]);
}

export function concreteTexture() {
  const [c, g] = canvas(256);
  const r = rng(5);
  g.fillStyle = "#b6b2aa";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 5000; i++) {
    const v = 150 + r() * 70;
    g.fillStyle = `rgba(${v},${v - 4},${v - 10},0.35)`;
    g.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 2);
  }
  g.fillStyle = "rgba(60,60,60,0.35)"; // control joint
  g.fillRect(0, 254, 256, 2);
  return tex(c, [1, 1]);
}

/** Sectional garage door: four rows of raised panels. */
export function garageTexture() {
  const [c, g] = canvas(512, 256);
  g.fillStyle = "#e9e5dc";
  g.fillRect(0, 0, 512, 256);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 8; col++) {
      const x = col * 64 + 6;
      const y = row * 64 + 8;
      g.fillStyle = "#d9d4c9";
      g.fillRect(x, y, 52, 48);
      g.fillStyle = "#f4f1ea";
      g.fillRect(x + 3, y + 3, 46, 4);
      g.fillStyle = "#c5bfb2";
      g.fillRect(x + 3, y + 41, 46, 4);
    }
    g.fillStyle = "#bfb8aa";
    g.fillRect(0, row * 64, 512, 2);
  }
  return tex(c);
}

/** A lit room seen through glass: warm, brighter low, curtain folds at the sides. */
export function windowTexture() {
  const [c, g] = canvas(128);
  const grad = g.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, "#5a3a20");
  grad.addColorStop(0.55, "#d98d45");
  grad.addColorStop(1, "#f6c27e");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 9; i++) {
    g.fillStyle = `rgba(80,40,20,${0.1 + (i % 2) * 0.12})`;
    g.fillRect(i * 4, 0, 3, 128);
    g.fillRect(124 - i * 4, 0, 3, 128);
  }
  return tex(c);
}

/** Soft disc for contact shadows (an alpha map: white = dark shadow). */
export function blobTexture() {
  const [c, g] = canvas(256);
  g.fillStyle = "#000";
  g.fillRect(0, 0, 256, 256);
  const grad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, "rgb(230,230,230)");
  grad.addColorStop(0.5, "rgb(120,120,120)");
  grad.addColorStop(1, "rgb(0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return tex(c, [1, 1], false);
}
