'use client';

import { Box, Flex, Heading, Text, VStack, HStack, Badge } from '@chakra-ui/react';
import type { FlightOffer } from '@/types/flight';
import { formatTime, formatDate, formatDuration, formatStops, formatRoute, formatCabinClass } from '@/utils/format';

interface FlightSummaryProps {
  flight: FlightOffer;
}

export function FlightSummary({ flight }: FlightSummaryProps) {
  return (
    <Box bg="white" borderRadius="lg" boxShadow="sm" p={{ base: '6', md: '8' }}>
      <Heading size="md" mb="5">
        Flight Summary
      </Heading>

      <VStack gap="5" align="stretch">
        {flight.slices.map((slice, index) => (
          <Box key={slice.id}>
            {flight.slices.length > 1 && (
              <Text fontSize="sm" fontWeight="medium" color="gray.500" mb="2">
                {index === 0 ? 'Outbound' : 'Return'}
              </Text>
            )}

            <Flex justify="space-between" align="center" gap="4">
              {/* Departure */}
              <VStack gap="0" align="start">
                <Text fontWeight="bold" fontSize="lg">
                  {formatTime(slice.departureTime)}
                </Text>
                <Text fontWeight="medium">{slice.origin.iataCode}</Text>
                <Text fontSize="sm" color="gray.500">
                  {formatDate(slice.departureTime, 'EEE, MMM d')}
                </Text>
              </VStack>

              {/* Duration */}
              <VStack gap="0" align="center">
                <Text fontSize="sm" color="gray.500">
                  {formatDuration(slice.duration)}
                </Text>
                <Box w="80px" h="1px" bg="gray.300" />
                <Text fontSize="xs" color={slice.stops === 0 ? 'green.600' : 'gray.500'}>
                  {formatStops(slice.stops)}
                </Text>
              </VStack>

              {/* Arrival */}
              <VStack gap="0" align="end">
                <Text fontWeight="bold" fontSize="lg">
                  {formatTime(slice.arrivalTime)}
                </Text>
                <Text fontWeight="medium">{slice.destination.iataCode}</Text>
                <Text fontSize="sm" color="gray.500">
                  {formatDate(slice.arrivalTime, 'EEE, MMM d')}
                </Text>
              </VStack>
            </Flex>

            {/* Flight details */}
            <Text fontSize="sm" color="gray.500" mt="2">
              {slice.segments.map((seg) => seg.airline.name).join(' • ')}
            </Text>

            {index < flight.slices.length - 1 && <Box h="1px" bg="gray.200" my="3" />}
          </Box>
        ))}

        {/* Price breakdown */}
        <Box h="1px" bg="gray.200" />

        <VStack gap="3" align="stretch">
          <Flex justify="space-between">
            <Text color="gray.600">Class</Text>
            <Text fontWeight="medium">{formatCabinClass(flight.cabinClass)}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="gray.600">Passengers</Text>
            <Text fontWeight="medium">{flight.passengers}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="gray.600">Base fare</Text>
            <Text fontWeight="medium">{flight.basePrice.displayAmount}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="gray.600">Taxes & fees</Text>
            <Text fontWeight="medium">{flight.taxesAndFees.displayAmount}</Text>
          </Flex>

          <Box h="1px" bg="gray.200" my="1" />

          <Flex justify="space-between" fontWeight="bold">
            <Text fontSize="lg">Total</Text>
            <Text fontSize="lg" color="blue.600">
              {flight.priceWithMarkup.displayAmount}
            </Text>
          </Flex>
        </VStack>

        {/* Badges */}
        <HStack gap="2">
          {flight.refundable && (
            <Badge colorPalette="green" size="md" px="3" py="1">
              Refundable
            </Badge>
          )}
          <Badge colorPalette="gray" size="md" px="3" py="1">
            {formatCabinClass(flight.cabinClass)}
          </Badge>
        </HStack>

        {/* Fare rules */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb="2">
            Fare Rules
          </Text>
          <VStack gap="2" align="stretch">
            {flight.fareRules.map((rule, index) => (
              <Text key={index} fontSize="sm" color="gray.600">
                • {rule}
              </Text>
            ))}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
