import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { billService } from "@/services/bill.service";

export function useBills() {
  return useQuery({
    queryKey: queryKeys.bills.list(),
    queryFn: () => billService.getAll(),
    staleTime: 1000 * 60 * 2,
  });
}
