"use client";

import { useEffect, useRef, type RefObject } from "react";
import { isCoarse, prefersReducedMotion } from "@/lib/gsap";

type P = { x: number; y: number; vx: number; vy: number; r: number; bounced: number; life: number };

/** Roof outline in the HouseArt viewBox (800 × 470). */
const ROOF: [number, number][] = [
  [120, 298],
  [300, 212],
  [520, 212],
  [700, 298],
];

/**
 * Canvas 2D hail that bounces off the house's roofline.
 * Idle-started, 30 fps on touch devices, paused off-screen or when inactive.
 */
export function HailCanvas({ active, svgRef, className }: { active: boolean; svgRef: RefObject<SVGSVGElement | null>; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv || prefersReducedMotion()) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let visible = false;
    let started = false;
    let last = 0;
    const frameMs = isCoarse() ? 1000 / 30 : 1000 / 60;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0,
      h = 0;
    let roof: [number, number][] = [];
    const parts: P[] = [];

    const measure = () => {
      const r = cv.getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const svg = svgRef.current;
      if (svg) {
        const s = svg.getBoundingClientRect();
        const k = s.width / 800;
        roof = ROOF.map(([x, y]) => [s.left - r.left + x * k, s.top - r.top + y * k]);
      }
    };

    const roofY = (x: number) => {
      for (let i = 0; i < roof.length - 1; i++) {
        const [x0, y0] = roof[i];
        const [x1, y1] = roof[i + 1];
        if (x >= x0 && x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
      }
      return h - 8; // ground
    };

    const spawn = (): P => ({
      x: Math.random() * (w + 120) - 20,
      y: -10 - Math.random() * h * 0.4,
      vx: -1.2 - Math.random() * 1.2,
      vy: 7 + Math.random() * 5,
      r: 1.1 + Math.random() * 1.9,
      bounced: 0,
      life: 1,
    });

    const step = (t: number) => {
      raf = requestAnimationFrame(step);
      if (t - last < frameMs - 1) return;
      const dt = Math.min(2, (t - last) / (1000 / 60));
      last = t;
      ctx.clearRect(0, 0, w, h);
      const on = activeRef.current;
      const target = on ? Math.round(Math.min(160, w / 5)) : 0;
      while (parts.length < target) parts.push(spawn());

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vy += 0.25 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const floor = roofY(p.x);
        if (p.y >= floor && p.vy > 0) {
          p.y = floor;
          p.vy *= -(0.28 + Math.random() * 0.12);
          p.vx = (Math.random() - 0.5) * 4;
          p.bounced++;
        }
        if (p.bounced) p.life -= 0.035 * dt;
        if (p.life <= 0 || p.y > h + 20 || p.x < -40 || p.bounced > 2) {
          if (on && parts.length <= target) parts[i] = spawn();
          else parts.splice(i, 1);
          continue;
        }
        // streak
        ctx.globalAlpha = 0.18 * p.life;
        ctx.strokeStyle = "#e9eef2";
        ctx.lineWidth = p.r * 0.7;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2);
        ctx.stroke();
        // stone
        ctx.globalAlpha = 0.9 * p.life;
        ctx.fillStyle = "#f4f7f9";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!on && parts.length === 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const run = () => {
      if (!raf && visible && started) {
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    };

    const ro = new ResizeObserver(measure);
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) run();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(cv);

    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 600));
    ric(() => {
      started = true;
      measure();
      run();
    });

    const poke = window.setInterval(() => activeRef.current && run(), 400);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(poke);
      ro.disconnect();
      io.disconnect();
    };
  }, [svgRef]);

  return <canvas ref={canvas} aria-hidden className={className} />;
}
