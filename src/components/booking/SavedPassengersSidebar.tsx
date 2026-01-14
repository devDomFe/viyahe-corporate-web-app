'use client';

import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Button,
} from '@chakra-ui/react';
import {
  DrawerRoot,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseTrigger,
} from '@chakra-ui/react/drawer';
import type { SavedPassenger, SavedPassengersState } from '@/types/saved-passenger';
import { PassengerSearchInput } from './PassengerSearchInput';
import { SavedPassengersList } from './SavedPassengersList';

interface SavedPassengersSidebarProps {
  savedPassengers: SavedPassenger[];
  state: SavedPassengersState;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectPassenger: (passenger: SavedPassenger) => void;
  addedPassengerIds: string[];
  // Mobile drawer props
  isOpen?: boolean;
  onClose?: () => void;
  // Limit props
  isAtLimit?: boolean;
}

function SidebarContent({
  savedPassengers,
  state,
  searchQuery,
  onSearchChange,
  onSelectPassenger,
  addedPassengerIds,
  isAtLimit = false,
}: Omit<SavedPassengersSidebarProps, 'isOpen' | 'onClose'>) {
  const isLoading = state.status === 'loading';
  const error = state.status === 'error' ? state.error : null;

  return (
    <VStack gap="4" align="stretch" h="full">
      <Box>
        <Heading size="sm" mb="1">
          Saved Passengers
        </Heading>
        <Text fontSize="xs" color="gray.500">
          {isAtLimit ? 'Passenger limit reached' : 'Click to add to booking'}
        </Text>
      </Box>

      <PassengerSearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search by name or email..."
      />

      <Box
        flex="1"
        overflowY="auto"
        mx="-3"
        px="3"
        opacity={isAtLimit ? 0.6 : 1}
        css={{
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: 'var(--chakra-colors-gray-300)',
            borderRadius: '3px',
          },
        }}
      >
        <SavedPassengersList
          passengers={savedPassengers}
          onSelectPassenger={onSelectPassenger}
          addedPassengerIds={addedPassengerIds}
          isLoading={isLoading}
          error={error}
          isDisabled={isAtLimit}
        />
      </Box>
    </VStack>
  );
}

export function SavedPassengersSidebar({
  savedPassengers,
  state,
  searchQuery,
  onSearchChange,
  onSelectPassenger,
  addedPassengerIds,
  isOpen = false,
  onClose,
  isAtLimit = false,
}: SavedPassengersSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar - hidden on mobile */}
      <Box
        display={{ base: 'none', lg: 'block' }}
        w="320px"
        flexShrink={0}
        bg="gray.50"
        borderRadius="lg"
        p="4"
        h="fit-content"
        position="sticky"
        top="4"
        maxH="calc(100vh - 200px)"
      >
        <SidebarContent
          savedPassengers={savedPassengers}
          state={state}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSelectPassenger={onSelectPassenger}
          addedPassengerIds={addedPassengerIds}
          isAtLimit={isAtLimit}
        />
      </Box>

      {/* Mobile Drawer */}
      <DrawerRoot
        open={isOpen}
        onOpenChange={(details) => !details.open && onClose?.()}
        placement="start"
        size="sm"
      >
        <DrawerBackdrop />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <Heading size="md">Saved Passengers</Heading>
            <DrawerCloseTrigger />
          </DrawerHeader>
          <DrawerBody py="4">
            <SidebarContent
              savedPassengers={savedPassengers}
              state={state}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              onSelectPassenger={(passenger) => {
                onSelectPassenger(passenger);
                onClose?.();
              }}
              addedPassengerIds={addedPassengerIds}
              isAtLimit={isAtLimit}
            />
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </>
  );
}
