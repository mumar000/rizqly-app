"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  daysUntil,
  isPaidForCurrentCycle,
  type Bill,
  type BillFrequency,
} from "@/services/bill.service";
import { useMarkBillPaid } from "@/hooks/mutations/useMarkBillPaid";
import { useDeleteBill } from "@/hooks/mutations/useDeleteBill";
import { formatPKR, CATEGORY_EMOJIS } from "@/utils/expenseParser";

interface BillDetailSheetProps {
  bill: Bill | null;
  onClose: () => void;
}

const FREQ_LABEL: Record<BillFrequency, string> = {
  monthly: "Monthly",
  weekly: "Weekly",
  yearly: "Yearly",
  one_off: "One-off",
};

function dueLabel(days: number) {
  if (days < 0) return `${Math.abs(days)} days late`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `in ${days} days`;
}

function urgencyColor(days: number) {
  if (days <= 2) return "#FF7A8A";
  if (days <= 7) return "#FBBF24";
  return "#A78BFA";
}

function fullDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-PK", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function BillDetailSheet({ bill, onClose }: BillDetailSheetProps) {
  const markPaid = useMarkBillPaid();
  const deleteBill = useDeleteBill();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (!bill) {
      setConfirmDelete(false);
      setPayError(null);
      return;
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [bill, onClose]);

  const paid = bill ? isPaidForCurrentCycle(bill) : false;
  const paidToday =
    bill?.lastPaidAt === new Date().toISOString().split("T")[0];
  const days = bill ? daysUntil(bill.nextDueDate) : 0;
  const emoji = bill ? CATEGORY_EMOJIS[bill.category] || "🧾" : "🧾";
  const color = paid ? "#39FF14" : bill ? urgencyColor(days) : "#A78BFA";

  return (
    <AnimatePresence>
      {bill && (
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
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[420px] h-[280px] rounded-full blur-3xl opacity-40"
              style={{ background: `${color}66` }}
            />

            <div className="relative flex justify-center pb-3">
              <div className="h-1.5 w-12 rounded-full bg-white/15" />
            </div>

            {/* Hero */}
            <div className="relative text-center pt-1 pb-5">
              <motion.div
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
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
                Bill · {FREQ_LABEL[bill.frequency]}
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-white break-words px-4">
                {bill.name}
              </h2>
              <p
                className="mt-3 text-[40px] leading-none font-extrabold tracking-tight"
                style={{ color: paid ? "rgba(255,255,255,0.55)" : "#FF7A8A" }}
              >
                {formatPKR(bill.amount)}
              </p>
              <p
                className="mt-2 inline-block text-xs font-extrabold px-3 py-1 rounded-full"
                style={{ color, background: `${color}1F` }}
              >
                {paid
                  ? paidToday
                    ? "✓ Paid today"
                    : bill.frequency === "one_off"
                      ? "✓ Paid"
                      : "✓ Paid · next " + dueLabel(days)
                  : dueLabel(days)}
              </p>
            </div>

            {/* Grid */}
            <div className="relative grid grid-cols-2 gap-3">
              <Tile label="Pay from" value={bill.bank_account} icon="🏦" />
              <Tile label="Category" value={bill.category} icon={emoji} />
              <Tile label="Next due" value={fullDate(bill.nextDueDate)} icon="📅" />
              <Tile
                label="Last paid"
                value={bill.lastPaidAt ? fullDate(bill.lastPaidAt) : "Never"}
                icon="✅"
              />
            </div>

            {/* Actions */}
            <div className="relative mt-6 space-y-2">
              {paid ? (
                <div
                  className="w-full rounded-2xl py-3.5 font-extrabold text-sm text-center"
                  style={{
                    background: "rgba(57,255,20,0.10)",
                    color: "#39FF14",
                    border: "1px solid rgba(57,255,20,0.3)",
                  }}
                >
                  ✓{" "}
                  {bill.frequency === "one_off"
                    ? "Paid"
                    : paidToday
                      ? "Paid today"
                      : `Paid · next due ${dueLabel(days)}`}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setPayError(null);
                    markPaid.mutate(bill.id, {
                      onSuccess: () => onClose(),
                      onError: (err) => setPayError(err.message),
                    });
                  }}
                  disabled={markPaid.isPending}
                  className="w-full rounded-2xl py-3.5 font-extrabold text-black text-sm disabled:opacity-40"
                  style={{ background: "#CCFF00" }}
                >
                  {markPaid.isPending ? "Logging payment…" : "✓ Mark paid"}
                </button>
              )}
              {payError && (
                <p
                  className="text-xs font-bold text-center"
                  style={{ color: "#FF7A8A" }}
                >
                  {payError}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-2xl py-3 font-extrabold text-white text-sm"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (!confirmDelete) {
                      setConfirmDelete(true);
                      return;
                    }
                    deleteBill.mutate(bill.id, {
                      onSuccess: () => onClose(),
                    });
                  }}
                  className="flex-1 rounded-2xl py-3 font-extrabold text-sm"
                  style={{
                    background: confirmDelete
                      ? "#FF6B6B"
                      : "rgba(255,59,48,0.12)",
                    color: confirmDelete ? "#fff" : "#FF6B6B",
                    border: "1px solid rgba(255,59,48,0.2)",
                  }}
                >
                  {confirmDelete ? "Tap again to delete" : "Delete"}
                </button>
              </div>
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
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div
      className="rounded-[20px] p-4 flex flex-col gap-2"
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-[10px] flex items-center justify-center text-sm"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          {icon}
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/40">
          {label}
        </span>
      </div>
      <p className="text-sm font-extrabold text-white truncate">{value}</p>
    </div>
  );
}
