"use client";

/**
 * The only door to three.js. Nothing imports a 3D module statically: callers run `after3DGate`
 * in an effect, and the `import()` happens inside its callback, so phones, tablets, reduced
 * motion and Save-Data never download a byte of it.
 */
export const DESKTOP_3D_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

const OFF_KEY = "halden-3d-off";
const OFF_EVENT = "halden:3d-off";

export function can3D() {
  if (typeof window === "undefined") return false;
  if (is3DOff()) return false;
  if (!window.matchMedia(DESKTOP_3D_QUERY).matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return false;
  return typeof WebGL2RenderingContext !== "undefined";
}

/**
 * How long the main thread was blocked while this page loaded and hydrated: every long task's time
 * past 50 ms, up to the first gate. A desktop that blocks for over 300 ms just loading the page
 * (~60 ms on a normal one) would hitch through building a scene too, so it keeps the stills and
 * never fetches three.js. Slow graphics with a fast CPU are caught by the scene's own frame check.
 */
const BUSY_LIMIT = 300;
let blocked = 0;
let longTasks: PerformanceObserver | null = null;
const addLong = (l: PerformanceEntryList) => l.forEach((e) => (blocked += Math.max(0, e.duration - 50)));
if (typeof window !== "undefined" && window.matchMedia(DESKTOP_3D_QUERY).matches && PerformanceObserver?.supportedEntryTypes?.includes("longtask")) {
  longTasks = new PerformanceObserver((l) => addLong(l.getEntries()));
  longTasks.observe({ type: "longtask", buffered: true });
}
function loadBlocked() {
  if (longTasks) {
    addLong(longTasks.takeRecords());
    longTasks.disconnect();
    longTasks = null;
    performance.mark("3d:gate", { detail: { blocked: Math.round(blocked) } });
  }
  return blocked;
}

/**
 * After the page has loaded (and the browser has had a breath), call `yes` on a big screen with a
 * mouse and a CPU that loaded the page without strain, otherwise `no`. Returns a cancel function.
 */
export function after3DGate(yes: () => void, no?: () => void) {
  let cancelled = false;
  let idle = 0;
  const run = () => {
    if (cancelled) return;
    if (!can3D()) return no?.();
    if (loadBlocked() > BUSY_LIMIT) {
      mark3DOff(`busy CPU: ${Math.round(blocked)} ms blocked while loading`);
      return no?.();
    }
    yes();
  };
  const onLoad = () => {
    if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(run, { timeout: 600 });
    else idle = window.setTimeout(run, 120);
  };
  if (document.readyState === "complete") onLoad();
  else window.addEventListener("load", onLoad, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", onLoad);
    if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
    window.clearTimeout(idle);
  };
}

function is3DOff() {
  try {
    return sessionStorage.getItem(OFF_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * This computer can't hold a smooth scene (no real GPU, or under ~45 fps in a scene's first two
 * seconds): every scene goes back to its still, and the rest of the visit starts on stills.
 */
export function mark3DOff(reason: string) {
  try {
    sessionStorage.setItem(OFF_KEY, "1");
  } catch {}
  window.dispatchEvent(new CustomEvent(OFF_EVENT, { detail: reason }));
}

export function on3DOff(cb: () => void) {
  window.addEventListener(OFF_EVENT, cb);
  return () => window.removeEventListener(OFF_EVENT, cb);
}

/**
 * One scene warms up at a time, each in the browser's idle time, in the order they were queued
 * (the page order: hero first). A task resolves when its scene is compiled and has drawn a frame,
 * so the next build never lands on top of the hero's first seconds.
 */
let queue: Promise<unknown> = Promise.resolve();
const idle = () =>
  new Promise<void>((r) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(() => r(), { timeout: 1500 }) : window.setTimeout(r, 120)));

export function warm3D(task: () => Promise<unknown>) {
  queue = queue.then(idle).then(() => (can3D() ? task() : undefined)).catch(() => {});
}

/** Let the browser breathe between the heavy steps of building a scene. */
export const yieldIdle = () =>
  new Promise<void>((r) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(() => r(), { timeout: 120 }) : window.setTimeout(r, 0)));
