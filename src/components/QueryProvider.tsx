"use client";

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client instance outside of the component to prevent re-initialization on re-renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Set a reasonable stale time for data that doesn't change often
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default QueryProvider;