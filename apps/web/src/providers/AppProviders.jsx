import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useState} from 'react';
import {ThemeProvider} from '../framework/ThemeContext';
import {ToastProvider} from '../design-system/components/StatusNotifications';

export default function AppProviders({children}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
