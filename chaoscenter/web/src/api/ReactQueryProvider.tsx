import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const ReactQueryProvider: React.FC = ({ children }): React.ReactElement => {
  const reactQueryClient = new QueryClient({
    defaultOptions: {
      mutations: {},
      queries: {
        refetchOnWindowFocus: false
      }
    }
  });

  return <QueryClientProvider client={reactQueryClient}>{children}</QueryClientProvider>;
};
