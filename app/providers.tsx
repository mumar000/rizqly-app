"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useState } from "react";
import { createIndexedDbPersister } from "@/lib/queryPersister";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            // Cache data for 30 days so it survives offline sessions.
            gcTime: 1000 * 60 * 60 * 24 * 30,
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            // While offline, keep showing cached data instead of erroring.
            networkMode: "offlineFirst",
          },
          mutations: {
            retry: 1,
            // Mutations pause when offline, resume when back online,
            // executing in submission order.
            networkMode: "offlineFirst",
          },
        },
      }),
  );

  const [persister] = useState(() => createIndexedDbPersister());

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days — prune older
        // Bump when the data shape changes so old caches don't poison new clients.
        buster: "v1",
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
