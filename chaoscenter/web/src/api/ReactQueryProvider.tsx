import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const ReactQueryProvider: React.FC = ({ children }): React.ReactElement => {
  const reactQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false
      },
      mutations: {}
    }
  });

  return <QueryClientProvider client={reactQueryClient}>{children}</QueryClientProvider>;
};
