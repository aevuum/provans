'use client';

import { SessionProvider } from 'next-auth/react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { store } from '../lib/store';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={client}>
        <ReduxProvider store={store}>
          {children}
        </ReduxProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}