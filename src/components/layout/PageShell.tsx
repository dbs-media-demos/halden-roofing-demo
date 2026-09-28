import { ViewTransition, type ReactNode } from "react";

/** Wraps every page: route changes rise in through a gable-shaped wipe (see globals.css). */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <main id="main" className="relative">
        {children}
      </main>
    </ViewTransition>
  );
}
