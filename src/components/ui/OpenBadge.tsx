"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { openStatus } from "@/lib/biz-core";
import { useBiz } from "@/components/preview/BizContext";

/** Live open/closed badge. Renders a neutral label on the server, then the real status. */
export function OpenBadge({ className }: { className?: string }) {
  const biz = useBiz();
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null);

  useEffect(() => {
    const tick = () => {
      const s = openStatus(biz);
      setStatus(s ? { open: s.open, label: s.text } : null);
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [biz]);

  if (!biz.hours) return null;

  return (
    <span className={clsx("t-eyebrow inline-flex items-center gap-2", className)} aria-live="polite">
      <span
        aria-hidden
        className={clsx(
          "relative inline-block h-2 w-2 rounded-full",
          status?.open ? "bg-[#5fbf7f] pulse-dot" : status ? "bg-copper" : "bg-current opacity-50",
        )}
      />
      <span suppressHydrationWarning>{status?.label ?? biz.hoursSummary}</span>
    </span>
  );
}
