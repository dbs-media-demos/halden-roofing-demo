import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { EAVE_Y, WALL_H, MAIN, WING, WING_RIDGE_Y, deckPolys, eaves, valleys, planeById, isTop, rng } from "./geometry";
import { stoneTexture, grassTexture, concreteTexture, garageTexture, windowTexture, blobTexture, glowTexture } from "./textures";

/*
 * Everything that isn't the roof covering: limestone walls, white trim, lit windows, a garage, the
 * felt deck, copper valleys and drip edge, gutters, a lawn with live oaks, a driveway and the street.
 * Built from primitives; textures are painted on canvases (textures.ts).
 */

export type House = {
  group: THREE.Group;
  /** Window panes and the porch light: their glow follows the time of day. */
  glow: THREE.MeshStandardMaterial[];
  /** Soft bloom sprites around the lit windows. */
  halo: THREE.SpriteMaterial;
  porch: THREE.PointLight;
  lawn: THREE.MeshStandardMaterial;
  wetMats: THREE.MeshStandardMaterial[];
  dispose: () => void;
};

/** Planar UVs in world metres, so textures keep their scale on every face. */
function worldUV(geo: THREE.BufferGeometry, size: number) {
  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const nx = Math.abs(nor.getX(i)),
      ny = Math.abs(nor.getY(i));
    const x = pos.getX(i),
      y = pos.getY(i),
      z = pos.getZ(i);
    const [a, b] = ny > 0.5 ? [x, z] : nx > 0.5 ? [z, y] : [x, y];
    uv[i * 2] = a / size;
    uv[i * 2 + 1] = b / size;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
}

function box(w: number, h: number, d: number, x: number, y: number, z: number) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return g;
}

/** A box from a to b (a beam along a segment), `w` wide and `h` tall, rolled about the segment. */
function beam(a: THREE.Vector3, b: THREE.Vector3, w: number, h: number, up = new THREE.Vector3(0, 1, 0)) {
  const len = a.distanceTo(b);
  const g = new THREE.BoxGeometry(len, h, w);
  const xAxis = b.clone().sub(a).normalize();
  const zAxis = new THREE.Vector3().crossVectors(xAxis, up).normalize();
  const yAxis = new THREE.Vector3().crossVectors(zAxis, xAxis).normalize();
  const m = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis).setPosition(a.clone().add(b).multiplyScalar(0.5));
  g.applyMatrix4(m);
  return g;
}

/**
 * `model`: the explorer's version, an architect's model on a round lawn plinth (no street, no
 * horizon), so the roof is the only thing to look at.
 */
export function buildHouse({ model = false } = {}): House {
  const group = new THREE.Group();
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const texs: THREE.Texture[] = [];
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, cast = true, receive = true) => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = cast;
    m.receiveShadow = receive;
    group.add(m);
    geos.push(geo);
    return m;
  };
  const mat = <T extends THREE.Material>(m: T) => {
    mats.push(m);
    return m;
  };

  // ── materials ──
  const stone = stoneTexture();
  texs.push(stone.map, stone.bump);
  const wall = mat(new THREE.MeshStandardMaterial({ map: stone.map, bumpMap: stone.bump, bumpScale: 1.6, roughness: 0.93, color: 0xf6efe4 }));
  const trim = mat(new THREE.MeshStandardMaterial({ color: 0xece7dd, roughness: 0.6 }));
  const bronze = mat(new THREE.MeshStandardMaterial({ color: 0x3b3029, roughness: 0.45, metalness: 0.3 }));
  const copper = mat(new THREE.MeshStandardMaterial({ color: 0xc4713c, roughness: 0.32, metalness: 0.75 }));
  const felt = mat(new THREE.MeshStandardMaterial({ color: 0x3a4249, roughness: 0.95, side: THREE.DoubleSide }));
  const slab = mat(new THREE.MeshStandardMaterial({ color: 0x9d988f, roughness: 0.9 }));
  const winTex = windowTexture();
  texs.push(winTex);
  const glass = mat(
    new THREE.MeshStandardMaterial({ color: 0x1d2329, roughness: 0.06, metalness: 0.1, emissive: 0xffffff, emissiveMap: winTex, emissiveIntensity: 1 }),
  );
  const door = mat(new THREE.MeshStandardMaterial({ color: 0x4a2f1f, roughness: 0.55 }));
  const garTex = garageTexture();
  texs.push(garTex);
  const garage = mat(new THREE.MeshStandardMaterial({ map: garTex, roughness: 0.55 }));
  const lampMat = mat(new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xffc27a, emissiveIntensity: 2 }));

  // ── slab, walls, wing gable ──
  add(box(2 * MAIN.x + 0.3, 0.22, 2 * MAIN.z + 0.3, 0, 0.05, 0), slab, false);
  add(box(WING.x1 - WING.x0 + 0.3, 0.22, WING.z1 - MAIN.z + 0.15, WING.cx, 0.05, (MAIN.z + WING.z1) / 2 + 0.075), slab, false);
  add(worldUV(box(2 * MAIN.x, WALL_H, 2 * MAIN.z, 0, WALL_H / 2, 0), 2.4), wall);
  add(worldUV(box(WING.x1 - WING.x0, WALL_H, WING.z1 - MAIN.z, WING.cx, WALL_H / 2, (MAIN.z + WING.z1) / 2), 2.4), wall);
  const tri = new THREE.Shape([new THREE.Vector2(WING.x0, WALL_H), new THREE.Vector2(WING.x1, WALL_H), new THREE.Vector2(WING.cx, WING_RIDGE_Y - 0.08)]);
  const gable = new THREE.ExtrudeGeometry(tri, { depth: WING.z1 - MAIN.z, bevelEnabled: false });
  gable.translate(0, 0, MAIN.z);
  add(worldUV(gable, 2.4), wall);

  // ── deck (felt underlayment, shows during tear-off) ──
  {
    const pts: number[] = [];
    for (const { plane, pts: p } of deckPolys) {
      const n = planeById(plane).n;
      const tris = p.length === 3 ? [[0, 1, 2]] : [[0, 1, 2], [0, 2, 3]];
      for (const [a, b, c] of tris) {
        const A = new THREE.Vector3(...p[a]),
          B = new THREE.Vector3(...p[b]),
          C = new THREE.Vector3(...p[c]);
        const fn = new THREE.Vector3().crossVectors(B.clone().sub(A), C.clone().sub(A));
        const order = fn.dot(n) > 0 ? [A, B, C] : [A, C, B];
        order.forEach((v) => pts.push(v.x, v.y, v.z));
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    g.computeVertexNormals();
    add(g, felt);
  }

  // ── soffits ──
  {
    const ring = new THREE.Shape([new THREE.Vector2(-7.5, -5), new THREE.Vector2(7.5, -5), new THREE.Vector2(7.5, 5), new THREE.Vector2(-7.5, 5)]);
    ring.holes.push(new THREE.Path([new THREE.Vector2(-7, -4.5), new THREE.Vector2(-7, 4.5), new THREE.Vector2(7, 4.5), new THREE.Vector2(7, -4.5)]));
    const g = new THREE.ShapeGeometry(ring);
    g.rotateX(Math.PI / 2);
    g.translate(0, EAVE_Y - 0.012, 0);
    add(g, trim, false);
    for (const [x0, x1] of [
      [WING.rx0, WING.x0],
      [WING.x1, WING.rx1],
    ]) {
      const s = new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(x0, 4.5), new THREE.Vector2(x1, 4.5), new THREE.Vector2(x1, 8.5), new THREE.Vector2(x0, 8.5)]));
      s.rotateX(Math.PI / 2);
      s.translate(0, EAVE_Y - 0.012, 0);
      add(s, trim, false);
    }
  }

  // ── fascia, gutters, copper drip edge, rakes, downspouts ──
  for (const [a, b] of eaves) {
    const out = new THREE.Vector3().crossVectors(b.clone().sub(a), new THREE.Vector3(0, 1, 0)).normalize();
    const lift = (v: THREE.Vector3, dy: number, o: number) => v.clone().add(new THREE.Vector3(0, dy, 0)).addScaledVector(out, o);
    add(beam(lift(a, -0.1, 0.02), lift(b, -0.1, 0.02), 0.04, 0.22), trim);
    add(beam(lift(a, -0.13, 0.1), lift(b, -0.13, 0.1), 0.13, 0.12), bronze);
    add(beam(lift(a, 0.012, 0.03), lift(b, 0.012, 0.03), 0.03, 0.025), copper, false);
  }
  {
    const z = WING.rz1 + 0.02;
    const apex = new THREE.Vector3(WING.cx, WING_RIDGE_Y, z);
    for (const x of [WING.rx0, WING.rx1]) {
      const foot = new THREE.Vector3(x, EAVE_Y, z);
      add(beam(foot.clone().add(new THREE.Vector3(0, -0.1, 0)), apex.clone().add(new THREE.Vector3(0, -0.1, 0)), 0.05, 0.22), trim);
      add(beam(foot.clone().add(new THREE.Vector3(0, 0.012, 0.02)), apex.clone().add(new THREE.Vector3(0, 0.012, 0.02)), 0.03, 0.025), copper, false);
    }
  }
  for (const [x, z] of [
    [7.08, 4.58],
    [WING.rx1 - 0.42, WING.z1 + 0.08],
    [WING.rx0 + 0.42, WING.z1 + 0.08],
    [-7.08, 4.58],
  ]) {
    add(box(0.08, EAVE_Y - 0.1, 0.06, x, (EAVE_Y - 0.1) / 2, z), bronze);
  }

  // ── copper valleys ──
  const valleyPairs: [THREE.Vector3, THREE.Vector3, string, string][] = [
    [valleys[0][0], valleys[0][1], "front", "wingR"],
    [valleys[1][0], valleys[1][1], "front", "wingL"],
  ];
  for (const [a, b, pa, pb] of valleyPairs) {
    for (const id of [pa, pb]) {
      const pl = planeById(id);
      const dir = b.clone().sub(a).normalize();
      let side = new THREE.Vector3().crossVectors(dir, pl.n).normalize();
      const mid = a.clone().lerp(b, 0.5);
      const probe = mid.clone().addScaledVector(side, 0.4);
      if (!isTop(pl, probe.x, probe.z, 0.05)) side = side.negate();
      const off = side.clone().multiplyScalar(0.14).addScaledVector(pl.n, 0.008);
      add(beam(a.clone().add(off), b.clone().add(off), 0.3, 0.006, pl.n), copper, false);
    }
  }

  // ── windows, door, garage ──
  const glow: THREE.MeshStandardMaterial[] = [glass];
  const glowTex = glowTexture();
  texs.push(glowTex);
  const halo = mat(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
  const addHalo = (at: THREE.Vector3, w: number, h: number) => {
    const sp = new THREE.Sprite(halo);
    sp.position.copy(at);
    sp.scale.set(w * 2.6, h * 2.3, 1);
    group.add(sp);
  };
  /** A window on a wall facing `n` (unit x or z), centred at (c, y) along that wall. */
  const win = (n: THREE.Vector3, plane: number, c: number, y: number, w: number, h: number, mullions = true) => {
    const along = new THREE.Vector3(n.z, 0, -n.x); // left → right as seen from outside
    const p = (a: number, b: number, d: number) => {
      const v = n.clone().multiplyScalar(plane + d).add(along.clone().multiplyScalar(c + a));
      v.y = y + b;
      return v;
    };
    const mk = (a: number, b: number, d: number, sw: number, sh: number, sd: number, m: THREE.Material) => {
      const g = new THREE.BoxGeometry(Math.abs(n.x) > 0.5 ? sd : sw, sh, Math.abs(n.x) > 0.5 ? sw : sd);
      const at = p(a, b, d);
      g.translate(at.x, at.y, at.z);
      add(g, m, m !== glass);
    };
    mk(0, 0, 0.012, w, h, 0.02, glass);
    addHalo(p(0, 0, 0.35), w, h);
    const f = 0.075;
    mk(0, h / 2 + f / 2, 0.04, w + 2 * f, f, 0.06, trim);
    mk(0, -h / 2 - f / 2, 0.04, w + 2 * f, f, 0.06, trim);
    mk(-w / 2 - f / 2, 0, 0.04, f, h, 0.06, trim);
    mk(w / 2 + f / 2, 0, 0.04, f, h, 0.06, trim);
    mk(0, -h / 2 - f - 0.04, 0.08, w + 2 * f + 0.14, 0.08, 0.14, trim); // sill
    if (mullions) {
      mk(0, 0, 0.03, 0.035, h, 0.025, trim);
      mk(0, h * 0.12, 0.03, w, 0.035, 0.025, trim);
    }
  };
  const Zp = new THREE.Vector3(0, 0, 1);
  const Xp = new THREE.Vector3(1, 0, 0);
  const Xn = new THREE.Vector3(-1, 0, 0);
  win(Zp, WING.z1, -4.45, 1.55, 1.25, 1.55);
  win(Zp, WING.z1, -1.55, 1.55, 1.25, 1.55);
  win(Zp, WING.z1, -3, 3.55, 0.55, 0.42, false); // little gable vent window
  win(Xp, MAIN.x, 2.3, 1.55, 1.3, 1.4); // right side
  win(Xp, MAIN.x, -1.4, 1.55, 1.3, 1.4);
  win(Xp, WING.x1, -6.4, 1.55, 1.1, 1.4);
  win(Xn, MAIN.x, 2.2, 1.55, 1.3, 1.4);
  win(Xn, MAIN.x, -1.6, 1.55, 1.3, 1.4);

  // front door with a transom, under the porch light
  {
    const z = MAIN.z;
    add(box(1.0, 2.2, 0.06, 1.1, 1.1 + 0.12, z + 0.03), door);
    add(box(1.16, 0.08, 0.1, 1.1, 2.36, z + 0.05), trim);
    add(box(0.08, 2.3, 0.1, 0.56, 1.2, z + 0.05), trim);
    add(box(0.08, 2.3, 0.1, 1.64, 1.2, z + 0.05), trim);
    add(box(0.9, 0.22, 0.02, 1.1, 2.12, z + 0.065), glass, false);
    add(box(0.05, 0.05, 0.08, 1.45, 1.22, z + 0.1), copper, false); // handle
    add(box(0.14, 0.26, 0.12, 1.86, 2.0, z + 0.07), lampMat, false);
    add(box(1.6, 0.12, 0.9, 1.1, 0.06, z + 0.45), slab, false); // stoop
  }
  // two-car garage
  {
    const z = MAIN.z;
    add(box(4.3, 2.3, 0.04, 4.6, 1.15 + 0.12, z + 0.02), garage);
    add(box(4.6, 0.12, 0.1, 4.6, 2.48, z + 0.05), trim);
    add(box(0.12, 2.4, 0.1, 2.39, 1.24, z + 0.05), trim);
    add(box(0.12, 2.4, 0.1, 6.81, 1.24, z + 0.05), trim);
  }
  glow.push(lampMat);
  addHalo(new THREE.Vector3(1.86, 2.0, MAIN.z + 0.3), 0.5, 0.5);
  const porch = new THREE.PointLight(0xffb066, 6, 7, 1.6);
  porch.position.set(1.86, 2.1, MAIN.z + 0.7);
  group.add(porch);

  // ── ground ──
  const grass = grassTexture();
  const concrete = concreteTexture();
  texs.push(grass, concrete);
  const lawn = mat(new THREE.MeshStandardMaterial({ map: grass, roughness: 0.97, color: 0xffffff }));
  // large, soft patches so the lawn never reads as a repeating tile
  lawn.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vLawn;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLawn = (modelMatrix * vec4(position, 1.0)).xz;");
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec2 vLawn;
float lh(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float ln(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(lh(i), lh(i + vec2(1, 0)), u.x), mix(lh(i + vec2(0, 1)), lh(i + vec2(1, 1)), u.x), u.y); }`,
      )
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
float lawnPatch = ln(vLawn * 0.11) * 0.6 + ln(vLawn * 0.37) * 0.4;
diffuseColor.rgb *= mix(0.72, 1.12, lawnPatch);
diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.12, 1.0, 0.8), smoothstep(0.55, 0.8, ln(vLawn * 0.06 + 7.0)));`,
      );
  };
  const PLINTH_R = 13.5;
  if (model) {
    const top = new THREE.CircleGeometry(PLINTH_R, 96);
    top.rotateX(-Math.PI / 2);
    add(top, lawn, false);
    const side = new THREE.CylinderGeometry(PLINTH_R, PLINTH_R, 0.7, 96, 1, true);
    side.translate(0, -0.35, 0);
    add(side, mat(new THREE.MeshStandardMaterial({ color: 0x1a2530, roughness: 0.55, metalness: 0.2 })), false);
    const lip = new THREE.TorusGeometry(PLINTH_R, 0.03, 6, 128);
    lip.rotateX(Math.PI / 2);
    add(lip, mat(new THREE.MeshStandardMaterial({ color: 0xc4713c, roughness: 0.3, metalness: 0.8 })), false);
  } else {
    const g = new THREE.PlaneGeometry(240, 240);
    g.rotateX(-Math.PI / 2);
    add(g, lawn, false);
  }
  const drive = mat(new THREE.MeshStandardMaterial({ map: concrete, roughness: 0.85 }));
  {
    const dLen = model ? 7 : 15;
    const dg = new THREE.PlaneGeometry(4.6, dLen, 1, 1);
    dg.rotateX(-Math.PI / 2);
    dg.translate(4.6, 0.012, MAIN.z + dLen / 2);
    worldUV(dg, 3.2);
    add(dg, drive, false);
    const wg = new THREE.PlaneGeometry(1.2, 2.3);
    wg.rotateX(-Math.PI / 2);
    wg.translate(1.1, 0.014, MAIN.z + 2.05);
    worldUV(wg, 1.2);
    add(wg, drive, false);
    if (!model) {
      const road = mat(new THREE.MeshStandardMaterial({ color: 0x2b2e31, roughness: 0.82 }));
      const rg = new THREE.PlaneGeometry(240, 8);
      rg.rotateX(-Math.PI / 2);
      rg.translate(0, 0.01, 23.5);
      add(rg, road, false);
      add(box(240, 0.15, 0.3, 0, 0.06, 19.4), slab, false);
    }
  }
  // soft contact shadow under the house (the storm light is too soft to ground it alone)
  const blob = blobTexture();
  texs.push(blob);
  const aoMat = mat(new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: blob, transparent: true, opacity: 0.55, depthWrite: false }));
  {
    const g = new THREE.PlaneGeometry(22, 18);
    g.rotateX(-Math.PI / 2);
    g.translate(-0.5, 0.02, 1.6);
    add(g, aoMat, false, false);
    if (model) {
      // the model's own shadow on the floor below the plinth
      const f = new THREE.PlaneGeometry(PLINTH_R * 3, PLINTH_R * 2.4);
      f.rotateX(-Math.PI / 2);
      f.translate(0, -0.72, 0.5);
      add(f, mat(new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: blob, transparent: true, opacity: 0.85, depthWrite: false })), false, false);
    }
  }

  // ── planting: boxwoods along the walls, live oaks, the neighbours ──
  const r = rng(21);
  const leaf = mat(new THREE.MeshStandardMaterial({ color: 0x3c4a2a, roughness: 0.95 }));
  const leafDark = mat(new THREE.MeshStandardMaterial({ color: 0x2c3820, roughness: 0.95 }));
  const bark = mat(new THREE.MeshStandardMaterial({ color: 0x3a2f26, roughness: 1 }));
  // foliage: a lumpy sphere (merged so the bumps stay smooth), reused at every scale
  const bush = (() => {
    const ico = new THREE.IcosahedronGeometry(1, 3);
    ico.deleteAttribute("normal");
    ico.deleteAttribute("uv");
    const g = mergeVertices(ico);
    ico.dispose();
    const p = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = Math.sin(v.x * 5.1 + 1.3) * Math.sin(v.y * 4.3 + 0.7) * Math.sin(v.z * 5.7 + 2.1);
      const m = Math.sin(v.x * 11.7) * Math.sin(v.y * 13.1) * Math.sin(v.z * 12.3);
      v.multiplyScalar(1 + n * 0.16 + m * 0.06);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  })();
  geos.push(bush);
  const shrub = (x: number, z: number, s: number) => {
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(bush, i % 2 ? leaf : leafDark);
      m.position.set(x + (r() - 0.5) * s, s * 0.55, z + (r() - 0.5) * s * 0.5);
      m.scale.set(s * (0.6 + r() * 0.3), s * (0.5 + r() * 0.2), s * (0.55 + r() * 0.3));
      m.castShadow = m.receiveShadow = true;
      group.add(m);
    }
  };
  for (const x of [-5.6, -4.4, -3, -1.6, -0.5]) shrub(x, WING.z1 + 0.6, 0.62);
  for (const z of [5.4, 6.6, 7.6]) shrub(0.55, z, 0.5);
  for (const z of [-3.6, 0.3, 3.4]) shrub(7.6, z, 0.6);

  const oak = (x: number, z: number, s: number) => {
    const trunk = new THREE.CylinderGeometry(0.16 * s, 0.3 * s, 3.2 * s, 9);
    trunk.translate(0, 1.6 * s, 0);
    trunk.rotateZ((r() - 0.5) * 0.18);
    trunk.translate(x, 0, z);
    add(trunk, bark);
    for (let i = 0; i < 34; i++) {
      const m = new THREE.Mesh(bush, r() < 0.55 ? leaf : leafDark);
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * 3.6 * s;
      m.position.set(x + Math.cos(a) * d, (3.4 + r() * 2.2) * s - d * d * 0.07, z + Math.sin(a) * d * 0.85);
      const k = (0.7 + r() * 0.65) * s;
      m.scale.set(k * 1.25, k * 0.8, k * 1.15);
      m.castShadow = m.receiveShadow = true;
      group.add(m);
    }
  };
  if (model) {
    oak(-10, -6, 0.95);
    oak(9.6, -7.4, 0.85);
  } else {
    oak(-13, -3, 1.15);
    oak(14.5, 9.5, 1.05);
    oak(8.5, -10.5, 1.2);
    oak(-19, 9, 0.95);
  }

  // a tree line far behind, mostly fog: depth without a second neighbourhood to model
  if (!model) {
    const treeLine = mat(new THREE.MeshStandardMaterial({ color: 0x2f3a26, roughness: 1 }));
    const n = 110;
    const tl = new THREE.InstancedMesh(bush, treeLine, n);
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (1.08 + (i / n) * 0.84) + (r() - 0.5) * 0.05;
      const d = 70 + r() * 30;
      const k = 2.2 + r() * 2.6;
      m4.compose(
        new THREE.Vector3(Math.cos(a) * d, k * 0.55, Math.sin(a) * d * 0.75 - 4),
        new THREE.Quaternion(),
        new THREE.Vector3(k * 1.3, k * (0.8 + r() * 0.5), k),
      );
      tl.setMatrixAt(i, m4);
    }
    tl.receiveShadow = false;
    group.add(tl);
  }

  return {
    group,
    glow,
    halo,
    porch,
    lawn,
    wetMats: [drive, slab as THREE.MeshStandardMaterial],
    dispose() {
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      texs.forEach((t) => t.dispose());
    },
  };
}
