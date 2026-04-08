"use client";

import { useEffect, type RefObject } from "react";

/**
 * Closes a popover when the user clicks outside of `ref`, taps outside on
 * touch devices, or presses Escape.
 */
export function useClickOutside(
  ref: RefObject<HTMLElement>,
  onClose: () => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;
    function onPointer(e: Event) {
      const node = ref.current;
      if (!node) return;
      if (!node.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, onClose, enabled]);
}
