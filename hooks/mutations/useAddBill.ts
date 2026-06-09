import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
  billService,
  type Bill,
  type CreateBillInput,
} from "@/services/bill.service";
import { newClientId } from "@/lib/idempotency";

export function useAddBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBillInput) => billService.create(input),

    onMutate: async (input) => {
      if (!input.clientId) input.clientId = newClientId();

      await queryClient.cancelQueries({ queryKey: queryKeys.bills.all });
      const previous = queryClient.getQueryData<Bill[]>(queryKeys.bills.list());

      const optimistic: Bill = {
        id: `temp-${Date.now()}`,
        name: input.name,
        amount: input.amount,
        category: input.category,
        bank_account: input.bankAccount,
        frequency: input.frequency,
        nextDueDate: input.nextDueDate,
        reminderEnabled: input.reminderEnabled ?? true,
        lastPaidAt: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Bill[]>(queryKeys.bills.list(), (old = []) =>
        [optimistic, ...old].sort((a, b) =>
          a.nextDueDate.localeCompare(b.nextDueDate),
        ),
      );

      return { previous };
    },

    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.bills.list(), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bills.all });
    },
  });
}
