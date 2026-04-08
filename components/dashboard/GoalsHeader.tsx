"use client";

import type { Goals } from "@/lib/types";
import { formatRelativeKo } from "@/lib/time";

type GoalCard = {
  key: keyof Pick<Goals, "overall" | "monthly" | "weekly">;
  label: string;
  hint: string;
  rail: string;
};

const CARDS: GoalCard[] = [
  { key: "overall", label: "전체 목표", hint: "OVERALL", rail: "#f4f4f7" },
  { key: "monthly", label: "월간 목표", hint: "MONTHLY", rail: "#FFD93D" },
  { key: "weekly", label: "주간 목표", hint: "WEEKLY", rail: "#4ECDC4" },
];

type Props = {
  goals: Goals | null;
  now: number;
};

export function GoalsHeader({ goals, now }: Props) {
  return (
    <section className="grid h-full grid-cols-3 gap-5">
      {CARDS.map((card) => {
        const value = goals?.[card.key] ?? "";
        return (
          <article
            key={card.key}
            className="relative flex h-full flex-col justify-between overflow-hidden rounded-[12px] border border-white/10 bg-bg-elevated/40 p-7"
            style={{ borderTop: `4px solid ${card.rail}` }}
          >
            <header className="flex items-baseline justify-between">
              <h2 className="font-display text-4xl font-black tracking-tight text-ink">
                {card.label}
              </h2>
              <span className="font-mono text-xs font-bold tracking-[0.3em] text-ink-muted">
                {card.hint}
              </span>
            </header>
            <p className="mt-3 line-clamp-3 font-display text-6xl font-black leading-[1.05] tracking-tight text-ink lg:text-7xl">
              {value || (
                <span className="text-ink-faint">아직 설정되지 않았습니다</span>
              )}
            </p>
            <footer className="mt-4 flex items-center justify-between text-sm font-semibold text-ink-muted">
              {goals && goals.updatedAt > 0 ? (
                <span>
                  수정됨 · {goals.updatedBy || "익명"} ·{" "}
                  {formatRelativeKo(goals.updatedAt, now)}
                </span>
              ) : (
                <span>—</span>
              )}
            </footer>
          </article>
        );
      })}
    </section>
  );
}
