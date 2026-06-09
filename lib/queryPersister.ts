"use client";

import { get, set, del } from "idb-keyval";
import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";

const STORAGE_KEY = "rizqly-query-cache.v1";

/**
 * IndexedDB-backed persister for the React Query cache.
 *
 * Why IndexedDB and not localStorage:
 *   - Survives across tabs, restarts, airplane mode.
 *   - Can hold MBs (localStorage caps at ~5MB and is synchronous, blocking the UI).
 *   - Async API — won't block render on first paint.
 *
 * Falls back to a no-op if window isn't available (SSR / Node).
 */
export function createIndexedDbPersister(): Persister {
  if (typeof window === "undefined") {
    // SSR no-op — only the client persists.
    return {
      persistClient: async () => {},
      restoreClient: async () => undefined,
      removeClient: async () => {},
    };
  }

  return {
    persistClient: async (client: PersistedClient) => {
      try {
        await set(STORAGE_KEY, client);
      } catch {
        // Storage full / blocked — silently drop. Cache is best-effort.
      }
    },
    restoreClient: async () => {
      try {
        return (await get<PersistedClient>(STORAGE_KEY)) ?? undefined;
      } catch {
        return undefined;
      }
    },
    removeClient: async () => {
      try {
        await del(STORAGE_KEY);
      } catch {}
    },
  };
}
