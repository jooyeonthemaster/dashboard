"use client";

import { useMemo } from "react";
import type { Note } from "@/lib/types";
import { togglePin, toggleDone } from "@/lib/notes";
import { formatRelativeKo } from "@/lib/time";
import { hexToRgba } from "@/lib/color";
import { getMemberColor } from "@/lib/members";

type Props = {
  note: Note;
  accent: string;
  isNew: boolean;
  now: number;
};

export function StickyNote({ note, accent, isNew, now }: Props) {
  const { tint, ring } = useMemo(
    () => ({
      tint: hexToRgba(accent, 0.09),
      ring: hexToRgba(accent, 0.35),
    }),
    [accent]
  );

  const handlePin = (e: React.MouseEvent): void => {
    e.stopPropagation();
    void togglePin(note.id, !note.pinned);
  };
  const handleDone = (e: React.MouseEvent): void => {
    e.stopPropagation();
    void toggleDone(note.id, !note.done);
  };

  return (
    <article
      className={[
        "group relative overflow-hidden rounded-2xl border border-white/[0.06] p-5 transition-all duration-300",
        isNew ? "animate-[noteIn_500ms_ease-out_both]" : "",
        note.done ? "opacity-[0.65]" : "",
        note.pinned
          ? "shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_8px_24px_-8px_rgba(0,0,0,0.8)]"
          : "shadow-[0_4px_16px_-8px_rgba(0,0,0,0.6)]",
      ].join(" ")}
      style={{
        backgroundImage: `linear-gradient(180deg, ${tint}, rgba(20,20,28,0.7))`,
        borderLeft: `5px solid ${accent}`,
        borderTop: note.pinned ? `6px solid ${accent}` : undefined,
        boxShadow: note.pinned
          ? `0 0 0 1px ${ring}, 0 12px 32px -16px ${ring}`
          : undefined,
      }}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-nowrap items-baseline gap-x-2">
            <span
              className="truncate max-w-[60%] text-2xl font-black tracking-tight"
              style={{ color: getMemberColor(note.authorSlug) }}
            >
              {note.authorName}
            </span>
            {note.recipientName && note.recipientSlug && (
              <span className="flex items-baseline gap-1 text-xl font-medium text-ink-muted">
                <span className="text-ink-faint">→</span>
                <span
                  className="truncate max-w-[60%]"
                  style={{ color: getMemberColor(note.recipientSlug) }}
                >
                  {note.recipientName}
                </span>
              </span>
            )}
            {note.target === "all" && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-bold tracking-wider text-ink-muted">
                전체
              </span>
            )}
            {note.pinned && (
              <span className="rounded bg-amber-300 px-2 py-0.5 text-xs font-black tracking-[0.25em] text-bg">
                PIN
              </span>
            )}
            {note.done && (
              <span className="rounded bg-emerald-400/15 px-2 py-0.5 text-sm font-bold tracking-[0.2em] text-emerald-300">
                DONE
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={handlePin}
            aria-label={note.pinned ? "고정 해제" : "고정"}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-base text-ink-muted transition hover:bg-white/10 hover:text-ink"
          >
            📌
          </button>
          <button
            type="button"
            onClick={handleDone}
            aria-label={note.done ? "완료 취소" : "완료"}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-base text-ink-muted transition hover:bg-white/10 hover:text-ink"
          >
            ✓
          </button>
        </div>
      </header>
      <p className="mt-3 line-clamp-4 whitespace-pre-wrap break-words text-2xl font-semibold leading-snug text-ink">
        {note.body}
      </p>
      <footer className="mt-3 flex items-center justify-between text-sm font-semibold text-ink-muted">
        <span>{formatRelativeKo(note.createdAt, now)}</span>
      </footer>
    </article>
  );
}
