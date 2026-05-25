"use client";

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Transaction } from "@/services/transaction.service";
import {
  formatPKR,
  CATEGORY_EMOJIS,
  CATEGORY_COLORS,
  INCOME_EMOJIS,
  INCOME_COLORS,
} from "@/utils/expenseParser";

interface DayDetailSheetProps {
  date: Date | null;
  transactions: Transaction[];
  onClose: () => void;
  onOpenTransaction: (t: Transaction) => void;
}

function sameLocalDay(d: Date, ref: Date) {
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

export function DayDetailSheet({
  date,
  transactions,
  onClose,
  onOpenTransaction,
}: DayDetailSheetProps) {
  useEffect(() => {
    if (!date) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [date, onClose]);

  const dayTx = useMemo(() => {
    if (!date) return [];
    return transactions.filter((t) => {
      const d = new Date(t.date || t.created_at);
      return !Number.isNaN(d.getTime()) && sameLocalDay(d, date);
    });
  }, [date, transactions]);

  const { totalIn, totalOut } = useMemo(() => {
    let inn = 0;
    let out = 0;
    for (const t of dayTx) {
      const a = Number(t.amount) || 0;
      if (t.direction === "income") inn += a;
      else out += a;
    }
    return { totalIn: inn, totalOut: out };
  }, [dayTx]);

  const formattedDate = date
    ? date.toLocaleDateString("en-PK", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <AnimatePresence>
      {date && (
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
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] px-5 pb-8 pt-3"
            style={{
              background: "#15161F",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              maxHeight: "85vh",
              overflowY: "auto",
              willChange: "transform",
            }}
          >
            <div className="flex justify-center pb-3">
              <div className="h-1.5 w-12 rounded-full bg-white/15" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-extrabold tracking-widest uppercase text-white/40">
                  {dayTx.length} transaction{dayTx.length === 1 ? "" : "s"}
                </p>
                <h2 className="text-lg font-extrabold text-white mt-0.5">
                  {formattedDate}
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

            {dayTx.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <StatTile
                  label="In"
                  value={formatPKR(totalIn)}
                  color="#39FF14"
                />
                <StatTile
                  label="Out"
                  value={formatPKR(totalOut)}
                  color="#FF7A8A"
                />
              </div>
            )}

            {dayTx.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🍃</div>
                <p className="text-white/40 font-medium text-sm">
                  Nothing logged
                </p>
                <p className="text-white/20 text-xs mt-1">A quiet money day.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dayTx.map((t) => (
                  <DayRow key={t.id} transaction={t} onOpen={onOpenTransaction} />
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatTile({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="rounded-[16px] p-3"
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/40">
        {label}
      </p>
      <p
        className="text-base font-extrabold mt-0.5 truncate"
        style={{ color }}
      >
        {value}
      </p>
    </div>
  );
}

function DayRow({
  transaction,
  onOpen,
}: {
  transaction: Transaction;
  onOpen: (t: Transaction) => void;
}) {
  const isIncome = transaction.direction === "income";
  const color = isIncome
    ? INCOME_COLORS[transaction.category] || "#22C55E"
    : CATEGORY_COLORS[transaction.category] || "#A78BFA";
  const emoji = isIncome
    ? INCOME_EMOJIS[transaction.category] || "✨"
    : CATEGORY_EMOJIS[transaction.category] || "📦";
  const time = new Date(transaction.created_at).toLocaleTimeString("en-PK", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => onOpen(transaction)}
      className="w-full rounded-[16px] p-3.5 flex items-center justify-between text-left"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-[12px] flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: `${color}1F` }}
        >
          {emoji}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white text-sm truncate">
            {transaction.description}
          </p>
          <p className="text-xs text-white/35 mt-0.5">{time}</p>
        </div>
      </div>
      <span
        className="font-extrabold text-sm flex-shrink-0 ml-2"
        style={{ color: isIncome ? "#39FF14" : "#FF7A8A" }}
      >
        {formatPKR(Number(transaction.amount))}
      </span>
    </motion.button>
  );
}
