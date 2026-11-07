import { Manrope } from "next/font/google";

/** Body: Manrope — friendly, very legible on phones. */
export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

/**
 * Spec annotations: IBM Plex Mono, desktop only (public/fonts, @font-face in globals.css, preloaded
 * from the root layout for desktop screens). Phones set those labels in Manrope and never fetch it.
 */

/** Display font (Archivo Expanded) is inlined in app/display-font.css — see the note there. */
export const fontVariables = manrope.variable;
