"use client";

/**
 * Korean Web Speech API helper with a small FIFO queue so rapid calls
 * don't drop utterances. No-op on the server.
 */

type QueueItem = { text: string; resolve: () => void };

let queue: QueueItem[] = [];
let speaking = false;
let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesReady = false;
let voiceListenerAttached = false;

function isAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.speechSynthesis !== "undefined" &&
    typeof window.SpeechSynthesisUtterance !== "undefined"
  );
}

function pickKoreanVoice(): SpeechSynthesisVoice | null {
  if (!isAvailable()) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;
  const exact = voices.find((v) => v.lang === "ko-KR");
  const loose = voices.find((v) => v.lang.toLowerCase().startsWith("ko"));
  cachedVoice = exact || loose || null;
  if (cachedVoice) voicesReady = true;
  return cachedVoice;
}

function ensureVoicesLoaded(): void {
  if (!isAvailable() || voicesReady) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    pickKoreanVoice();
    voicesReady = true;
    return;
  }
  if (voiceListenerAttached) return;
  voiceListenerAttached = true;
  const handler = () => {
    voicesReady = true;
    pickKoreanVoice();
    drain();
  };
  window.speechSynthesis.addEventListener("voiceschanged", handler, {
    once: true,
  });
}

function drain(): void {
  if (!isAvailable()) {
    queue.forEach((q) => q.resolve());
    queue = [];
    speaking = false;
    return;
  }
  if (speaking) return;
  if (!voicesReady) {
    ensureVoicesLoaded();
    return;
  }
  const next = queue.shift();
  if (!next) return;
  speaking = true;

  const utter = new SpeechSynthesisUtterance(next.text);
  utter.lang = "ko-KR";
  utter.rate = 1.0;
  utter.pitch = 1.0;
  utter.volume = 1.0;

  const voice = pickKoreanVoice();
  if (voice) utter.voice = voice;

  let watchdog: number | null = null;
  const done = (): void => {
    if (watchdog !== null) {
      window.clearTimeout(watchdog);
      watchdog = null;
    }
    if (!speaking) return;
    speaking = false;
    next.resolve();
    drain();
  };
  utter.onend = done;
  utter.onerror = done;

  try {
    window.speechSynthesis.speak(utter);
    watchdog = window.setTimeout(
      done,
      Math.max(5000, next.text.length * 120)
    );
  } catch {
    done();
  }
}

/**
 * Queue a Korean TTS utterance. Resolves when the utterance finishes (or
 * immediately on unsupported environments).
 */
export function speak(text: string): Promise<void> {
  if (!isAvailable() || !text) return Promise.resolve();

  if (!voicesReady) ensureVoicesLoaded();

  return new Promise<void>((resolve) => {
    queue.push({ text, resolve });
    drain();
  });
}

/** Warm voice list inside a user gesture. */
export function warmVoices(): void {
  if (!isAvailable()) return;
  window.speechSynthesis.getVoices();
  ensureVoicesLoaded();
}

/** Stop current speech and clear the queue, resolving any pending promises. */
export function cancelSpeech(): void {
  if (!isAvailable()) {
    queue.forEach((q) => q.resolve());
    queue = [];
    speaking = false;
    return;
  }
  const pending = queue;
  queue = [];
  speaking = false;
  pending.forEach((q) => q.resolve());
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}
