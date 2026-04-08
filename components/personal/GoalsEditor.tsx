"use client";

import { useEffect, useRef, useState } from "react";
import type { Goals } from "@/lib/types";
import { subscribeGoals, updateGoals } from "@/lib/notes";

type Props = { editorName: string };

type Baseline = { overall: string; monthly: string; weekly: string };

export default function GoalsEditor({ editorName }: Props) {
  const [goals, setGoals] = useState<Goals | null>(null);
  const [overall, setOverall] = useState("");
  const [monthly, setMonthly] = useState("");
  const [weekly, setWeekly] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [externalChange, setExternalChange] = useState(false);

  const hydratedRef = useRef(false);
  const baselineRef = useRef<Baseline>({
    overall: "",
    monthly: "",
    weekly: "",
  });
  const hydrationStampRef = useRef<number>(0);

  useEffect(() => {
    const unsub = subscribeGoals((g) => {
      setGoals(g);
      if (!hydratedRef.current) {
        setOverall(g.overall);
        setMonthly(g.monthly);
        setWeekly(g.weekly);
        baselineRef.current = {
          overall: g.overall,
          monthly: g.monthly,
          weekly: g.weekly,
        };
        hydrationStampRef.current = g.updatedAt;
        hydratedRef.current = true;
        return;
      }
      // External change detection.
      if (g.updatedAt > hydrationStampRef.current) {
        const localUntouched =
          overall === baselineRef.current.overall &&
          monthly === baselineRef.current.monthly &&
          weekly === baselineRef.current.weekly;
        if (localUntouched) {
          setOverall(g.overall);
          setMonthly(g.monthly);
          setWeekly(g.weekly);
          baselineRef.current = {
            overall: g.overall,
            monthly: g.monthly,
            weekly: g.weekly,
          };
          hydrationStampRef.current = g.updatedAt;
        } else {
          setExternalChange(true);
        }
      }
    });
    return () => unsub();
    // We deliberately omit overall/monthly/weekly to avoid re-subscribing on
    // every keystroke; the closure reads the latest state via React.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function rehydrateFromRemote(): void {
    if (!goals) return;
    setOverall(goals.overall);
    setMonthly(goals.monthly);
    setWeekly(goals.weekly);
    baselineRef.current = {
      overall: goals.overall,
      monthly: goals.monthly,
      weekly: goals.weekly,
    };
    hydrationStampRef.current = goals.updatedAt;
    setExternalChange(false);
  }

  const dirty =
    overall !== baselineRef.current.overall ||
    monthly !== baselineRef.current.monthly ||
    weekly !== baselineRef.current.weekly;

  async function onSave(): Promise<void> {
    if (!hydratedRef.current || !dirty) return;
    setSaving(true);
    try {
      await updateGoals({ overall, monthly, weekly }, editorName);
      baselineRef.current = { overall, monthly, weekly };
      setSavedMsg("저장 완료");
      window.setTimeout(() => setSavedMsg(null), 2000);
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error(e);
      }
      setSavedMsg("저장 실패");
      window.setTimeout(() => setSavedMsg(null), 2400);
    } finally {
      setSaving(false);
    }
  }

  const lastUpdated =
    goals && goals.updatedAt
      ? `마지막 수정: ${goals.updatedBy || "—"} · ${new Date(goals.updatedAt).toLocaleString("ko-KR", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}`
      : "아직 저장된 목표가 없습니다.";

  const fields: {
    key: "overall" | "monthly" | "weekly";
    label: string;
    value: string;
    set: (v: string) => void;
    placeholder: string;
  }[] = [
    {
      key: "overall",
      label: "전체 목표",
      value: overall,
      set: setOverall,
      placeholder: "올해의 큰 방향성을 적어주세요",
    },
    {
      key: "monthly",
      label: "월간 목표",
      value: monthly,
      set: setMonthly,
      placeholder: "이번 달 집중할 일을 적어주세요",
    },
    {
      key: "weekly",
      label: "주간 목표",
      value: weekly,
      set: setWeekly,
      placeholder: "이번 주 집중할 일을 적어주세요",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {externalChange && (
        <div className="flex items-center justify-between rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-200">
          <span>외부 변경 감지 — 새로고침</span>
          <button
            type="button"
            onClick={rehydrateFromRemote}
            className="rounded-lg border border-amber-300/40 bg-amber-300/20 px-3 py-1 text-xs font-bold text-amber-100 hover:bg-amber-300/30"
          >
            적용
          </button>
        </div>
      )}

      {fields.map((f) => (
        <div key={f.key}>
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-ink-muted">
            {f.label}
          </div>
          <textarea
            value={f.value}
            onChange={(e) => f.set(e.target.value)}
            placeholder={f.placeholder}
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-bg-sunken/60 px-4 py-3 text-[15px] font-medium text-ink placeholder:text-ink-faint focus:border-white/30 focus:outline-none"
          />
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="text-xs text-ink-muted">{lastUpdated}</div>
        <div className="flex items-center gap-3">
          {savedMsg && (
            <span className="text-xs font-semibold text-emerald-300">
              {savedMsg}
            </span>
          )}
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={saving || !dirty || !hydratedRef.current}
            className="rounded-xl border border-white/20 bg-white px-5 py-2.5 text-sm font-bold text-bg transition hover:bg-ink disabled:opacity-50"
          >
            {saving ? "저장 중…" : "목표 업데이트"}
          </button>
        </div>
      </div>
    </div>
  );
}
