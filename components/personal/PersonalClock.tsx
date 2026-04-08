"use client";

import { useEffect, useState } from "react";

export default function PersonalClock() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const label =
    now === null
      ? "--:--:--"
      : new Date(now).toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });

  return (
    <div className="flex items-center gap-4 lg:flex-col lg:items-end">
      <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 px-3 py-1.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        <span className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-300">
          live
        </span>
      </div>
      <div
        className="font-mono text-3xl font-bold tabular-nums text-ink"
        suppressHydrationWarning
      >
        {label}
      </div>
    </div>
  );
}
