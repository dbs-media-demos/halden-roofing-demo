/**
 * The /v2 hero's storm, in canvas 2D over a plate rendered from the 3D scene without its weather
 * (public/images/3d/hero-plate-*). Hailstones fall in three depths: far ones vanish behind the
 * roofline, the middle ones strike the real roof planes of the plate (a white tick, a bounce down
 * the slope, off the eave), near ones streak past and settle on the lawn and the drive, melting a
 * few seconds later. Rain slants with the wind (the pointer), lightning lights the sky and the
 * headline, and the scroll passes the storm: the hail thins out and stops, the rain eases.
 *
 * No three.js, no WebGL. Paused off screen and in hidden tabs; reduced motion draws one still frame.
 */

/** The plate's size, and the roof in its pixels (top silhouette and eaves, left to right). */
const IW = 2560;
const IH = 1440;
const ROOF_TOP: [number, number][] = [
  [194, 874],
  [604, 588],
  [1040, 696],
  [1660, 624],
  [2232, 826],
];
const ROOF_EAVE: [number, number][] = [
  [194, 880],
  [604, 602],
  [1060, 836],
  [1260, 856],
  [2232, 832],
];
const HOUSE_X0 = 194;
const HOUSE_X1 = 2232;
/** Lawn and drive in front of the house, and the far field. */
const GROUND_NEAR: [number, number] = [1250, 1440];
const GROUND_FAR = 1168;

const at = (line: [number, number][], x: number) => {
  for (let i = 1; i < line.length; i++) {
    const [x0, y0] = line[i - 1];
    const [x1, y1] = line[i];
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return line[line.length - 1][1];
};
/** Which way is down the roof at x: -1 left, 1 right. */
const downhill = (x: number) => {
  for (let i = 1; i < ROOF_TOP.length; i++) if (x <= ROOF_TOP[i][0]) return ROOF_TOP[i][1] > ROOF_TOP[i - 1][1] ? 1 : -1;
  return 1;
};
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

type Stone = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** 0 far, 1 roof, 2 near */
  layer: 0 | 1 | 2;
  /** where it lands next */
  land: number;
  /** 0 falling, 1 bounced, 2 resting */
  state: 0 | 1 | 2;
  bounces: number;
  life: number;
  a: number;
};
type Tick = { x: number; y: number; t: number; big: boolean };
type Drop = { x: number; y: number; len: number; v: number; near: boolean };

export type HailStorm = {
  setProgress: (p: number) => void;
  setPointer: (x: number) => void;
  stop: () => void;
};

type Opts = {
  /** Every strike on the roof (the hit counter). */
  onHit?: () => void;
  /** Lightning, 0 → ~1 (lights the headline and the sky). */
  onFlash?: (f: number) => void;
  still?: boolean;
};

const MAX_STONES = 900;
const MAX_RESTING = 380;

function sprite() {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(16, 14, 0, 16, 16, 16);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.5, "rgba(240,246,252,0.96)");
  grd.addColorStop(0.72, "rgba(214,226,238,0.45)");
  grd.addColorStop(1, "rgba(214,226,238,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 32, 32);
  return c;
}

export function startHailStorm(cv: HTMLCanvasElement, opts: Opts = {}): HailStorm {
  const ctx = cv.getContext("2d", { alpha: true });
  const noop = { setProgress() {}, setPointer() {}, stop() {} };
  if (!ctx) return noop;

  const ice = sprite();
  const stones: Stone[] = [];
  const ticks: Tick[] = [];
  const drops: Drop[] = [];
  let resting = 0;

  let W = 0,
    H = 0,
    s = 1,
    ox = 0,
    oy = 0,
    dpr = 1;
  const resize = () => {
    const r = cv.getBoundingClientRect();
    W = r.width;
    H = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, W > 1700 ? 1.25 : 1.5);
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    // the plate is drawn object-fit: cover, centred
    s = Math.max(W / IW, H / IH);
    ox = (W - IW * s) / 2;
    oy = (H - IH * s) / 2;
  };
  resize();

  let progress = 0;
  let quality = 1;
  let wind = 0.16;
  let windGoal = 0.16;
  let time = 0;
  let flash = 0;
  let nextBolt = 1.3;
  let bolt = -1;
  const spawnAcc = [0, 0, 0];

  for (let i = 0; i < 280; i++) {
    const near = i % 3 === 0;
    drops.push({ x: rnd(-200, IW + 200), y: rnd(-200, IH), len: near ? rnd(130, 210) : rnd(70, 120), v: near ? rnd(4200, 5200) : rnd(3000, 3800), near });
  }

  const spawn = (layer: 0 | 1 | 2) => {
    if (stones.length >= MAX_STONES) return;
    let x = rnd(-150, IW + 150);
    if (layer === 1) x = rnd(HOUSE_X0 + 40, HOUSE_X1 - 30);
    const top = layer === 1 ? at(ROOF_TOP, x) : 0;
    const land =
      layer === 0
        ? x > HOUSE_X0 && x < HOUSE_X1
          ? at(ROOF_TOP, x)
          : rnd(GROUND_FAR - 20, GROUND_FAR + 30)
        : layer === 1
          ? top + Math.random() ** 1.4 * (at(ROOF_EAVE, x) - top)
          : rnd(...GROUND_NEAR);
    const v = layer === 0 ? rnd(1300, 1600) : layer === 1 ? rnd(1900, 2300) : rnd(2500, 3100);
    stones.push({
      x,
      y: rnd(-120, -20),
      vx: 0,
      vy: v,
      r: layer === 0 ? rnd(2.4, 3.4) : layer === 1 ? rnd(3.6, 5) : rnd(5, 7.5),
      layer,
      land,
      state: 0,
      bounces: 0,
      life: 0,
      a: layer === 0 ? 0.55 : layer === 1 ? 0.92 : 1,
    });
  };

  const rest = (st: Stone) => {
    st.state = 2;
    st.vx = st.vy = 0;
    st.life = rnd(5, 9);
    resting++;
    if (resting > MAX_RESTING) {
      // too many on the ground: the oldest melts now
      const old = stones.find((o) => o.state === 2 && o.life > 0.4);
      if (old) old.life = 0.4;
    }
  };

  const step = (dt: number) => {
    time += dt;
    wind += (windGoal - wind) * Math.min(1, dt * 1.5);
    const intro = Math.min(1, time / 0.5);
    const storm = Math.max(0, 1 - progress * 1.7) * intro;
    const rates = [70, 95, 32];
    for (const l of [0, 1, 2] as const) {
      spawnAcc[l] += rates[l] * storm * quality * dt;
      while (spawnAcc[l] >= 1) {
        spawnAcc[l] -= 1;
        spawn(l);
      }
    }

    for (let i = stones.length - 1; i >= 0; i--) {
      const st = stones[i];
      if (st.state === 2) {
        st.life -= dt * (1 + progress * 3); // melts faster once the storm has passed
        if (st.life <= 0) {
          stones.splice(i, 1);
          resting--;
        }
        continue;
      }
      if (st.state === 0) {
        st.vx = wind * st.vy * 0.22;
      } else {
        st.vy += 5200 * dt;
      }
      st.x += st.vx * dt;
      st.y += st.vy * dt;
      if (st.y < st.land || st.vy < 0) continue;

      if (st.layer === 0) {
        stones.splice(i, 1);
        continue;
      }
      if (st.layer === 1 && st.state === 0) {
        // a strike on the roof: a tick, then a bounce down the slope and off the eave
        ticks.push({ x: st.x, y: st.land, t: 0, big: true });
        opts.onHit?.();
        st.state = 1;
        st.vy = -st.vy * rnd(0.22, 0.38);
        st.vx = downhill(st.x) * rnd(160, 420);
        st.land = rnd(GROUND_NEAR[0], GROUND_NEAR[0] + 70);
        continue;
      }
      // the ground: a hop or two, then it settles
      if (st.bounces < (st.layer === 2 ? 2 : 1)) {
        if (st.bounces === 0 && st.layer === 2) ticks.push({ x: st.x, y: st.land, t: 0, big: false });
        st.bounces++;
        st.state = 1;
        st.y = st.land;
        st.vy = -Math.abs(st.vy) * rnd(0.18, 0.3);
        st.vx = st.vx * 0.5 + rnd(-140, 140);
        continue;
      }
      st.y = st.land;
      rest(st);
    }

    for (let i = ticks.length - 1; i >= 0; i--) {
      ticks[i].t += dt;
      if (ticks[i].t > 0.32) ticks.splice(i, 1);
    }

    const rain = Math.max(0.25, 1 - progress * 1.2) * intro;
    for (const d of drops) {
      d.y += d.v * dt;
      d.x += wind * d.v * 0.3 * dt;
      if (d.y > IH + 100 || d.x > IW + 300 || d.x < -300) {
        d.y = rnd(-260, -40);
        d.x = rnd(-300, IW + 100);
      }
    }

    // lightning: a strike, a flicker and a second, weaker one
    if (progress < 0.45) {
      nextBolt -= dt;
      if (nextBolt <= 0) {
        bolt = 0;
        nextBolt = rnd(5, 9.5);
      }
    }
    if (bolt >= 0) {
      bolt += dt;
      const b = bolt;
      flash =
        b < 0.05 ? b / 0.05 : b < 0.14 ? 1 - ((b - 0.05) / 0.09) * 0.8 : b < 0.2 ? 0.2 + ((b - 0.14) / 0.06) * 0.65 : 0.85 * Math.exp(-(b - 0.2) * 5.5);
      if (b > 1.4) {
        bolt = -1;
        flash = 0;
      }
      opts.onFlash?.(flash);
    }
    return rain;
  };

  const draw = (rain: number) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const X = (x: number) => ox + x * s;
    const Y = (y: number) => oy + y * s;

    // rain: two depths, one stroke each
    ctx.lineCap = "round";
    for (const near of [false, true]) {
      ctx.beginPath();
      for (let i = 0; i < drops.length * quality; i++) {
        const d = drops[i];
        if (d.near !== near) continue;
        const dx = wind * 0.3 * d.len;
        ctx.moveTo(X(d.x), Y(d.y));
        ctx.lineTo(X(d.x - dx), Y(d.y - d.len));
      }
      ctx.strokeStyle = near ? `rgba(214,226,238,${0.34 * rain})` : `rgba(196,210,224,${0.22 * rain})`;
      ctx.lineWidth = near ? 1.15 : 0.75;
      ctx.stroke();
    }

    // hail
    for (const st of stones) {
      const r = st.r * s * 1.25;
      let a = st.a;
      if (st.state === 2) a *= Math.min(1, st.life / 2) * 0.9;
      ctx.globalAlpha = a;
      const cx = X(st.x);
      const cy = Y(st.y);
      if (st.state === 0) {
        // a streak as long as the stone is fast
        const len = r * 2 + st.vy * s * (st.layer === 2 ? 0.011 : 0.007);
        // the wind only slants it a few degrees: drawn upright, the trail offset by the drift
        ctx.drawImage(ice, cx - r - st.vx * s * 0.004, cy - len + r, r * 2, len);
      } else {
        ctx.drawImage(ice, cx - r, cy - r * (st.state === 2 ? 0.8 : 1), r * 2, r * (st.state === 2 ? 1.6 : 2));
      }
    }
    ctx.globalAlpha = 1;

    // strikes: a quick white tick on the shingles
    ctx.lineWidth = 1.4;
    for (const t of ticks) {
      const k = t.t / 0.32;
      const rr = (t.big ? 9 : 6) * s * (0.5 + k * 1.6);
      ctx.strokeStyle = `rgba(240,246,252,${(1 - k) * (t.big ? 0.8 : 0.45)})`;
      ctx.beginPath();
      ctx.ellipse(X(t.x), Y(t.y), rr, rr * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
      if (t.big && k < 0.35) {
        // the strike itself: a pin of white light on the shingle
        ctx.fillStyle = `rgba(255,255,255,${0.9 * (1 - k / 0.35)})`;
        ctx.fillRect(X(t.x) - 1.2, Y(t.y) - 1.2, 2.4, 2.4);
      }
    }
  };

  // reduced motion: one frame of the storm, held
  if (opts.still) {
    progress = 0;
    for (let t = 0; t < 4; t += 1 / 30) step(1 / 30);
    flash = 0;
    opts.onFlash?.(0);
    draw(1);
    const ro = new ResizeObserver(() => {
      resize();
      draw(1);
    });
    ro.observe(cv);
    return { setProgress() {}, setPointer() {}, stop: () => ro.disconnect() };
  }

  // a second of storm already falling, so the first frame isn't empty
  for (let t = 0; t < 1.1; t += 1 / 30) step(1 / 30);
  time = 0.5;
  nextBolt = 1.2;

  let raf = 0;
  let last = 0;
  let onScreen = true;
  let work = 0;
  let frames = 0;
  const frame = (now: number) => {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    const t = performance.now();
    draw(step(dt));
    // a slow computer gets a lighter storm (fewer stones and drops) rather than a stutter
    work += (performance.now() - t - work) * 0.1;
    if (++frames > 30 && quality > 0.45 && work > 4) {
      quality = Math.max(0.45, quality - 0.15);
      frames = 0;
    }
    schedule();
  };
  const schedule = () => {
    if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const halt = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
  };
  const io = new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    if (onScreen) schedule();
    else halt();
  });
  io.observe(cv);
  const onVis = () => (document.hidden ? halt() : schedule());
  document.addEventListener("visibilitychange", onVis);
  const ro = new ResizeObserver(resize);
  ro.observe(cv);
  schedule();

  return {
    setProgress(p) {
      progress = p;
    },
    setPointer(x) {
      windGoal = 0.16 + x * 0.22;
    },
    stop() {
      halt();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      opts.onFlash?.(0);
    },
  };
}
