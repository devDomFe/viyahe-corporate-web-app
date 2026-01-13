'use client';

import { Box, Text, VStack } from '@chakra-ui/react';
import { Spinner } from '@chakra-ui/react/spinner';
import type { FlightOffer } from '@/types/flight';
import { FlightCard } from './FlightCard';

interface FlightListProps {
  flights: FlightOffer[];
  selectedFlightId?: string;
  onSelectFlight: (flightId: string) => void;
  isLoading?: boolean;
}

export function FlightList({
  flights,
  selectedFlightId,
  onSelectFlight,
  isLoading,
}: FlightListProps) {
  if (isLoading) {
    return (
      <Box textAlign="center" py="10">
        <Spinner size="lg" color="blue.500" />
        <Text mt="4" color="gray.600">
          Searching for flights...
        </Text>
      </Box>
    );
  }

  if (flights.length === 0) {
    return (
      <Box textAlign="center" py="10" bg="white" borderRadius="lg" boxShadow="sm">
        <Text fontSize="lg" color="gray.600">
          No flights found matching your criteria.
        </Text>
        <Text fontSize="sm" color="gray.500" mt="2">
          Try adjusting your filters or search parameters.
        </Text>
      </Box>
    );
  }

  return (
    <VStack gap="4" align="stretch">
      {flights.map((flight) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          onSelect={onSelectFlight}
          isSelected={selectedFlightId === flight.id}
        />
      ))}
    </VStack>
  );
}
