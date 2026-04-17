import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";

/**
 * Detects if the app is running either as an installed PWA or inside a
 * Capacitor native shell.
 */
const getIsStandalone = (): boolean => {
  if (typeof window === "undefined") return false;

  const nativeApp = Capacitor.isNativePlatform();
  const mql = window.matchMedia?.("(display-mode: standalone)").matches;
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  return Boolean(nativeApp || mql || iosStandalone);
};

export const useStandalone = (): boolean => {
  const [standalone, setStandalone] = useState<boolean>(() => getIsStandalone());

  useEffect(() => {
    setStandalone(getIsStandalone());

    const mql = window.matchMedia?.("(display-mode: standalone)");
    if (!mql) return;
    const handler = () => setStandalone(getIsStandalone());
    mql.addEventListener?.("change", handler);
    return () => mql.removeEventListener?.("change", handler);
  }, []);

  return standalone;
};
