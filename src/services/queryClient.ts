import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh
      gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Do not retry on 404s or auth errors
        if (error instanceof Error && error.message.includes('404')) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});
