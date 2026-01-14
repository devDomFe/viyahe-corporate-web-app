'use client';

import { Box, VStack, Text, Button, Flex, Heading, HStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useMultiBooking } from '@/hooks/useMultiBooking';
import { BookingCard } from './BookingCard';

interface BookingSidebarProps {
  onClose?: () => void;
}

export function BookingSidebar({ onClose }: BookingSidebarProps) {
  const router = useRouter();
  const { bookings, activeBookingId, createBooking, setActiveBooking, removeBooking } = useMultiBooking();

  // Separate drafts from submitted bookings
  const draftBookings = bookings.filter((b) => b.status !== 'submitted');
  const submittedBookings = bookings.filter((b) => b.status === 'submitted');

  const handleNewBooking = () => {
    createBooking();
    router.push('/');
    onClose?.();
  };

  const handleSelectBooking = (id: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;

    setActiveBooking(id);

    // Navigate based on booking status
    switch (booking.status) {
      case 'searching':
        router.push('/');
        break;
      case 'selecting':
        router.push('/flights');
        break;
      case 'filling':
        router.push('/booking');
        break;
      case 'submitted':
        router.push('/booking/confirmation');
        break;
    }

    onClose?.();
  };

  const handleRemoveBooking = (id: string) => {
    removeBooking(id);
  };

  const handleClearSubmitted = () => {
    submittedBookings.forEach((booking) => {
      removeBooking(booking.id);
    });
  };

  return (
    <Box h="full" display="flex" flexDirection="column">
      {/* Header */}
      <Box p="4" borderBottom="1px solid" borderColor="gray.200">
        <Heading size="md" color="blue.600" mb="3">
          My Bookings
        </Heading>
        <Button colorPalette="blue" size="sm" w="full" onClick={handleNewBooking}>
          + New Booking
        </Button>
      </Box>

      {/* Bookings List */}
      <Box flex="1" overflowY="auto" p="3">
        {bookings.length === 0 ? (
          <Box textAlign="center" py="8">
            <Text color="gray.500" fontSize="sm" mb="2">
              No bookings yet
            </Text>
            <Text color="gray.400" fontSize="xs">
              Click "New Booking" to start searching for flights
            </Text>
          </Box>
        ) : (
          <VStack gap="4" align="stretch">
            {/* Draft Bookings */}
            {draftBookings.length > 0 && (
              <Box>
                <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb="2" px="1">
                  IN PROGRESS ({draftBookings.length})
                </Text>
                <VStack gap="2" align="stretch">
                  {draftBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      isActive={booking.id === activeBookingId}
                      onSelect={() => handleSelectBooking(booking.id)}
                      onRemove={() => handleRemoveBooking(booking.id)}
                    />
                  ))}
                </VStack>
              </Box>
            )}

            {/* Submitted Bookings */}
            {submittedBookings.length > 0 && (
              <Box>
                <Flex justify="space-between" align="center" mb="2" px="1">
                  <Text fontSize="xs" fontWeight="semibold" color="gray.500">
                    SUBMITTED ({submittedBookings.length})
                  </Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    colorPalette="gray"
                    onClick={handleClearSubmitted}
                  >
                    Clear All
                  </Button>
                </Flex>
                <VStack gap="2" align="stretch">
                  {submittedBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      isActive={booking.id === activeBookingId}
                      onSelect={() => handleSelectBooking(booking.id)}
                      onRemove={() => handleRemoveBooking(booking.id)}
                    />
                  ))}
                </VStack>
              </Box>
            )}
          </VStack>
        )}
      </Box>

      {/* Footer */}
      <Box p="3" borderTop="1px solid" borderColor="gray.100" bg="gray.50">
        <Text fontSize="xs" color="gray.500" textAlign="center">
          {draftBookings.length} in progress • {submittedBookings.length} submitted
        </Text>
      </Box>
    </Box>
  );
}
