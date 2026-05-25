import { useMemo } from "react";
import { daysUntil, type Bill } from "@/services/bill.service";
import { useBillSnoozes } from "@/hooks/useBillSnoozes";

export interface AlertingBill extends Bill {
  daysLeft: number;
}

export interface DueAlerts {
  alerts: AlertingBill[];
  count: number;
  totalAmount: number;
  hasUrgent: boolean; // overdue or due today/tomorrow
  isSnoozed: (id: string) => boolean;
  snooze: (id: string, days?: number) => void;
  clearSnooze: (id: string) => void;
}

/**
 * Derives the set of bills currently "alerting":
 *   - daysUntil(due) <= ALERT_WINDOW_DAYS (including overdue)
 *   - not currently snoozed
 *
 * Memoised against bills + snoozes so consumers re-render only when the
 * surfaced set actually changes.
 */
const ALERT_WINDOW_DAYS = 3;

export function useDueAlerts(bills: Bill[]): DueAlerts {
  const { isSnoozed, snooze, clear } = useBillSnoozes();

  const alerts = useMemo<AlertingBill[]>(() => {
    const today = new Date();
    return bills
      .map((b) => ({ ...b, daysLeft: daysUntil(b.nextDueDate, today) }))
      .filter(
        (b) => b.daysLeft <= ALERT_WINDOW_DAYS && !isSnoozed(b.id, today),
      )
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [bills, isSnoozed]);

  const totalAmount = useMemo(
    () => alerts.reduce((s, b) => s + (Number(b.amount) || 0), 0),
    [alerts],
  );

  const hasUrgent = alerts.some((b) => b.daysLeft <= 1);

  return {
    alerts,
    count: alerts.length,
    totalAmount,
    hasUrgent,
    isSnoozed,
    snooze,
    clearSnooze: clear,
  };
}
