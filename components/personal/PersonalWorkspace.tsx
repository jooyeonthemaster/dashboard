"use client";

import { useEffect, useMemo, useState } from "react";
import type { Member } from "@/lib/members";
import type { Note } from "@/lib/types";
import { subscribeNotes } from "@/lib/notes";
import Composer from "./Composer";
import MyNotesList from "./MyNotesList";
import GoalsEditor from "./GoalsEditor";
import PersonalClock from "./PersonalClock";

type Props = {
  member: Member;
  allMembers: Member[];
};

export default function PersonalWorkspace({ member, allMembers }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [goalsOpen, setGoalsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("lastSlug", member.slug);
    } catch {
      // ignore storage errors (private mode, etc.)
    }
  }, [member.slug]);

  useEffect(() => {
    const unsub = subscribeNotes(setNotes);
    return () => unsub();
  }, []);

  const myNotes = useMemo(
    () => notes.filter((n) => n.authorSlug === member.slug),
    [notes, member.slug]
  );

  return (
    <main className="min-h-screen bg-bg text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-6 py-8 lg:px-10 lg:py-10">
        {/* Header */}
        <header className="mb-10 flex flex-col gap-6 border-b border-white/5 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.32em] text-ink-muted">
              <span>personal note</span>
              <span className="h-px w-8 bg-ink-faint/40" />
              <span>/u/{member.slug}</span>
            </div>
            <h1 className="mt-4 font-display text-4xl font-black leading-tight tracking-tight text-ink lg:text-5xl">
              안녕하세요,{" "}
              <span style={{ color: member.color }}>{member.name}</span>
              <span className="text-ink-muted">님</span>
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center rounded-full border bg-transparent px-3 py-1 text-xs font-semibold tracking-wide"
                style={{ borderColor: `${member.color}66`, color: member.color }}
              >
                {member.role}
              </span>
            </div>
          </div>

          <PersonalClock />
        </header>

        {/* Two-pane layout */}
        <div className="grid flex-1 grid-cols-1 gap-8 lg:grid-cols-[1.65fr_1fr]">
          {/* Left pane */}
          <section className="flex flex-col gap-8">
            <Composer
              authorSlug={member.slug}
              authorName={member.name}
              allMembers={allMembers}
            />

            <div className="rounded-2xl border border-white/5 bg-bg-elevated/60">
              <button
                type="button"
                onClick={() => setGoalsOpen((v) => !v)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <div>
                  <div className="font-mono text-xs uppercase tracking-[0.3em] text-ink-muted">
                    team goals
                  </div>
                  <div className="mt-1 text-xl font-bold text-ink">팀 목표 편집</div>
                </div>
                <span className="text-ink-muted">{goalsOpen ? "−" : "+"}</span>
              </button>
              {goalsOpen && (
                <div className="border-t border-white/5 px-6 py-6">
                  <GoalsEditor editorName={member.name} />
                </div>
              )}
            </div>
          </section>

          {/* Right pane */}
          <aside className="flex flex-col gap-6">
            <MyNotesList
              myNotes={myNotes}
              allNotes={notes}
              authorSlug={member.slug}
            />
          </aside>
        </div>

        <footer className="mt-12 border-t border-white/5 pt-6 font-mono text-xs uppercase tracking-[0.3em] text-ink-muted">
          whiteboard · personal workspace
        </footer>
      </div>
    </main>
  );
}
