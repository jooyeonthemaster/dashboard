"use client";

import { useEffect, useRef } from "react";
import type { Note, TeamKey } from "@/lib/types";
import { StickyNote } from "./StickyNote";

type Props = {
  teamKey: TeamKey;
  label: string;
  accent: string;
  notes: Note[];
  newIds: Set<string>;
  now: number;
};

const SCROLL_DURATION_MS = 30_000;
const PAUSE_AT_BOTTOM_MS = 3_000;
const PAUSE_AT_TOP_MS = 1_500;

export function TeamColumn({ label, accent, notes, newIds, now }: Props) {
  const sorted = [...notes].sort((a, b) => {
    const ap = a.pinned ? 1 : 0;
    const bp = b.pinned ? 1 : 0;
    if (ap !== bp) return bp - ap;
    return b.createdAt - a.createdAt;
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const noteCount = sorted.length;

  // Auto-scroll loop for signage. Pauses when there are <= 3 notes.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (noteCount <= 3) {
      el.scrollTop = 0;
      return;
    }

    let raf = 0;
    let timer: number | null = null;
    let cancelled = false;
    let phaseStart = 0;
    let phase: "down" | "pauseBottom" | "pauseTop" = "down";

    const startPhase = (
      next: "down" | "pauseBottom" | "pauseTop",
      delay = 0
    ): void => {
      if (cancelled) return;
      const begin = (): void => {
        phase = next;
        phaseStart = performance.now();
        if (next === "down") {
          raf = requestAnimationFrame(tick);
        } else if (next === "pauseBottom") {
          timer = window.setTimeout(() => {
            if (cancelled || !el) return;
            el.scrollTop = 0;
            startPhase("pauseTop");
          }, PAUSE_AT_BOTTOM_MS);
        } else {
          timer = window.setTimeout(() => startPhase("down"), PAUSE_AT_TOP_MS);
        }
      };
      if (delay > 0) {
        timer = window.setTimeout(begin, delay);
      } else {
        begin();
      }
    };

    const tick = (): void => {
      if (cancelled || !el) return;
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 0) {
        return;
      }
      const elapsed = performance.now() - phaseStart;
      const t = Math.min(1, elapsed / SCROLL_DURATION_MS);
      el.scrollTop = max * t;
      if (t >= 1) {
        startPhase("pauseBottom");
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    startPhase("down", 1500);

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [noteCount]);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.015]">
      <div className="h-3 w-full" style={{ backgroundColor: accent }} />
      <header
        className="relative flex items-center justify-between border-b border-white/5 px-5 py-4"
        style={{
          backgroundImage: `linear-gradient(90deg, ${accent}22, transparent 60%)`,
        }}
      >
        <h3 className="font-display text-4xl font-black uppercase tracking-tight text-ink">
          {label}
        </h3>
        <span
          className="rounded-full px-4 py-1.5 font-mono text-xl font-black tabular-nums"
          style={{
            backgroundColor: `${accent}1f`,
            color: accent,
            border: `1px solid ${accent}40`,
          }}
        >
          {String(noteCount).padStart(2, "0")}
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        {sorted.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-center">
            <div>
              <div className="mb-3 font-mono text-sm tracking-[0.3em] text-ink-faint">
                NO MEMOS YET
              </div>
              <p className="text-2xl font-semibold text-ink-faint">
                아직 메모가 없습니다
              </p>
            </div>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="scrollbar-none flex h-full flex-col gap-3 overflow-y-auto p-4"
          >
            {sorted.map((note) => (
              <StickyNote
                key={note.id}
                note={note}
                accent={accent}
                isNew={newIds.has(note.id)}
                now={now}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
