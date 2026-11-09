"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { isPhone } from "@/lib/gsap";
import { after3DGate, can3D, mark3DOff, on3DOff, warm3D, yieldIdle } from "@/lib/three-gate";
import type { HouseScene, Mode } from "@/components/fx/roof3d/HouseScene";
import type { MaterialId } from "@/content/materials";

type Setup = {
  mode: Mode;
  canvas: RefObject<HTMLCanvasElement | null>;
  /** The element whose visibility starts and stops the loop. */
  host: RefObject<HTMLElement | null>;
  /** Read when the build starts (the latest step or roof). */
  init?: () => { step?: number; roof?: { kind: MaterialId; hex: string } };
  onFlash?: (f: number) => void;
  /** Wire the scene up once it is ready; returns the undo. */
  attach?: (h: HouseScene) => () => void;
  /** Hold the warm-up queue until this scene's first two seconds are timed (the hero). */
  holdQueue?: boolean;
};

const FADE_MS = 1500;

/**
 * A desktop 3D scene that never stutters on the way in. The still underneath stays until the scene
 * is built, compiled and has drawn a hidden frame; scenes are warmed one by one in idle time after
 * load (page order), not when the visitor reaches them. No real GPU, or a slow first two seconds,
 * fades back to the still, frees the GPU and keeps every scene on its still for the visit.
 * three.js is only fetched inside the gate.
 */
export function useHouseScene({ mode, canvas, host, init, onFlash, attach, holdQueue }: Setup) {
  const scene = useRef<HouseScene | null>(null);
  const [live, setLive] = useState(false);
  const cb = useRef({ init, onFlash, attach });
  useEffect(() => {
    cb.current = { init, onFlash, attach };
  });

  useEffect(() => {
    if (isPhone()) return;
    let house: HouseScene | null = null;
    let disposed = false;
    let detach = () => {};
    let fade = 0;
    let leaving: HouseScene | null = null;

    // back to the still: stop drawing now, fade the canvas out, then free the GPU
    const toStill = () => {
      const h = house;
      if (!h) return;
      house = null;
      scene.current = null;
      h.setVisible(false);
      detach();
      detach = () => {};
      setLive(false);
      leaving = h;
      fade = window.setTimeout(() => {
        leaving = null;
        h.dispose();
      }, FADE_MS);
    };
    const offOff = on3DOff(toStill);

    const cancel = after3DGate(() =>
      warm3D(async () => {
        const { createHouseScene, NoGpuError } = await import("@/components/fx/roof3d/HouseScene");
        const cv = canvas.current;
        const el = host.current;
        if (disposed || !cv || !el) return;
        let h: HouseScene;
        try {
          h = await createHouseScene(cv, {
            mode,
            ...cb.current.init?.(),
            pause: yieldIdle,
            onFlash: (f) => cb.current.onFlash?.(f),
            onSlow: (fps, worst, work) => mark3DOff(`${mode}: ${Math.round(fps)} fps, worst frame ${Math.round(worst)} ms, ${work.toFixed(1)} ms work`),
          });
        } catch (e) {
          if (e instanceof NoGpuError) mark3DOff(e.message);
          return; // the still stays
        }
        if (disposed || !can3D()) return h.dispose(); // gone, or another scene found this computer too slow meanwhile
        house = h;
        scene.current = h;
        const io = new IntersectionObserver(([en]) => h.setVisible(en.isIntersecting));
        const ro = new ResizeObserver(() => h.resize());
        io.observe(el);
        ro.observe(cv);
        const undo = cb.current.attach?.(h);
        detach = () => {
          io.disconnect();
          ro.disconnect();
          undo?.();
        };
        setLive(true);
        if (holdQueue) await Promise.race([h.probed, new Promise((r) => setTimeout(r, PROBE_WAIT))]);
      }),
    );

    return () => {
      disposed = true;
      cancel();
      offOff();
      detach();
      window.clearTimeout(fade);
      scene.current = null;
      house?.dispose();
      leaving?.dispose();
    };
  }, [mode, canvas, host, holdQueue]);

  return { scene, live };
}

/** The hero's two timed seconds plus its fade-in, at most: then the next scene may warm up. */
const PROBE_WAIT = 2600;
