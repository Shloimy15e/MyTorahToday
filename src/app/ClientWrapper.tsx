// app/client-wrapper.tsx (or a similar filename)
"use client"; // Mark this component as a Client Component

import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient} >
      {children}
    </QueryClientProvider>
  )
}
