"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  daysUntil,
  urgencyBand,
  type Bill,
  type UrgencyBand,
} from "@/services/bill.service";
import { formatPKR, CATEGORY_EMOJIS } from "@/utils/expenseParser";

interface BillsTimelineProps {
  bills: Bill[];
  onOpen: (bill: Bill) => void;
}

const BAND_META: Record<
  UrgencyBand,
  { label: string; emoji: string; color: string }
> = {
  overdue: { label: "Overdue", emoji: "⚠️", color: "#FF7A8A" },
  this_week: { label: "This week", emoji: "🔥", color: "#FBBF24" },
  later: { label: "Later", emoji: "🗓️", color: "#A78BFA" },
};

function dueLabel(days: number) {
  if (days < 0) return `${Math.abs(days)}d late`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `in ${days}d`;
}

function urgencyColor(days: number) {
  if (days < 0) return "#FF7A8A";
  if (days <= 2) return "#FF7A8A";
  if (days <= 7) return "#FBBF24";
  return "rgba(255,255,255,0.5)";
}

export function BillsTimeline({ bills, onOpen }: BillsTimelineProps) {
  const groups = useMemo(() => {
    const today = new Date();
    const buckets: Record<UrgencyBand, Array<Bill & { _days: number }>> = {
      overdue: [],
      this_week: [],
      later: [],
    };
    for (const b of bills) {
      const days = daysUntil(b.nextDueDate, today);
      buckets[urgencyBand(days)].push({ ...b, _days: days });
    }
    for (const k of Object.keys(buckets) as UrgencyBand[]) {
      buckets[k].sort((a, b) => a._days - b._days);
    }
    return buckets;
  }, [bills]);

  const total = useMemo(
    () => bills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0),
    [bills],
  );

  return (
    <div className="space-y-5">
      {/* Header total */}
      <div
        className="rounded-[20px] p-4 flex items-center justify-between"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,122,138,0.10) 0%, rgba(255,255,255,0.025) 100%)",
          border: "1px solid rgba(255,122,138,0.18)",
        }}
      >
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/40">
            Coming out
          </p>
          <p
            className="text-xl font-extrabold mt-0.5"
            style={{ color: "#FF7A8A" }}
          >
            {formatPKR(total)}
          </p>
        </div>
        <span className="text-2xl">🧾</span>
      </div>

      {(Object.keys(BAND_META) as UrgencyBand[]).map((band) => {
        const items = groups[band];
        if (items.length === 0) return null;
        const meta = BAND_META[band];
        return (
          <div key={band}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-sm">{meta.emoji}</span>
              <span
                className="text-[10px] font-extrabold uppercase tracking-[0.2em]"
                style={{ color: meta.color }}
              >
                {meta.label}
              </span>
              <span className="text-[10px] font-bold text-white/30">
                · {items.length}
              </span>
            </div>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {items.map((b) => {
                  const emoji = CATEGORY_EMOJIS[b.category] || "🧾";
                  const dColor = urgencyColor(b._days);
                  return (
                    <motion.button
                      key={b.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onOpen(b)}
                      className="w-full rounded-[16px] p-3.5 flex items-center justify-between text-left"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
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
                              {dueLabel(b._days)}
                            </span>
                            <span className="text-[11px] text-white/35 truncate">
                              {b.bank_account}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className="font-extrabold text-sm flex-shrink-0 ml-2"
                        style={{ color: "#FF7A8A" }}
                      >
                        {formatPKR(b.amount)}
                      </span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
