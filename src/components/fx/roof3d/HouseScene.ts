import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { MaterialId } from "@/content/materials";
import { buildHouse } from "./house";
import { buildCovering, onRoof, type Covering } from "./coverings";
import { buildSky, buildRain, buildHail, buildLightning } from "./weather";
import { grainTexture } from "./textures";
import { rng } from "./geometry";

/**
 * The Halden house in real-time 3D (desktop only, loaded behind lib/three-gate).
 * One scene, three uses:
 * - "hero": a hailstorm at dusk. Hail bounces off wet architectural shingles and gathers on the
 *   lawn, lightning lights the clouds (and, through `onFlash`, the headline). Scroll cranes the
 *   camera up to the shingles; the pointer leans it.
 * - "story": the storm-damage story. Each step sets the weather, the camera and the props: hits
 *   circled on the shingles, the 10×10 test square, tear-off and the new roof course by course,
 *   nails on the drive and the magnet sweeper, golden hour.
 * - "explorer": a clear day; the roof really changes material (shingle, metal, clay, slate) course
 *   by course, swatches recolour it, and the visitor can drag to turn the house.
 * Renders only while on screen, the tab is visible and something is moving.
 */

export type Weather = "storm" | "overcast" | "clear" | "golden";
export type Mode = "hero" | "story" | "explorer";

export type HouseScene = {
  setProgress: (p: number) => void;
  setPointer: (nx: number, ny: number) => void;
  drag: (dx: number) => void;
  setStep: (i: number) => void;
  setRoof: (kind: MaterialId, hex: string) => void;
  setWeather: (w: Weather, instant?: boolean) => void;
  setVisible: (v: boolean) => void;
  resize: () => void;
  /** Run the simulation forward without drawing (stills: let the hail gather first). */
  warm: (seconds: number) => void;
  /** Settle everything and return a PNG of one frame at w×h (for the phone and fallback stills). */
  snapshot: (w: number, h: number, zoom?: number) => string;
  dispose: () => void;
};

type Opts = {
  mode: Mode;
  roof?: { kind: MaterialId; hex: string };
  step?: number;
  onFirstFrame?: () => void;
  onFlash?: (f: number) => void;
};

type Look = {
  top: string;
  horizon: string;
  ground: string;
  fogNear: number;
  fogFar: number;
  sun: string;
  sunI: number;
  sunDir: [number, number, number];
  hemiSky: string;
  hemiGround: string;
  hemiI: number;
  glow: number;
  exposure: number;
  wet: number;
  cloud: number;
  sunGlow: number;
  hail: number;
  rain: number;
  lightning: number;
  lawn: string;
};

const LOOKS: Record<Weather, Look> = {
  storm: {
    top: "#202c33",
    horizon: "#71817d",
    ground: "#2a3030",
    fogNear: 24,
    fogFar: 120,
    sun: "#cfdbe4",
    sunI: 2.2,
    sunDir: [-0.25, 0.62, -0.75],
    hemiSky: "#a9bac4",
    hemiGround: "#3a3a2c",
    hemiI: 1.9,
    glow: 2.1,
    exposure: 1.2,
    wet: 1,
    cloud: 1,
    sunGlow: 0,
    hail: 1,
    rain: 1,
    lightning: 1,
    lawn: "#8f9c80",
  },
  overcast: {
    top: "#3c4a57",
    horizon: "#95a3b0",
    ground: "#3b4144",
    fogNear: 30,
    fogFar: 170,
    sun: "#e3e9ee",
    sunI: 1.5,
    sunDir: [-0.3, 0.9, 0.3],
    hemiSky: "#c7d3dc",
    hemiGround: "#4a4a3a",
    hemiI: 1.6,
    glow: 0.9,
    exposure: 1.05,
    wet: 0.55,
    cloud: 0.75,
    sunGlow: 0,
    hail: 0,
    rain: 0,
    lightning: 0,
    lawn: "#a3ad8e",
  },
  clear: {
    top: "#4f7fa8",
    horizon: "#d3dee4",
    ground: "#5a5a48",
    fogNear: 34,
    fogFar: 150,
    sun: "#fff1dc",
    sunI: 3.1,
    sunDir: [0.55, 0.78, 0.5],
    hemiSky: "#d3e3f0",
    hemiGround: "#6d6650",
    hemiI: 1.15,
    glow: 0,
    exposure: 1,
    wet: 0,
    cloud: 0.25,
    sunGlow: 0.35,
    hail: 0,
    rain: 0,
    lightning: 0,
    lawn: "#c2c69c",
  },
  golden: {
    top: "#33476a",
    horizon: "#eba56c",
    ground: "#4a3a2c",
    fogNear: 34,
    fogFar: 190,
    sun: "#ffb46e",
    sunI: 3.4,
    sunDir: [0.85, 0.2, 0.35],
    hemiSky: "#a8b6cf",
    hemiGround: "#5a4632",
    hemiI: 0.95,
    glow: 1.3,
    exposure: 1.02,
    wet: 0,
    cloud: 0.35,
    sunGlow: 1,
    hail: 0,
    rain: 0,
    lightning: 0,
    lawn: "#b9a77c",
  },
};

type Pose = { pos: THREE.Vector3; target: THREE.Vector3; fov: number };
const P = (pos: [number, number, number], target: [number, number, number], fov: number): Pose => ({
  pos: new THREE.Vector3(...pos),
  target: new THREE.Vector3(...target),
  fov,
});

const HERO_FROM = P([8, 1.0, 24], [-0.5, 4.3, 2], 30);
const HERO_TO = P([6.5, 8.6, 13.5], [2.6, 3.7, 2.2], 30);
const STORY: Pose[] = [
  P([15, 3.2, 27], [-0.6, 2.8, 2.5], 33),
  P([8.5, 9, 15.5], [2.4, 3.5, 3.4], 34),
  P([5.8, 9.8, 15.2], [2.4, 3.6, 3.2], 36),
  P([5.2, 10.4, 12.6], [2.6, 3.6, 3.3], 35),
  P([15, 6.2, 23], [0, 3.2, 2.5], 34),
  P([9, 2.6, 19.5], [2.6, 0.9, 8.5], 36),
  P([16, 3.4, 27], [-0.6, 2.8, 2.5], 33),
];
const EXPLORER = { target: new THREE.Vector3(0, 1.1, 0.5), radius: 42, el: 0.34, az: 0.42, fov: 27 };
const STORY_WEATHER: Weather[] = ["storm", "overcast", "overcast", "overcast", "clear", "clear", "golden"];

const OLD_ROOF = "#5d5850";
const NEW_ROOF = "#353a40";

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt));

export function createHouseScene(canvas: HTMLCanvasElement, opts: Opts): HouseScene {
  const { mode } = opts;
  const studio = mode === "explorer"; // an architect's model on a plinth, in studio light
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: studio, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.debug.checkShaderErrors = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const maxDpr = mode === "hero" ? 1.5 : 1.75;

  const scene = new THREE.Scene();
  if (!studio) scene.fog = new THREE.Fog(0x000000, 30, 160);
  const camera = new THREE.PerspectiveCamera(32, 1.6, 0.1, 420);

  // ── lights ──
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.radius = mode === "hero" ? 7 : 5;
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.03;
  Object.assign(sun.shadow.camera, { left: -17, right: 17, top: 17, bottom: -17, near: 1, far: 90 });
  sun.target.position.set(0, 0, 3);
  scene.add(sun, sun.target);
  const flash = new THREE.DirectionalLight(0xdfe9ff, 0);
  flash.target.position.set(0, 0, 3);
  scene.add(flash, flash.target);

  // ── world ──
  const sky = buildSky();
  if (!studio) scene.add(sky.mesh);
  const house = buildHouse({ model: studio });
  scene.add(house.group);
  const grain = grainTexture();
  grain.repeat.set(1, 1);

  const weathered = mode === "story";
  // the storm hero gets a lighter "pewter" shingle so the courses and the hail read in the dark
  let base: Covering = buildCovering(opts.roof?.kind ?? "shingle", opts.roof?.hex ?? (weathered ? OLD_ROOF : "#6b6f73"), grain, 1);
  let incoming: Covering | null = null;
  scene.add(base.group);
  let install = { t: 1, dur: 2.4, running: false };

  const rain = mode === "explorer" ? null : buildRain();
  if (rain) scene.add(rain.mesh);
  const hail = mode === "explorer" ? null : buildHail(mode === "hero" ? 1800 : 1400);
  if (hail) scene.add(hail.mesh);
  const lightning = buildLightning(mode === "hero" ? 1.6 : 0.8);

  // ── story props ──
  const props = mode === "story" ? buildStoryProps(scene) : null;
  let storyNew: Covering | null = null;
  let storyInstall = 0; // 0 = old roof, 1 = new roof
  let storyInstallTarget = 0;
  if (mode === "story") {
    storyNew = buildCovering("shingle", NEW_ROOF, grain, 2);
    const done = (opts.step ?? 0) >= 4; // arriving mid-story: the right roof is already on
    storyInstall = storyInstallTarget = done ? 1 : 0;
    storyNew.uniforms.uFront.value = done ? 2 : -0.2;
    base.uniforms.uCut.value = done ? 2 : -1;
    scene.add(storyNew.group);
  }

  // ── look (weather) state ──
  const cur = {
    top: new THREE.Color(),
    horizon: new THREE.Color(),
    ground: new THREE.Color(),
    sun: new THREE.Color(),
    hemiSky: new THREE.Color(),
    hemiGround: new THREE.Color(),
    lawn: new THREE.Color(),
    sunDir: new THREE.Vector3(),
    n: {} as Record<string, number>,
  };
  const NUM = ["fogNear", "fogFar", "sunI", "hemiI", "glow", "exposure", "wet", "cloud", "sunGlow", "hail", "rain", "lightning"] as const;
  let from = structuredClone(LOOKS.clear);
  let to = LOOKS.clear;
  let blend = 1;
  const tmp = new THREE.Color();
  const tmp2 = new THREE.Color();
  const lerpLook = (k: number) => {
    const cols = ["top", "horizon", "ground", "sun", "hemiSky", "hemiGround", "lawn"] as const;
    for (const c of cols) cur[c].copy(tmp.set(from[c])).lerp(tmp2.set(to[c]), k);
    cur.sunDir.set(...from.sunDir).lerp(new THREE.Vector3(...to.sunDir), k).normalize();
    for (const n of NUM) cur.n[n] = from[n] + (to[n] - from[n]) * k;
  };
  const snapshotLook = (): Look => ({
    top: "#" + cur.top.getHexString(),
    horizon: "#" + cur.horizon.getHexString(),
    ground: "#" + cur.ground.getHexString(),
    sun: "#" + cur.sun.getHexString(),
    hemiSky: "#" + cur.hemiSky.getHexString(),
    hemiGround: "#" + cur.hemiGround.getHexString(),
    lawn: "#" + cur.lawn.getHexString(),
    sunDir: [cur.sunDir.x, cur.sunDir.y, cur.sunDir.z],
    ...(Object.fromEntries(NUM.map((n) => [n, cur.n[n]])) as Pick<Look, (typeof NUM)[number]>),
  });

  const initial: Weather = mode === "explorer" ? "clear" : mode === "hero" ? "storm" : STORY_WEATHER[opts.step ?? 0];
  from = structuredClone(LOOKS[initial]);
  to = LOOKS[initial];
  lerpLook(1);

  let flashF = 0;
  const applyLook = () => {
    const n = cur.n;
    const u = sky.uniforms;
    u.uTop.value.copy(cur.top);
    u.uHorizon.value.copy(cur.horizon);
    u.uGround.value.copy(cur.ground);
    u.uSunDir.value.copy(cur.sunDir);
    u.uSunColor.value.copy(cur.sun);
    u.uSunGlow.value = n.sunGlow;
    u.uCloud.value = n.cloud;
    u.uFlash.value = flashF;
    u.uFlashDir.value.copy(lightning.dir.lengthSq() ? lightning.dir : u.uFlashDir.value);
    const fog = scene.fog as THREE.Fog | null;
    if (fog) {
      fog.color.copy(cur.horizon).lerp(cur.top, 0.25);
      fog.near = n.fogNear;
      fog.far = n.fogFar;
    }
    sun.color.copy(cur.sun);
    sun.intensity = n.sunI;
    sun.position.copy(cur.sunDir).multiplyScalar(45).add(sun.target.position);
    hemi.color.copy(cur.hemiSky);
    hemi.groundColor.copy(cur.hemiGround);
    hemi.intensity = n.hemiI;
    house.glow.forEach((m) => (m.emissiveIntensity = 0.22 + n.glow));
    house.halo.opacity = Math.min(1, n.glow * 0.5);
    house.porch.intensity = n.glow * 5;
    house.lawn.color.copy(cur.lawn);
    for (const c of [base, incoming, storyNew]) if (c && c.kind !== "metal") c.material.roughness = c.dryRoughness * (1 - 0.5 * n.wet);
    for (const m of house.wetMats) {
      m.roughness = 0.85 - 0.45 * n.wet;
      m.color.setScalar(1 - 0.45 * n.wet); // wet concrete goes dark
    }
    renderer.toneMappingExposure = n.exposure + flashF * 0.22;
    flash.intensity = flashF * 7;
    flash.position.copy(lightning.dir).multiplyScalar(40).setY(30).add(flash.target.position);
    if (rain) rain.uniforms.uAmount.value = n.rain;
  };
  applyLook();

  // Metal, glazed clay and slate need something to reflect: the model gets a soft studio.
  let env: THREE.WebGLRenderTarget | null = null;
  if (studio) {
    const pm = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    env = pm.fromScene(room, 0.04);
    room.dispose();
    pm.dispose();
    scene.environment = env.texture;
    scene.environmentIntensity = 0.55;
    const rim = new THREE.DirectionalLight(0xbcd2ff, 1.4);
    rim.position.set(-30, 18, -26);
    scene.add(rim);
  }

  // ── camera state ──
  let progress = 0;
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  const orbit = { az: EXPLORER.az, taz: EXPLORER.az };
  const pose = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 32 };
  const poseFrom = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 32 };
  let poseT = 1;
  let step = opts.step ?? 0;

  const goalPose = (): Pose => {
    if (mode === "hero") {
      const k = ease(progress);
      return { pos: HERO_FROM.pos.clone().lerp(HERO_TO.pos, k), target: HERO_FROM.target.clone().lerp(HERO_TO.target, k), fov: HERO_FROM.fov + (HERO_TO.fov - HERO_FROM.fov) * k };
    }
    if (mode === "story") return STORY[step];
    const { target, radius, el, fov } = EXPLORER;
    const pos = new THREE.Vector3(Math.sin(orbit.az) * Math.cos(el), Math.sin(el), Math.cos(orbit.az) * Math.cos(el)).multiplyScalar(radius).add(target);
    return { pos, target: target.clone(), fov };
  };
  const g0 = goalPose();
  pose.pos.copy(g0.pos);
  pose.target.copy(g0.target);
  pose.fov = g0.fov;

  const offset = new THREE.Vector3();
  const placeCamera = () => {
    offset.copy(pose.pos).sub(pose.target);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -ptr.x * (mode === "explorer" ? 0.05 : 0.07));
    camera.position.copy(pose.target).add(offset);
    camera.position.y += ptr.y * (mode === "hero" ? 0.7 : 0.4);
    camera.fov = pose.fov;
    camera.updateProjectionMatrix();
    camera.lookAt(pose.target);
  };

  // ── loop ──
  let last = 0;
  let time = 0;
  let raf = 0;
  let visible = true;
  let ready = false;
  let disposed = false;
  let first = true;

  /** Advance everything by dt. Returns true while anything is still moving. */
  const update = (dt: number) => {
    time += dt;
    let busy = false;

    if (blend < 1) {
      blend = Math.min(1, blend + dt / 1.6);
      lerpLook(ease(blend));
      busy = true;
    }
    const f = lightning.update(dt, cur.n.lightning > 0.5);
    if (f > 0.002 || flashF > 0.002) busy = true;
    flashF = f;
    opts.onFlash?.(f);

    if (hail) {
      hail.update(dt, cur.n.hail * (mode === "hero" ? 420 : 340), camera.position);
      if (hail.alive > 0 || cur.n.hail > 0) busy = true;
    }
    if (rain && cur.n.rain > 0.01) {
      rain.uniforms.uTime.value = time;
      busy = true;
    }
    if (cur.n.cloud > 0.5) busy = true; // storm clouds drift
    sky.uniforms.uTime.value = time;

    // roof install (explorer swap)
    if (install.running) {
      install.t = Math.min(1, install.t + dt / install.dur);
      const front = -0.12 + ease(install.t) * 1.3;
      if (incoming) {
        incoming.uniforms.uFront.value = front;
        base.uniforms.uCut.value = front + 0.06;
      }
      if (install.t >= 1) finishInstall();
      busy = true;
    }
    // story: tear-off and new roof follow the step
    if (storyNew && Math.abs(storyInstall - storyInstallTarget) > 0.0005) {
      const dir = Math.sign(storyInstallTarget - storyInstall);
      storyInstall = Math.min(1, Math.max(0, storyInstall + (dir * dt) / 3.2));
      const front = -0.12 + ease(storyInstall) * 1.3;
      storyNew.uniforms.uFront.value = front;
      base.uniforms.uCut.value = storyInstall <= 0 ? -1 : front + 0.06;
      busy = true;
    }
    if (props && props.update(dt, step)) busy = true;

    // camera
    if (poseT < 1) {
      poseT = Math.min(1, poseT + dt / 1.5);
      const g = goalPose();
      const k = ease(poseT);
      pose.pos.copy(poseFrom.pos).lerp(g.pos, k);
      pose.target.copy(poseFrom.target).lerp(g.target, k);
      pose.fov = poseFrom.fov + (g.fov - poseFrom.fov) * k;
      busy = true;
    } else {
      const g = goalPose();
      const kk = 1 - Math.exp(-dt * (mode === "hero" ? 7 : 6));
      const d = pose.pos.distanceToSquared(g.pos) + pose.target.distanceToSquared(g.target);
      pose.pos.lerp(g.pos, kk);
      pose.target.lerp(g.target, kk);
      pose.fov += (g.fov - pose.fov) * kk;
      if (d > 1e-6) busy = true;
    }
    if (mode === "explorer") {
      const before = orbit.az;
      orbit.az = damp(orbit.az, orbit.taz, 5, dt);
      if (Math.abs(orbit.az - before) > 1e-5) busy = true;
    }
    const bx = ptr.x,
      by = ptr.y;
    ptr.x = damp(ptr.x, ptr.tx, 3.2, dt);
    ptr.y = damp(ptr.y, ptr.ty, 3.2, dt);
    if (Math.abs(ptr.x - bx) + Math.abs(ptr.y - by) > 1e-5) busy = true;

    applyLook();
    placeCamera();
    return busy;
  };

  const frame = () => {
    raf = 0;
    if (disposed || !visible || document.hidden || !ready) return;
    const now = performance.now();
    const dt = Math.min((now - (last || now - 16)) / 1000, 1 / 20);
    last = now;
    const busy = update(dt);
    renderer.render(scene, camera);
    if (first) {
      first = false;
      opts.onFirstFrame?.();
    }
    if (busy) raf = requestAnimationFrame(frame);
    else last = 0;
  };
  const invalidate = () => {
    if (raf || disposed || !visible || !ready || document.hidden) return;
    raf = requestAnimationFrame(frame);
  };
  const onVis = () => invalidate();
  document.addEventListener("visibilitychange", onVis);

  function finishInstall() {
    install.running = false;
    install.t = 1;
    if (incoming) {
      scene.remove(base.group);
      base.dispose();
      base = incoming;
      base.uniforms.uFront.value = 2;
      base.uniforms.uCut.value = -1;
      incoming = null;
    }
  }

  const resize = () => {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    invalidate();
  };
  resize();
  placeCamera();

  // Compile shaders off the main thread where the browser allows it, then start.
  renderer
    .compileAsync(scene, camera)
    .catch(() => {})
    .then(() => {
      if (disposed) return;
      ready = true;
      invalidate();
    });

  let seed = 3;
  const api: HouseScene = {
    setProgress(p) {
      progress = Math.min(1, Math.max(0, p));
      invalidate();
    },
    setPointer(nx, ny) {
      ptr.tx = nx;
      ptr.ty = ny;
      invalidate();
    },
    drag(dx) {
      orbit.taz = Math.min(1.0, Math.max(-0.6, orbit.taz - dx * 0.0045));
      invalidate();
    },
    setStep(i) {
      if (mode !== "story" || i === step) return;
      step = i;
      poseFrom.pos.copy(pose.pos);
      poseFrom.target.copy(pose.target);
      poseFrom.fov = pose.fov;
      poseT = 0;
      api.setWeather(STORY_WEATHER[i]);
      storyInstallTarget = i >= 4 ? 1 : 0;
      invalidate();
    },
    setRoof(kind, hex) {
      if (install.running) finishInstall();
      if (base.kind === kind && base.material.userData.hex === hex) return;
      incoming = buildCovering(kind, hex, grain, seed++);
      incoming.material.userData.hex = hex;
      incoming.uniforms.uFront.value = -0.2;
      scene.add(incoming.group);
      install = { t: 0, dur: kind === base.kind ? 1.6 : 2.4, running: true };
      // new materials compile once; the install starts on the next frame either way
      renderer.compileAsync(incoming.group, camera, scene).catch(() => {});
      invalidate();
    },
    setWeather(w, instant) {
      from = snapshotLook();
      to = LOOKS[w];
      blend = instant ? 1 : 0;
      if (instant) lerpLook(1);
      invalidate();
    },
    setVisible(v) {
      visible = v;
      if (v) invalidate();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
      }
    },
    resize,
    warm(seconds) {
      for (let t = 0; t < seconds; t += 1 / 60) update(1 / 60);
    },
    snapshot(w, h, zoom = 1) {
      // settle the camera, the install and the light first
      poseT = 1;
      blend = 1;
      lerpLook(1);
      if (install.running) finishInstall();
      if (storyNew) {
        storyInstall = storyInstallTarget;
        storyNew.uniforms.uFront.value = storyInstall ? 2 : -0.2;
        base.uniforms.uCut.value = storyInstall ? 2 : -1;
      }
      props?.settle(step);
      const g = goalPose();
      pose.pos.copy(g.pos);
      pose.target.copy(g.target);
      pose.fov = g.fov;
      flashF = 0;
      applyLook();
      renderer.setPixelRatio(1);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      placeCamera();
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      const url = canvas.toDataURL("image/png");
      camera.zoom = 1;
      resize();
      return url;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      house.dispose();
      base.dispose();
      incoming?.dispose();
      storyNew?.dispose();
      sky.dispose();
      rain?.dispose();
      hail?.dispose();
      props?.dispose();
      grain.dispose();
      env?.dispose();
      renderer.dispose();
    },
  };
  base.material.userData.hex = opts.roof?.hex;
  return api;
}

// ─────────────────────────── story props ───────────────────────────

/** Hits circled on the shingles, the test square, a ladder, roofing nails and the magnet sweeper. */
function buildStoryProps(scene: THREE.Scene) {
  const group = new THREE.Group();
  scene.add(group);
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const keep = <T extends THREE.BufferGeometry | THREE.Material>(x: T) => {
    if (x instanceof THREE.BufferGeometry) geos.push(x);
    else mats.push(x);
    return x;
  };

  // hits: a copper ring around a bruise where the granules came off
  const ringGeo = keep(new THREE.RingGeometry(0.14, 0.185, 40).rotateX(-Math.PI / 2));
  const dotGeo = keep(new THREE.CircleGeometry(0.06, 20).rotateX(-Math.PI / 2));
  const copper = keep(new THREE.MeshBasicMaterial({ color: 0xe0874a, toneMapped: false }));
  const bruise = keep(new THREE.MeshBasicMaterial({ color: 0x0c0d0f, transparent: true, opacity: 0.7, depthWrite: false }));
  const chalk = keep(new THREE.MeshBasicMaterial({ color: 0xf2eee7, toneMapped: false }));
  const hitsAt: [number, number][] = [
    [9.4, 1.3],
    [10.6, 2.1],
    [11.7, 1.0],
    [12.1, 2.4],
    [9.9, 3.1],
    [11.2, 3.5],
    [8.7, 2.3],
    [10.3, 0.75],
  ];
  const hits = hitsAt.map(([u, v]) => {
    const { pos, quat } = onRoof("front", u, v, 0.07);
    const g = new THREE.Group();
    g.position.copy(pos);
    g.quaternion.copy(quat);
    g.add(new THREE.Mesh(ringGeo, copper), new THREE.Mesh(dotGeo, bruise));
    g.scale.setScalar(0.001);
    group.add(g);
    return g;
  });

  // the 10×10 ft test square, chalked on the slope
  const square = new THREE.Group();
  {
    const S = 3.05,
      w = 0.04;
    const { pos, quat } = onRoof("front", 10.1, 2.0, 0.075);
    square.position.copy(pos);
    square.quaternion.copy(quat);
    const bar = keep(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2));
    for (const [x, z, sx, sz] of [
      [0, -S / 2, S, w],
      [0, S / 2, S, w],
      [-S / 2, 0, w, S],
      [S / 2, 0, w, S],
    ]) {
      // dashed: short pieces along each side
      const n = 9;
      for (let i = 0; i < n; i++) {
        const m = new THREE.Mesh(bar, chalk);
        const t = (i + 0.5) / n - 0.5;
        m.position.set(sx > sz ? t * S : x, 0, sx > sz ? z : t * S);
        m.scale.set(sx > sz ? (S / n) * 0.62 : w, 1, sx > sz ? w : (S / n) * 0.62);
        square.add(m);
      }
    }
    square.scale.setScalar(0.001);
    group.add(square);
  }

  // aluminium ladder against the gutter
  const ladder = new THREE.Group();
  {
    const al = keep(new THREE.MeshStandardMaterial({ color: 0xb8bcc0, roughness: 0.4, metalness: 0.6 }));
    const foot = new THREE.Vector3(6.95, 0, 7.1);
    const top = new THREE.Vector3(6.95, 3.35, 5.1);
    const dir = top.clone().sub(foot);
    const len = dir.length();
    const rail = keep(new THREE.BoxGeometry(0.05, len, 0.08));
    const rung = keep(new THREE.CylinderGeometry(0.018, 0.018, 0.46, 8).rotateZ(Math.PI / 2));
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    for (const dx of [-0.23, 0.23]) {
      const m = new THREE.Mesh(rail, al);
      m.position.copy(foot.clone().lerp(top, 0.5)).add(new THREE.Vector3(dx, 0, 0));
      m.quaternion.copy(q);
      m.castShadow = true;
      ladder.add(m);
    }
    for (let i = 1; i < 12; i++) {
      const m = new THREE.Mesh(rung, al);
      m.position.copy(foot.clone().lerp(top, i / 12));
      m.castShadow = true;
      ladder.add(m);
    }
    group.add(ladder);
  }

  // nails on the drive and the lawn, and the magnet sweeper that collects them
  const NZ0 = 10.1,
    NZ1 = 10.9;
  const r = rng(77);
  const nailGeo = keep(new THREE.CylinderGeometry(0.012, 0.012, 0.11, 6).rotateZ(Math.PI / 2));
  const steel = keep(new THREE.MeshStandardMaterial({ color: 0xd8dde2, roughness: 0.25, metalness: 0.9, emissive: 0x3a3f44 }));
  const N = 140;
  const nails = new THREE.InstancedMesh(nailGeo, steel, N);
  const nailX: number[] = [];
  const nailM: THREE.Matrix4[] = [];
  for (let i = 0; i < N; i++) {
    const x = -6.5 + r() * 14;
    const z = NZ0 + r() * (NZ1 - NZ0);
    const m = new THREE.Matrix4().compose(new THREE.Vector3(x, 0.03, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r() * Math.PI, 0)), new THREE.Vector3(1, 1, 1));
    nailX.push(x);
    nailM.push(m);
    nails.setMatrixAt(i, m);
  }
  nails.frustumCulled = false;
  group.add(nails);
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);

  const sweeper = new THREE.Group();
  {
    const body = keep(new THREE.MeshStandardMaterial({ color: 0xc4713c, roughness: 0.4, metalness: 0.4 }));
    const black = keep(new THREE.MeshStandardMaterial({ color: 0x15181b, roughness: 0.6 }));
    const head = new THREE.Mesh(keep(new THREE.BoxGeometry(0.16, 0.1, 0.95)), body);
    head.position.y = 0.11;
    const wheel = keep(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 18).rotateX(Math.PI / 2));
    const w1 = new THREE.Mesh(wheel, black);
    w1.position.set(0, 0.085, -0.52);
    const w2 = w1.clone();
    w2.position.z = 0.52;
    const handle = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.016, 0.016, 1.35, 8)), black);
    handle.position.set(-0.45, 0.62, 0);
    handle.rotation.z = 0.78;
    const grip = new THREE.Mesh(keep(new THREE.BoxGeometry(0.05, 0.05, 0.42)), black);
    grip.position.set(-0.93, 1.1, 0);
    sweeper.add(head, w1, w2, handle, grip);
    sweeper.traverse((o) => (o.castShadow = true));
    sweeper.position.set(-7.5, 0, (NZ0 + NZ1) / 2);
    sweeper.visible = false;
    group.add(sweeper);
  }

  const appear = (o: THREE.Object3D, on: boolean, dt: number, delay = 0, t = 0) => {
    const goal = on && t >= delay ? 1 : 0.001;
    const s = damp(o.scale.x, goal, on ? 9 : 14, dt);
    o.scale.setScalar(s);
    o.visible = s > 0.01;
    return Math.abs(s - goal) > 0.002;
  };

  let stepTime = 0;
  let lastStep = -1;
  let sweepX = -7.5;
  let swept = -99;

  const setNails = (upTo: number) => {
    for (let i = 0; i < N; i++) nails.setMatrixAt(i, nailX[i] < upTo ? hidden : nailM[i]);
    nails.instanceMatrix.needsUpdate = true;
  };

  return {
    update(dt: number, step: number) {
      if (step !== lastStep) {
        stepTime = 0;
        if (step === 5 && lastStep !== 5) {
          sweepX = -7.5;
          swept = -99;
        }
        if (step < 5) {
          swept = -99;
          setNails(swept);
        }
        lastStep = step;
      }
      stepTime += dt;
      let busy = false;
      hits.forEach((h, i) => {
        if (appear(h, step >= 1 && step <= 3, dt, 0.25 + i * 0.16, stepTime + (step > 1 ? 9 : 0))) busy = true;
      });
      if (appear(square, step === 3, dt, 0.3, stepTime)) busy = true;
      ladder.visible = step <= 4;
      nails.visible = step === 4 || step === 5;
      sweeper.visible = step === 5;
      if (step === 5) {
        // two passes across the yard, then park
        sweepX = Math.min(8.2, sweepX + dt * 4.2);
        sweeper.position.x = sweepX;
        if (sweepX - 0.1 > swept) {
          swept = sweepX - 0.1;
          setNails(swept);
        }
        if (sweepX < 8.2) busy = true;
      }
      return busy;
    },
    /** Jump straight to the end state of a step (for stills). */
    settle(step: number) {
      for (let k = 0; k < 120; k++) this.update(1 / 30, step);
    },
    dispose() {
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      scene.remove(group);
    },
  };
}

