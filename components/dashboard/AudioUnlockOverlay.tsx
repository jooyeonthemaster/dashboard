"use client";

import { useEffect } from "react";
import { speak, warmVoices } from "@/lib/tts";

type Props = {
  onUnlock: () => void;
};

export function AudioUnlockOverlay({ onUnlock }: Props) {
  // Warm the voice list early so by the time the user clicks, the
  // Korean voice is already cached. We never speak inside this effect.
  useEffect(() => {
    warmVoices();
  }, []);

  const handleClick = (): void => {
    void speak("알림이 활성화되었습니다");
    onUnlock();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/85 backdrop-blur-xl">
      <button
        type="button"
        onClick={handleClick}
        className="group relative flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] px-16 py-14 text-center shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)] transition hover:scale-[1.02] hover:border-white/20"
      >
        <span className="text-7xl" aria-hidden>
          🔊
        </span>
        <div className="max-w-xl">
          <p className="font-display text-4xl font-black tracking-tight text-ink">
            알림 시작
          </p>
          <p className="mt-3 text-base font-medium text-ink-muted">
            브라우저 정책상 음성 알림은 최초 한 번의 클릭이 필요합니다. 화면을
            눌러 실시간 음성 알림을 켜주세요.
          </p>
        </div>
        <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-ink-faint">
          Tap to enable voice alerts
        </span>
      </button>
    </div>
  );
}
