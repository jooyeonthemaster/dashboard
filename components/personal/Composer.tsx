"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Member } from "@/lib/members";
import { TEAMS, type NoteTarget } from "@/lib/types";
import { createNote } from "@/lib/notes";
import { readableTextOn } from "@/lib/color";
import RecipientPicker from "./RecipientPicker";

type Props = {
  authorSlug: string;
  authorName: string;
  allMembers: Member[];
};

type Recipient = { slug: string; name: string } | null;

const NEUTRAL_COLORS = ["#F4F4F7", "#94A3B8"];
const ALL_ACCENT = "#F4F4F7";

function accentFor(target: NoteTarget): string {
  if (target === "all") return ALL_ACCENT;
  return TEAMS.find((t) => t.key === target)?.accent ?? ALL_ACCENT;
}

export default function Composer({ authorSlug, authorName, allMembers }: Props) {
  const [target, setTarget] = useState<NoteTarget>("all");
  const [recipient, setRecipient] = useState<Recipient>(null);
  const [body, setBody] = useState("");
  const [color, setColor] = useState<string>(ALL_ACCENT);
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastKind, setToastKind] = useState<"ok" | "err">("ok");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userTouchedColor = useRef(false);

  // When target changes, auto-follow accent color unless user manually picked.
  useEffect(() => {
    if (!userTouchedColor.current) {
      setColor(accentFor(target));
    }
  }, [target]);

  const colorOptions = [...TEAMS.map((t) => t.accent), ...NEUTRAL_COLORS];

  async function handleSubmit(): Promise<void> {
    const trimmed = body.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await createNote({
        authorSlug,
        authorName,
        target,
        recipientSlug: recipient?.slug,
        recipientName: recipient?.name,
        body: trimmed,
        color,
        pinned,
      });
      setBody("");
      setPinned(false);
      setRecipient(null);
      userTouchedColor.current = false;
      setColor(accentFor(target));
      setToastKind("ok");
      setToast("메모가 전달되었습니다");
      window.setTimeout(() => setToast(null), 2500);
      textareaRef.current?.focus();
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error(err);
      }
      setToastKind("err");
      setToast("전송 실패 · 다시 시도해주세요");
      window.setTimeout(() => setToast(null), 2600);
    } finally {
      setSubmitting(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>): void {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void handleSubmit();
    }
  }

  const targetOptions: { key: NoteTarget; label: string; accent: string }[] = [
    { key: "all", label: "전체", accent: ALL_ACCENT },
    ...TEAMS.map((t) => ({
      key: t.key as NoteTarget,
      label: t.label,
      accent: t.accent,
    })),
  ];

  const submitTextColor = readableTextOn(color);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-bg-elevated/80 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
      {/* Accent bar */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] transition-colors"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.32em] text-ink-muted">
            compose
          </div>
          <div className="mt-1 text-xl font-bold text-ink">새 메모 작성</div>
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.28em] text-ink-muted">
          ⌘/Ctrl + Enter 전송
        </div>
      </div>

      {/* Target selector */}
      <div className="mt-7">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-ink-muted">
          전달 대상
        </div>
        <div className="flex flex-wrap gap-2">
          {targetOptions.map((opt) => {
            const active = target === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setTarget(opt.key)}
                className={`relative rounded-xl border px-5 py-3 text-sm font-bold tracking-wide transition ${
                  active
                    ? "border-white/0"
                    : "border-white/10 bg-white/[0.02] text-ink hover:border-white/20 hover:bg-white/[0.05]"
                }`}
                style={
                  active
                    ? {
                        backgroundColor: opt.accent,
                        color: readableTextOn(opt.accent),
                      }
                    : undefined
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recipient */}
      <div className="mt-6">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-ink-muted">
          지정 대상자 (선택)
        </div>
        <RecipientPicker
          value={recipient}
          onChange={setRecipient}
          members={allMembers}
          selfSlug={authorSlug}
        />
      </div>

      {/* Body */}
      <div className="mt-6">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={onKeyDown}
          rows={5}
          placeholder="전달하고 싶은 메시지를 적어주세요…"
          className="w-full resize-none rounded-2xl border border-white/10 bg-bg-sunken/60 px-6 py-5 text-lg font-medium leading-relaxed text-ink placeholder:text-ink-faint focus:border-white/30 focus:outline-none"
          style={{ caretColor: color }}
        />
      </div>

      {/* Color + pin */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold uppercase tracking-[0.28em] text-ink-muted">
            색상
          </div>
          <div className="flex gap-2">
            {colorOptions.map((c) => {
              const active = color === c;
              return (
                <button
                  key={c}
                  type="button"
                  aria-label={`색상 ${c}`}
                  onClick={() => {
                    userTouchedColor.current = true;
                    setColor(c);
                  }}
                  className={`h-8 w-8 rounded-full border transition ${
                    active ? "border-white scale-110" : "border-white/20 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              );
            })}
          </div>
        </div>

        <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="h-4 w-4 accent-amber-300"
          />
          <span>📌 상단 고정</span>
        </label>
      </div>

      {/* Submit */}
      <div className="mt-7 flex items-center gap-4">
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!body.trim() || submitting}
          className="group relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl px-8 py-5 text-lg font-black tracking-wide transition disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: color, color: submitTextColor }}
        >
          {submitting ? "전송 중…" : "메모 보내기"}
          {!submitting && (
            <kbd className="ml-2 rounded bg-black/20 px-1.5 py-0.5 font-mono text-xs">
              ⌘↵
            </kbd>
          )}
        </button>
      </div>

      {toast && (
        <div
          role="status"
          className={`pointer-events-none mt-4 rounded-xl border px-4 py-3 text-center text-sm font-semibold ${
            toastKind === "ok"
              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/15 text-rose-300"
          }`}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
