"use client";

import { useCallback, useSyncExternalStore } from "react";

/** A dismissible flag persisted in sessionStorage, readable without effects (SSR-safe). */
const listeners = new Set<() => void>();

const read = (key: string) => {
  try {
    return sessionStorage.getItem(key) === "0";
  } catch {
    return false;
  }
};

export function useDismissed(key: string): [boolean, () => void] {
  const subscribe = useCallback((cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }, []);
  const dismissed = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => false,
  );
  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(key, "0");
    } catch {}
    listeners.forEach((l) => l());
  }, [key]);
  return [dismissed, dismiss];
}
