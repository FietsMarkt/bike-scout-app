import { useEffect, useRef, useState } from "react";
import { haptic } from "@/lib/haptic";

type Options = {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  enabled?: boolean;
};

/**
 * Pull-to-refresh hook for mobile/PWA. Attaches touch listeners to the
 * scroll container (default: window). Returns the offset (px) to render
 * an indicator and a `refreshing` flag.
 */
export const usePullToRefresh = ({ onRefresh, threshold = 70, enabled = true }: Options) => {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const triggered = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0 || refreshing) return;
      startY.current = e.touches[0].clientY;
      triggered.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (startY.current == null || refreshing) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0 && window.scrollY <= 0) {
        const damped = Math.min(delta * 0.5, threshold * 1.6);
        setPull(damped);
        if (damped > threshold && !triggered.current) {
          triggered.current = true;
          haptic("medium");
        }
      }
    };

    const onTouchEnd = async () => {
      if (startY.current == null) return;
      startY.current = null;
      if (pull > threshold && !refreshing) {
        setRefreshing(true);
        setPull(threshold);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
          setPull(0);
        }
      } else {
        setPull(0);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [pull, refreshing, threshold, onRefresh, enabled]);

  return { pull, refreshing, threshold };
};
