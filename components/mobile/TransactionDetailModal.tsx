"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { type Transaction } from "@/services/transaction.service";
import {
  formatPKR,
  CATEGORY_EMOJIS,
  CATEGORY_COLORS,
  INCOME_EMOJIS,
  INCOME_COLORS,
} from "@/utils/expenseParser";

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

function formatDay(input: string) {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-PK", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(input: string) {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-PK", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function relativeFromNow(input: string) {
  if (!input) return "";
  const d = new Date(input).getTime();
  if (Number.isNaN(d)) return "";
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (days < 30) return `${days}d ago`;
  return "";
}

export function TransactionDetailModal({
  transaction,
  onClose,
  onDelete,
}: TransactionDetailModalProps) {
  useEffect(() => {
    if (!transaction) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [transaction, onClose]);

  const isIncome = transaction?.direction === "income";
  const color = transaction
    ? isIncome
      ? INCOME_COLORS[transaction.category] || "#22C55E"
      : CATEGORY_COLORS[transaction.category] || "#A78BFA"
    : "#A78BFA";
  const emoji = transaction
    ? isIncome
      ? INCOME_EMOJIS[transaction.category] || "✨"
      : CATEGORY_EMOJIS[transaction.category] || "📦"
    : "📦";

  return (
    <AnimatePresence>
      {transaction && (
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
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 500) onClose();
            }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] px-5 pb-8 pt-3 overflow-hidden"
            style={{
              background: "#15161F",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              maxHeight: "92vh",
            }}
          >
            {/* Glow */}
            <div
              className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[420px] h-[280px] rounded-full blur-3xl opacity-50"
              style={{ background: `${color}55` }}
            />

            {/* Drag handle */}
            <div className="relative flex justify-center pb-3">
              <div className="h-1.5 w-12 rounded-full bg-white/15" />
            </div>

            {/* Hero */}
            <div className="relative text-center pt-2 pb-5">
              <motion.div
                initial={{ scale: 0.6, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
                className="mx-auto w-20 h-20 rounded-[24px] flex items-center justify-center text-4xl"
                style={{
                  background: `${color}22`,
                  boxShadow: `0 12px 40px -10px ${color}80`,
                }}
              >
                {emoji}
              </motion.div>

              <p className="mt-4 text-[10px] font-extrabold tracking-[0.2em] uppercase text-white/40">
                {isIncome ? "Money in" : "Money out"}
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-white break-words px-4">
                {transaction.description || "Untitled"}
              </h2>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="mt-3 text-[40px] leading-none font-extrabold tracking-tight"
                style={{
                  color: isIncome ? "#39FF14" : "#FF7A8A",
                  textShadow: isIncome
                    ? "0 0 24px rgba(57,255,20,0.35)"
                    : "0 0 24px rgba(255,122,138,0.25)",
                }}
              >
                {formatPKR(Number(transaction.amount))}
              </motion.p>
            </div>

            {/* Grid */}
            <div className="relative grid grid-cols-2 gap-3">
              <Tile
                label="Category"
                value={transaction.category}
                accent={color}
                icon={emoji}
              />
              <Tile
                label="Bank"
                value={transaction.bank_account || "—"}
                accent="#60A5FA"
                icon="🏦"
              />
              <Tile
                label="Date"
                value={formatDay(transaction.date || transaction.created_at)}
                accent="#F472B6"
                icon="📅"
              />
              <Tile
                label="Time"
                value={formatTime(transaction.created_at)}
                hint={relativeFromNow(transaction.created_at)}
                accent="#FBBF24"
                icon="⏰"
              />
            </div>

            {/* Actions */}
            <div className="relative mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-2xl py-3.5 font-extrabold text-white text-sm"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                Close
              </button>
              {onDelete && (
                <button
                  onClick={() => {
                    onDelete(transaction.id);
                    onClose();
                  }}
                  className="flex-1 rounded-2xl py-3.5 font-extrabold text-sm"
                  style={{
                    background: "rgba(255,59,48,0.12)",
                    color: "#FF6B6B",
                    border: "1px solid rgba(255,59,48,0.2)",
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Tile({
  label,
  value,
  hint,
  accent,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  accent: string;
  icon: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] p-4 flex flex-col gap-2"
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-[10px] flex items-center justify-center text-sm"
          style={{ background: `${accent}22` }}
        >
          {icon}
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/40">
          {label}
        </span>
      </div>
      <div>
        <p className="text-sm font-extrabold text-white truncate">{value}</p>
        {hint && <p className="text-[11px] text-white/35 mt-0.5">{hint}</p>}
      </div>
    </motion.div>
  );
}
