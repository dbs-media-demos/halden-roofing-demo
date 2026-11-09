import * as THREE from "three";

/*
 * The Halden house in metres, the same house as the old drawing: a single-storey Texas ranch with a
 * hip roof and a front-facing gable wing, everything at a true 6/12 pitch. y is up, the street is +z.
 *
 * The roof is described as a height field (the union of the hip block and the wing), so coverings,
 * hail and markers can all ask "how high is the roof here, and which slope is on top?".
 */

export const PITCH = 0.5; // 6/12
export const SLOPE = Math.atan(PITCH);
export const COS = Math.cos(SLOPE);
export const SIN = Math.sin(SLOPE);

export const WALL_H = 3;
export const EAVE_Y = 2.75; // roof edge, 0.5 m overhang past the walls
export const MAIN = { x: 7, z: 4.5, rx: 7.5, rz: 5 }; // walls ±x/±z, roof edge ±rx/±rz
export const WING = { x0: -6, x1: 0, z1: 8, rx0: -6.5, rx1: 0.5, rz1: 8.5, cx: -3, half: 3.5 };
export const RIDGE_Y = EAVE_Y + PITCH * MAIN.rz; // 5.25
export const WING_RIDGE_Y = EAVE_Y + PITCH * WING.half; // 4.5

const NONE = -1e9;

export function mainHeight(x: number, z: number) {
  const dx = MAIN.rx - Math.abs(x);
  const dz = MAIN.rz - Math.abs(z);
  if (dx < 0 || dz < 0) return NONE;
  return EAVE_Y + PITCH * Math.min(dx, dz);
}

export function wingHeight(x: number, z: number) {
  if (x < WING.rx0 || x > WING.rx1 || z < 0 || z > WING.rz1) return NONE;
  return EAVE_Y + PITCH * (WING.half - Math.abs(x - WING.cx));
}

/** Top of the roof at (x, z), or a big negative number off the roof. */
export const roofHeight = (x: number, z: number) => Math.max(mainHeight(x, z), wingHeight(x, z));

export type Plane = {
  id: string;
  /** Eave-corner origin, along-eave unit vector, up-slope unit vector (in the plane). */
  o: THREE.Vector3;
  u: THREE.Vector3;
  v: THREE.Vector3;
  n: THREE.Vector3;
  /** Length along the eave and up the slope to cover. */
  uLen: number;
  vLen: number;
  /** Height of this plane at (x, z). */
  y: (x: number, z: number) => number;
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function plane(id: string, o: THREE.Vector3, u: THREE.Vector3, v: THREE.Vector3, uLen: number, vLen: number, y: Plane["y"]): Plane {
  return { id, o, u, v, n: new THREE.Vector3().crossVectors(u, v).normalize(), uLen, vLen, y };
}

const mainV = MAIN.rz / COS; // slope length eave → ridge on the hip block
const wingV = WING.half / COS;

export const planes: Plane[] = [
  plane("front", V(-MAIN.rx, EAVE_Y, MAIN.rz), V(1, 0, 0), V(0, SIN, -COS), 2 * MAIN.rx, mainV, (_x, z) => EAVE_Y + PITCH * (MAIN.rz - z)),
  plane("back", V(MAIN.rx, EAVE_Y, -MAIN.rz), V(-1, 0, 0), V(0, SIN, COS), 2 * MAIN.rx, mainV, (_x, z) => EAVE_Y + PITCH * (MAIN.rz + z)),
  plane("left", V(-MAIN.rx, EAVE_Y, -MAIN.rz), V(0, 0, 1), V(COS, SIN, 0), 2 * MAIN.rz, mainV, (x) => EAVE_Y + PITCH * (MAIN.rx + x)),
  plane("right", V(MAIN.rx, EAVE_Y, MAIN.rz), V(0, 0, -1), V(-COS, SIN, 0), 2 * MAIN.rz, mainV, (x) => EAVE_Y + PITCH * (MAIN.rx - x)),
  plane("wingL", V(WING.rx0, EAVE_Y, 0), V(0, 0, 1), V(COS, SIN, 0), WING.rz1, wingV, (x) => EAVE_Y + PITCH * (x - WING.rx0)),
  plane("wingR", V(WING.rx1, EAVE_Y, WING.rz1), V(0, 0, -1), V(-COS, SIN, 0), WING.rz1, wingV, (x) => EAVE_Y + PITCH * (WING.rx1 - x)),
];

export const planeById = (id: string) => planes.find((p) => p.id === id)!;

/** Is `p` the top surface at (x, z)? */
export function isTop(p: Plane, x: number, z: number, eps = 0.012) {
  const h = roofHeight(x, z);
  if (h < 0) return false;
  return Math.abs(p.y(x, z) - h) < eps;
}

/** The slope on top at (x, z), if any. */
export function topPlane(x: number, z: number) {
  const h = roofHeight(x, z);
  if (h < 0) return null;
  for (const p of planes) if (Math.abs(p.y(x, z) - h) < 0.02) return p;
  return null;
}

/** Normalised height on the roof: 0 at the eaves, 1 at the main ridge. Courses install in this order. */
export const courseOf = (y: number) => (y - EAVE_Y) / (RIDGE_Y - EAVE_Y);

/** The roof deck as triangles (x, y, z), one set per slope. */
export const deckPolys: { plane: string; pts: [number, number, number][] }[] = [
  { plane: "front", pts: [[-7.5, EAVE_Y, 5], [7.5, EAVE_Y, 5], [2.5, RIDGE_Y, 0], [-2.5, RIDGE_Y, 0]] },
  { plane: "back", pts: [[7.5, EAVE_Y, -5], [-7.5, EAVE_Y, -5], [-2.5, RIDGE_Y, 0], [2.5, RIDGE_Y, 0]] },
  { plane: "left", pts: [[-7.5, EAVE_Y, -5], [-7.5, EAVE_Y, 5], [-2.5, RIDGE_Y, 0]] },
  { plane: "right", pts: [[7.5, EAVE_Y, 5], [7.5, EAVE_Y, -5], [2.5, RIDGE_Y, 0]] },
  { plane: "wingL", pts: [[-6.5, EAVE_Y, 5], [-6.5, EAVE_Y, 8.5], [-3, WING_RIDGE_Y, 8.5], [-3, WING_RIDGE_Y, 1.5]] },
  { plane: "wingR", pts: [[0.5, EAVE_Y, 8.5], [0.5, EAVE_Y, 5], [-3, WING_RIDGE_Y, 1.5], [-3, WING_RIDGE_Y, 8.5]] },
];

type Seg = [THREE.Vector3, THREE.Vector3];
export const ridges: Seg[] = [
  [V(-2.5, RIDGE_Y, 0), V(2.5, RIDGE_Y, 0)],
  [V(-3, WING_RIDGE_Y, 1.5), V(-3, WING_RIDGE_Y, 8.5)],
];
export const hips: Seg[] = [
  [V(2.5, RIDGE_Y, 0), V(7.5, EAVE_Y, 5)],
  [V(2.5, RIDGE_Y, 0), V(7.5, EAVE_Y, -5)],
  [V(-2.5, RIDGE_Y, 0), V(-7.5, EAVE_Y, 5)],
  [V(-2.5, RIDGE_Y, 0), V(-7.5, EAVE_Y, -5)],
];
export const valleys: Seg[] = [
  [V(0.5, EAVE_Y, 5), V(-3, WING_RIDGE_Y, 1.5)],
  [V(-6.5, EAVE_Y, 5), V(-3, WING_RIDGE_Y, 1.5)],
];

/** Eave lines that carry fascia and a gutter. */
export const eaves: Seg[] = [
  [V(-7.5, EAVE_Y, 5), V(-6.5, EAVE_Y, 5)],
  [V(0.5, EAVE_Y, 5), V(7.5, EAVE_Y, 5)],
  [V(7.5, EAVE_Y, 5), V(7.5, EAVE_Y, -5)],
  [V(7.5, EAVE_Y, -5), V(-7.5, EAVE_Y, -5)],
  [V(-7.5, EAVE_Y, -5), V(-7.5, EAVE_Y, 5)],
  [V(-6.5, EAVE_Y, 5), V(-6.5, EAVE_Y, 8.5)],
  [V(0.5, EAVE_Y, 8.5), V(0.5, EAVE_Y, 5)],
];

/** Small deterministic random, so stills and the live scene match. */
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
