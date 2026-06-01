"use client";

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import {
  useTransactions,
  useTransactionStats,
} from "@/hooks/queries/useTransactions";
import { useDeleteTransaction } from "@/hooks/mutations/useDeleteTransaction";
import { usePeriodFilter } from "@/hooks/usePeriodFilter";
import { useTransactionSelection } from "@/hooks/useTransactionSelection";
import { useSavedGroups } from "@/hooks/useSavedGroups";
import type { Period } from "@/types/period";
import type { Transaction } from "@/services/transaction.service";
import { PeriodSelector } from "@/components/mobile/PeriodSelector";
import { SwipeableTransactionRow } from "@/components/mobile/SwipeableTransactionRow";
import { TransactionDetailModal } from "@/components/mobile/TransactionDetailModal";
import { SelectionCalcBar } from "@/components/mobile/SelectionCalcBar";
import { SavedGroupsSheet } from "@/components/mobile/SavedGroupsSheet";
import { formatPKR } from "@/utils/expenseParser";

interface DayGroup {
  key: string;
  label: string;
  totalIn: number;
  totalOut: number;
  items: Transaction[];
}

function dayKey(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "unknown";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (same(d, today)) return "Today";
  if (same(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-PK", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatRelative(s: string) {
  const diffMs = Date.now() - new Date(s).getTime();
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(diffMs / 3600000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return new Date(s).toLocaleTimeString("en-PK", {
    hour: "numeric",
    minute: "2-digit",
  });
}

type DirectionFilter = "all" | "income" | "expense";

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [activePeriod, setActivePeriod] = useState<Period>({
    type: "this_month",
  });
  const periodMeta = usePeriodFilter(activePeriod);

  const [direction, setDirection] = useState<DirectionFilter>("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [groupsSheetOpen, setGroupsSheetOpen] = useState(false);

  const { data: allTransactions = [], isLoading } = useTransactions(
    periodMeta.filters,
  );
  const { data: stats } = useTransactionStats(periodMeta.filters);
  const deleteTransaction = useDeleteTransaction();

  const transactions = useMemo(
    () =>
      direction === "all"
        ? allTransactions
        : allTransactions.filter((t) => t.direction === direction),
    [allTransactions, direction],
  );

  const selection = useTransactionSelection(transactions);
  const savedGroups = useSavedGroups();

  const handleOpenDetail = useCallback(
    (t: Transaction) => setSelectedTransaction(t),
    [],
  );
  const handleDeleteOne = useCallback(
    (id: string) => deleteTransaction.mutate(id),
    [deleteTransaction],
  );
  const handleLongPress = selection.select;
  const handleToggleSelect = selection.toggle;
  const handleCancelSelection = selection.clear;

  const handleSaveGroup = useCallback(
    (name: string) => {
      const { selectedTransactions, totalIncome, totalExpense, net } =
        selection.stats;
      if (selectedTransactions.length === 0) return;
      savedGroups.save({
        name,
        transactionIds: selectedTransactions.map((t) => t.id),
        total: totalIncome + totalExpense,
        net,
      });
      selection.clear();
    },
    [selection, savedGroups],
  );

  const handleDeleteSelection = useCallback(() => {
    const ids = Array.from(selection.selectedIds);
    if (ids.length === 0) return;
    ids.forEach((id) => deleteTransaction.mutate(id));
    selection.clear();
  }, [selection, deleteTransaction]);

  // Group by day (single pass, memoized).
  const groups = useMemo<DayGroup[]>(() => {
    const map = new Map<string, DayGroup>();
    for (const t of transactions) {
      const k = dayKey(t.created_at);
      let g = map.get(k);
      if (!g) {
        g = { key: k, label: dayLabel(t.created_at), totalIn: 0, totalOut: 0, items: [] };
        map.set(k, g);
      }
      const amt = Number(t.amount) || 0;
      if (t.direction === "income") g.totalIn += amt;
      else g.totalOut += amt;
      g.items.push(t);
    }
    return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [transactions]);

  if (!user && !authLoading) return null;

  const totalIncome = stats?.totalIncome ?? 0;
  const totalExpenses = stats?.totalExpenses ?? 0;
  const hasResults = transactions.length > 0;

  return (
    <div
      className="min-h-screen flex flex-col pb-28"
      style={{ backgroundColor: "#0F0F11" }}
    >
      {/* Header */}
      <header className="px-6 pt-10 pb-3">
        <div className="flex items-center gap-3">
          <Link
            href="/budget"
            aria-label="Back"
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-extrabold"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
            }}
          >
            ‹
          </Link>
          <div>
            <p className="text-[#8F90A6] text-[10px] font-extrabold tracking-[0.25em] uppercase">
              Transactions
            </p>
            <h1 className="text-[28px] leading-tight font-extrabold text-white mt-0.5">
              {periodMeta.label}
            </h1>
          </div>
        </div>

        {/* Quick totals row */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Tile label="In" value={formatPKR(totalIncome)} color="#39FF14" />
          <Tile label="Out" value={formatPKR(totalExpenses)} color="#FF7A8A" />
        </div>
      </header>

      <PeriodSelector activePeriod={activePeriod} onChange={setActivePeriod} />

      {/* Direction filter */}
      <div className="px-6 mt-4 flex gap-2">
        <FilterChip
          active={direction === "all"}
          onClick={() => setDirection("all")}
        >
          All · {allTransactions.length}
        </FilterChip>
        <FilterChip
          active={direction === "income"}
          onClick={() => setDirection("income")}
        >
          💰 Income
        </FilterChip>
        <FilterChip
          active={direction === "expense"}
          onClick={() => setDirection("expense")}
        >
          💸 Expense
        </FilterChip>
      </div>

      {/* Day-grouped list */}
      <div className="flex-1 px-6 mt-5 space-y-6">
        {isLoading && !hasResults ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="rounded-[16px] p-4 flex items-center gap-3"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-[14px] flex-shrink-0 animate-pulse"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />
                <div className="flex-1 space-y-2">
                  <div
                    className="w-3/5 h-3.5 rounded-lg animate-pulse"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                  />
                  <div
                    className="w-2/5 h-3 rounded-lg animate-pulse"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  />
                </div>
                <div
                  className="w-16 h-4 rounded-lg animate-pulse"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
            ))}
          </div>
        ) : !hasResults ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🍃</div>
            <p className="text-white/40 font-medium">
              {direction === "income"
                ? "No income in this period"
                : direction === "expense"
                  ? "No expenses in this period"
                  : "Nothing logged in this period"}
            </p>
          </div>
        ) : (
          groups.map((g) => {
            const net = g.totalIn - g.totalOut;
            return (
              <section key={g.key}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/40">
                    {g.label}
                  </p>
                  <p
                    className="text-[11px] font-extrabold"
                    style={{
                      color: net >= 0 ? "#39FF14" : "#FF7A8A",
                    }}
                  >
                    {net >= 0 ? "+" : ""}
                    {formatPKR(Math.abs(net))}
                  </p>
                </div>
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {g.items.map((t, i) => (
                      <SwipeableTransactionRow
                        key={t.id}
                        transaction={t}
                        index={i}
                        selected={selection.selectedIds.has(t.id)}
                        selectionMode={selection.isSelectionMode}
                        onDelete={handleDeleteOne}
                        onOpen={handleOpenDetail}
                        onLongPress={handleLongPress}
                        onToggleSelect={handleToggleSelect}
                        formatDate={formatRelative}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            );
          })
        )}
      </div>

      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onDelete={handleDeleteOne}
      />

      <SelectionCalcBar
        visible={selection.isSelectionMode}
        stats={selection.stats}
        onCancel={handleCancelSelection}
        onSaveGroup={handleSaveGroup}
        onDeleteAll={handleDeleteSelection}
      />

      <SavedGroupsSheet
        open={groupsSheetOpen}
        groups={savedGroups.groups}
        onClose={() => setGroupsSheetOpen(false)}
        onOpenGroup={(g) => {
          selection.replace(g.transactionIds);
          setGroupsSheetOpen(false);
        }}
        onDeleteGroup={savedGroups.remove}
      />

      {savedGroups.groups.length > 0 && !selection.isSelectionMode && (
        <button
          onClick={() => setGroupsSheetOpen(true)}
          className="fixed bottom-24 left-4 z-30 rounded-full px-3.5 py-2 flex items-center gap-1.5 text-xs font-extrabold text-white backdrop-blur-xl"
          style={{
            background: "rgba(20,21,32,0.85)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.6)",
          }}
        >
          🧮 Groups
          <span className="text-[10px] text-white/40">
            {savedGroups.groups.length}
          </span>
        </button>
      )}
    </div>
  );
}

function Tile({
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

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className="rounded-full px-3.5 py-1.5 text-xs font-extrabold"
      style={{
        background: active ? "rgba(204,255,0,0.14)" : "rgba(255,255,255,0.04)",
        color: active ? "#CCFF00" : "#fff",
        border: `1px solid ${
          active ? "rgba(204,255,0,0.3)" : "rgba(255,255,255,0.06)"
        }`,
      }}
    >
      {children}
    </motion.button>
  );
}
