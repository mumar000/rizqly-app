import { useCallback, useEffect, useRef } from "react";

interface UseLongPressOptions {
  onLongPress: () => void;
  delayMs?: number;
  moveThresholdPx?: number;
  enabled?: boolean;
}

/**
 * Native pointer-event long-press detector.
 * Cancels on movement past threshold so it doesn't fight horizontal swipe gestures.
 * Returns handlers to spread on the target element.
 */
export function useLongPress({
  onLongPress,
  delayMs = 450,
  moveThresholdPx = 8,
  enabled = true,
}: UseLongPressOptions) {
  const timerRef = useRef<number | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const firedRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startRef.current = null;
  }, []);

  useEffect(() => clear, [clear]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      firedRef.current = false;
      startRef.current = { x: e.clientX, y: e.clientY };
      timerRef.current = window.setTimeout(() => {
        firedRef.current = true;
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          try {
            navigator.vibrate?.(18);
          } catch {}
        }
        onLongPress();
      }, delayMs);
    },
    [enabled, delayMs, onLongPress]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startRef.current || timerRef.current == null) return;
      const dx = Math.abs(e.clientX - startRef.current.x);
      const dy = Math.abs(e.clientY - startRef.current.y);
      if (dx > moveThresholdPx || dy > moveThresholdPx) clear();
    },
    [moveThresholdPx, clear]
  );

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: clear,
      onPointerCancel: clear,
      onPointerLeave: clear,
    },
    didFireRef: firedRef,
  };
}
