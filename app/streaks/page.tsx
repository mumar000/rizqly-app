"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/queries/useTransactions";
import { CalendarHeatmap } from "@/components/mobile/CalendarHeatmap";
import { DayDetailSheet } from "@/components/mobile/DayDetailSheet";
import { TransactionDetailModal } from "@/components/mobile/TransactionDetailModal";
import { BillsTimeline } from "@/components/mobile/BillsTimeline";
import { AddBillSheet } from "@/components/mobile/AddBillSheet";
import { BillDetailSheet } from "@/components/mobile/BillDetailSheet";
import { useBills } from "@/hooks/queries/useBills";
import type { Bill } from "@/services/bill.service";
import type { Transaction } from "@/services/transaction.service";

function monthBounds(month: Date) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const toIso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  return { startDate: toIso(startDate), endDate: toIso(endDate) };
}

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [openTransaction, setOpenTransaction] = useState<Transaction | null>(
    null,
  );
  const [addBillOpen, setAddBillOpen] = useState(false);
  const [openBill, setOpenBill] = useState<Bill | null>(null);

  const { data: bills = [] } = useBills();

  const { startDate, endDate } = useMemo(
    () => monthBounds(viewMonth),
    [viewMonth],
  );
  const { data: transactions = [] } = useTransactions({ startDate, endDate });

  const monthLabel = useMemo(
    () =>
      viewMonth.toLocaleDateString("en-PK", {
        month: "long",
        year: "numeric",
      }),
    [viewMonth],
  );

  const heroStats = useMemo(() => {
    const counts = new Map<string, number>();
    let totalTx = 0;
    for (const t of transactions) {
      const raw = t.date || t.created_at;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) continue;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const key = `${y}-${m}-${day}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
      totalTx += 1;
    }
    const daysInMonth = new Date(
      viewMonth.getFullYear(),
      viewMonth.getMonth() + 1,
      0,
    ).getDate();
    const activeDays = counts.size;

    let maxCount = 0;
    let hottestDay: Date | null = null;
    for (const [key, count] of counts) {
      if (count > maxCount) {
        maxCount = count;
        const [y, m, d] = key.split("-").map(Number);
        hottestDay = new Date(y, m - 1, d);
      }
    }

    const today = new Date();
    const todayY = today.getFullYear();
    const todayM = String(today.getMonth() + 1).padStart(2, "0");
    const todayD = String(today.getDate()).padStart(2, "0");
    const todayKey = `${todayY}-${todayM}-${todayD}`;
    const loggedToday = (counts.get(todayKey) ?? 0) > 0;

    return {
      activeDays,
      daysInMonth,
      totalTx,
      hottestDay,
      maxCount,
      loggedToday,
    };
  }, [transactions, viewMonth]);

  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return (
      now.getFullYear() === viewMonth.getFullYear() &&
      now.getMonth() === viewMonth.getMonth()
    );
  }, [viewMonth]);

  const shiftMonth = useCallback((delta: number) => {
    setSelectedDay(null);
    setSelectedKey(null);
    setViewMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1),
    );
  }, []);

  const handleSelectDay = useCallback((date: Date, key: string) => {
    setSelectedDay(date);
    setSelectedKey(key);
  }, []);

  if (!user && !authLoading) return null;

  return (
    <div
      className="min-h-screen flex flex-col pb-28"
      style={{ backgroundColor: "#0F0F11" }}
    >
      <header className="px-6 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#8F90A6] text-[10px] font-extrabold tracking-[0.25em] uppercase">
              Calendar
            </p>
            <h1 className="text-[28px] leading-tight font-extrabold text-white mt-1">
              {monthLabel}
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <NavButton onClick={() => shiftMonth(-1)} aria="Previous month">
              ‹
            </NavButton>
            <NavButton
              onClick={() =>
                setViewMonth(() => {
                  const n = new Date();
                  return new Date(n.getFullYear(), n.getMonth(), 1);
                })
              }
              aria="This month"
              disabled={isCurrentMonth}
            >
              •
            </NavButton>
            <NavButton onClick={() => shiftMonth(1)} aria="Next month">
              ›
            </NavButton>
          </div>
        </div>

        {/* Hero stat strip */}
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6">
          <StatPill
            icon="⚡"
            label={heroStats.loggedToday ? "Active today" : "Quiet today"}
            tone={heroStats.loggedToday ? "lime" : "muted"}
            pulse={heroStats.loggedToday}
          />
          <StatPill
            icon="✨"
            label={`${heroStats.activeDays}/${heroStats.daysInMonth} days`}
          />
          {heroStats.hottestDay && (
            <StatPill
              icon="👑"
              label={`${heroStats.hottestDay.toLocaleDateString("en-PK", {
                weekday: "short",
                day: "numeric",
              })} · ${heroStats.maxCount}`}
            />
          )}
          <StatPill icon="📊" label={`${heroStats.totalTx} total`} />
        </div>
      </header>

      <section className="px-5 mt-3">
        <motion.div
          key={monthLabel}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="relative rounded-[28px] p-5 overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(204,255,0,0.04) 0%, rgba(255,255,255,0.025) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 20px 60px -30px rgba(204,255,0,0.25)",
          }}
        >
          {/* Soft top glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[260px] rounded-full blur-3xl"
            style={{ background: "rgba(204,255,0,0.18)" }}
          />
          <div className="relative">
            <CalendarHeatmap
              month={viewMonth}
              transactions={transactions}
              selectedKey={selectedKey}
              onSelectDay={handleSelectDay}
            />
          </div>
        </motion.div>
      </section>

      <section className="px-5 mt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-extrabold text-base flex items-center gap-2">
            <span>📆</span> Coming up
          </h2>
          <button
            onClick={() => setAddBillOpen(true)}
            className="text-[10px] font-extrabold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full inline-flex items-center gap-1"
            style={{
              color: "#CCFF00",
              background: "rgba(204,255,0,0.12)",
              border: "1px solid rgba(204,255,0,0.25)",
            }}
          >
            + Add
          </button>
        </div>

        {bills.length === 0 ? (
          <div
            className="relative rounded-[24px] p-8 text-center"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px dashed rgba(255,255,255,0.08)",
            }}
          >
            <div className="text-4xl mb-2">🧾</div>
            <p className="text-white font-extrabold text-sm">
              Never get blindsided by a bill
            </p>
            <p className="text-white/45 text-xs mt-1.5 px-4 leading-relaxed">
              Track rent, subs and recurring charges. We’ll surface what’s next.
            </p>
            <button
              onClick={() => setAddBillOpen(true)}
              className="mt-4 rounded-full px-4 py-2 text-xs font-extrabold inline-flex items-center gap-1.5"
              style={{
                background: "#CCFF00",
                color: "#000",
              }}
            >
              + Add your first bill
            </button>
          </div>
        ) : (
          <BillsTimeline bills={bills} onOpen={(b) => setOpenBill(b)} />
        )}
      </section>

      <DayDetailSheet
        date={selectedDay}
        transactions={transactions}
        onClose={() => {
          setSelectedDay(null);
          setSelectedKey(null);
        }}
        onOpenTransaction={(t) => setOpenTransaction(t)}
      />

      <AnimatePresence>
        {openTransaction && (
          <TransactionDetailModal
            transaction={openTransaction}
            onClose={() => setOpenTransaction(null)}
          />
        )}
      </AnimatePresence>

      <AddBillSheet open={addBillOpen} onClose={() => setAddBillOpen(false)} />

      <BillDetailSheet bill={openBill} onClose={() => setOpenBill(null)} />
    </div>
  );
}

function NavButton({
  children,
  onClick,
  aria,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  aria: string;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={aria}
      className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-extrabold disabled:opacity-30"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#fff",
      }}
    >
      {children}
    </motion.button>
  );
}

function StatPill({
  icon,
  label,
  tone = "default",
  pulse = false,
}: {
  icon: string;
  label: string;
  tone?: "default" | "lime" | "muted";
  pulse?: boolean;
}) {
  const palette =
    tone === "lime"
      ? {
          bg: "rgba(204,255,0,0.12)",
          border: "rgba(204,255,0,0.3)",
          text: "#CCFF00",
        }
      : tone === "muted"
        ? {
            bg: "rgba(255,255,255,0.04)",
            border: "rgba(255,255,255,0.06)",
            text: "rgba(255,255,255,0.5)",
          }
        : {
            bg: "rgba(255,255,255,0.05)",
            border: "rgba(255,255,255,0.08)",
            text: "#fff",
          };
  return (
    <div
      className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold whitespace-nowrap"
      style={{
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        color: palette.text,
      }}
    >
      <span className="relative inline-flex items-center">
        {icon}
        {pulse && (
          <motion.span
            aria-hidden
            className="absolute -right-1 -top-1 w-1.5 h-1.5 rounded-full"
            style={{ background: "#CCFF00" }}
            animate={{ opacity: [1, 0.2, 1], scale: [1, 1.4, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </span>
      {label}
    </div>
  );
}
