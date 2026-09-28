"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { getOpenStatus, type OpenStatus } from "@/lib/hours";

/** Live open/closed badge. Renders a neutral label on the server, then the real status. */
export function OpenBadge({ className }: { className?: string }) {
  const [status, setStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    const tick = () => setStatus(getOpenStatus());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className={clsx("t-eyebrow inline-flex items-center gap-2", className)} aria-live="polite">
      <span
        aria-hidden
        className={clsx(
          "relative inline-block h-2 w-2 rounded-full",
          status?.open ? "bg-[#5fbf7f] pulse-dot" : status ? "bg-copper" : "bg-current opacity-50",
        )}
      />
      <span suppressHydrationWarning>{status?.label ?? "Mon – Fri 7 am – 6 pm"}</span>
    </span>
  );
}
