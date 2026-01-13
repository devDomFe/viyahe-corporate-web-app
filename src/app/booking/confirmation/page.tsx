'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  Button,
  HStack,
  Code,
} from '@chakra-ui/react';
import { Alert } from '@chakra-ui/react/alert';
import { Spinner } from '@chakra-ui/react/spinner';
import type { Booking, AgentNotification } from '@/types/booking';
import { formatDateTime, formatRoute, formatCurrency } from '@/utils/format';

export default function ConfirmationPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [notification, setNotification] = useState<AgentNotification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    const storedBooking = sessionStorage.getItem('booking');
    const storedNotification = sessionStorage.getItem('notification');

    if (!storedBooking || !storedNotification) {
      setIsLoading(false);
      return;
    }

    try {
      setBooking(JSON.parse(storedBooking));
      setNotification(JSON.parse(storedNotification));
    } catch (err) {
      console.error('Error parsing booking data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNewSearch = () => {
    // Clear session storage
    sessionStorage.removeItem('selectedFlight');
    sessionStorage.removeItem('searchParams');
    sessionStorage.removeItem('booking');
    sessionStorage.removeItem('notification');
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

  if (!booking || !notification) {
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

  const flightDetails = notification.booking.flightDetails;
  const passengers = notification.booking.passengers;
  const pricing = notification.booking.pricing;

  return (
    <Box minH="100vh" bg="gray.50" pb="10">
      <Container maxW="4xl" py={{ base: '8', md: '10' }} px={{ base: '4', md: '8' }} mx="auto">
        <VStack gap={{ base: '6', md: '8' }} align="stretch">
          {/* Success Header */}
          <Box textAlign="center">
            <Box
              w="80px"
              h="80px"
              bg="green.100"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb="4"
            >
              <Text fontSize="4xl">✓</Text>
            </Box>
            <Heading size="xl" color="green.600" mb="2">
              Booking Request Submitted!
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Your booking request has been sent to our travel agents for review.
            </Text>
          </Box>

          {/* Booking Reference */}
          <Box bg="white" borderRadius="lg" boxShadow="sm" p={{ base: '5', md: '6' }}>
            <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
              <Box>
                <Text fontSize="sm" color="gray.500">
                  Booking Reference
                </Text>
                <Text fontSize="2xl" fontWeight="bold" fontFamily="mono">
                  {booking.id.toUpperCase()}
                </Text>
              </Box>
              <Box textAlign={{ base: 'left', md: 'right' }}>
                <Text fontSize="sm" color="gray.500">
                  Submitted
                </Text>
                <Text fontWeight="medium">
                  {formatDateTime(booking.createdAt)}
                </Text>
              </Box>
            </Flex>
          </Box>

          {/* Flight Details */}
          <Box bg="white" borderRadius="lg" boxShadow="sm" p={{ base: '5', md: '6' }}>
            <Heading size="md" mb="4">
              Flight Details
            </Heading>
            <VStack gap="3" align="stretch">
              <Flex justify="space-between">
                <Text color="gray.600">Route</Text>
                <Text fontWeight="medium">
                  {formatRoute(flightDetails.origin, flightDetails.destination)}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.600">Departure</Text>
                <Text fontWeight="medium">{flightDetails.departureDate}</Text>
              </Flex>
              {flightDetails.returnDate && (
                <Flex justify="space-between">
                  <Text color="gray.600">Return</Text>
                  <Text fontWeight="medium">{flightDetails.returnDate}</Text>
                </Flex>
              )}
              <Flex justify="space-between">
                <Text color="gray.600">Trip Type</Text>
                <Text fontWeight="medium" textTransform="capitalize">
                  {flightDetails.tripType.replace('_', ' ')}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.600">Class</Text>
                <Text fontWeight="medium" textTransform="capitalize">
                  {flightDetails.cabinClass.replace('_', ' ')}
                </Text>
              </Flex>
              <Box h="1px" bg="gray.200" />
              <Flex justify="space-between" fontWeight="bold">
                <Text>Total Price</Text>
                <Text color="blue.600">
                  {formatCurrency(pricing.markedUpAmount, pricing.currency)}
                </Text>
              </Flex>
            </VStack>
          </Box>

          {/* Passenger Details */}
          <Box bg="white" borderRadius="lg" boxShadow="sm" p={{ base: '5', md: '6' }}>
            <Heading size="md" mb="4">
              Passengers ({passengers.length})
            </Heading>
            <VStack gap="3" align="stretch">
              {passengers.map((passenger, index) => (
                <Box key={index} p="3" bg="gray.50" borderRadius="md">
                  <Text fontWeight="medium">{passenger.name}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {passenger.email} • {passenger.phone}
                  </Text>
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Special Requests */}
          {(notification.booking.specialRequests || notification.booking.discountCode) && (
            <Box bg="white" borderRadius="lg" boxShadow="sm" p={{ base: '5', md: '6' }}>
              <Heading size="md" mb="4">
                Additional Information
              </Heading>
              <VStack gap="3" align="stretch">
                {notification.booking.discountCode && (
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Discount Code
                    </Text>
                    <Text fontWeight="medium">{notification.booking.discountCode}</Text>
                  </Box>
                )}
                {notification.booking.specialRequests && (
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Special Requests
                    </Text>
                    <Text>{notification.booking.specialRequests}</Text>
                  </Box>
                )}
              </VStack>
            </Box>
          )}

          {/* Next Steps */}
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

          {/* Agent Notification JSON */}
          <Box bg="white" borderRadius="lg" boxShadow="sm" p={{ base: '5', md: '6' }}>
            <Flex justify="space-between" align="center" mb="4">
              <Box>
                <Heading size="md">Agent Notification Data</Heading>
                <Text fontSize="sm" color="gray.500">
                  This data will be sent to the travel agent (email integration to be implemented)
                </Text>
              </Box>
              <Button size="md" variant="outline" px="5" onClick={() => setShowJson(!showJson)}>
                {showJson ? 'Hide' : 'Show'} JSON
              </Button>
            </Flex>

            {showJson && (
              <Box
                bg="gray.900"
                borderRadius="md"
                p="4"
                overflow="auto"
                maxH="400px"
              >
                <Code
                  display="block"
                  whiteSpace="pre"
                  fontSize="xs"
                  color="green.300"
                  bg="transparent"
                >
                  {JSON.stringify(notification, null, 2)}
                </Code>
              </Box>
            )}
          </Box>

          {/* Actions */}
          <Flex gap="4" justify="center">
            <Button variant="outline" size="lg" px="6" onClick={() => window.print()}>
              Print Confirmation
            </Button>
            <Button colorPalette="blue" size="lg" px="6" onClick={handleNewSearch}>
              Book Another Flight
            </Button>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
}
