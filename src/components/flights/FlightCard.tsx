'use client';

import { Box, Button, Flex, HStack, Text, VStack, Badge } from '@chakra-ui/react';
import type { FlightOffer, FlightSlice } from '@/types/flight';
import { formatTime, formatDuration, formatStops, formatRoute } from '@/utils/format';

interface SliceDisplayProps {
  slice: FlightSlice;
  label?: string;
}

function SliceDisplay({ slice, label }: SliceDisplayProps) {
  return (
    <Box>
      {label && (
        <Text fontSize="xs" color="gray.500" fontWeight="medium" mb="1">
          {label}
        </Text>
      )}
      <Flex justify="space-between" align="center" gap="4">
        {/* Departure */}
        <VStack gap="0" align="start" minW="80px">
          <Text fontWeight="bold" fontSize="lg">
            {formatTime(slice.departureTime)}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {slice.origin.iataCode}
          </Text>
        </VStack>

        {/* Duration & Stops */}
        <VStack gap="0" flex="1" align="center">
          <Text fontSize="sm" color="gray.500">
            {formatDuration(slice.duration)}
          </Text>
          <Box w="full" h="1px" bg="gray.300" position="relative">
            {slice.stops > 0 && (
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                w="8px"
                h="8px"
                bg="gray.400"
                borderRadius="full"
              />
            )}
          </Box>
          <Text fontSize="xs" color={slice.stops === 0 ? 'green.600' : 'gray.500'}>
            {formatStops(slice.stops)}
          </Text>
        </VStack>

        {/* Arrival */}
        <VStack gap="0" align="end" minW="80px">
          <Text fontWeight="bold" fontSize="lg">
            {formatTime(slice.arrivalTime)}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {slice.destination.iataCode}
          </Text>
        </VStack>
      </Flex>

      {/* Airline info */}
      <Text fontSize="xs" color="gray.500" mt="1">
        {slice.segments.map((seg) => `${seg.airline.name} ${seg.flightNumber}`).join(' → ')}
      </Text>
    </Box>
  );
}

interface FlightCardProps {
  flight: FlightOffer;
  onSelect: (flightId: string) => void;
  isSelected?: boolean;
}

function getSliceLabel(index: number, totalSlices: number): string | undefined {
  if (totalSlices === 1) return undefined;
  if (totalSlices === 2) return index === 0 ? 'Outbound' : 'Return';
  return `Flight ${index + 1}`;
}

export function FlightCard({ flight, onSelect, isSelected }: FlightCardProps) {
  // For display, show all slices (round-trip has 2, one-way has 1, multi-city combined has multiple)
  const slicesToShow = flight.slices;

  return (
    <Box
      bg="white"
      borderRadius="lg"
      boxShadow={isSelected ? 'outline' : 'sm'}
      border="1px solid"
      borderColor={isSelected ? 'blue.500' : 'gray.200'}
      p={{ base: '5', md: '6' }}
      transition="all 0.2s"
      _hover={{ boxShadow: 'md', borderColor: 'blue.300' }}
    >
      <Flex direction={{ base: 'column', lg: 'row' }} gap="4" justify="space-between">
        {/* Flight Info */}
        <Box flex="1">
          <VStack gap="4" align="stretch">
            {slicesToShow.map((slice, index) => (
              <SliceDisplay
                key={slice.id}
                slice={slice}
                label={getSliceLabel(index, slicesToShow.length)}
              />
            ))}
          </VStack>
        </Box>

        {/* Price & Select */}
        <Flex
          direction="column"
          align={{ base: 'stretch', lg: 'end' }}
          justify="space-between"
          minW="170px"
          gap="4"
          borderLeft={{ lg: '1px solid' }}
          borderColor={{ lg: 'gray.200' }}
          pl={{ lg: '5' }}
          pt={{ base: '4', lg: '0' }}
          borderTop={{ base: '1px solid', lg: 'none' }}
        >
          <VStack gap="1" align={{ base: 'center', lg: 'end' }}>
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              {flight.priceWithMarkup.displayAmount}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {flight.passengers} {flight.passengers === 1 ? 'passenger' : 'passengers'}
            </Text>
            <HStack gap="2" mt="2">
              {flight.refundable && (
                <Badge colorPalette="green" size="md" px="3" py="1">
                  Refundable
                </Badge>
              )}
              <Badge colorPalette="gray" size="md" px="3" py="1">
                {flight.cabinClass.replace('_', ' ')}
              </Badge>
            </HStack>
          </VStack>

          <Button
            colorPalette={isSelected ? 'green' : 'blue'}
            size="lg"
            px="6"
            onClick={() => onSelect(flight.id)}
            w="full"
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
