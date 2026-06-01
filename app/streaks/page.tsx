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
import { BillAlertsSheet } from "@/components/mobile/BillAlertsSheet";
import { useBills } from "@/hooks/queries/useBills";
import { useDueAlerts } from "@/hooks/useDueAlerts";
import { formatPKR } from "@/utils/expenseParser";
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
  const [alertsOpen, setAlertsOpen] = useState(false);

  const { data: bills = [] } = useBills();
  const dueAlerts = useDueAlerts(bills);

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
            <BellButton
              count={dueAlerts.count}
              urgent={dueAlerts.hasUrgent}
              onClick={() => setAlertsOpen(true)}
            />
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

        {dueAlerts.count > 0 && (
          <motion.button
            layout
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setAlertsOpen(true)}
            className="w-full mb-3 rounded-[18px] p-3.5 flex items-center justify-between text-left"
            style={{
              background: dueAlerts.hasUrgent
                ? "linear-gradient(160deg, rgba(255,122,138,0.18) 0%, rgba(255,122,138,0.06) 100%)"
                : "linear-gradient(160deg, rgba(251,191,36,0.16) 0%, rgba(255,255,255,0.025) 100%)",
              border: `1px solid ${
                dueAlerts.hasUrgent
                  ? "rgba(255,122,138,0.3)"
                  : "rgba(251,191,36,0.25)"
              }`,
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl">{dueAlerts.hasUrgent ? "🚨" : "🔔"}</span>
              <div className="min-w-0">
                <p className="text-white font-extrabold text-sm truncate">
                  {dueAlerts.count} bill{dueAlerts.count === 1 ? "" : "s"} due
                  soon
                </p>
                <p className="text-white/50 text-xs mt-0.5">
                  Total {formatPKR(dueAlerts.totalAmount)} · tap to review
                </p>
              </div>
            </div>
            <span
              className="text-xs font-extrabold"
              style={{
                color: dueAlerts.hasUrgent ? "#FF7A8A" : "#FBBF24",
              }}
            >
              →
            </span>
          </motion.button>
        )}

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

      <BillAlertsSheet
        open={alertsOpen}
        alerts={dueAlerts.alerts}
        totalAmount={dueAlerts.totalAmount}
        onClose={() => setAlertsOpen(false)}
        onSnooze={(id, days) =>
          days === 0 ? dueAlerts.clearSnooze(id) : dueAlerts.snooze(id, days)
        }
      />
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

function BellButton({
  count,
  urgent,
  onClick,
}: {
  count: number;
  urgent: boolean;
  onClick: () => void;
}) {
  const active = count > 0;
  const dotColor = urgent ? "#FF7A8A" : "#FBBF24";
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      aria-label={
        active ? `${count} bills due soon` : "No bill alerts"
      }
      className="relative w-9 h-9 rounded-full flex items-center justify-center"
      style={{
        background: active
          ? "rgba(204,255,0,0.1)"
          : "rgba(255,255,255,0.05)",
        border: `1px solid ${
          active ? "rgba(204,255,0,0.3)" : "rgba(255,255,255,0.08)"
        }`,
        color: active ? "#CCFF00" : "#fff",
      }}
    >
      <span className="text-base leading-none">🔔</span>
      {active && (
        <motion.span
          className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-extrabold flex items-center justify-center text-white"
          style={{
            background: dotColor,
            border: "2px solid #0F0F11",
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 480, damping: 22 }}
        >
          {count > 9 ? "9+" : count}
        </motion.span>
      )}
      {urgent && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{ opacity: [0.55, 0.1, 0.55] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ boxShadow: `0 0 0 2px ${dotColor}55` }}
        />
      )}
    </motion.button>
  );
}

