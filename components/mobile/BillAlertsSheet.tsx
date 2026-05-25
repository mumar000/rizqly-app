"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AlertingBill } from "@/hooks/useDueAlerts";
import { useMarkBillPaid } from "@/hooks/mutations/useMarkBillPaid";
import { formatPKR, CATEGORY_EMOJIS } from "@/utils/expenseParser";

interface BillAlertsSheetProps {
  open: boolean;
  alerts: AlertingBill[];
  totalAmount: number;
  onClose: () => void;
  onSnooze: (id: string, days?: number) => void;
}

function dueLabel(days: number) {
  if (days < 0) return `${Math.abs(days)}d late`;
  if (days === 0) return "Due today";
  if (days === 1) return "Tomorrow";
  return `in ${days}d`;
}

function urgencyColor(days: number) {
  if (days <= 1) return "#FF7A8A";
  if (days <= 3) return "#FBBF24";
  return "#A78BFA";
}

export function BillAlertsSheet({
  open,
  alerts,
  totalAmount,
  onClose,
  onSnooze,
}: BillAlertsSheetProps) {
  const markPaid = useMarkBillPaid();

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
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
            }}
          >
            <div className="flex justify-center pb-3">
              <div className="h-1.5 w-12 rounded-full bg-white/15" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-extrabold tracking-[0.25em] uppercase text-white/40">
                  Heads up
                </p>
                <h2 className="text-lg font-extrabold text-white mt-0.5">
                  {alerts.length === 0
                    ? "All clear"
                    : alerts.length === 1
                      ? "1 bill needs you"
                      : `${alerts.length} bills due soon`}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 text-sm"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                ✕
              </button>
            </div>

            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🎉</div>
                <p className="text-white/40 font-medium text-sm">
                  Nothing due in the next few days.
                </p>
              </div>
            ) : (
              <>
                {/* Total */}
                <div
                  className="rounded-[20px] p-4 flex items-center justify-between mb-4"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(255,122,138,0.12) 0%, rgba(255,255,255,0.025) 100%)",
                    border: "1px solid rgba(255,122,138,0.2)",
                  }}
                >
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/40">
                      About to leave you
                    </p>
                    <p
                      className="text-xl font-extrabold mt-0.5"
                      style={{ color: "#FF7A8A" }}
                    >
                      {formatPKR(totalAmount)}
                    </p>
                  </div>
                  <span className="text-2xl">🔔</span>
                </div>

                {/* List */}
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {alerts.map((b) => {
                      const emoji = CATEGORY_EMOJIS[b.category] || "🧾";
                      const dColor = urgencyColor(b.daysLeft);
                      return (
                        <motion.div
                          key={b.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          className="rounded-[16px] p-3.5"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.07)",
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-11 h-11 rounded-[14px] flex items-center justify-center text-lg flex-shrink-0"
                                style={{ background: "rgba(255,255,255,0.06)" }}
                              >
                                {emoji}
                              </div>
                              <div className="min-w-0">
                                <p className="font-extrabold text-white text-sm truncate">
                                  {b.name}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span
                                    className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full"
                                    style={{
                                      color: dColor,
                                      background: `${dColor}1F`,
                                    }}
                                  >
                                    {dueLabel(b.daysLeft)}
                                  </span>
                                  <span className="text-[11px] text-white/35 truncate">
                                    {b.bank_account}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span
                              className="font-extrabold text-sm flex-shrink-0"
                              style={{ color: "#FF7A8A" }}
                            >
                              {formatPKR(b.amount)}
                            </span>
                          </div>

                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() =>
                                markPaid.mutate(b.id, {
                                  // Auto-clear stale snooze entry after payment.
                                  onSuccess: () => onSnooze(b.id, 0),
                                })
                              }
                              disabled={markPaid.isPending}
                              className="flex-1 rounded-xl py-2 text-xs font-extrabold text-black disabled:opacity-40"
                              style={{ background: "#CCFF00" }}
                            >
                              ✓ Mark paid
                            </button>
                            <button
                              onClick={() => onSnooze(b.id, 1)}
                              className="flex-1 rounded-xl py-2 text-xs font-extrabold text-white"
                              style={{
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.08)",
                              }}
                            >
                              💤 Snooze 1d
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
