import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "rizqly.billSnoozes.v1";

type SnoozeMap = Record<string, string>; // billId -> snoozedUntilISO

function readStorage(): SnoozeMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStorage(map: SnoozeMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

/**
 * Per-bill snooze state held in localStorage. A snooze means
 * "don't surface this in alerts until <iso>". Stale entries (past the
 * snooze date or for bills that no longer exist) are pruned lazily on read.
 */
export function useBillSnoozes() {
  const [snoozes, setSnoozes] = useState<SnoozeMap>(() => readStorage());

  useEffect(() => {
    writeStorage(snoozes);
  }, [snoozes]);

  const isSnoozed = useCallback(
    (billId: string, now: Date = new Date()) => {
      const until = snoozes[billId];
      if (!until) return false;
      return new Date(until).getTime() > now.getTime();
    },
    [snoozes],
  );

  const snooze = useCallback((billId: string, days: number = 1) => {
    setSnoozes((prev) => {
      const until = new Date();
      until.setDate(until.getDate() + days);
      return { ...prev, [billId]: until.toISOString() };
    });
  }, []);

  const clear = useCallback((billId: string) => {
    setSnoozes((prev) => {
      if (!(billId in prev)) return prev;
      const next = { ...prev };
      delete next[billId];
      return next;
    });
  }, []);

  return { snoozes, isSnoozed, snooze, clear };
}
