// Bundled by render.mjs (esbuild) into a standalone page that runs the site's own 3D scene.
import { createHouseScene } from "../../src/components/fx/roof3d/HouseScene.ts";

const q = new URLSearchParams(location.search);
const canvas = document.querySelector("canvas");
canvas.style.width = "1200px";
canvas.style.height = "800px";
window.__scene = createHouseScene(canvas, {
  mode: q.get("mode") || "hero",
  step: +(q.get("step") || 0),
  roof: q.get("kind") ? { kind: q.get("kind"), hex: "#" + q.get("hex") } : undefined,
  onFirstFrame: () => (window.__ready = true),
});
