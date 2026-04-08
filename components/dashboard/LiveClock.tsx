"use client";

import { useEffect, useState } from "react";
import { formatClockKST, formatDateKST } from "@/lib/time";

export function LiveClock() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (now === null) {
    return (
      <div className="flex items-center gap-6 text-ink-muted">
        <span className="text-sm tracking-wide">--</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
        </span>
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
          LIVE
        </span>
      </div>
      <span className="text-lg font-semibold text-ink-muted">
        {formatDateKST(now)}
      </span>
      <span className="font-mono text-4xl font-black tabular-nums tracking-tight text-ink">
        {formatClockKST(now)}
      </span>
    </div>
  );
}
