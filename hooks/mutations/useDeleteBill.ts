import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { billService, type Bill } from "@/services/bill.service";

export function useDeleteBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => billService.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bills.all });
      const previous = queryClient.getQueryData<Bill[]>(queryKeys.bills.list());

      queryClient.setQueryData<Bill[]>(queryKeys.bills.list(), (old = []) =>
        old.filter((b) => b.id !== id),
      );

      return { previous };
    },

    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.bills.list(), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills.all });
    },
  });
}
