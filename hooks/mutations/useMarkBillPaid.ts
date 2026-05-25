import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { INIT_QUERY_KEY } from "@/hooks/queries/useInitData";
import { billService } from "@/services/bill.service";

export function useMarkBillPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => billService.markPaid(id),

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.banks.all });
      queryClient.invalidateQueries({ queryKey: INIT_QUERY_KEY });
    },
  });
}
