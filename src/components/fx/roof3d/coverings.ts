import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { MaterialId } from "@/content/materials";
import { type Plane, planes, planeById, isTop, courseOf, ridges, hips, rng } from "./geometry";

/*
 * Real roof coverings, piece by piece: every shingle tab, slate, clay barrel and metal panel is an
 * instance laid on the deck with the overlap a roofer would give it, so courses throw their own
 * little shadow lines. Hips and ridges get caps, as on a real roof.
 *
 * Install / tear-off runs in the vertex shader: `uFront` (0 at the eaves → 1 at the ridge) drops new
 * pieces in course by course; `uCut` lifts old ones away ahead of it, so the felt shows for a
 * moment between the old roof and the new one.
 */

export type InstallUniforms = { uFront: { value: number }; uCut: { value: number } };

export type Covering = {
  group: THREE.Group;
  uniforms: InstallUniforms;
  material: THREE.MeshStandardMaterial;
  kind: MaterialId;
  /** Roughness when dry; wet roofs are glossier. */
  dryRoughness: number;
  dispose: () => void;
};

type Item = { m: THREE.Matrix4; c: THREE.Color; course: number; seed: number };

const X = new THREE.Vector3(1, 0, 0);
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();

function basis(pl: Plane, tilt = 0, yaw = 0) {
  const m = new THREE.Matrix4().makeBasis(pl.u, pl.n, pl.v.clone().negate());
  const q = new THREE.Quaternion().setFromRotationMatrix(m);
  if (yaw) q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw));
  if (tilt) q.multiply(new THREE.Quaternion().setFromAxisAngle(X, -tilt));
  return q;
}

const at = (pl: Plane, u: number, v: number, lift: number, out = new THREE.Vector3()) =>
  out.copy(pl.o).addScaledVector(pl.u, u).addScaledVector(pl.v, v).addScaledVector(pl.n, lift);

function ok(pl: Plane, u: number, v: number) {
  if (u < 0 || u > pl.uLen || v < 0 || v > pl.vLen + 0.05) return false;
  at(pl, u, v, 0, _p);
  return isTop(pl, _p.x, _p.z);
}

/** Trim a piece spanning [a, b] along the eave so its exposed area stays on this slope. */
function clipSpan(pl: Plane, a: number, b: number, v1: number, v2: number): [number, number] | null {
  const good = (u: number) => ok(pl, u, v1) && ok(pl, u, v2);
  while (a < b && !good(a)) a += 0.02;
  while (b > a && !good(b)) b -= 0.02;
  return b - a > 0.05 ? [a, b] : null;
}

/** Linear colour from a hex, lightness nudged by `k` (1 = as is). */
function tint(hex: string, k: number, hue = 0) {
  const c = new THREE.Color(hex);
  if (hue) c.offsetHSL(hue, 0, 0);
  return c.multiplyScalar(k);
}

function push(items: Item[], pos: THREE.Vector3, q: THREE.Quaternion, s: THREE.Vector3, c: THREE.Color, seed: number, course?: number) {
  items.push({ m: new THREE.Matrix4().compose(pos, q, s), c, course: course ?? courseOf(pos.y), seed });
}

const COVERED = planes.filter((p) => p.id !== "back"); // the back slope is never in view

// ─────────────────────────── pieces per material ───────────────────────────

type Spec = { geo: THREE.BufferGeometry; items: Item[] }[];

function shingles(hex: string, r: () => number): Spec {
  const e = 0.143,
    L = 0.33,
    t = 0.011,
    H0 = 0.024;
  const tilt = Math.atan(t / e);
  const items: Item[] = [];
  for (const pl of COVERED) {
    const q = basis(pl, tilt);
    const rows = Math.ceil(pl.vLen / e);
    for (let k = 0; k < rows; k++) {
      const v0 = k * e;
      let u = -r() * 0.3;
      while (u < pl.uLen) {
        const w = 0.17 + r() * 0.28;
        const span = clipSpan(pl, Math.max(0, u), Math.min(pl.uLen, u + w), v0 + 0.01, v0 + L * 0.62);
        if (span) {
          const [a, b] = span;
          const extra = r() * 0.03; // laminated "dragon teeth": tabs end at slightly different heights
          const len = L + extra;
          const pos = at(pl, (a + b) / 2, v0 - extra + len / 2, H0);
          const dark = r() < 0.14 ? 0.72 : 1;
          const c = tint(hex, (0.86 + r() * 0.3) * dark, (r() - 0.5) * 0.012);
          push(items, pos, q, _s.set(b - a - 0.007, t, len), c, r());
        }
        u += w;
      }
    }
  }
  return [{ geo: new THREE.BoxGeometry(1, 1, 1), items }];
}

function slates(hex: string, r: () => number): Spec {
  const e = 0.118,
    L = 0.3,
    t = 0.009,
    H0 = 0.02,
    W = 0.255;
  const tilt = Math.atan(t / e);
  const items: Item[] = [];
  for (const pl of COVERED) {
    const rows = Math.ceil(pl.vLen / e);
    for (let k = 0; k < rows; k++) {
      const v0 = k * e;
      for (let u = k % 2 ? -W / 2 : 0; u < pl.uLen; u += W) {
        const span = clipSpan(pl, Math.max(0, u), Math.min(pl.uLen, u + W), v0 + 0.01, v0 + L * 0.62);
        if (!span) continue;
        const [a, b] = span;
        const q = basis(pl, tilt, (r() - 0.5) * 0.02);
        const pos = at(pl, (a + b) / 2, v0 + L / 2 + (r() - 0.5) * 0.008, H0);
        const c = tint(hex, 0.8 + r() * 0.4, (r() - 0.5) * 0.02);
        push(items, pos, q, _s.set(b - a - 0.006, t, L), c, r());
      }
    }
  }
  return [{ geo: new THREE.BoxGeometry(1, 1, 1), items }];
}

/** Half a cylinder shell along z: the top half (cover, convex) or bottom half (pan, concave). */
function shell(r: number, len: number, top: boolean, segs = 10) {
  const g = new THREE.CylinderGeometry(r, r * 0.92, len, segs, 1, true, top ? Math.PI / 2 : -Math.PI / 2, Math.PI);
  g.rotateX(Math.PI / 2); // axis y → z (the wider end at the eave)
  return g;
}

function tiles(hex: string, r: () => number): Spec {
  const e = 0.31,
    L = 0.42,
    W = 0.3,
    H0 = 0.02;
  const tilt = Math.atan(0.035 / e);
  // one unit = a concave pan with a convex cover over the joint to its right
  const pan = shell(0.112, L, false);
  pan.translate(0, 0.112, 0);
  const cover = shell(0.088, L, true);
  cover.translate(W / 2, 0.1, 0);
  const unit = mergeGeometries([pan, cover])!;
  pan.dispose();
  cover.dispose();
  const items: Item[] = [];
  for (const pl of COVERED) {
    const q = basis(pl, tilt);
    const rows = Math.ceil(pl.vLen / e);
    for (let k = 0; k < rows; k++) {
      const v0 = k * e;
      for (let u = 0; u < pl.uLen; u += W) {
        const span = clipSpan(pl, Math.max(0, u - 0.04), Math.min(pl.uLen, u + W - 0.04), v0 + 0.01, v0 + L * 0.6);
        if (!span) continue;
        const [a, b] = span;
        const sx = (b - a) / W;
        const pos = at(pl, a + 0.04, v0 + L / 2, H0);
        const c = tint(hex, 0.82 + r() * 0.34, (r() - 0.5) * 0.03);
        push(items, pos, q, _s.set(sx, 1, 1), c, r());
      }
    }
  }
  return [{ geo: unit, items }];
}

function metal(hex: string, r: () => number): Spec {
  const W = 0.42,
    L = 0.25,
    H0 = 0.014;
  const plates: Item[] = [];
  const seams: Item[] = [];
  for (const pl of COVERED) {
    const q = basis(pl);
    const rows = Math.ceil(pl.vLen / L);
    const cols = Math.ceil(pl.uLen / W);
    for (let i = 0; i < cols; i++) {
      const u = i * W;
      const panelTone = 0.97 + r() * 0.06; // each panel off a slightly different coil
      for (let k = 0; k < rows; k++) {
        const v0 = k * L;
        const span = clipSpan(pl, u, Math.min(pl.uLen, u + W), v0, v0 + L);
        if (!span) continue;
        const [a, b] = span;
        const pos = at(pl, (a + b) / 2, v0 + L / 2, H0);
        push(plates, pos, q, _s.set(b - a, 0.008, L + 0.002), tint(hex, panelTone), r());
        if (b > u + W - 0.03 && ok(pl, u + W, v0) && ok(pl, u + W, v0 + L)) {
          const sp = at(pl, u + W, v0 + L / 2, H0 + 0.028);
          push(seams, sp, q, _s.set(0.022, 0.05, L + 0.002), tint(hex, 1.04), r(), courseOf(pos.y));
        }
      }
    }
  }
  return [
    { geo: new THREE.BoxGeometry(1, 1, 1), items: plates },
    { geo: new THREE.BoxGeometry(1, 1, 1), items: seams },
  ];
}

// ─────────────────────────── ridge and hip caps ───────────────────────────

const capPlanes: [THREE.Vector3, THREE.Vector3, string, string][] = [
  [ridges[0][0], ridges[0][1], "front", "back"],
  [ridges[1][0], ridges[1][1], "wingL", "wingR"],
  [hips[0][0], hips[0][1], "front", "right"],
  [hips[1][0], hips[1][1], "back", "right"],
  [hips[2][0], hips[2][1], "front", "left"],
  [hips[3][0], hips[3][1], "back", "left"],
];

/** Two slabs per piece, one lying on each slope, meeting over the hip or ridge. */
function slabCaps(hex: string, r: () => number, len: number, halfW: number, lift: number, thick: number, tone = 0.9): Item[] {
  const items: Item[] = [];
  for (const [a, b, pa, pb] of capPlanes) {
    const dir = b.clone().sub(a);
    const length = dir.length();
    dir.normalize();
    const n = Math.max(1, Math.round(length / len));
    for (const id of [pa, pb]) {
      const pl = planeById(id);
      let Xd = dir.clone();
      let Zd = new THREE.Vector3().crossVectors(Xd, pl.n).normalize();
      const probe = a.clone().lerp(b, 0.5).addScaledVector(Zd, 0.4);
      if (!isTop(pl, probe.x, probe.z, 0.05)) {
        Zd = Zd.negate();
        Xd = Xd.negate();
      }
      const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(Xd, pl.n, Zd));
      for (let i = 0; i < n; i++) {
        const p = a.clone().lerp(b, (i + 0.5) / n).addScaledVector(Zd, halfW / 2 - 0.01).addScaledVector(pl.n, lift);
        push(items, p, q, new THREE.Vector3((length / n) * 0.97, thick, halfW), tint(hex, tone * (0.9 + r() * 0.15)), r());
      }
    }
  }
  return items;
}

function tileCaps(hex: string, r: () => number): Spec {
  const geo = shell(0.13, 0.42, true, 12);
  const items: Item[] = [];
  for (const [a, b, pa, pb] of capPlanes) {
    const dir = b.clone().sub(a);
    const length = dir.length();
    dir.normalize();
    const up = planeById(pa).n.clone().add(planeById(pb).n).normalize();
    const side = new THREE.Vector3().crossVectors(up, dir).normalize();
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(side, up, dir));
    const n = Math.max(1, Math.round(length / 0.36));
    for (let i = 0; i < n; i++) {
      const p = a.clone().lerp(b, (i + 0.5) / n).addScaledVector(up, 0.17);
      push(items, p, q, new THREE.Vector3(1, 1, ((length / n) * 1.12) / 0.42), tint(hex, 0.85 + r() * 0.2), r());
    }
  }
  return [{ geo, items }];
}

// ─────────────────────────── install shader ───────────────────────────

const HEAD = /* glsl */ `
attribute float aCourse;
attribute float aSeed;
uniform float uFront;
uniform float uCut;
`;
const BEGIN = /* glsl */ `
#include <begin_vertex>
float tIn = clamp((uFront - aCourse) / 0.08, 0.0, 1.0);
float tOut = clamp((aCourse - uCut) / 0.06, 0.0, 1.0);
float kShow = min(tIn, tOut);
transformed *= step(0.001, kShow);
float eIn = 1.0 - tIn;
float roofLift = eIn * eIn * (0.45 + aSeed * 0.5) + (1.0 - tOut) * (1.0 - tOut) * 0.7;
`;
const PROJECT = /* glsl */ `
vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
  mvPosition.xyz += normalize( instanceMatrix[1].xyz ) * roofLift;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;
`;

function withInstall<M extends THREE.Material>(mat: M, u: InstallUniforms, key: string) {
  mat.onBeforeCompile = (s) => {
    s.uniforms.uFront = u.uFront;
    s.uniforms.uCut = u.uCut;
    s.vertexShader = s.vertexShader
      .replace("#include <common>", `#include <common>\n${HEAD}`)
      .replace("#include <begin_vertex>", BEGIN)
      .replace("#include <project_vertex>", PROJECT);
  };
  mat.customProgramCacheKey = () => key;
  return mat;
}

const LOOK: Record<MaterialId, { roughness: number; metalness: number; grain: boolean; capHex?: number }> = {
  shingle: { roughness: 0.9, metalness: 0, grain: true },
  slate: { roughness: 0.62, metalness: 0.04, grain: true },
  tile: { roughness: 0.78, metalness: 0, grain: true },
  metal: { roughness: 0.34, metalness: 0.88, grain: false },
};

function coveringMaterials(kind: MaterialId, grain: THREE.Texture, uniforms: InstallUniforms) {
  const look = LOOK[kind];
  const material = withInstall(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: look.roughness,
      metalness: look.metalness,
      map: look.grain ? grain : null,
      side: kind === "tile" ? THREE.DoubleSide : THREE.FrontSide,
    }),
    uniforms,
    "roof-install",
  );
  const depth = withInstall(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }), uniforms, "roof-install-depth");
  return { material, depth };
}

/**
 * One invisible piece of every roof kind, set up exactly like the real ones (instanced, tinted,
 * shadowed, install shader). Added to the scene for the start-up compile, so swapping roofs later
 * never compiles a shader mid-click. Keep it until the scene goes: disposing it frees the programs.
 */
export function warmCoverings(grain: THREE.Texture) {
  const group = new THREE.Group();
  const uniforms: InstallUniforms = { uFront: { value: -1 }, uCut: { value: -1 } }; // nothing shows
  const geo = new THREE.BoxGeometry(0.01, 0.01, 0.01);
  geo.setAttribute("aCourse", new THREE.InstancedBufferAttribute(new Float32Array([1]), 1));
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(new Float32Array([0]), 1));
  const mats: THREE.Material[] = [];
  for (const kind of Object.keys(LOOK) as MaterialId[]) {
    const { material, depth } = coveringMaterials(kind, grain, uniforms);
    const mesh = new THREE.InstancedMesh(geo, material, 1);
    mesh.setMatrixAt(0, new THREE.Matrix4());
    mesh.setColorAt(0, new THREE.Color(0xffffff));
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.customDepthMaterial = depth;
    mesh.frustumCulled = false;
    group.add(mesh);
    mats.push(material, depth);
  }
  return {
    group,
    dispose() {
      geo.dispose();
      mats.forEach((m) => m.dispose());
    },
  };
}

export function buildCovering(kind: MaterialId, hex: string, grain: THREE.Texture, seed = 1): Covering {
  const r = rng(seed);
  let spec: Spec;
  if (kind === "shingle") spec = [...shingles(hex, r), { geo: new THREE.BoxGeometry(1, 1, 1), items: slabCaps(hex, r, 0.2, 0.17, 0.05, 0.014, 0.82) }];
  else if (kind === "slate") spec = [...slates(hex, r), { geo: new THREE.BoxGeometry(1, 1, 1), items: slabCaps(hex, r, 0.26, 0.16, 0.04, 0.012, 0.85) }];
  else if (kind === "tile") spec = [...tiles(hex, r), ...tileCaps(hex, r)];
  else spec = [...metal(hex, r), { geo: new THREE.BoxGeometry(1, 1, 1), items: slabCaps(hex, r, 1.2, 0.2, 0.05, 0.01, 0.95) }];

  const look = LOOK[kind];
  const uniforms: InstallUniforms = { uFront: { value: 2 }, uCut: { value: -1 } };
  const { material, depth } = coveringMaterials(kind, grain, uniforms);

  const group = new THREE.Group();
  const geos: THREE.BufferGeometry[] = [];
  for (const { geo, items } of spec) {
    if (!items.length) continue;
    const course = new Float32Array(items.length);
    const seeds = new Float32Array(items.length);
    items.forEach((it, i) => {
      course[i] = it.course;
      seeds[i] = it.seed;
    });
    geo.setAttribute("aCourse", new THREE.InstancedBufferAttribute(course, 1));
    geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
    const mesh = new THREE.InstancedMesh(geo, material, items.length);
    items.forEach((it, i) => {
      mesh.setMatrixAt(i, it.m);
      mesh.setColorAt(i, it.c);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.customDepthMaterial = depth;
    mesh.frustumCulled = false;
    group.add(mesh);
    geos.push(geo);
  }
  return {
    group,
    uniforms,
    material,
    kind,
    dryRoughness: look.roughness,
    dispose() {
      geos.forEach((g) => g.dispose());
      material.dispose();
      depth.dispose();
    },
  };
}

/** Where a point on a slope is in the world (for markers laid on the roof). */
export function onRoof(planeId: string, u: number, v: number, lift: number) {
  const pl = planeById(planeId);
  return { pos: at(pl, u, v, lift), quat: basis(pl), plane: pl };
}

