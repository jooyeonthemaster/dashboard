"use client";

import { useCallback, useRef, useState } from "react";
import type { Member } from "@/lib/members";
import { useClickOutside } from "@/lib/use-click-outside";

type Value = { slug: string; name: string } | null;

type Props = {
  value: Value;
  onChange: (v: Value) => void;
  members: Member[];
  selfSlug: string;
};

export default function RecipientPicker({
  value,
  onChange,
  members,
  selfSlug,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(rootRef, close, open);

  const label = value ? `@${value.name}` : "지정 안함";

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
          value
            ? "border-sky-400/50 bg-sky-400/10 text-sky-200 hover:bg-sky-400/15"
            : "border-white/10 bg-white/[0.02] text-ink-muted hover:border-white/20 hover:text-ink"
        }`}
      >
        <span>{label}</span>
        <span className="text-xs opacity-60">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-bg-elevated shadow-2xl">
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-ink-muted hover:bg-white/[0.05]"
          >
            <span>지정 안함</span>
            {!value && <span className="text-xs text-ink-muted">✓</span>}
          </button>
          <div className="h-px bg-white/5" />
          <div className="max-h-64 overflow-y-auto">
            {members
              .filter((m) => m.slug !== selfSlug)
              .map((m) => {
                const active = value?.slug === m.slug;
                return (
                  <button
                    key={m.slug}
                    type="button"
                    onClick={() => {
                      onChange({ slug: m.slug, name: m.name });
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition hover:bg-white/[0.05] ${
                      active ? "text-ink" : "text-ink-muted"
                    }`}
                  >
                    <span className="font-semibold">{m.name}</span>
                    <span className="font-mono text-xs uppercase tracking-widest text-ink-muted">
                      {m.role}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
