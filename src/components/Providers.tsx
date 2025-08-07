'use client';

import { SessionProvider } from 'next-auth/react';
import { Provider } from 'react-redux';
import { store } from '@/lib/store';

interface ProvidersProps {
  children: React.ReactNode;
  session?: unknown;
}

export default function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <Provider store={store}>
        {children}
      </Provider>
    </SessionProvider>
  );
}
