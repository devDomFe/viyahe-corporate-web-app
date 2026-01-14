'use client';

import { Box, Flex, Text, Badge, IconButton, VStack, HStack } from '@chakra-ui/react';
import type { DraftBooking } from '@/types/multi-booking';
import { getBookingDisplayLabel, getBookingDisplayDate } from '@/types/multi-booking';

interface BookingCardProps {
  booking: DraftBooking;
  isActive: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

const statusConfig: Record<string, { label: string; colorPalette: string }> = {
  searching: { label: 'Searching', colorPalette: 'gray' },
  selecting: { label: 'Selecting', colorPalette: 'blue' },
  filling: { label: 'Filling', colorPalette: 'yellow' },
  ready: { label: 'Ready', colorPalette: 'green' },
  submitted: { label: 'Submitted', colorPalette: 'green' },
};

function getPassengerNames(booking: DraftBooking): string | null {
  if (booking.passengers.length === 0) return null;

  const names = booking.passengers.map((p) => {
    const firstName = p.data.firstName || '';
    const lastName = p.data.lastName || '';
    return `${firstName} ${lastName}`.trim();
  }).filter(Boolean);

  if (names.length === 0) return null;
  if (names.length === 1) return names[0];
  if (names.length === 2) return names.join(' & ');
  return `${names[0]} +${names.length - 1}`;
}

export function BookingCard({ booking, isActive, onSelect, onRemove }: BookingCardProps) {
  const label = getBookingDisplayLabel(booking);
  const date = getBookingDisplayDate(booking);
  const passengerCount = booking.passengers.length;
  const requiredPassengers = booking.searchParams?.passengers || 1;
  const passengerNames = getPassengerNames(booking);

  // Determine display status - show "Ready" when all passengers are added
  const displayStatus =
    booking.status === 'filling' && passengerCount >= requiredPassengers ? 'ready' : booking.status;
  const statusInfo = statusConfig[displayStatus];

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <Box
      p="3"
      borderRadius="md"
      bg={isActive ? 'blue.50' : 'white'}
      border="1px solid"
      borderColor={isActive ? 'blue.200' : 'gray.200'}
      cursor="pointer"
      onClick={onSelect}
      _hover={{
        borderColor: isActive ? 'blue.300' : 'gray.300',
        bg: isActive ? 'blue.50' : 'gray.50',
      }}
      transition="all 0.15s"
      position="relative"
    >
      <Flex justify="space-between" align="flex-start" gap="2">
        <VStack align="start" gap="1" flex="1" minW="0">
          <Text
            fontWeight="semibold"
            fontSize="sm"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            maxW="full"
          >
            {label}
          </Text>

          {passengerNames && (
            <Text
              fontSize="xs"
              color="gray.700"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              maxW="full"
            >
              {passengerNames}
            </Text>
          )}

          <HStack gap="2" flexWrap="wrap">
            {date && (
              <Text fontSize="xs" color="gray.500">
                {date}
              </Text>
            )}
          </HStack>

          <Badge size="sm" colorPalette={statusInfo.colorPalette}>
            {statusInfo.label}
          </Badge>
        </VStack>

        <IconButton
          aria-label="Remove booking"
          size="xs"
          variant="ghost"
          colorPalette="red"
          onClick={handleRemove}
          opacity={0.6}
          _hover={{ opacity: 1 }}
        >
          ×
        </IconButton>
      </Flex>
    </Box>
  );
}
