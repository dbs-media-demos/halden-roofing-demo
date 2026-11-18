"use client";

import { createContext, type ReactNode } from "react";

/**
 * True on /v2, the homepage without 3D (for a slow laptop, or a lead who doesn't want it): every
 * 3D scene further down keeps the still it already shows phones and slow desktops, and nothing
 * fetches three.js. Read by lib/use-house-scene.
 */
export const No3DContext = createContext(false);

export function No3D({ children }: { children: ReactNode }) {
  return <No3DContext.Provider value>{children}</No3DContext.Provider>;
}
