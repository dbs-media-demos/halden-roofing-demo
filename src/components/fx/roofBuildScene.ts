import { ScrollTrigger, isCoarse, loadGsap, prefersReducedMotion } from "@/lib/gsap";

/** Architectural shingle tones (dark slate, slight blend like real laminated shingles). */
const TONES = ["#2c3238", "#33393f", "#393f46", "#2f353b", "#363c43", "#2a2f35"];

type Tab = { x: number; w: number; k: number; t: number; tone: string; seed: number };

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const easeOut = (n: number) => 1 - Math.pow(1 - n, 3);
const hash = (a: number, b: number) => {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/**
 * A long, low Texas hip roof that installs itself as it scrolls past:
 * the outline is drawn, chalk lines snap across the decking, shingles drop in
 * course by course in a diagonal stair-step (the way crews actually lay them),
 * the ridge gets capped and the copper drip edge runs along the eave.
 * Once it's finished, sunlight glints across it and the pointer lifts the
 * shingles near it like a gust of wind.
 * Canvas 2D, paused off-screen, 30 fps on touch devices; reduced motion = the finished roof.
 */
export function startRoofBuild(cv: HTMLCanvasElement, box: HTMLElement, label: HTMLElement | null) {
  const ctx = cv.getContext("2d");
  if (!ctx) return;

  const still = prefersReducedMotion();
  const frameMs = isCoarse() ? 1000 / 30 : 1000 / 60;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let W = 0,
    H = 0,
    h = 0,
    run = 0,
    N = 10,
    cH = 0,
    maxT = 1;
  let tabs: Tab[] = [];

  let target = still ? 1 : 0;
  let p = target;
  let shownCourse = -1;

  // pointer "wind"
  let px = -999,
    py = -999,
    wind = 0,
    windTarget = 0;

  const left = (y: number) => (run * (H - y)) / h; // hip line x at height y

  const measure = () => {
    const r = cv.getBoundingClientRect();
    W = r.width;
    H = r.height;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    h = H - 2;
    run = Math.min(h * 2, W * 0.3); // 6/12 hips where there's room
    N = H < 120 ? 6 : 10;
    cH = h / N;
    const tw = Math.max(20, cH * 2.5);
    tabs = [];
    for (let k = 0; k < N; k++) {
      const off = (k % 2) * tw * 0.5 + hash(k, 3) * tw * 0.3;
      for (let x = -off, i = 0; x < W; x += tw, i++) {
        const cx = x + tw / 2;
        // diagonal stair-step: lower courses and left side first
        const t = k * 0.55 + (cx / W) * 2.4;
        tabs.push({ x, w: tw, k, t, tone: TONES[Math.floor(hash(k, i) * TONES.length)], seed: hash(i, k) * 6.28 });
      }
    }
    maxT = (N - 1) * 0.55 + 2.4;
  };

  const roofPath = () => {
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(run, H - h);
    ctx.lineTo(W - run, H - h);
    ctx.lineTo(W, H);
    ctx.closePath();
  };

  const draw = (time: number) => {
    ctx.clearRect(0, 0, W, H);
    const outline = clamp(p / 0.12);
    const chalk = clamp((p - 0.06) / 0.12);
    const lay = clamp((p - 0.14) / 0.72);
    const cap = clamp((p - 0.86) / 0.08);
    const drip = clamp((p - 0.92) / 0.08);

    // decking / underlayment
    ctx.save();
    roofPath();
    ctx.clip();
    ctx.globalAlpha = 0.55 * outline;
    ctx.fillStyle = "#e3dccf";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    // chalk lines snapped for each course
    if (chalk > 0) {
      ctx.strokeStyle = "rgba(196,113,60,.55)";
      ctx.lineWidth = 1;
      for (let k = 1; k < N; k++) {
        const c = easeOut(clamp(chalk * 1.6 - (k / N) * 0.6));
        if (c <= 0) continue;
        const y = H - k * cH;
        const x0 = left(y);
        ctx.beginPath();
        ctx.moveTo(x0, y + 0.5);
        ctx.lineTo(x0 + (W - 2 * x0) * c, y + 0.5);
        ctx.stroke();
      }
    }

    // shingles
    const head = lay * (maxT + 0.5);
    const gap = Math.max(1, cH * 0.07);
    for (const s of tabs) {
      const a = clamp((head - s.t) / 0.5);
      if (a <= 0) continue;
      const e = easeOut(a);
      const yb = H - s.k * cH;
      let dy = -(1 - e) * cH * 1.6;
      let lift = 0;
      if (wind > 0.001 && a >= 1) {
        const dx = s.x + s.w / 2 - px;
        const dyp = yb - cH / 2 - py;
        const near = clamp(1 - Math.sqrt(dx * dx + dyp * dyp) / (cH * 7));
        if (near > 0) lift = near * near * wind * (0.7 + 0.3 * Math.sin(time * 0.022 + s.seed)) * cH * 0.45;
      }
      dy -= lift;
      ctx.globalAlpha = Math.min(1, a * 2.2);
      if (lift > 0.3) {
        // dark gap under a lifted tab
        ctx.fillStyle = "#14191f";
        ctx.fillRect(s.x, yb - lift - 1, s.w - gap, lift + 1);
      }
      ctx.fillStyle = s.tone;
      ctx.fillRect(s.x, yb - cH + dy, s.w, cH + 0.6);
      // keyway between tabs + butt edge shadow of each course
      ctx.fillStyle = "rgba(0,0,0,.42)";
      ctx.fillRect(s.x, yb - cH + dy, gap, cH);
      ctx.fillRect(s.x, yb - Math.max(1.2, cH * 0.1) + dy, s.w, Math.max(1.2, cH * 0.1));
      // granule highlight on the top of the exposure
      ctx.fillStyle = "rgba(255,255,255,.05)";
      ctx.fillRect(s.x, yb - cH + dy, s.w, 1);
      // nail-gun flash on the tabs landing right now
      if (a < 0.6) {
        ctx.globalAlpha = (0.6 - a) / 0.6;
        ctx.fillStyle = "#d98a52";
        ctx.beginPath();
        ctx.arc(s.x + s.w * 0.25, yb - cH * 0.62, Math.max(1.4, cH * 0.1), 0, Math.PI * 2);
        ctx.arc(s.x + s.w * 0.75, yb - cH * 0.62, Math.max(1.4, cH * 0.1), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // sunlight passing over the finished roof
    if (!still && p > 0.97) {
      const cycle = 7000;
      const g = ((time % cycle) / cycle) * 1.9 - 0.45; // -0.45 → 1.45, then rests off-roof
      const gx = g * W;
      const band = Math.max(120, W * 0.14);
      const grad = ctx.createLinearGradient(gx - band, 0, gx + band, H);
      grad.addColorStop(0, "rgba(255,236,214,0)");
      grad.addColorStop(0.5, "rgba(255,236,214,.16)");
      grad.addColorStop(1, "rgba(255,236,214,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();

    // ridge + hip caps
    if (cap > 0) {
      const ce = easeOut(cap);
      ctx.strokeStyle = "#1f252b";
      ctx.lineCap = "round";
      ctx.lineWidth = Math.max(3, cH * 0.32);
      ctx.beginPath();
      ctx.moveTo(1, H - 1);
      ctx.lineTo(1 + (run - 1) * ce, H - 1 - (h - 1) * ce);
      ctx.moveTo(W - 1, H - 1);
      ctx.lineTo(W - 1 - (run - 1) * ce, H - 1 - (h - 1) * ce);
      if (cap > 0.5) {
        const r = easeOut(clamp(cap * 2 - 1));
        const mid = W / 2;
        const half = (W / 2 - run) * r;
        ctx.moveTo(mid - half, H - h + 1);
        ctx.lineTo(mid + half, H - h + 1);
      }
      ctx.stroke();
    }

    // blueprint outline
    if (outline > 0 && outline < 1) {
      const len = 2 * Math.hypot(run, h) + (W - 2 * run);
      ctx.setLineDash([len * outline, len]);
      ctx.strokeStyle = "rgba(14,22,32,.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(run, H - h);
      ctx.lineTo(W - run, H - h);
      ctx.lineTo(W, H);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // copper drip edge along the eave
    if (drip > 0) {
      ctx.fillStyle = "#c4713c";
      ctx.fillRect(0, H - 2, W * easeOut(drip), 2);
    }

    // course counter
    const course = p >= 0.995 ? N + 1 : Math.min(N, Math.floor(lay * N + (lay > 0 ? 1 : 0)));
    if (course !== shownCourse && label) {
      shownCourse = course;
      label.textContent =
        course > N ? "Ridge capped · dried in ✓" : `Course ${String(Math.max(course, 0)).padStart(2, "0")}/${String(N).padStart(2, "0")}`;
    }
  };

  if (still) {
    const ro = new ResizeObserver(() => {
      measure();
      draw(0);
    });
    ro.observe(cv);
    return () => ro.disconnect();
  }

  let raf = 0;
  let last = 0;
  let visible = false;
  const loop = (t: number) => {
    raf = requestAnimationFrame(loop);
    if (t - last < frameMs - 1) return;
    last = t;
    p += (target - p) * 0.14;
    if (Math.abs(target - p) < 0.0005) p = target;
    wind += (windTarget - wind) * 0.08;
    windTarget *= 0.96; // gusts die down
    draw(t);
  };
  const runLoop = () => {
    if (!raf && visible && W) raf = requestAnimationFrame(loop);
  };

  const ro = new ResizeObserver(() => {
    measure();
    draw(performance.now());
  });
  ro.observe(cv);

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) runLoop();
    else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  });
  io.observe(cv);

  let st: { kill: () => void } | undefined;
  let dead = false;
  loadGsap().then(() => {
    if (dead) return;
    const trigger = ScrollTrigger.create({
      trigger: box,
      start: "top 92%",
      end: "bottom 42%",
      onUpdate: (self) => {
        target = self.progress;
      },
    });
    st = trigger;
    target = p = trigger.progress;
  });

  const move = (e: PointerEvent) => {
    const r = cv.getBoundingClientRect();
    px = e.clientX - r.left;
    py = e.clientY - r.top;
    windTarget = 1;
  };
  const leave = () => {
    windTarget = 0;
  };
  cv.addEventListener("pointermove", move);
  cv.addEventListener("pointerdown", move);
  cv.addEventListener("pointerleave", leave);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    dead = true;
    st?.kill();
    cv.removeEventListener("pointermove", move);
    cv.removeEventListener("pointerdown", move);
    cv.removeEventListener("pointerleave", leave);
  };
}
