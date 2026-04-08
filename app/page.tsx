"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { subscribeNotes, subscribeGoals } from "@/lib/notes";
import { speak } from "@/lib/tts";
import { TEAMS, type Goals, type Note, type TeamKey } from "@/lib/types";
import { GoalsHeader } from "@/components/dashboard/GoalsHeader";
import { TeamColumn } from "@/components/dashboard/TeamColumn";
import { LiveClock } from "@/components/dashboard/LiveClock";
import {
  NotificationToastStack,
  type ToastItem,
} from "@/components/dashboard/NotificationToast";
import { AudioUnlockOverlay } from "@/components/dashboard/AudioUnlockOverlay";

const NEW_HIGHLIGHT_MS = 2500;
const MAX_BUFFERED_ANNOUNCEMENTS = 10;

type Announcement = { phrase: string };

function buildPhrase(note: Note): { phrase: string; toastTitle: string } {
  const teamLabel = TEAMS.find((t) => t.key === note.target)?.label ?? "";
  if (note.recipientName) {
    return {
      phrase: `띵동! ${note.authorName}님이 ${note.recipientName}님에게 메시지를 남겼습니다`,
      toastTitle: `${note.authorName} → ${note.recipientName}`,
    };
  }
  if (note.target === "all") {
    return {
      phrase: `띵동! ${note.authorName}님이 전체에게 메시지를 남겼습니다`,
      toastTitle: `${note.authorName} → 전체`,
    };
  }
  return {
    phrase: `띵동! ${note.authorName}님이 ${teamLabel} 팀에 메시지를 남겼습니다`,
    toastTitle: `${note.authorName} → ${teamLabel} 팀`,
  };
}

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [goals, setGoals] = useState<Goals | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [now, setNow] = useState<number>(() => Date.now());
  const [lastSlug, setLastSlug] = useState<string | null>(null);

  const lastSeenRef = useRef<number>(0);
  const initializedRef = useRef<boolean>(false);
  const audioUnlockedRef = useRef<boolean>(false);
  const pendingAnnouncementsRef = useRef<Announcement[]>([]);

  // Tick for relative-time re-renders.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    // Initialize the "seen" cursor at mount time so backfill is suppressed.
    lastSeenRef.current = Date.now();
    try {
      const v = window.localStorage.getItem("lastSlug");
      if (v) setLastSlug(v);
    } catch {
      /* ignore */
    }
  }, []);

  // Subscribe to goals.
  useEffect(() => {
    const unsub = subscribeGoals((g) => setGoals(g));
    return () => unsub();
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((toast: ToastItem) => {
    setToasts((prev) => {
      const next = [toast, ...prev];
      return next.slice(0, 3);
    });
  }, []);

  const markNew = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setNewIds((prev) => {
      const n = new Set(prev);
      ids.forEach((id) => n.add(id));
      return n;
    });
    window.setTimeout(() => {
      setNewIds((prev) => {
        const n = new Set(prev);
        ids.forEach((id) => n.delete(id));
        return n;
      });
    }, NEW_HIGHLIGHT_MS);
  }, []);

  // Subscribe to notes + drive TTS/toasts on fresh items.
  useEffect(() => {
    const unsub = subscribeNotes((list) => {
      setNotes(list);

      if (!initializedRef.current) {
        initializedRef.current = true;
        // lastSeenRef was initialized to mount time above.
        return;
      }

      const prevSeen = lastSeenRef.current;
      const fresh = list
        .filter((n) => n.createdAt > prevSeen)
        .sort((a, b) => a.createdAt - b.createdAt);

      if (fresh.length === 0) return;

      lastSeenRef.current = fresh[fresh.length - 1].createdAt;
      markNew(fresh.map((f) => f.id));

      for (const note of fresh) {
        const { phrase, toastTitle } = buildPhrase(note);
        const accent =
          note.target === "all"
            ? "#f4f4f7"
            : TEAMS.find((t) => t.key === note.target)?.accent ?? "#f4f4f7";

        pushToast({
          id: `${note.id}-${Date.now()}`,
          title: toastTitle,
          body: note.body,
          accent,
        });

        if (audioUnlockedRef.current) {
          void speak(phrase);
        } else {
          // Buffer for flush after audio unlock (cap at MAX).
          const buf = pendingAnnouncementsRef.current;
          buf.push({ phrase });
          if (buf.length > MAX_BUFFERED_ANNOUNCEMENTS) {
            buf.splice(0, buf.length - MAX_BUFFERED_ANNOUNCEMENTS);
          }
        }
      }
    });
    return () => unsub();
  }, [markNew, pushToast]);

  const notesByTeam = useMemo(() => {
    const map: Record<TeamKey, Note[]> = {
      marketing: [],
      sales: [],
      dev: [],
      ops: [],
    };
    for (const note of notes) {
      if (note.target === "all") {
        (Object.keys(map) as TeamKey[]).forEach((k) => map[k].push(note));
      } else {
        map[note.target].push(note);
      }
    }
    return map;
  }, [notes]);

  const handleUnlock = useCallback(() => {
    audioUnlockedRef.current = true;
    setAudioUnlocked(true);
    // Flush any buffered announcements collected while audio was locked.
    const buf = pendingAnnouncementsRef.current;
    pendingAnnouncementsRef.current = [];
    for (const a of buf) {
      void speak(a.phrase);
    }
  }, []);

  return (
    <main className="relative flex h-screen w-screen flex-col overflow-hidden bg-bg">
      {/* Masthead */}
      <header className="relative z-10 flex h-[8vh] min-h-[80px] items-center justify-between border-y border-white/10 px-10">
        <div className="flex items-baseline gap-4">
          <span className="font-display text-5xl font-black tracking-tight text-ink">
            TEAM/BOARD
          </span>
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-ink-muted">
            Office Signage · Issue 01
          </span>
        </div>
        <div className="flex items-center gap-6">
          {lastSlug && (
            <Link
              href={`/u/${lastSlug}`}
              className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-sm font-semibold text-ink-muted transition hover:border-white/30 hover:text-ink"
            >
              내 노트로 →
            </Link>
          )}
          <LiveClock />
        </div>
      </header>

      {/* Goals header */}
      <div className="relative z-10 h-[26vh] min-h-[260px] px-10 pt-5">
        <GoalsHeader goals={goals} now={now} />
      </div>

      {/* Body: four columns */}
      <div className="relative z-10 min-h-0 flex-1 px-10 pb-6 pt-5">
        <div className="grid h-full min-h-0 grid-cols-4 gap-5">
          {TEAMS.map((team) => (
            <TeamColumn
              key={team.key}
              teamKey={team.key}
              label={team.label}
              accent={team.accent}
              notes={notesByTeam[team.key]}
              newIds={newIds}
              now={now}
            />
          ))}
        </div>
      </div>

      <NotificationToastStack toasts={toasts} onDismiss={dismissToast} />

      {!audioUnlocked && <AudioUnlockOverlay onUnlock={handleUnlock} />}
    </main>
  );
}
