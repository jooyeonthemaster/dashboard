"use client";

import { useMemo, useState } from "react";
import type { Note, NoteTarget } from "@/lib/types";
import { TEAMS } from "@/lib/types";
import { togglePin, toggleDone, deleteNote } from "@/lib/notes";
import { readableTextOn } from "@/lib/color";

type Props = {
  myNotes: Note[];
  allNotes: Note[];
  authorSlug: string;
};

function targetLabel(t: NoteTarget): string {
  if (t === "all") return "전체";
  return TEAMS.find((tt) => tt.key === t)?.label ?? t;
}

function targetAccent(t: NoteTarget): string {
  if (t === "all") return "#F4F4F7";
  return TEAMS.find((tt) => tt.key === t)?.accent ?? "#F4F4F7";
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function NoteCard({ note, owned }: { note: Note; owned: boolean }) {
  const accent = targetAccent(note.target);
  const [confirming, setConfirming] = useState(false);

  async function onDelete(): Promise<void> {
    if (!confirming) {
      setConfirming(true);
      window.setTimeout(() => setConfirming(false), 4000);
      return;
    }
    try {
      await deleteNote(note.id);
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  }

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border p-5 transition ${
        note.done
          ? "border-white/5 bg-white/[0.02] opacity-60"
          : "border-white/10 bg-bg-elevated/70 hover:border-white/20"
      }`}
    >
      <div
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ backgroundColor: note.color || accent }}
      />

      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em]">
        <span
          className="rounded-full px-2.5 py-1"
          style={{ backgroundColor: accent, color: readableTextOn(accent) }}
        >
          {targetLabel(note.target)}
        </span>
        {note.recipientName && (
          <span className="rounded-full border border-sky-400/40 bg-sky-400/10 px-2.5 py-1 text-sky-200">
            @{note.recipientName}
          </span>
        )}
        {note.pinned && (
          <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-2.5 py-1 text-amber-200">
            📌 PIN
          </span>
        )}
        {!owned && (
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-ink-muted">
            {note.authorName}
          </span>
        )}
      </div>

      <p
        className={`mt-3 whitespace-pre-wrap break-words text-[15px] font-medium leading-relaxed ${
          note.done ? "text-ink-muted line-through" : "text-ink"
        }`}
      >
        {note.body}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-muted">
          {formatTime(note.createdAt)}
        </span>
        {owned && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void togglePin(note.id, !note.pinned)}
              title="고정 토글"
              aria-label="고정 토글"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-base text-ink-muted transition hover:bg-white/5 hover:text-ink"
            >
              📌
            </button>
            <button
              type="button"
              onClick={() => void toggleDone(note.id, !note.done)}
              title="완료 토글"
              aria-label="완료 토글"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-base text-ink-muted transition hover:bg-white/5 hover:text-ink"
            >
              ✓
            </button>
            <button
              type="button"
              onClick={() => void onDelete()}
              title="삭제"
              aria-label={confirming ? "정말 삭제" : "삭제"}
              className={`ml-1 flex h-10 items-center justify-center rounded-lg border-l border-white/10 pl-3 pr-2 text-base transition ${
                confirming
                  ? "text-rose-300"
                  : "text-ink-muted hover:bg-rose-500/10 hover:text-rose-300"
              }`}
            >
              {confirming ? (
                <span className="text-xs font-bold">정말요?</span>
              ) : (
                "🗑"
              )}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function MyNotesList({ myNotes, allNotes, authorSlug }: Props) {
  const sortedMine = useMemo(() => {
    const list = [...myNotes];
    list.sort((a, b) => {
      if (!!b.pinned !== !!a.pinned)
        return Number(!!b.pinned) - Number(!!a.pinned);
      return b.createdAt - a.createdAt;
    });
    return list;
  }, [myNotes]);

  const teamFeed = useMemo(
    () => allNotes.filter((n) => n.authorSlug !== authorSlug),
    [allNotes, authorSlug]
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-white/10 bg-bg-elevated/50 p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.32em] text-ink-muted">
              my notes
            </div>
            <div className="mt-1 text-xl font-bold text-ink">내 메모</div>
          </div>
          <span className="text-sm font-semibold text-ink-muted">
            {sortedMine.length}개
          </span>
        </div>

        {sortedMine.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-ink-muted">
            아직 작성한 메모가 없습니다.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedMine.map((n) => (
              <NoteCard key={n.id} note={n} owned />
            ))}
          </div>
        )}
      </section>

      <details className="group rounded-3xl border border-white/10 bg-bg-elevated/30 p-6">
        <summary className="flex cursor-pointer items-center justify-between text-sm font-bold text-ink-muted transition hover:text-ink">
          <span className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.32em] text-ink-muted">
              team feed
            </span>
            <span>전체 메모 보기</span>
          </span>
          <span className="text-xs">{teamFeed.length}개 ▾</span>
        </summary>
        <div className="mt-4 flex flex-col gap-3">
          {teamFeed.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-ink-muted">
              팀 전체에 아직 메모가 없습니다.
            </div>
          ) : (
            teamFeed.map((n) => <NoteCard key={n.id} note={n} owned={false} />)
          )}
        </div>
      </details>
    </div>
  );
}
