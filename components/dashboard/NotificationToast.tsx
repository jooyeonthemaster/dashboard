"use client";

import { useEffect } from "react";

export type ToastItem = {
  id: string;
  title: string;
  body: string;
  accent: string;
};

type Props = {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
};

export function NotificationToastStack({ toasts, onDismiss }: Props) {
  return (
    <div className="pointer-events-none fixed right-6 top-6 z-40 flex w-[480px] flex-col gap-3">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const id = window.setTimeout(() => onDismiss(toast.id), 4000);
    return () => window.clearTimeout(id);
  }, [toast.id, onDismiss]);

  return (
    <div
      className="pointer-events-auto animate-[toastIn_240ms_ease-out_both] overflow-hidden rounded-2xl border border-white/10 bg-bg-elevated/95 p-5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl"
      style={{ borderLeft: `5px solid ${toast.accent}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xl font-extrabold tracking-tight text-ink">
          {toast.title}
        </p>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="text-sm text-ink-muted transition hover:text-ink"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>
      <p className="mt-2 line-clamp-2 text-base text-ink-muted">{toast.body}</p>
    </div>
  );
}
