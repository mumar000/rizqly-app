"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatPKR } from "@/utils/expenseParser";
import type { SelectionStats } from "@/hooks/useTransactionSelection";

interface SelectionCalcBarProps {
  visible: boolean;
  stats: SelectionStats;
  onCancel: () => void;
  onSaveGroup: (name: string) => void;
  onDeleteAll: () => void;
}

const SPLIT_OPTIONS = [2, 3, 4, 5, 6];

export function SelectionCalcBar({
  visible,
  stats,
  onCancel,
  onSaveGroup,
  onDeleteAll,
}: SelectionCalcBarProps) {
  const [splitOpen, setSplitOpen] = useState(false);
  const [splitBy, setSplitBy] = useState(2);
  const [saveOpen, setSaveOpen] = useState(false);
  const [groupName, setGroupName] = useState("");

  const totalForSplit = Math.abs(stats.net);
  const perPerson = totalForSplit / splitBy;

  const closePopovers = () => {
    setSplitOpen(false);
    setSaveOpen(false);
  };

  const handleCancel = () => {
    closePopovers();
    setGroupName("");
    onCancel();
  };

  const handleSaveSubmit = () => {
    const trimmed = groupName.trim();
    if (!trimmed) return;
    onSaveGroup(trimmed);
    setGroupName("");
    setSaveOpen(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed top-0 inset-x-0 z-40 px-3 pt-3"
          style={{ willChange: "transform, opacity" }}
        >
          <div
            className="rounded-[24px] px-4 pt-3 pb-3 backdrop-blur-xl"
            style={{
              background: "rgba(20,21,32,0.92)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 18px 50px -12px rgba(0,0,0,0.6)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🧮</span>
                <span className="text-white text-sm font-extrabold">
                  {stats.count} selected
                </span>
              </div>
              <button
                onClick={handleCancel}
                className="text-white/60 text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                Cancel
              </button>
            </div>

            {/* Totals */}
            <div className="mt-3 flex items-end justify-between gap-3">
              <div className="flex gap-3 flex-1 min-w-0">
                <Stat
                  label="In"
                  value={`+${formatPKR(stats.totalIncome)}`}
                  color="#86EFAC"
                />
                <Stat
                  label="Out"
                  value={`-${formatPKR(stats.totalExpense)}`}
                  color="#FF8B8B"
                />
              </div>
              <div className="text-right">
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/40">
                  Net
                </p>
                <p
                  className="text-lg font-extrabold leading-none mt-0.5"
                  style={{
                    color: stats.net >= 0 ? "#86EFAC" : "#FF8B8B",
                  }}
                >
                  {stats.net >= 0 ? "+" : "-"}
                  {formatPKR(Math.abs(stats.net))}
                </p>
              </div>
            </div>

            {/* Mini ratio bar */}
            <div className="mt-3 h-1.5 rounded-full overflow-hidden flex bg-white/5">
              <motion.div
                animate={{ flex: stats.incomeRatio }}
                transition={{ duration: 0.18 }}
                style={{ background: "#86EFAC", flex: stats.incomeRatio }}
              />
              <motion.div
                animate={{ flex: 1 - stats.incomeRatio }}
                transition={{ duration: 0.18 }}
                style={{
                  background: "#FF8B8B",
                  flex: 1 - stats.incomeRatio,
                }}
              />
            </div>

            {/* Action row */}
            <div className="mt-3 flex items-center gap-2">
              <ActionChip
                icon="÷"
                label="Split"
                active={splitOpen}
                onClick={() => {
                  setSaveOpen(false);
                  setSplitOpen((v) => !v);
                }}
              />
              <ActionChip
                icon="💾"
                label="Save"
                active={saveOpen}
                onClick={() => {
                  setSplitOpen(false);
                  setSaveOpen((v) => !v);
                }}
              />
              <ActionChip
                icon="🗑️"
                label="Delete"
                tone="danger"
                onClick={onDeleteAll}
              />
            </div>

            {/* Split popover */}
            <AnimatePresence initial={false}>
              {splitOpen && (
                <motion.div
                  key="split"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                      {SPLIT_OPTIONS.map((n) => (
                        <button
                          key={n}
                          onClick={() => setSplitBy(n)}
                          className="flex-shrink-0 rounded-full px-3 py-1 text-xs font-extrabold"
                          style={{
                            background:
                              splitBy === n
                                ? "rgba(204,255,0,0.18)"
                                : "rgba(255,255,255,0.06)",
                            color: splitBy === n ? "#CCFF00" : "#fff",
                            border:
                              splitBy === n
                                ? "1px solid rgba(204,255,0,0.4)"
                                : "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          ÷{n}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2.5 text-xs text-white/50 font-bold">
                      Each person pays
                    </p>
                    <p className="text-xl font-extrabold text-white">
                      {formatPKR(perPerson)}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save popover */}
            <AnimatePresence initial={false}>
              {saveOpen && (
                <motion.div
                  key="save"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                    <input
                      autoFocus
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveSubmit();
                      }}
                      placeholder="Name this group e.g. Karachi trip"
                      className="flex-1 rounded-2xl bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none font-bold"
                    />
                    <button
                      onClick={handleSaveSubmit}
                      disabled={!groupName.trim()}
                      className="rounded-2xl px-4 text-xs font-extrabold text-black disabled:opacity-40"
                      style={{ background: "#CCFF00" }}
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/40">
        {label}
      </p>
      <p
        className="text-sm font-extrabold truncate"
        style={{ color }}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function ActionChip({
  icon,
  label,
  onClick,
  active = false,
  tone = "default",
}: {
  icon: string;
  label: string;
  onClick: () => void;
  active?: boolean;
  tone?: "default" | "danger";
}) {
  const danger = tone === "danger";
  return (
    <button
      onClick={onClick}
      className="flex-1 rounded-2xl py-2 flex items-center justify-center gap-1.5 text-xs font-extrabold"
      style={{
        background: danger
          ? "rgba(255,59,48,0.12)"
          : active
            ? "rgba(204,255,0,0.14)"
            : "rgba(255,255,255,0.05)",
        color: danger ? "#FF6B6B" : active ? "#CCFF00" : "#fff",
        border: `1px solid ${
          danger
            ? "rgba(255,59,48,0.2)"
            : active
              ? "rgba(204,255,0,0.3)"
              : "rgba(255,255,255,0.06)"
        }`,
      }}
    >
      <span className="text-sm">{icon}</span>
      {label}
    </button>
  );
}
