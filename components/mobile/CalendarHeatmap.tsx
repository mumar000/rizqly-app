"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Transaction } from "@/services/transaction.service";

interface CalendarHeatmapProps {
  month: Date;
  transactions: Transaction[];
  selectedKey: string | null;
  onSelectDay: (date: Date, key: string) => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/** Local YYYY-MM-DD key (avoids UTC drift across timezones). */
function dayKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function pickTxDate(t: Transaction): Date {
  const raw = t.date || t.created_at;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export function CalendarHeatmap({
  month,
  transactions,
  selectedKey,
  onSelectDay,
}: CalendarHeatmapProps) {
  const { cells, maxCount, totalCount, hottestKey } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of transactions) {
      const k = dayKey(pickTxDate(t));
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }

    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const leadingBlanks = first.getDay();
    const daysInMonth = last.getDate();
    const todayKey = dayKey(new Date());

    const list: Array<
      | { type: "blank"; key: string }
      | {
          type: "day";
          key: string;
          date: Date;
          count: number;
          isToday: boolean;
          isFuture: boolean;
        }
    > = [];

    for (let i = 0; i < leadingBlanks; i++) {
      list.push({ type: "blank", key: `b-${i}` });
    }

    let max = 0;
    let total = 0;
    let hottest: string | null = null;
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(month.getFullYear(), month.getMonth(), d);
      const key = dayKey(date);
      const count = counts.get(key) ?? 0;
      if (count > max) {
        max = count;
        hottest = key;
      }
      total += count;
      list.push({
        type: "day",
        key,
        date,
        count,
        isToday: key === todayKey,
        isFuture: key > todayKey,
      });
    }

    return { cells: list, maxCount: max, totalCount: total, hottestKey: hottest };
  }, [month, transactions]);

  return (
    <div>
      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-extrabold text-white/30 tracking-[0.2em]"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, idx) => {
          if (cell.type === "blank") {
            return <div key={cell.key} className="aspect-square" />;
          }

          const ratio = maxCount > 0 ? cell.count / maxCount : 0;
          const hot = cell.count > 0;
          const isHottest = hottestKey === cell.key && cell.count > 0;
          const selected = cell.key === selectedKey;

          // Gradient intensity — brighter top edge, fades down for depth.
          const bg = hot
            ? `linear-gradient(160deg, rgba(204,255,0,${0.25 + 0.7 * ratio}) 0%, rgba(204,255,0,${0.12 + 0.55 * ratio}) 100%)`
            : "rgba(255,255,255,0.035)";

          const textColor = !hot
            ? cell.isFuture
              ? "rgba(255,255,255,0.22)"
              : "rgba(255,255,255,0.55)"
            : ratio > 0.55
              ? "#0F0F11"
              : "rgba(255,255,255,0.92)";

          return (
            <motion.button
              key={cell.key}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: Math.min(idx, 28) * 0.012,
                type: "spring",
                stiffness: 380,
                damping: 24,
              }}
              whileTap={{ scale: 0.88 }}
              onClick={() => onSelectDay(cell.date, cell.key)}
              className="aspect-square rounded-[12px] relative flex items-center justify-center text-[12px] font-extrabold"
              style={{
                background: bg,
                color: textColor,
                border: selected
                  ? "1.5px solid #CCFF00"
                  : cell.isToday
                    ? "1.5px solid rgba(204,255,0,0.6)"
                    : "1px solid rgba(255,255,255,0.04)",
                boxShadow: selected
                  ? "0 0 0 3px rgba(204,255,0,0.22), 0 8px 24px -8px rgba(204,255,0,0.45)"
                  : isHottest
                    ? "0 8px 28px -8px rgba(204,255,0,0.55)"
                    : undefined,
                willChange: "transform",
              }}
              aria-label={`${cell.date.toDateString()}, ${cell.count} transaction${cell.count === 1 ? "" : "s"}`}
            >
              {/* Today pulse ring */}
              {cell.isToday && !selected && (
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-[12px] pointer-events-none"
                  animate={{ opacity: [0.55, 0.1, 0.55] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    boxShadow: "0 0 0 2px rgba(204,255,0,0.45)",
                  }}
                />
              )}

              {/* Hottest day crown */}
              {isHottest && (
                <span
                  aria-hidden
                  className="absolute -top-1.5 -right-1 text-[11px]"
                  style={{ filter: "drop-shadow(0 2px 6px rgba(204,255,0,0.6))" }}
                >
                  👑
                </span>
              )}

              <span className="relative">{cell.date.getDate()}</span>

              {/* Activity dots — intensity tier instead of raw number */}
              {hot && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-[2px]">
                  {Array.from({
                    length: ratio > 0.66 ? 3 : ratio > 0.33 ? 2 : 1,
                  }).map((_, i) => (
                    <span
                      key={i}
                      className="w-[3px] h-[3px] rounded-full"
                      style={{
                        background:
                          ratio > 0.55 ? "#0F0F11" : "rgba(255,255,255,0.85)",
                      }}
                    />
                  ))}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 flex items-center justify-between text-[10px] font-extrabold text-white/40 tracking-wide">
        <span>
          {totalCount} {totalCount === 1 ? "log" : "logs"} this month
        </span>
        <div className="flex items-center gap-1.5">
          <span>less</span>
          {[0.22, 0.45, 0.7, 0.95].map((a) => (
            <span
              key={a}
              className="w-2.5 h-2.5 rounded-[4px]"
              style={{ background: `rgba(204,255,0,${a})` }}
            />
          ))}
          <span>more</span>
        </div>
      </div>
    </div>
  );
}
