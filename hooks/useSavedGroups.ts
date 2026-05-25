import { useCallback, useEffect, useState } from "react";

export interface SavedGroup {
  id: string;
  name: string;
  transactionIds: string[];
  total: number;
  net: number;
  createdAt: string;
}

const STORAGE_KEY = "rizqly.groups.v1";

function readStorage(): SavedGroup[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(groups: SavedGroup[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch {}
}

export function useSavedGroups() {
  const [groups, setGroups] = useState<SavedGroup[]>(() => readStorage());

  useEffect(() => {
    writeStorage(groups);
  }, [groups]);

  const save = useCallback(
    (input: Omit<SavedGroup, "id" | "createdAt">) => {
      const group: SavedGroup = {
        ...input,
        id: `g_${Date.now().toString(36)}`,
        createdAt: new Date().toISOString(),
      };
      setGroups((prev) => [group, ...prev]);
      return group;
    },
    []
  );

  const remove = useCallback((id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return { groups, save, remove };
}
