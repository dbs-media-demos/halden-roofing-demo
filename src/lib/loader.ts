"use client";

import { useSyncExternalStore } from "react";

/**
 * The preview's page loader (components/preview/LeadLoader): while it shows, `<html data-loading>`
 * is set (by its inline script, before the first paint) and the homepage's own entrance waits.
 * When it exits, the attribute goes and `loader:done` fires on window. Without a loader (the
 * concept site, a lead without a logo, a reload in the same tab) everything runs at once.
 */
export const LOADER_DONE = "loader:done";

export const loaderShowing = () => typeof document !== "undefined" && document.documentElement.hasAttribute("data-loading");

/** Run `cb` once the loader has gone (now, if there is none). Returns a cancel function. */
export function whenLoaderDone(cb: () => void) {
  if (!loaderShowing()) {
    cb();
    return () => {};
  }
  const on = () => cb();
  window.addEventListener(LOADER_DONE, on, { once: true });
  return () => window.removeEventListener(LOADER_DONE, on);
}

const subscribe = (cb: () => void) => {
  window.addEventListener(LOADER_DONE, cb);
  return () => window.removeEventListener(LOADER_DONE, cb);
};

/** true once no loader covers the page (false on the server). */
export const useLoaderDone = () =>
  useSyncExternalStore(
    subscribe,
    () => !loaderShowing(),
    () => false,
  );
