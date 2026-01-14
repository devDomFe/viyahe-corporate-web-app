'use client';

import { Box, VStack, Text, Spinner, Flex } from '@chakra-ui/react';
import type { SavedPassenger } from '@/types/saved-passenger';
import { SavedPassengerListItem } from './SavedPassengerListItem';

interface SavedPassengersListProps {
  passengers: SavedPassenger[];
  onSelectPassenger: (passenger: SavedPassenger) => void;
  addedPassengerIds: string[];
  isLoading?: boolean;
  error?: string | null;
  isDisabled?: boolean;
}

export function SavedPassengersList({
  passengers,
  onSelectPassenger,
  addedPassengerIds,
  isLoading = false,
  error = null,
  isDisabled = false,
}: SavedPassengersListProps) {
  if (isLoading) {
    return (
      <Flex justify="center" align="center" py="8">
        <Spinner size="md" color="blue.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box py="4" px="3">
        <Text fontSize="sm" color="red.500" textAlign="center">
          {error}
        </Text>
      </Box>
    );
  }

  if (passengers.length === 0) {
    return (
      <Box py="8" px="3">
        <Text fontSize="sm" color="gray.500" textAlign="center">
          No passengers found
        </Text>
      </Box>
    );
  }

  const addedIdsSet = new Set(addedPassengerIds);

  return (
    <VStack gap="1" align="stretch">
      {passengers.map((passenger) => (
        <SavedPassengerListItem
          key={passenger.id}
          passenger={passenger}
          onSelect={onSelectPassenger}
          isAdded={addedIdsSet.has(passenger.id)}
          isDisabled={isDisabled && !addedIdsSet.has(passenger.id)}
        />
      ))}
    </VStack>
  );
}
