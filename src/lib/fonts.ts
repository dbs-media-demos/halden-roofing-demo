import { Manrope, IBM_Plex_Mono } from "next/font/google";

/** Body: Manrope — friendly, very legible on phones. */
export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

/**
 * Spec annotations: IBM Plex Mono. Preloaded (10 KB) + `optional`: a late swap re-wraps
 * long letter-spaced labels on phones and shifts the layout, so we never swap mid-view.
 */
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-plex-mono",
  display: "optional",
});

/** Display font (Archivo Expanded) is inlined in app/display-font.css — see the note there. */
export const fontVariables = `${manrope.variable} ${plexMono.variable}`;
