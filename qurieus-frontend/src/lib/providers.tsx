'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { ReactNode } from 'react';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <SubscriptionProvider>
        {children}
      </SubscriptionProvider>
    </Provider>
  );
} 