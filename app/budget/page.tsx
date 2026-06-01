"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import {
  useTransactions,
  useTransactionStats,
} from "@/hooks/queries/useTransactions";
import { useBanks } from "@/hooks/queries/useBanks";
import { usePeriodFilter } from "@/hooks/usePeriodFilter";
import type { Period } from "@/types/period";
import { FinanceAnalyticsChart } from "@/components/mobile/FinanceAnalyticsChart";
import { DailyRizqCard } from "@/components/mobile/DailyRizqCard";
import { PeriodSelector } from "@/components/mobile/PeriodSelector";
import { BankCarousel } from "@/components/mobile/BankCarousel";
import { formatPKR } from "@/utils/expenseParser";


function DeltaPill({
  current,
  previous,
  label,
  invert = false,
}: {
  current: number;
  previous: number;
  label: string;
  /** When true, a positive delta is bad (used for expenses). */
  invert?: boolean;
}) {
  if (previous <= 0 && current <= 0) return null;

  const delta = previous > 0 ? ((current - previous) / previous) * 100 : 100;
  const isGood = invert ? delta <= 0 : delta >= 0;

  return (
    <div
      className="mt-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-extrabold"
      style={{
        color: isGood ? "#86EFAC" : "#FF8B8B",
        background: isGood
          ? "rgba(134,239,172,0.10)"
          : "rgba(255,139,139,0.10)",
      }}
    >
      <span>{delta >= 0 ? "▲" : "▼"}</span>
      <span>
        {Math.abs(Math.round(delta))}% vs {label}
      </span>
    </div>
  );
}

export default function BudgetPage() {
  const { user, loading: authLoading } = useAuth();
  const [activePeriod, setActivePeriod] = useState<Period>({
    type: "this_month",
  });
  const periodMeta = usePeriodFilter(activePeriod);
  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    refetch,
  } = useTransactions({
    ...periodMeta.filters,
  });
  const { data: transactionStats } = useTransactionStats(periodMeta.filters);
  const { data: priorStats } = useTransactionStats(periodMeta.priorFilters);
  const { data: banks = [] } = useBanks();

  const isLoading = transactionsLoading;

  const { expenseBreakdown, incomeBreakdown } = useMemo(() => {
    const expense: Record<string, number> = {};
    const income: Record<string, number> = {};
    for (const t of transactions) {
      const amt = Number(t.amount) || 0;
      if (t.direction === "expense") {
        expense[t.category] = (expense[t.category] ?? 0) + amt;
      } else {
        income[t.category] = (income[t.category] ?? 0) + amt;
      }
    }
    return { expenseBreakdown: expense, incomeBreakdown: income };
  }, [transactions]);

  if (!user && !authLoading) return null;

  const totalIncome = transactionStats?.totalIncome ?? 0;
  const totalExpenses = transactionStats?.totalExpenses ?? 0;
  const byBank = transactionStats?.byBank ?? {};
  const showDelta =
    activePeriod.type === "last_month" || activePeriod.type === "ytd";
  const txCount = transactions.length;

  return (
    <div
      className="min-h-screen flex flex-col pb-28"
      style={{ backgroundColor: "#0F0F11" }}
    >
      {/* Header */}
      <header className="px-6 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#8F90A6] text-xs font-extrabold tracking-widest uppercase">
              Rizqly
            </p>
            <h1 className="text-2xl font-extrabold text-white mt-0.5">
              {periodMeta.label}
            </h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => refetch()}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            🔄
          </motion.button>
        </div>
      </header>

      <PeriodSelector activePeriod={activePeriod} onChange={setActivePeriod} />

      {/* Income and Expense Cards */}
      <div className="px-6 mt-5 grid grid-cols-2 gap-4">
        {/* Income Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-[24px] relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(134,239,172,0.1) 0%, rgba(134,239,172,0.02) 100%)",
            border: "1px solid rgba(134,239,172,0.2)",
          }}
        >
          <div
            className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, #86EFAC 0%, transparent 70%)",
            }}
          />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#86EFAC]/10 text-[#86EFAC]">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
              Income
            </p>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skel-in"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  className="w-20 h-8 rounded-xl animate-pulse"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="real-in"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-xl sm:text-2xl font-extrabold text-white break-all">
                  {formatPKR(totalIncome)}
                </h2>
                {showDelta && (
                  <DeltaPill
                    current={totalIncome}
                    previous={priorStats?.totalIncome ?? 0}
                    label={periodMeta.priorLabel}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Expense Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 rounded-[24px] relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,139,139,0.1) 0%, rgba(255,139,139,0.02) 100%)",
            border: "1px solid rgba(255,139,139,0.2)",
          }}
        >
          <div
            className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, #FF8B8B 0%, transparent 70%)",
            }}
          />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#FF8B8B]/10 text-[#FF8B8B]">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </div>
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
              Expense
            </p>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skel-out"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  className="w-20 h-8 rounded-xl animate-pulse"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="real-out"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-xl sm:text-2xl font-extrabold text-white break-all">
                  {formatPKR(totalExpenses)}
                </h2>
                {showDelta && (
                  <DeltaPill
                    current={totalExpenses}
                    previous={priorStats?.totalExpenses ?? 0}
                    label={periodMeta.priorLabel}
                    invert
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 space-y-6">
        {/* Daily Rizq — always reserve space */}
        <div>
          <DailyRizqCard />
        </div>

        {/* Pie chart — skeleton while loading */}
        <div>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skel-chart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-[24px] p-5"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-36 h-5 rounded-xl mb-5 animate-pulse"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />
                <div className="flex items-center gap-6">
                  <div
                    className="w-32 h-32 rounded-full animate-pulse flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  />
                  <div className="flex-1 space-y-3">
                    {[80, 60, 70, 50].map((w, i) => (
                      <div
                        key={i}
                        className="h-3.5 rounded-lg animate-pulse"
                        style={{
                          width: `${w}%`,
                          background: "rgba(255,255,255,0.05)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="real-chart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <FinanceAnalyticsChart
                  expenseData={expenseBreakdown}
                  incomeData={incomeBreakdown}
                  totalExpenses={totalExpenses}
                  totalIncome={totalIncome}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="-mx-6">
          <BankCarousel
            banks={banks}
            byBank={byBank}
            flowLabel={periodMeta.flowSuffix}
            isLoading={isLoading}
          />
        </div>

        {/* All transactions — dedicated page */}
        <Link
          href="/transactions"
          className="block pb-4 group"
          aria-label="See all transactions"
        >
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="relative rounded-[24px] p-5 flex items-center justify-between overflow-hidden"
            style={{
              background:
                "linear-gradient(140deg, rgba(204,255,0,0.06) 0%, rgba(255,255,255,0.03) 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full blur-2xl opacity-50"
              style={{ background: "rgba(204,255,0,0.18)" }}
            />
            <div className="relative flex items-center gap-3 min-w-0">
              <div
                className="w-12 h-12 rounded-[16px] flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  background: "rgba(204,255,0,0.14)",
                  border: "1px solid rgba(204,255,0,0.25)",
                }}
              >
                🧾
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-white text-sm">
                  Transactions
                </p>
                <p className="text-white/45 text-xs mt-0.5">
                  {isLoading
                    ? "Loading…"
                    : txCount === 0
                      ? periodMeta.emptyCopy
                      : `${txCount} ${
                          txCount === 1 ? "entry" : "entries"
                        } · ${periodMeta.label}`}
                </p>
              </div>
            </div>
            <span
              className="relative text-base font-extrabold flex-shrink-0 ml-3"
              style={{ color: "#CCFF00" }}
            >
              →
            </span>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
