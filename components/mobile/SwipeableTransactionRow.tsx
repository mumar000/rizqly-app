"use client";

import React from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useLongPress } from "@/hooks/useLongPress";
import {
  CATEGORY_COLORS,
  CATEGORY_EMOJIS,
  INCOME_COLORS,
  INCOME_EMOJIS,
  formatPKR,
} from "@/utils/expenseParser";
import type { Transaction } from "@/services/transaction.service";

interface SwipeableTransactionRowProps {
  transaction: Transaction;
  index: number;
  selected: boolean;
  selectionMode: boolean;
  onDelete: (id: string) => void;
  onOpen: (transaction: Transaction) => void;
  onLongPress: (id: string) => void;
  onToggleSelect: (id: string) => void;
  formatDate: (s: string) => string;
}

function SwipeableTransactionRowImpl({
  transaction,
  index,
  selected,
  selectionMode,
  onDelete,
  onOpen,
  onLongPress,
  onToggleSelect,
  formatDate,
}: SwipeableTransactionRowProps) {
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-100, -40, 0], [1, 0.5, 0]);
  const deleteScale = useTransform(x, [-100, -40, 0], [1.1, 0.85, 0.6]);
  const cardOpacity = useTransform(x, [-200, -120, 0], [0, 0.3, 1]);
  const isIncome = transaction.direction === "income";
  const categoryColor = isIncome
    ? INCOME_COLORS[transaction.category] || "#22C55E"
    : CATEGORY_COLORS[transaction.category] || "#8884d8";
  const categoryEmoji = isIncome
    ? INCOME_EMOJIS[transaction.category] || "✨"
    : CATEGORY_EMOJIS[transaction.category] || "📦";

  const { handlers: longPressHandlers, didFireRef } = useLongPress({
    onLongPress: () => onLongPress(transaction.id),
    enabled: !selectionMode,
  });

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -80) {
      animate(x, -500, { duration: 0.25, ease: "easeIn" }).then(() => {
        onDelete(transaction.id);
      });
    } else {
      animate(x, 0, { type: "spring", stiffness: 500, damping: 35 });
    }
  };

  const handleTap = () => {
    if (didFireRef.current) {
      didFireRef.current = false;
      return;
    }
    if (selectionMode) onToggleSelect(transaction.id);
    else onOpen(transaction);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.03 }}
      className="relative overflow-hidden rounded-[16px]"
    >
      {!selectionMode && (
        <motion.div
          style={{
            opacity: deleteOpacity,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,59,48,0.15) 30%, rgba(255,59,48,0.95) 100%)",
          }}
          className="absolute inset-0 flex items-center justify-end pr-5 rounded-[16px]"
        >
          <motion.div
            style={{ scale: deleteScale }}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-2xl">🗑️</span>
            <span className="text-white text-[10px] font-bold tracking-wide">
              DELETE
            </span>
          </motion.div>
        </motion.div>
      )}

      <motion.div
        {...longPressHandlers}
        drag={selectionMode ? false : "x"}
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={{ left: 0.15, right: 0 }}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        animate={{ scale: selected ? 0.97 : 1 }}
        transition={{ duration: 0.12 }}
        style={{
          x: selectionMode ? 0 : x,
          opacity: selectionMode ? 1 : cardOpacity,
          background: selected
            ? "rgba(204,255,0,0.08)"
            : "rgba(255,255,255,0.04)",
          border: selected
            ? "1px solid rgba(204,255,0,0.45)"
            : "1px solid rgba(255,255,255,0.07)",
          borderRadius: "16px",
          willChange: "transform",
        }}
        className="relative p-4 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <div
              className="w-11 h-11 rounded-[14px] flex items-center justify-center text-xl"
              style={{ background: `${categoryColor}18` }}
            >
              {categoryEmoji}
            </div>
            {selectionMode && (
              <div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold"
                style={{
                  background: selected ? "#CCFF00" : "rgba(0,0,0,0.6)",
                  color: selected ? "#000" : "#fff",
                  border: selected
                    ? "1.5px solid #15161F"
                    : "1.5px solid rgba(255,255,255,0.15)",
                }}
              >
                {selected ? "✓" : ""}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-sm truncate">
              {transaction.description}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-white/35 mt-0.5">
              <span className="truncate">{transaction.bank_account}</span>
              <span>·</span>
              <span>{formatDate(transaction.created_at)}</span>
            </div>
          </div>
        </div>
        <span
          className="font-extrabold text-sm flex-shrink-0 ml-2"
          style={{ color: isIncome ? "#39FF14" : "#FF7A8A" }}
        >
          {formatPKR(Number(transaction.amount))}
        </span>
      </motion.div>
    </motion.div>
  );
}

export const SwipeableTransactionRow = React.memo(SwipeableTransactionRowImpl);
