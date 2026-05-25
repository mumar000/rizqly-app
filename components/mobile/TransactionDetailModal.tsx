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

const SOURCE_LABEL: Record<Transaction["sourceType"], string> = {
  manual: "Manual entry",
  natural_language: "Natural language",
  receipt_scan: "Receipt scan",
  system: "System",
};

function formatFullDate(input: string) {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleString("en-PK", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
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
  if (m < 60) return `${m} min ago`;
  if (h < 24) return `${h} hr ago`;
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
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
      : CATEGORY_COLORS[transaction.category] || "#8884d8"
    : "#8884d8";
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
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] px-6 pb-10 pt-3"
            style={{
              background: "#1A1B2E",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              maxHeight: "92vh",
              overflowY: "auto",
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pb-4">
              <div className="h-1.5 w-12 rounded-full bg-white/15" />
            </div>

            {/* Header */}
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-[20px] flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: `${color}22` }}
              >
                {emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-extrabold tracking-widest uppercase text-white/40">
                  {isIncome ? "Income" : "Expense"} · {transaction.category}
                </p>
                <h2 className="mt-0.5 text-xl font-extrabold text-white break-words">
                  {transaction.description || "Untitled"}
                </h2>
                <p
                  className={`mt-2 text-3xl font-extrabold ${
                    isIncome ? "text-[#86EFAC]" : "text-white"
                  }`}
                >
                  {isIncome ? "+" : "-"}
                  {formatPKR(Number(transaction.amount))}
                </p>
              </div>
            </div>

            {/* Detail grid */}
            <div className="mt-7 space-y-2">
              <DetailRow label="Bank" value={transaction.bank_account || "—"} />
              <DetailRow
                label="Date"
                value={formatFullDate(transaction.date || transaction.created_at)}
                hint={relativeFromNow(transaction.created_at)}
              />
              <DetailRow
                label="Logged"
                value={formatFullDate(transaction.created_at)}
              />
              <DetailRow
                label="Source"
                value={SOURCE_LABEL[transaction.sourceType] ?? transaction.sourceType}
              />
              {transaction.rawInput && (
                <DetailRow
                  label="You typed"
                  value={`"${transaction.rawInput}"`}
                />
              )}
              {transaction.scanStatus && transaction.scanStatus !== "none" && (
                <DetailRow
                  label="Scan"
                  value={`${transaction.scanStatus}${
                    transaction.scanConfidence != null
                      ? ` · ${Math.round(transaction.scanConfidence * 100)}%`
                      : ""
                  }`}
                />
              )}
              {transaction.relatedGoalId && (
                <DetailRow label="Linked goal" value={transaction.relatedGoalId} />
              )}
              <DetailRow label="ID" value={transaction.id} mono />
            </div>

            {/* Actions */}
            <div className="mt-7 flex gap-3">
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

function DetailRow({
  label,
  value,
  hint,
  mono = false,
}: {
  label: string;
  value: string;
  hint?: string;
  mono?: boolean;
}) {
  return (
    <div
      className="flex items-start justify-between gap-4 rounded-[14px] px-4 py-3"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <span className="text-xs font-bold uppercase tracking-wider text-white/40 pt-0.5">
        {label}
      </span>
      <div className="text-right min-w-0 flex-1">
        <p
          className={`text-sm font-bold text-white break-words ${
            mono ? "font-mono text-xs text-white/70" : ""
          }`}
        >
          {value}
        </p>
        {hint && <p className="text-[11px] text-white/35 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}
