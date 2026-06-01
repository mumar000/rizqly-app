import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { queryKeys } from "@/lib/queryKeys";
import { transactionService } from "@/services/transaction.service";
import type { TransactionFilters } from "@/types/period";

interface Options {
  /** Skip the fetch entirely (e.g. for derived stats we don't currently display). */
  enabled?: boolean;
}

/**
 * Transactions for the given period. Gates on auth so it doesn't fire a
 * pre-auth request that has to be retried; uses keepPreviousData so changing
 * period swaps content in-place instead of flashing a skeleton.
 */
export function useTransactions(
  filters?: TransactionFilters,
  options: Options = {},
) {
  const { status } = useSession();
  return useQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: () => transactionService.getAll(filters),
    enabled: status === "authenticated" && options.enabled !== false,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });
}

export function useTransactionStats(
  filters?: TransactionFilters,
  options: Options = {},
) {
  const { status } = useSession();
  return useQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: () => transactionService.getAll(filters),
    enabled: status === "authenticated" && options.enabled !== false,
    placeholderData: keepPreviousData,
    select: (transactions) => transactionService.getStats(transactions),
    staleTime: 1000 * 60 * 2,
  });
}
