'use client';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { MultiBookingProvider } from '@/contexts/MultiBookingContext';
import { AppShell } from '@/components/layout';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <MultiBookingProvider>
        <AppShell>{children}</AppShell>
      </MultiBookingProvider>
    </ChakraProvider>
  );
}
