import { useCallback, useMemo, useState } from "react";
import type { Transaction } from "@/services/transaction.service";

export interface SelectionStats {
  count: number;
  totalIncome: number;
  totalExpense: number;
  net: number;
  incomeRatio: number;
  selectedTransactions: Transaction[];
}

/**
 * Multi-select state for transactions. Selection is held in a Set<id>
 * so that membership lookups and toggles are O(1). Derived stats are
 * memoised against the selection and an id->transaction map so re-render
 * cost is O(selected), not O(all transactions).
 */
export function useTransactionSelection(transactions: Transaction[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set()
  );

  const byId = useMemo(() => {
    const map = new Map<string, Transaction>();
    for (const t of transactions) map.set(t.id, t);
    return map;
  }, [transactions]);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const select = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const replace = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clear = useCallback(() => {
    setSelectedIds((prev) => (prev.size === 0 ? prev : new Set()));
  }, []);

  const stats = useMemo<SelectionStats>(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    const selectedTransactions: Transaction[] = [];

    selectedIds.forEach((id) => {
      const t = byId.get(id);
      if (!t) return;
      selectedTransactions.push(t);
      const amt = Number(t.amount) || 0;
      if (t.direction === "income") totalIncome += amt;
      else totalExpense += amt;
    });

    const gross = totalIncome + totalExpense;
    return {
      count: selectedTransactions.length,
      totalIncome,
      totalExpense,
      net: totalIncome - totalExpense,
      incomeRatio: gross > 0 ? totalIncome / gross : 0,
      selectedTransactions,
    };
  }, [selectedIds, byId]);

  return {
    selectedIds,
    isSelectionMode: selectedIds.size > 0,
    toggle,
    select,
    replace,
    clear,
    stats,
  };
}
