import * as THREE from "three";
import { roofHeight, topPlane, MAIN, WING, WALL_H, rng } from "./geometry";

/*
 * Sky, rain, hail and lightning.
 * - Sky: a dome with a shader gradient, slow fbm storm clouds, a sun glow and lightning lighting the
 *   clouds from inside.
 * - Rain: line streaks moved entirely in the vertex shader.
 * - Hail: a small CPU simulation. Stones fall with the wind, bounce off the real roof slopes
 *   (restitution, a little spin-off), roll down and off the eaves, and lie on the lawn for a while.
 * - Lightning: a flicker envelope that drives the scene's flash light, the sky and the page.
 */

// ─────────────────────────── sky ───────────────────────────

export type SkyUniforms = {
  uTop: { value: THREE.Color };
  uHorizon: { value: THREE.Color };
  uGround: { value: THREE.Color };
  uSunDir: { value: THREE.Vector3 };
  uSunColor: { value: THREE.Color };
  uSunGlow: { value: number };
  uCloud: { value: number };
  uTime: { value: number };
  uFlash: { value: number };
  uFlashDir: { value: THREE.Vector3 };
};

export function buildSky() {
  const uniforms: SkyUniforms = {
    uTop: { value: new THREE.Color() },
    uHorizon: { value: new THREE.Color() },
    uGround: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uSunColor: { value: new THREE.Color() },
    uSunGlow: { value: 0 },
    uCloud: { value: 0 },
    uTime: { value: 0 },
    uFlash: { value: 0 },
    uFlashDir: { value: new THREE.Vector3(-0.4, 0.5, -0.8).normalize() },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop, uHorizon, uGround, uSunDir, uSunColor, uFlashDir;
      uniform float uSunGlow, uCloud, uTime, uFlash;
      varying vec3 vDir;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
      }
      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
        return v;
      }
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = mix(uHorizon, uTop, smoothstep(0.0, 0.55, h));
        col = mix(uGround, col, smoothstep(-0.08, 0.0, h));
        // clouds on a ceiling: dark undersides, paler breaks, lit from inside by lightning
        vec2 uv = d.xz / (max(h, 0.0) + 0.1) * 0.5 + vec2(uTime * 0.014, uTime * 0.005);
        float n = fbm(uv * 1.1);
        float n2 = fbm(uv * 3.1 + 5.0);
        float cov = smoothstep(0.62 - uCloud * 0.36, 0.86 - uCloud * 0.12, n) * smoothstep(-0.02, 0.1, h);
        vec3 under = col * mix(0.42, 0.85, n2);
        vec3 lit = mix(col, uHorizon, 0.65) * 1.18;
        vec3 cloudCol = mix(under, lit, smoothstep(0.45, 0.85, n2) * 0.55);
        col = mix(col, cloudCol, cov * (0.5 + uCloud * 0.5));
        // sun
        float s = max(dot(d, normalize(uSunDir)), 0.0);
        col += uSunColor * (pow(s, 900.0) * 6.0 + pow(s, 28.0) * 0.35 + pow(s, 5.0) * 0.12) * uSunGlow * (1.0 - cov * 0.7);
        // lightning glows through the clouds around where it struck
        float f = pow(max(dot(d, normalize(uFlashDir)), 0.0), 2.5);
        col += uFlash * vec3(0.72, 0.8, 1.0) * (0.14 + 1.25 * cov * f + 0.45 * f);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const geo = new THREE.SphereGeometry(180, 48, 24);
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;
  return { mesh, uniforms, dispose: () => (geo.dispose(), material.dispose()) };
}

// ─────────────────────────── rain ───────────────────────────

export function buildRain(count = 2600) {
  const r = rng(99);
  const pos = new Float32Array(count * 6);
  const end = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const x = (r() - 0.5) * 40,
      y = r(),
      z = (r() - 0.5) * 34 + 6;
    pos.set([x, y, z, x, y, z], i * 6);
    end[i * 2 + 1] = 1;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aEnd", new THREE.BufferAttribute(end, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 8, 6), 40);
  const uniforms = {
    uTime: { value: 0 },
    uAmount: { value: 0 },
    uColor: { value: new THREE.Color(0xc8d4dc) },
    uWind: { value: new THREE.Vector2(2.2, 1.6) },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      attribute float aEnd;
      uniform float uTime;
      uniform vec2 uWind;
      varying float vA;
      void main() {
        float H = 18.0, fall = 17.0;
        float y = mod(position.y * H - uTime * fall, H);
        vec3 vel = normalize(vec3(uWind.x, -fall, uWind.y));
        vec3 p = vec3(position.x - vel.x * (H - y), y, position.z - vel.z * (H - y));
        p += vel * aEnd * 0.6;
        vA = 1.0 - aEnd * 0.85;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vA *= smoothstep(60.0, 12.0, -mv.z) * smoothstep(1.5, 4.0, -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uAmount;
      varying float vA;
      void main() {
        gl_FragColor = vec4(uColor, vA * uAmount * 0.32);
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.LineSegments(geo, material);
  mesh.frustumCulled = false;
  return { mesh, uniforms, dispose: () => (geo.dispose(), material.dispose()) };
}

// ─────────────────────────── hail ───────────────────────────

type Stone = {
  p: THREE.Vector3;
  v: THREE.Vector3;
  r: number;
  life: number; // seconds left once resting; -1 while flying
  bounces: number;
  alive: boolean;
  shard: boolean;
  q: THREE.Quaternion;
};

const UP = new THREE.Vector3(0, 1, 0);
const insideWalls = (x: number, z: number) =>
  (Math.abs(x) < MAIN.x && Math.abs(z) < MAIN.z) || (x > WING.x0 && x < WING.x1 && z > 0 && z < WING.z1);

export function buildHail(max = 900) {
  const r = rng(42);
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0xf3f7fa, roughness: 0.2, metalness: 0, emissive: 0xb9cad8, emissiveIntensity: 0.6 });
  const mesh = new THREE.InstancedMesh(geo, material, max);
  mesh.frustumCulled = false;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.count = 0;
  const stones: Stone[] = Array.from({ length: max }, () => ({
    p: new THREE.Vector3(),
    v: new THREE.Vector3(),
    r: 0,
    life: -1,
    bounces: 0,
    alive: false,
    shard: false,
    q: new THREE.Quaternion(),
  }));
  const wind = new THREE.Vector3(2.6, 0, 1.4);
  const m = new THREE.Matrix4();
  const s = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const qq = new THREE.Quaternion();
  let acc = 0;
  let cursor = 0;
  /** Spawn area (x0, x1, z0, z1): in front of the camera, over the house. */
  const area = { x0: -15, x1: 14, z0: -6, z1: 17 };

  const take = () => {
    for (let k = 0; k < max; k++) {
      const i = (cursor + k) % max;
      if (!stones[i].alive) {
        cursor = (i + 1) % max;
        return stones[i];
      }
    }
    // pool full: recycle the oldest resting stone
    let best: Stone | null = null;
    for (const st of stones) if (st.life >= 0 && (!best || st.life < best.life)) best = st;
    return best;
  };

  const spawn = (st: Stone, y = 13 + r() * 6) => {
    st.alive = true;
    st.shard = false;
    st.bounces = 0;
    st.life = -1;
    st.r = 0.011 + Math.pow(r(), 2.6) * 0.022;
    if (r() < 0.55) st.p.set(-9 + r() * 18, y, -5 + r() * 14); // over the roof, where it shows
    else st.p.set(area.x0 + r() * (area.x1 - area.x0), y, area.z0 + r() * (area.z1 - area.z0));
    st.p.x -= wind.x * 0.8; // the wind carries it in
    st.p.z -= wind.z * 0.8;
    st.v.set(wind.x + (r() - 0.5) * 1.2, -15 - r() * 6, wind.z + (r() - 0.5) * 1.2);
    st.q.setFromEuler(new THREE.Euler(r() * 6, r() * 6, r() * 6));
  };

  const shards = (p: THREE.Vector3, n: THREE.Vector3) => {
    for (let k = 0; k < 2; k++) {
      const st = take();
      if (!st) return;
      st.alive = true;
      st.shard = true;
      st.bounces = 3;
      st.life = 0.35 + r() * 0.3;
      st.r = 0.007 + r() * 0.006;
      st.p.copy(p);
      st.v.copy(n).multiplyScalar(1.5 + r() * 2).add(new THREE.Vector3((r() - 0.5) * 3, r() * 1.5, (r() - 0.5) * 3));
    }
  };

  let alive = 0;
  return {
    mesh,
    get alive() {
      return alive;
    },
    /** Advance the storm by dt seconds; `rate` is stones per second (0 stops new ones). */
    update(dt: number, rate: number, eye?: THREE.Vector3) {
      acc += rate * dt;
      while (acc >= 1) {
        acc -= 1;
        const st = take();
        if (st) spawn(st);
      }
      let n = 0;
      for (const st of stones) {
        if (!st.alive) continue;
        if (st.life >= 0 && st.bounces >= 99) {
          // resting on the lawn: melt away at the end of its life
          st.life -= dt;
          if (st.life <= 0) {
            st.alive = false;
            continue;
          }
        } else {
          st.v.y -= 9.8 * dt;
          st.p.addScaledVector(st.v, dt);
          if (st.shard) {
            st.life -= dt;
            if (st.life <= 0 || st.p.y < 0) {
              st.alive = false;
              continue;
            }
          } else {
            const h = roofHeight(st.p.x, st.p.z);
            if (h > 0 && st.p.y - st.r < h && st.p.y > h - 0.6) {
              const pl = topPlane(st.p.x, st.p.z);
              const nrm = pl ? pl.n : UP;
              st.p.y = h + st.r;
              const vn = st.v.dot(nrm);
              if (vn < 0) {
                const speed = -vn;
                const e = st.bounces === 0 ? 0.32 + r() * 0.2 : 0.25;
                st.v.addScaledVector(nrm, -(1 + e) * vn);
                st.v.x += (r() - 0.5) * speed * 0.18;
                st.v.z += (r() - 0.5) * speed * 0.18;
                st.v.multiplyScalar(st.bounces === 0 ? 1 : 0.985);
                if (st.bounces === 0 && speed > 7) shards(st.p, nrm);
                st.bounces++;
              }
            } else if (st.p.y < WALL_H && insideWalls(st.p.x, st.p.z)) {
              st.alive = false; // went into the house (hidden): recycle
              continue;
            } else if (st.p.y - st.r < 0) {
              st.p.y = st.r;
              if (Math.abs(st.v.y) < 1.2) {
                st.v.set(0, 0, 0);
                st.bounces = 99;
                st.life = 5 + r() * 5;
              } else {
                st.v.y = -st.v.y * 0.28;
                st.v.x *= 0.5;
                st.v.z *= 0.5;
                st.bounces++;
              }
            }
          }
        }
        // matrix: streak along the velocity while falling, a little stone once it has landed
        let k = st.r;
        if (st.life >= 0 && st.bounces >= 99 && st.life < 1.5) k *= st.life / 1.5;
        if (eye) k *= THREE.MathUtils.smoothstep(st.p.distanceTo(eye), 3, 9); // nothing smears across the lens
        const speed = st.v.length();
        if (!st.shard && st.bounces === 0 && speed > 1) {
          dir.copy(st.v).divideScalar(speed);
          qq.setFromUnitVectors(UP, dir);
          s.set(k * 0.7, k * (1 + speed * 0.12), k * 0.7);
          m.compose(st.p, qq, s);
        } else {
          s.set(k, k, k);
          m.compose(st.p, st.q, s);
        }
        mesh.setMatrixAt(n++, m);
      }
      alive = n;
      mesh.count = n;
      mesh.instanceMatrix.needsUpdate = true;
    },
    clear() {
      stones.forEach((st) => (st.alive = false));
      mesh.count = 0;
      alive = 0;
    },
    dispose() {
      geo.dispose();
      material.dispose();
    },
  };
}

// ─────────────────────────── lightning ───────────────────────────

export function buildLightning(firstAt = 1.4) {
  const r = rng(5);
  let next = firstAt;
  let t = -1;
  const dir = new THREE.Vector3();
  const pulses: [number, number][] = [
    [0, 1],
    [0.1, 0.45],
    [0.23, 0.85],
  ];
  return {
    dir,
    /** Returns the flash strength (0..~1) after advancing dt. */
    update(dt: number, enabled: boolean) {
      if (t >= 0) {
        t += dt;
        if (t > 0.9) t = -1;
      } else if (enabled) {
        next -= dt;
        if (next <= 0) {
          t = 0;
          next = 5 + r() * 5;
          dir.set(-0.9 + r() * 1.4, 0.25 + r() * 0.35, -1).normalize();
          pulses[1][1] = 0.3 + r() * 0.3;
          pulses[2][1] = 0.6 + r() * 0.4;
        }
      }
      if (t < 0) return 0;
      let f = 0;
      for (const [at, a] of pulses) if (t >= at) f += a * Math.exp(-(t - at) / 0.055);
      return Math.min(1.2, f);
    },
    get active() {
      return t >= 0;
    },
  };
}
