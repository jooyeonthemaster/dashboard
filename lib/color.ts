/**
 * Return a high-contrast text color (near-black or near-white)
 * for an arbitrary hex background.
 */
export function readableTextOn(hex: string): "#0a0a0f" | "#f4f4f7" {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#f4f4f7";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#0a0a0f" : "#f4f4f7";
}

/** Convert a #rrggbb hex string to an `rgba(...)` string. */
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
