import { useEffect, useState } from "react";

/**
 * Detects if the app is running as an installed PWA (standalone display mode).
 * Returns true when launched from home-screen icon on iOS/Android, or as
 * an installed Chrome/Edge desktop PWA.
 */
export const useStandalone = (): boolean => {
  const [standalone, setStandalone] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const mql = window.matchMedia?.("(display-mode: standalone)").matches;
    const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    return Boolean(mql || iosStandalone);
  });

  useEffect(() => {
    const mql = window.matchMedia?.("(display-mode: standalone)");
    if (!mql) return;
    const handler = (e: MediaQueryListEvent) => setStandalone(e.matches);
    mql.addEventListener?.("change", handler);
    return () => mql.removeEventListener?.("change", handler);
  }, []);

  return standalone;
};
