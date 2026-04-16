/**
 * Haptic feedback utility for iOS PWA / mobile web.
 * Falls back gracefully where the Vibration API is unavailable.
 */
type HapticStyle = "light" | "medium" | "heavy" | "success" | "warning" | "error";

const PATTERNS: Record<HapticStyle, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 35,
  success: [12, 40, 18],
  warning: [20, 60, 20],
  error: [30, 80, 30, 80, 30],
};

export const haptic = (style: HapticStyle = "light"): void => {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  try {
    navigator.vibrate(PATTERNS[style]);
  } catch {
    /* ignore */
  }
};
