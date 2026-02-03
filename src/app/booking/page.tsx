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
} from '@chakra-ui/react';
import { Alert } from '@chakra-ui/react/alert';
import { Spinner } from '@chakra-ui/react/spinner';
import {
  BookingExtras,
  FlightSummary,
  SavedPassengersSidebar,
  PassengerCard,
  SavePassengerModal,
} from '@/components/booking';
import type { Passenger, PassengerFormData } from '@/types/passenger';
import { useSavedPassengers } from '@/hooks/useSavedPassengers';
import { useBookingPassengers } from '@/hooks/useBookingPassengers';
import { useMultiBooking } from '@/hooks/useMultiBooking';
import { formDataToSavedPassenger } from '@/types/saved-passenger';
import { saveBooking, generateBookingId } from '@/lib/bookings/localStorage';
import type { BookingWithDocuments, BookingRequest } from '@/types/booking';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export default function BookingPage() {
  const router = useRouter();
  const {
    activeBooking,
    activeBookingId,
    setBookingStatus,
    removeBooking,
    setPassengers: setContextPassengers,
    updateBooking,
  } = useMultiBooking();

  // Get flight and searchParams from context
  const flight = activeBooking?.selectedFlight ?? null;
  const searchParams = activeBooking?.searchParams ?? null;

  // Check if booking is locked (submitted status)
  const isLocked = activeBooking?.status === 'submitted';

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form extras state - initialize from activeBooking
  const [discountCode, setDiscountCode] = useState(activeBooking?.discountCode ?? '');
  const [specialRequests, setSpecialRequests] = useState(activeBooking?.specialRequests ?? '');

  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Save modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newPassengersToSave, setNewPassengersToSave] = useState<PassengerFormData[]>([]);

  // Saved passengers hook
  const {
    filteredPassengers,
    state: savedPassengersState,
    searchQuery,
    setSearchQuery,
    bulkCreatePassengers,
  } = useSavedPassengers();

  // Booking passengers hook - initialize with passengers from active booking
  const {
    passengers,
    addFromSaved,
    addNew,
    updatePassenger,
    removePassenger,
    expandedIds,
    toggleExpand,
    errors,
    validateAll,
    getSavedPassengerIds,
    getNewPassengersToSave,
    passengerCount,
  } = useBookingPassengers(activeBooking?.passengers ?? []);

  // Sync form state when switching to a different booking
  useEffect(() => {
    setDiscountCode(activeBooking?.discountCode ?? '');
    setSpecialRequests(activeBooking?.specialRequests ?? '');
    setError(null);
    setIsLoading(true);
  }, [activeBookingId]); // Only re-run when activeBookingId changes

  // Check if we have a valid booking from context
  useEffect(() => {
    if (!activeBooking) {
      setError('No flight selected. Please search for flights first.');
      setIsLoading(false);
      return;
    }

    if (!activeBooking.selectedFlight || !activeBooking.searchParams) {
      setError('No flight selected. Please search for flights first.');
      setIsLoading(false);
      return;
    }

    // Update booking status to 'filling' (only if not already submitted)
    if (activeBookingId && activeBooking.status !== 'filling' && activeBooking.status !== 'submitted') {
      setBookingStatus(activeBookingId, 'filling');
    }

    setIsLoading(false);
  }, [activeBooking, activeBookingId, setBookingStatus]);

  // Sync passengers to context whenever they change
  useEffect(() => {
    if (activeBookingId && passengers.length > 0) {
      setContextPassengers(activeBookingId, passengers);
    }
  }, [activeBookingId, passengers, setContextPassengers]);

  // Sync discount code and special requests to context
  useEffect(() => {
    if (activeBookingId) {
      updateBooking(activeBookingId, { discountCode: discountCode || undefined });
    }
  }, [activeBookingId, discountCode, updateBooking]);

  useEffect(() => {
    if (activeBookingId) {
      updateBooking(activeBookingId, { specialRequests: specialRequests || undefined });
    }
  }, [activeBookingId, specialRequests, updateBooking]);

  // Get IDs of saved passengers that have been added to booking
  const addedSavedPassengerIds = getSavedPassengerIds();

  // Calculate passenger limit
  const requiredPassengers = searchParams?.passengers || 1;
  const isAtPassengerLimit = passengerCount >= requiredPassengers;

  // Wrapper to prevent adding when at limit
  const handleAddFromSaved = (passenger: Parameters<typeof addFromSaved>[0]) => {
    if (isAtPassengerLimit) return;
    addFromSaved(passenger);
  };

  const handleAddNew = () => {
    if (isAtPassengerLimit) return;
    addNew();
  };

  const handleSubmit = async () => {
    if (!flight || !searchParams) return;

    // Check if we have enough passengers
    if (passengerCount < requiredPassengers) {
      setError(`Please add ${requiredPassengers} passenger${requiredPassengers > 1 ? 's' : ''} to continue.`);
      return;
    }

    // Validate all passengers
    const isValid = validateAll();
    if (!isValid) {
      setError('Please fix the errors in the passenger forms.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create passenger objects
      const passengerList: Passenger[] = passengers.map((p) => ({
        id: generateId(),
        type: 'adult' as const,
        title: p.data.title,
        firstName: p.data.firstName,
        lastName: p.data.lastName,
        middleName: p.data.middleName || undefined,
        dateOfBirth: p.data.dateOfBirth,
        gender: p.data.gender as 'male' | 'female' | 'other',
        email: p.data.email,
        phone: p.data.phone,
        nationality: p.data.nationality || undefined,
        identityDocument: p.data.documentType
          ? {
              type: p.data.documentType as 'passport' | 'national_id' | 'drivers_license',
              number: p.data.documentNumber,
              issuingCountry: p.data.documentIssuingCountry,
              expiryDate: p.data.documentExpiryDate,
            }
          : undefined,
      }));

      // Create booking request
      const bookingId = generateBookingId();
      const now = new Date().toISOString();

      const bookingRequest: BookingRequest = {
        id: generateId(),
        flightOffer: flight,
        searchParams,
        passengers: passengerList,
        discountCode: discountCode || undefined,
        specialRequests: specialRequests || undefined,
        contactEmail: passengers[0].data.email,
        contactPhone: passengers[0].data.phone,
        createdAt: now,
      };

      // Create the full booking object
      const newBooking: BookingWithDocuments = {
        id: bookingId,
        request: bookingRequest,
        status: 'BOOKING_REQUESTED',
        originalPrice: flight.totalPrice.amount,
        finalPrice: flight.priceWithMarkup.amount,
        currency: flight.priceWithMarkup.currency,
        createdAt: now,
        updatedAt: now,
        documents: [],
      };

      // Save booking to localStorage
      saveBooking(newBooking);

      // Store booking data for confirmation page
      sessionStorage.setItem('bookingId', bookingId);
      sessionStorage.setItem('booking', JSON.stringify(newBooking));

      // Update draft booking status to submitted and store booking ID
      if (activeBookingId) {
        updateBooking(activeBookingId, {
          status: 'submitted',
          serverBookingId: bookingId,
          serverStatus: 'BOOKING_REQUESTED',
        });
      }

      // Check if there are new passengers to save
      const newPassengers = getNewPassengersToSave();
      if (newPassengers.length > 0) {
        setNewPassengersToSave(newPassengers);
        setShowSaveModal(true);
      } else {
        // No new passengers, go directly to confirmation
        router.push('/booking/confirmation');
      }
    } catch (err) {
      setError('Failed to submit booking. Please try again.');
      console.error('Booking submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePassengers = async (passengersToSave: PassengerFormData[]) => {
    const createData = passengersToSave.map(formDataToSavedPassenger);
    await bulkCreatePassengers(createData);
    router.push('/booking/confirmation');
  };

  const handleSkipSave = () => {
    setShowSaveModal(false);
    router.push('/booking/confirmation');
  };

  // Check if flight is international (simple check)
  const isInternational = flight
    ? flight.slices[0].origin.country !== flight.slices[0].destination.country
    : false;

  if (isLoading) {
    return (
      <Box minH="100vh" bg="gray.50" px={{ base: '4', md: '8' }}>
        <Container maxW="7xl" py={{ base: '8', md: '10' }}>
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
        <Container maxW="7xl" py={{ base: '8', md: '10' }}>
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
    <Box minH="100vh" bg="gray.50" pb="10" pt={{ base: '4', md: '6' }}>
      <Container maxW="7xl" py={{ base: '6', md: '10' }} px={{ base: '4', md: '8' }} mx="auto">
        <VStack gap={{ base: '5', md: '6' }} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
            <Heading size="xl" color="blue.600">
              Complete Your Booking
            </Heading>
            <HStack gap="3">
              <Text fontSize="sm" color="gray.600">
                {passengerCount} of {requiredPassengers} passengers added
              </Text>
              <Button variant="outline" size="md" px="6" onClick={() => router.back()}>
                Back to Flights
              </Button>
            </HStack>
          </Flex>

          {/* Locked Alert */}
          {isLocked && (
            <Alert.Root status="warning">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Booking Submitted</Alert.Title>
                <Alert.Description>
                  This booking has been submitted and cannot be edited. Contact support for changes.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          {/* Error Alert */}
          {error && (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Error</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          {/* Main Layout: Sidebar + Content + Flight Summary */}
          <Flex gap={{ base: '6', lg: '6' }} direction={{ base: 'column', lg: 'row' }}>
            {/* Saved Passengers Sidebar */}
            <SavedPassengersSidebar
              savedPassengers={filteredPassengers}
              state={savedPassengersState}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectPassenger={handleAddFromSaved}
              addedPassengerIds={addedSavedPassengerIds}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              isAtLimit={isAtPassengerLimit}
            />

            {/* Main Content Area */}
            <Box flex="1" minW="0">
              <VStack gap={{ base: '5', md: '6' }} align="stretch">
                {/* Mobile Action Buttons */}
                <HStack display={{ base: 'flex', lg: 'none' }} gap="3">
                  <Button
                    variant="outline"
                    flex="1"
                    onClick={() => setIsSidebarOpen(true)}
                    disabled={isAtPassengerLimit || isLocked}
                  >
                    Add from Directory
                  </Button>
                  <Button
                    variant="outline"
                    flex="1"
                    onClick={handleAddNew}
                    disabled={isAtPassengerLimit || isLocked}
                  >
                    Add New Passenger
                  </Button>
                </HStack>

                {/* Desktop Add Button */}
                <HStack display={{ base: 'none', lg: 'flex' }} justify="flex-end">
                  <Button
                    variant="outline"
                    onClick={handleAddNew}
                    disabled={isAtPassengerLimit || isLocked}
                    px="6"
                  >
                    + Add New Passenger
                  </Button>
                </HStack>

                {/* Passenger Limit Info */}
                {isAtPassengerLimit && (
                  <Alert.Root status="info">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Description>
                        All {requiredPassengers} passenger{requiredPassengers > 1 ? 's' : ''} added. Remove a passenger to add a different one.
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                )}

                {/* Passenger Cards */}
                {passengers.length === 0 ? (
                  <Box
                    bg="white"
                    borderRadius="lg"
                    p="8"
                    textAlign="center"
                    border="2px dashed"
                    borderColor="gray.200"
                  >
                    <Text color="gray.500" mb="4">
                      No passengers added yet.
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      Select from saved passengers in the sidebar or add a new passenger.
                    </Text>
                  </Box>
                ) : (
                  <VStack gap="4" align="stretch">
                    {passengers.map((passenger, index) => (
                      <PassengerCard
                        key={passenger.id}
                        passenger={passenger}
                        index={index}
                        isExpanded={expandedIds.has(passenger.id)}
                        onToggleExpand={() => toggleExpand(passenger.id)}
                        onChange={(data) => updatePassenger(passenger.id, data)}
                        onRemove={() => removePassenger(passenger.id)}
                        errors={errors.get(passenger.id)}
                        isInternational={isInternational}
                        isLocked={isLocked}
                      />
                    ))}
                  </VStack>
                )}

                {/* Extras */}
                <BookingExtras
                  discountCode={discountCode}
                  specialRequests={specialRequests}
                  onDiscountCodeChange={setDiscountCode}
                  onSpecialRequestsChange={setSpecialRequests}
                  isDisabled={isLocked}
                />

                {/* Submit Button (mobile) */}
                {!isLocked && (
                  <Box display={{ base: 'block', lg: 'none' }}>
                    <Button
                      colorPalette="blue"
                      size="lg"
                      w="full"
                      onClick={handleSubmit}
                      loading={isSubmitting}
                      disabled={isSubmitting || passengerCount < requiredPassengers}
                    >
                      Submit Booking Request
                    </Button>
                  </Box>
                )}
              </VStack>
            </Box>

            {/* Right Sidebar - Flight Summary */}
            <Box w={{ base: 'full', lg: '350px' }} flexShrink={0}>
              <Box position={{ lg: 'sticky' }} top={{ lg: '24px' }}>
                <VStack gap="5" align="stretch">
                  <FlightSummary flight={flight} />

                  {/* Submit Button (desktop) */}
                  {!isLocked && (
                    <Box display={{ base: 'none', lg: 'block' }}>
                      <Button
                        colorPalette="blue"
                        size="lg"
                        w="full"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={isSubmitting || passengerCount < requiredPassengers}
                      >
                        Submit Booking Request
                      </Button>
                      <Text fontSize="xs" color="gray.500" mt="2" textAlign="center">
                        By submitting, you agree to our terms and conditions
                      </Text>
                    </Box>
                  )}

                  {/* View Confirmation Button (when locked) */}
                  {isLocked && (
                    <Box display={{ base: 'none', lg: 'block' }}>
                      <Button
                        colorPalette="green"
                        size="lg"
                        w="full"
                        onClick={() => router.push('/booking/confirmation')}
                      >
                        View Confirmation
                      </Button>
                    </Box>
                  )}
                </VStack>
              </Box>
            </Box>
          </Flex>
        </VStack>
      </Container>

      {/* Save Passengers Modal */}
      <SavePassengerModal
        isOpen={showSaveModal}
        onClose={handleSkipSave}
        passengers={newPassengersToSave}
        onSave={handleSavePassengers}
      />
    </Box>
  );
}
