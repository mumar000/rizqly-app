"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatPKR } from "@/utils/expenseParser";
import type { SavedGroup } from "@/hooks/useSavedGroups";

interface SavedGroupsSheetProps {
  open: boolean;
  groups: SavedGroup[];
  onClose: () => void;
  onOpenGroup: (group: SavedGroup) => void;
  onDeleteGroup: (id: string) => void;
}

function formatRelative(iso: string) {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const diff = Date.now() - d;
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Today";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-PK", {
    month: "short",
    day: "numeric",
  });
}

export function SavedGroupsSheet({
  open,
  groups,
  onClose,
  onOpenGroup,
  onDeleteGroup,
}: SavedGroupsSheetProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] px-5 pb-8 pt-3"
            style={{
              background: "#15161F",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            <div className="flex justify-center pb-3">
              <div className="h-1.5 w-12 rounded-full bg-white/15" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-extrabold tracking-widest uppercase text-white/40">
                  Saved groups
                </p>
                <h2 className="text-lg font-extrabold text-white mt-0.5">
                  Tap to recalculate
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-2xl flex items-center justify-center text-white/60 text-sm"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                ✕
              </button>
            </div>

            {groups.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-3">🧮</div>
                <p className="text-white/40 font-medium text-sm">
                  No groups saved yet
                </p>
                <p className="text-white/20 text-xs mt-1 px-8">
                  Long-press transactions, then tap Save to remember a
                  calculation
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {groups.map((g) => (
                  <motion.div
                    key={g.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-[16px] p-4 flex items-center gap-3"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <button
                      onClick={() => onOpenGroup(g)}
                      className="flex-1 flex items-center gap-3 text-left min-w-0"
                    >
                      <div
                        className="w-11 h-11 rounded-[14px] flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: "rgba(204,255,0,0.14)" }}
                      >
                        🧮
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-white text-sm truncate">
                          {g.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-white/40 mt-0.5">
                          <span>{g.transactionIds.length} items</span>
                          <span>·</span>
                          <span>{formatRelative(g.createdAt)}</span>
                        </div>
                      </div>
                      <span
                        className="text-sm font-extrabold flex-shrink-0"
                        style={{
                          color: g.net >= 0 ? "#39FF14" : "#FF7A8A",
                        }}
                      >
                        {formatPKR(Math.abs(g.net))}
                      </span>
                    </button>
                    <button
                      onClick={() => onDeleteGroup(g.id)}
                      aria-label="Delete group"
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white/80 text-sm flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
