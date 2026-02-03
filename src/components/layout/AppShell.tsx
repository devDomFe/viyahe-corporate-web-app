'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import {
  DrawerRoot,
  DrawerBackdrop,
  DrawerContent,
  DrawerCloseTrigger,
  DrawerBody,
} from '@chakra-ui/react/drawer';
import { useMultiBooking } from '@/hooks/useMultiBooking';
import { BookingSidebar } from './BookingSidebar';

interface AppShellProps {
  children: ReactNode;
}

const SIDEBAR_WIDTH = '280px';

export function AppShell({ children }: AppShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { bookings } = useMultiBooking();
  const pathname = usePathname();

  // Hide sidebar on agent routes
  const isAgentRoute = pathname?.startsWith('/agent');

  // If on agent route, render without sidebar
  if (isAgentRoute) {
    return <Box minH="100vh">{children}</Box>;
  }

  return (
    <Flex minH="100vh">
      {/* Desktop Sidebar */}
      <Box
        display={{ base: 'none', lg: 'block' }}
        w={SIDEBAR_WIDTH}
        flexShrink={0}
        bg="white"
        borderRight="1px solid"
        borderColor="gray.200"
        position="fixed"
        top="0"
        left="0"
        h="100vh"
        zIndex="sticky"
      >
        <BookingSidebar />
      </Box>

      {/* Mobile Sidebar (Drawer) */}
      <DrawerRoot open={isMobileOpen} onOpenChange={(e) => setIsMobileOpen(e.open)} placement="start">
        <DrawerBackdrop />
        <DrawerContent maxW={SIDEBAR_WIDTH}>
          <DrawerCloseTrigger />
          <DrawerBody p="0">
            <BookingSidebar onClose={() => setIsMobileOpen(false)} />
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>

      {/* Mobile FAB to open sidebar */}
      <Box
        display={{ base: 'block', lg: 'none' }}
        position="fixed"
        bottom="6"
        left="6"
        zIndex="sticky"
      >
        <IconButton
          aria-label="Open bookings sidebar"
          size="lg"
          colorPalette="blue"
          borderRadius="full"
          boxShadow="lg"
          onClick={() => setIsMobileOpen(true)}
          w="14"
          h="14"
        >
          <Flex direction="column" align="center" justify="center">
            <Text fontSize="lg" fontWeight="bold" lineHeight="1">
              {bookings.length}
            </Text>
          </Flex>
        </IconButton>
      </Box>

      {/* Main Content */}
      <Box
        flex="1"
        ml={{ base: '0', lg: SIDEBAR_WIDTH }}
        minH="100vh"
      >
        {children}
      </Box>
    </Flex>
  );
}
