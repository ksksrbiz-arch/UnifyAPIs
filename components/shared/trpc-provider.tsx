'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { httpBatchStreamLink } from '@trpc/client';
import superjson from 'superjson';
import { trpc } from '@/lib/trpc/client';
import { makeQueryClient } from '@/lib/trpc/query-client';

let clientQueryClient: ReturnType<typeof makeQueryClient> | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient();
  if (!clientQueryClient) clientQueryClient = makeQueryClient();
  return clientQueryClient;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchStreamLink({
          url: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/trpc`,
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
