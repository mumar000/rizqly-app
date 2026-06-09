"use client";

import { useEffect, useState } from "react";
import { onlineManager, useMutationState, useQueryClient } from "@tanstack/react-query";

/**
 * Single source of truth for "are we online?" + wires React Query's
 * onlineManager to browser events so it auto-pauses mutations offline
 * and auto-resumes the queue on reconnect.
 *
 * Also exposes the number of pending (paused or in-flight) mutations
 * so the SyncStatusBanner can show a count.
 */
export function useOnlineStatus() {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const updateOnline = () => {
      const next = navigator.onLine;
      setIsOnline(next);
      onlineManager.setOnline(next);
      if (next) {
        // Reconnected — flush queued writes in submission order.
        queryClient.resumePausedMutations();
      }
    };

    // Seed React Query with whatever the browser thinks right now.
    onlineManager.setOnline(navigator.onLine);

    // Resume on first mount in case there's a queue from a previous session.
    if (navigator.onLine) {
      queryClient.resumePausedMutations();
    }

    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, [queryClient]);

  // Count mutations that haven't finished yet.
  const pendingCount = useMutationState({
    filters: { status: "pending" },
    select: () => 1,
  }).length;

  return { isOnline, pendingCount };
}
