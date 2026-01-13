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
} from '@chakra-ui/react';
import { Alert } from '@chakra-ui/react/alert';
import { Spinner } from '@chakra-ui/react/spinner';
import { PassengerForm, BookingExtras, FlightSummary } from '@/components/booking';
import type { FlightOffer, FlightSearchParams } from '@/types/flight';
import type { PassengerFormData, Passenger } from '@/types/passenger';
import type { AgentNotification, Booking, BookingRequest } from '@/types/booking';
import { EMPTY_PASSENGER_FORM } from '@/types/passenger';
import { validatePassengerForm } from '@/utils/validation';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export default function BookingPage() {
  const router = useRouter();
  const [flight, setFlight] = useState<FlightOffer | null>(null);
  const [searchParams, setSearchParams] = useState<FlightSearchParams | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [passengers, setPassengers] = useState<PassengerFormData[]>([]);
  const [passengerErrors, setPassengerErrors] = useState<Record<string, string>[]>([]);
  const [discountCode, setDiscountCode] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Load flight data from session storage
  useEffect(() => {
    const storedFlight = sessionStorage.getItem('selectedFlight');
    const storedParams = sessionStorage.getItem('searchParams');

    if (!storedFlight || !storedParams) {
      setError('No flight selected. Please search for flights first.');
      setIsLoading(false);
      return;
    }

    try {
      const parsedFlight = JSON.parse(storedFlight) as FlightOffer;
      const parsedParams = JSON.parse(storedParams) as FlightSearchParams;

      setFlight(parsedFlight);
      setSearchParams(parsedParams);

      // Initialize passenger forms based on passenger count
      const passengerCount = parsedParams.passengers || 1;
      setPassengers(Array(passengerCount).fill(null).map(() => ({ ...EMPTY_PASSENGER_FORM })));
      setPassengerErrors(Array(passengerCount).fill({}));
    } catch (err) {
      setError('Failed to load flight data.');
      console.error('Error parsing flight data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePassengerChange = (index: number, data: PassengerFormData) => {
    const newPassengers = [...passengers];
    newPassengers[index] = data;
    setPassengers(newPassengers);

    // Clear errors for this passenger
    const newErrors = [...passengerErrors];
    newErrors[index] = {};
    setPassengerErrors(newErrors);
  };

  const validateAllPassengers = (): { valid: boolean; errorMessages: string[] } => {
    const newErrors: Record<string, string>[] = [];
    let allValid = true;
    const errorMessages: string[] = [];

    passengers.forEach((passenger, index) => {
      const result = validatePassengerForm(passenger);
      newErrors.push(result.errors);
      if (!result.valid) {
        allValid = false;
        // Collect specific error messages
        Object.entries(result.errors).forEach(([field, message]) => {
          const fieldLabel = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
          errorMessages.push(`Passenger ${index + 1}: ${fieldLabel} - ${message}`);
        });
      }
    });

    setPassengerErrors(newErrors);
    return { valid: allValid, errorMessages };
  };

  const handleSubmit = async () => {
    if (!flight || !searchParams) return;

    // Validate all passengers
    const validation = validateAllPassengers();
    if (!validation.valid) {
      const errorList = validation.errorMessages.slice(0, 5).join('\n');
      setError(`Please fix the following errors:\n${errorList}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create passenger objects
      const passengerList: Passenger[] = passengers.map((p, index) => ({
        id: generateId(),
        type: 'adult' as const,
        title: p.title,
        firstName: p.firstName,
        lastName: p.lastName,
        middleName: p.middleName || undefined,
        dateOfBirth: p.dateOfBirth,
        gender: p.gender as 'male' | 'female' | 'other',
        email: p.email,
        phone: p.phone,
        nationality: p.nationality || undefined,
        identityDocument: p.documentType
          ? {
              type: p.documentType as 'passport' | 'national_id' | 'drivers_license',
              number: p.documentNumber,
              issuingCountry: p.documentIssuingCountry,
              expiryDate: p.documentExpiryDate,
            }
          : undefined,
      }));

      // Create booking request
      const bookingRequest: BookingRequest = {
        id: generateId(),
        flightOffer: flight,
        searchParams,
        passengers: passengerList,
        discountCode: discountCode || undefined,
        specialRequests: specialRequests || undefined,
        contactEmail: passengers[0].email,
        contactPhone: passengers[0].phone,
        createdAt: new Date().toISOString(),
      };

      // Create booking record
      const booking: Booking = {
        id: generateId(),
        request: bookingRequest,
        status: 'pending',
        originalPrice: flight.totalPrice.amount,
        finalPrice: flight.priceWithMarkup.amount,
        currency: flight.priceWithMarkup.currency,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create agent notification
      const notification: AgentNotification = {
        bookingId: booking.id,
        type: 'new_booking',
        timestamp: new Date().toISOString(),
        booking: {
          flightDetails: {
            origin: searchParams.origin,
            destination: searchParams.destination,
            departureDate: searchParams.departureDate,
            returnDate: searchParams.returnDate,
            tripType: searchParams.tripType,
            cabinClass: searchParams.cabinClass,
          },
          passengers: passengerList.map((p) => ({
            name: `${p.title} ${p.firstName} ${p.lastName}`,
            email: p.email,
            phone: p.phone,
          })),
          pricing: {
            originalAmount: flight.totalPrice.amount,
            markedUpAmount: flight.priceWithMarkup.amount,
            currency: flight.priceWithMarkup.currency,
          },
          specialRequests: specialRequests || undefined,
          discountCode: discountCode || undefined,
        },
      };

      // Store booking data for confirmation page
      sessionStorage.setItem('booking', JSON.stringify(booking));
      sessionStorage.setItem('notification', JSON.stringify(notification));

      // Navigate to confirmation
      router.push('/booking/confirmation');
    } catch (err) {
      setError('Failed to submit booking. Please try again.');
      console.error('Booking submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if flight is international (simple check)
  const isInternational = flight
    ? flight.slices[0].origin.country !== flight.slices[0].destination.country
    : false;

  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.50" px={{ base: '4', md: '8' }}>
        <Container maxW="6xl" py={{ base: '8', md: '10' }}>
          <Flex justify="center" align="center" minH="400px">
            <VStack gap="4">
              <Spinner size="xl" color="blue.500" />
              <Text color="gray.600">Loading booking details...</Text>
            </VStack>
          </Flex>
        </Container>
      </Box>
    );
  }

  if (!flight || !searchParams) {
    return (
      <Box minH="100vh" bg="gray.50" px={{ base: '4', md: '8' }}>
        <Container maxW="6xl" py={{ base: '8', md: '10' }}>
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>No Flight Selected</Alert.Title>
              <Alert.Description>
                {error || 'Please search for flights and select one to book.'}
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

  return (
    <Box minH="100vh" bg="gray.50" pb="10">
      <Container maxW="6xl" py={{ base: '6', md: '10' }} px={{ base: '4', md: '8' }} mx="auto">
        <VStack gap={{ base: '5', md: '6' }} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <Heading size="xl" color="blue.600">
              Complete Your Booking
            </Heading>
            <Button variant="outline" size="lg" px="6" onClick={() => router.back()}>
              Back to Flights
            </Button>
          </Flex>

          {/* Error Alert */}
          {error && (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Validation Error</Alert.Title>
                <Alert.Description>
                  <Box as="pre" whiteSpace="pre-wrap" fontSize="sm">
                    {error}
                  </Box>
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          <Flex gap={{ base: '6', lg: '8' }} direction={{ base: 'column', lg: 'row' }}>
            {/* Main Form */}
            <Box flex="1">
              <VStack gap={{ base: '6', md: '8' }} align="stretch">
                {/* Passenger Forms */}
                {passengers.map((passenger, index) => (
                  <PassengerForm
                    key={index}
                    passengerNumber={index + 1}
                    data={passenger}
                    onChange={(data) => handlePassengerChange(index, data)}
                    errors={passengerErrors[index]}
                    isInternational={isInternational}
                  />
                ))}

                {/* Extras */}
                <BookingExtras
                  discountCode={discountCode}
                  specialRequests={specialRequests}
                  onDiscountCodeChange={setDiscountCode}
                  onSpecialRequestsChange={setSpecialRequests}
                />

                {/* Submit Button (mobile) */}
                <Box display={{ base: 'block', lg: 'none' }}>
                  <Button
                    colorPalette="blue"
                    size="lg"
                    w="full"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Submit Booking Request
                  </Button>
                </Box>
              </VStack>
            </Box>

            {/* Sidebar - Flight Summary */}
            <Box w={{ base: 'full', lg: '380px' }} flexShrink={0}>
              <Box position={{ lg: 'sticky' }} top={{ lg: '24px' }}>
                <VStack gap="5" align="stretch">
                  <FlightSummary flight={flight} />

                  {/* Submit Button (desktop) */}
                  <Box display={{ base: 'none', lg: 'block' }}>
                    <Button
                      colorPalette="blue"
                      size="lg"
                      w="full"
                      onClick={handleSubmit}
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      Submit Booking Request
                    </Button>
                    <Text fontSize="xs" color="gray.500" mt="2" textAlign="center">
                      By submitting, you agree to our terms and conditions
                    </Text>
                  </Box>
                </VStack>
              </Box>
            </Box>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
}
