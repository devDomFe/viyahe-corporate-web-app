'use client';

import { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  Button,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { Alert } from '@chakra-ui/react/alert';
import { Spinner } from '@chakra-ui/react/spinner';
import type { BookingWithDocuments, BookingStatus } from '@/types/booking';
import { formatRoute } from '@/utils/format';
import { useMultiBooking } from '@/hooks/useMultiBooking';
import { DocumentList } from '@/components/agent/DocumentList';
import { getBookingById } from '@/lib/bookings/localStorage';

const STATUS_CONFIG: Record<BookingStatus, { label: string; colorPalette: string; icon: string }> = {
  BOOKING_REQUESTED: { label: 'Pending Review', colorPalette: 'yellow', icon: '⏳' },
  CONFIRMED: { label: 'Confirmed', colorPalette: 'green', icon: '✓' },
  REJECTED: { label: 'Rejected', colorPalette: 'red', icon: '✕' },
  FULFILLED: { label: 'Fulfilled', colorPalette: 'blue', icon: '✓' },
};

function ConfirmationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { bookings, createBooking } = useMultiBooking();
  const [serverBooking, setServerBooking] = useState<BookingWithDocuments | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get booking ID from URL query parameter
  const urlBookingId = searchParams.get('id');

  // Find the draft booking from context using URL param
  const contextBooking = useMemo(() => {
    if (urlBookingId) {
      return bookings.find(b => b.serverBookingId === urlBookingId) || null;
    }
    // Fallback to sessionStorage
    const storedBookingId = typeof window !== 'undefined' ? sessionStorage.getItem('bookingId') : null;
    if (storedBookingId) {
      return bookings.find(b => b.serverBookingId === storedBookingId) || null;
    }
    return null;
  }, [urlBookingId, bookings]);

  // Track current booking ID to detect changes
  const currentBookingIdRef = useRef<string | null>(null);

  // Load booking from localStorage
  const loadBooking = useCallback((bookingId: string) => {
    const booking = getBookingById(bookingId);
    if (booking) {
      setServerBooking(booking);
    }
  }, []);

  // Initialize page
  useEffect(() => {
    const bookingId = urlBookingId || (typeof window !== 'undefined' ? sessionStorage.getItem('bookingId') : null);

    // Detect if booking ID changed
    if (currentBookingIdRef.current === bookingId) {
      return;
    }
    currentBookingIdRef.current = bookingId;

    setIsLoading(true);

    if (bookingId) {
      loadBooking(bookingId);
    }

    setIsLoading(false);
  }, [urlBookingId, loadBooking]);

  // Poll for status updates - reload from localStorage periodically
  useEffect(() => {
    const bookingId = urlBookingId || (typeof window !== 'undefined' ? sessionStorage.getItem('bookingId') : null);
    if (!bookingId) return;

    // Only poll if status is still BOOKING_REQUESTED
    if (serverBooking && serverBooking.status !== 'BOOKING_REQUESTED') return;

    const interval = setInterval(() => {
      loadBooking(bookingId);
    }, 2000);

    return () => clearInterval(interval);
  }, [urlBookingId, serverBooking?.status, loadBooking]);

  const handleNewSearch = () => {
    sessionStorage.removeItem('bookingId');
    createBooking();
    router.push('/');
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Container maxW="4xl" py={{ base: '8', md: '10' }} px={{ base: '4', md: '8' }} mx="auto">
          <Flex justify="center" align="center" minH="400px">
            <VStack gap="4">
              <Spinner size="xl" color="blue.500" />
              <Text color="gray.600">Loading confirmation...</Text>
            </VStack>
          </Flex>
        </Container>
      </Box>
    );
  }

  // No booking found
  if (!contextBooking && !serverBooking) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Container maxW="4xl" py={{ base: '8', md: '10' }} px={{ base: '4', md: '8' }} mx="auto">
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>No Booking Found</Alert.Title>
              <Alert.Description>
                Please complete the booking process first.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
          <Button mt="4" onClick={() => router.push('/')}>
            Search Flights
          </Button>
        </Container>
      </Box>
    );
  }

  // Use contextBooking for flight/passenger details, serverBooking for status
  const flight = contextBooking?.selectedFlight;
  const search = contextBooking?.searchParams;
  const paxList = contextBooking?.passengers || [];
  const bookingId = contextBooking?.serverBookingId || serverBooking?.id;

  // Determine status display
  const displayStatus = serverBooking?.status || 'BOOKING_REQUESTED';
  const statusConfig = STATUS_CONFIG[displayStatus];

  return (
    <Box minH="100vh" bg="gray.50" pb="10">
      <Container maxW="4xl" py={{ base: '8', md: '10' }} px={{ base: '4', md: '8' }} mx="auto">
        <VStack gap={{ base: '6', md: '8' }} align="stretch">
          {/* Success Header */}
          <Box textAlign="center">
            <Box
              w="80px"
              h="80px"
              bg={displayStatus === 'REJECTED' ? 'red.100' : displayStatus === 'FULFILLED' ? 'blue.100' : 'green.100'}
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb="4"
            >
              <Text fontSize="4xl">{statusConfig.icon}</Text>
            </Box>
            <Heading size="xl" color={`${statusConfig.colorPalette}.600`} mb="2">
              Booking {statusConfig.label}
            </Heading>
            <Text color="gray.600" fontSize="lg">
              {displayStatus === 'BOOKING_REQUESTED' && 'Your booking has been sent to our travel agents for review.'}
              {displayStatus === 'CONFIRMED' && 'Your booking has been confirmed! Documents will be uploaded shortly.'}
              {displayStatus === 'REJECTED' && 'Your booking request was not approved.'}
              {displayStatus === 'FULFILLED' && 'Your booking is complete. Download your travel documents below.'}
            </Text>
          </Box>

          {/* Booking Reference and Status */}
          {bookingId && (
            <Box bg="white" borderRadius="lg" boxShadow="sm" p={{ base: '5', md: '6' }}>
              <Flex justify="space-between" align="start" flexWrap="wrap" gap="4">
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Booking Reference
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" fontFamily="mono">
                    {bookingId.toUpperCase()}
                  </Text>
                </Box>
                <Box textAlign={{ base: 'left', md: 'right' }}>
                  <Text fontSize="sm" color="gray.500">
                    Status
                  </Text>
                  <Badge
                    colorPalette={statusConfig.colorPalette}
                    size="lg"
                    px="3"
                    py="1"
                  >
                    {statusConfig.icon} {statusConfig.label}
                  </Badge>
                </Box>
              </Flex>
            </Box>
          )}

          {/* Rejection Notice */}
          {serverBooking?.status === 'REJECTED' && (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Booking Rejected</Alert.Title>
                <Alert.Description>
                  {serverBooking.rejectionReason || 'Your booking request was rejected. Please contact support for more information.'}
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          {/* Fulfilled Notice with Documents */}
          {serverBooking?.status === 'FULFILLED' && serverBooking.documents.length > 0 && (
            <Box bg="white" borderRadius="lg" boxShadow="sm" p={{ base: '5', md: '6' }}>
              <Heading size="md" mb="4" color="green.600">
                Your Travel Documents
              </Heading>
              <Text color="gray.600" mb="4">
                Your booking is complete. Download your travel documents below.
              </Text>
              <DocumentList
                documents={serverBooking.documents}
                showActions={true}
              />
            </Box>
          )}

          {/* Confirmed with Documents */}
          {serverBooking?.status === 'CONFIRMED' && serverBooking.documents.length > 0 && (
            <Box bg="white" borderRadius="lg" boxShadow="sm" p={{ base: '5', md: '6' }}>
              <Heading size="md" mb="4" color="blue.600">
                Documents
              </Heading>
              <Text color="gray.600" mb="4">
                The following documents have been uploaded for your booking.
              </Text>
              <DocumentList
                documents={serverBooking.documents}
                showActions={true}
              />
            </Box>
          )}

          {/* Flight Details */}
          {flight && search && (
            <Box bg="white" borderRadius="lg" boxShadow="sm" p={{ base: '5', md: '6' }}>
              <Heading size="md" mb="4">
                Flight Details
              </Heading>
              <VStack gap="3" align="stretch">
                <Flex justify="space-between">
                  <Text color="gray.600">Route</Text>
                  <Text fontWeight="medium">
                    {formatRoute(search.origin, search.destination)}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.600">Departure</Text>
                  <Text fontWeight="medium">{search.departureDate}</Text>
                </Flex>
                {search.returnDate && (
                  <Flex justify="space-between">
                    <Text color="gray.600">Return</Text>
                    <Text fontWeight="medium">{search.returnDate}</Text>
                  </Flex>
                )}
                <Flex justify="space-between">
                  <Text color="gray.600">Class</Text>
                  <Text fontWeight="medium" textTransform="capitalize">
                    {search.cabinClass.replace('_', ' ')}
                  </Text>
                </Flex>
                <Box h="1px" bg="gray.200" />
                <Flex justify="space-between" fontWeight="bold">
                  <Text>Total Price</Text>
                  <Text color="blue.600">
                    {flight.priceWithMarkup.displayAmount}
                  </Text>
                </Flex>
              </VStack>
            </Box>
          )}

          {/* Passenger Details */}
          {paxList.length > 0 && (
            <Box bg="white" borderRadius="lg" boxShadow="sm" p={{ base: '5', md: '6' }}>
              <Heading size="md" mb="4">
                Passengers ({paxList.length})
              </Heading>
              <VStack gap="3" align="stretch">
                {paxList.map((passenger, index) => (
                  <Box key={index} p="3" bg="gray.50" borderRadius="md">
                    <Text fontWeight="medium">
                      {passenger.data.title} {passenger.data.firstName} {passenger.data.lastName}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {passenger.data.email} • {passenger.data.phone}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}

          {/* Next Steps - only show if pending */}
          {displayStatus === 'BOOKING_REQUESTED' && (
            <Box bg="blue.50" borderRadius="lg" p={{ base: '5', md: '6' }}>
              <Heading size="md" mb="3" color="blue.700">
                What Happens Next?
              </Heading>
              <VStack gap="2" align="stretch">
                <HStack gap="3">
                  <Box w="24px" h="24px" bg="blue.600" borderRadius="full" color="white" fontSize="sm" display="flex" alignItems="center" justifyContent="center">
                    1
                  </Box>
                  <Text>Our travel agents will review your booking request</Text>
                </HStack>
                <HStack gap="3">
                  <Box w="24px" h="24px" bg="blue.600" borderRadius="full" color="white" fontSize="sm" display="flex" alignItems="center" justifyContent="center">
                    2
                  </Box>
                  <Text>You will receive an email or call for confirmation</Text>
                </HStack>
                <HStack gap="3">
                  <Box w="24px" h="24px" bg="blue.600" borderRadius="full" color="white" fontSize="sm" display="flex" alignItems="center" justifyContent="center">
                    3
                  </Box>
                  <Text>Once confirmed, your e-ticket will be issued</Text>
                </HStack>
              </VStack>
            </Box>
          )}

          {/* Actions */}
          <Flex gap="4" justify="center">
            <Button colorPalette="blue" size="lg" px="6" onClick={handleNewSearch}>
              Book Another Flight
            </Button>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
}

function ConfirmationPageLoading() {
  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="4xl" py={{ base: '8', md: '10' }} px={{ base: '4', md: '8' }} mx="auto">
        <Flex justify="center" align="center" minH="400px">
          <VStack gap="4">
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.600">Loading confirmation...</Text>
          </VStack>
        </Flex>
      </Container>
    </Box>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<ConfirmationPageLoading />}>
      <ConfirmationPageContent />
    </Suspense>
  );
}
