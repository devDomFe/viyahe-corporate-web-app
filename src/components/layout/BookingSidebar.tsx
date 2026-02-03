'use client';

import { useEffect, useRef } from 'react';
import { Box, VStack, Text, Button, Flex, Heading } from '@chakra-ui/react';
import { useRouter, usePathname } from 'next/navigation';
import { useMultiBooking } from '@/hooks/useMultiBooking';
import { BookingCard } from './BookingCard';
import type { DraftBooking } from '@/types/multi-booking';
import { getBookingById } from '@/lib/bookings/localStorage';

interface BookingSidebarProps {
  onClose?: () => void;
}

/**
 * Categorize bookings into 4 groups based on their status
 */
function categorizeBookings(bookings: DraftBooking[]) {
  const inProgress: DraftBooking[] = [];
  const submitted: DraftBooking[] = [];
  const fulfilled: DraftBooking[] = [];
  const rejected: DraftBooking[] = [];

  for (const booking of bookings) {
    if (booking.status !== 'submitted') {
      // Local draft statuses: searching, selecting, filling
      inProgress.push(booking);
    } else {
      // Submitted bookings - group by server status
      const serverStatus = booking.serverStatus;
      if (serverStatus === 'FULFILLED') {
        fulfilled.push(booking);
      } else if (serverStatus === 'REJECTED') {
        rejected.push(booking);
      } else {
        // BOOKING_REQUESTED or CONFIRMED go to "Submitted" group
        submitted.push(booking);
      }
    }
  }

  return { inProgress, submitted, fulfilled, rejected };
}

export function BookingSidebar({ onClose }: BookingSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { bookings, activeBookingId, createBooking, setActiveBooking, removeBooking, updateBooking } = useMultiBooking();

  // Use refs to avoid infinite loops - these don't trigger re-renders when accessed
  const bookingsRef = useRef(bookings);
  const updateBookingRef = useRef(updateBooking);

  // Keep refs up to date
  useEffect(() => {
    bookingsRef.current = bookings;
    updateBookingRef.current = updateBooking;
  }, [bookings, updateBooking]);

  // Fetch server statuses from localStorage on mount and periodically
  useEffect(() => {
    const fetchServerStatuses = () => {
      const currentBookings = bookingsRef.current;
      const currentUpdateBooking = updateBookingRef.current;

      const submittedBookings = currentBookings.filter(
        (b) => b.status === 'submitted' && b.serverBookingId
      );

      for (const booking of submittedBookings) {
        // Read directly from localStorage (shared with agent interface)
        const serverBooking = getBookingById(booking.serverBookingId!);
        if (serverBooking) {
          const newServerStatus = serverBooking.status;
          // Only update if status actually changed
          if (newServerStatus && newServerStatus !== booking.serverStatus) {
            currentUpdateBooking(booking.id, { serverStatus: newServerStatus });
          }
        }
      }
    };

    // Initial fetch
    fetchServerStatuses();

    // Poll every 2 seconds for status updates (localStorage is fast)
    const interval = setInterval(fetchServerStatuses, 2000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array - runs once on mount

  // Group bookings into categories
  const { inProgress, submitted, fulfilled, rejected } = categorizeBookings(bookings);

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
        // Build URL params from booking's search params
        if (booking.searchParams) {
          const params = booking.searchParams;
          const urlSearchParams = new URLSearchParams({
            tripType: params.tripType,
            origin: params.origin,
            destination: params.destination,
            departureDate: params.departureDate,
            passengers: params.passengers.toString(),
            cabinClass: params.cabinClass,
          });
          if (params.returnDate) {
            urlSearchParams.set('returnDate', params.returnDate);
          }
          if (params.additionalLegs && params.additionalLegs.length > 0) {
            urlSearchParams.set('additionalLegs', JSON.stringify(params.additionalLegs));
          }
          router.push(`/flights?${urlSearchParams.toString()}`);
        } else {
          router.push('/flights');
        }
        break;
      case 'filling':
        router.push('/booking');
        break;
      case 'submitted':
        // Pass serverBookingId in URL to load correct booking
        if (booking.serverBookingId) {
          router.push(`/booking/confirmation?id=${booking.serverBookingId}`);
        } else {
          router.push('/booking/confirmation');
        }
        break;
    }

    onClose?.();
  };

  const handleRemoveBooking = (id: string) => {
    // If removing the active booking while on /flights or /booking, redirect to root
    const isOnBookingPage = pathname === '/flights' || pathname === '/booking';
    const isRemovingActiveBooking = id === activeBookingId;

    removeBooking(id);

    if (isRemovingActiveBooking && isOnBookingPage) {
      router.push('/');
    }
  };

  const handleClearGroup = (group: DraftBooking[]) => {
    group.forEach((booking) => {
      removeBooking(booking.id);
    });
  };

  // Render a booking group section
  const renderGroup = (
    title: string,
    groupBookings: DraftBooking[],
    colorScheme: string,
    showClearButton = false
  ) => {
    if (groupBookings.length === 0) return null;

    return (
      <Box>
        <Flex justify="space-between" align="center" mb="2" px="1">
          <Text fontSize="xs" fontWeight="semibold" color={`${colorScheme}.600`}>
            {title} ({groupBookings.length})
          </Text>
          {showClearButton && (
            <Button
              size="xs"
              variant="ghost"
              colorPalette="gray"
              onClick={() => handleClearGroup(groupBookings)}
            >
              Clear
            </Button>
          )}
        </Flex>
        <VStack gap="2" align="stretch">
          {groupBookings.map((booking) => (
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
    );
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
            {/* In Progress - searching, selecting, filling, ready */}
            {renderGroup('IN PROGRESS', inProgress, 'gray')}

            {/* Submitted - pending (BOOKING_REQUESTED) and confirmed */}
            {renderGroup('SUBMITTED', submitted, 'yellow', true)}

            {/* Fulfilled */}
            {renderGroup('FULFILLED', fulfilled, 'green', true)}

            {/* Rejected */}
            {renderGroup('REJECTED', rejected, 'red', true)}
          </VStack>
        )}
      </Box>

      {/* Footer */}
      <Box p="3" borderTop="1px solid" borderColor="gray.100" bg="gray.50">
        <Text fontSize="xs" color="gray.500" textAlign="center">
          {inProgress.length} in progress • {submitted.length + fulfilled.length + rejected.length} submitted
        </Text>
      </Box>
    </Box>
  );
}
