'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
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
import { FlightList, FlightFilters, FlightSort } from '@/components/flights';
import { useFlightSearch } from '@/hooks/useFlightSearch';
import type { FlightSearchParams, TripType, CabinClass } from '@/types/flight';
import { formatDate, formatCabinClass, formatPassengers, formatRoute } from '@/utils/format';

function SearchSummary({ params }: { params: FlightSearchParams }) {
  return (
    <Box bg="white" borderRadius="lg" boxShadow="sm" p={{ base: '4', md: '5' }}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'start', md: 'center' }}
        gap="2"
      >
        <HStack gap="4" flexWrap="wrap">
          <Text fontWeight="bold" fontSize="lg">
            {formatRoute(params.origin, params.destination)}
          </Text>
          <Text color="gray.600">
            {formatDate(params.departureDate)}
            {params.returnDate && ` - ${formatDate(params.returnDate)}`}
          </Text>
        </HStack>
        <HStack gap="2">
          <Text fontSize="sm" color="gray.500">
            {formatPassengers(params.passengers)} • {formatCabinClass(params.cabinClass)}
          </Text>
        </HStack>
      </Flex>
    </Box>
  );
}

function FlightsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse search params
  const flightSearchParams = useMemo<FlightSearchParams | null>(() => {
    const tripType = searchParams.get('tripType') as TripType | null;
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const departureDate = searchParams.get('departureDate');
    const returnDate = searchParams.get('returnDate');
    const passengers = searchParams.get('passengers');
    const cabinClass = searchParams.get('cabinClass') as CabinClass | null;

    if (!tripType || !origin || !destination || !departureDate || !cabinClass) {
      return null;
    }

    return {
      tripType,
      origin,
      destination,
      departureDate,
      returnDate: returnDate || undefined,
      passengers: passengers ? parseInt(passengers) : 1,
      cabinClass,
    };
  }, [searchParams]);

  const {
    filteredFlights,
    isLoading,
    error,
    filters,
    setFilters,
    sortOption,
    setSortOption,
    availableAirlines,
    maxPriceRange,
    maxDurationRange,
    selectedFlightId,
    setSelectedFlightId,
    selectedFlight,
  } = useFlightSearch(flightSearchParams);

  const handleSelectFlight = (flightId: string) => {
    setSelectedFlightId(flightId === selectedFlightId ? null : flightId);
  };

  const handleContinueToBooking = () => {
    if (!selectedFlightId || !flightSearchParams) return;

    // Store selected flight in session storage for the booking page
    sessionStorage.setItem('selectedFlight', JSON.stringify(selectedFlight));
    sessionStorage.setItem('searchParams', JSON.stringify(flightSearchParams));

    router.push('/booking');
  };

  if (!flightSearchParams) {
    return (
      <Box minH="100vh" bg="gray.50" px={{ base: '4', md: '8' }}>
        <Container maxW="6xl" py={{ base: '8', md: '10' }}>
          <Alert.Root status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Invalid Search</Alert.Title>
              <Alert.Description>
                Please go back and enter your search criteria.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
          <Button mt="4" onClick={() => router.push('/')}>
            Back to Search
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" px={{ base: '4', md: '8' }}>
      <Container maxW="7xl" py={{ base: '6', md: '10' }}>
        <VStack gap={{ base: '5', md: '6' }} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <Heading size="xl" color="blue.600">
              Flight Results
            </Heading>
            <Button variant="outline" size="lg" px="6" onClick={() => router.push('/')}>
              New Search
            </Button>
          </Flex>

          {/* Search Summary */}
          <SearchSummary params={flightSearchParams} />

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

          {/* Main Content */}
          <Flex gap="6" direction={{ base: 'column', lg: 'row' }}>
            {/* Filters Sidebar */}
            <Box w={{ base: 'full', lg: '280px' }} flexShrink={0}>
              <FlightFilters
                filters={filters}
                onFiltersChange={setFilters}
                availableAirlines={availableAirlines}
                maxPriceRange={maxPriceRange}
                maxDurationRange={maxDurationRange}
              />
            </Box>

            {/* Results */}
            <Box flex="1">
              <VStack gap="4" align="stretch">
                {/* Sort & Count */}
                <FlightSort
                  value={sortOption}
                  onChange={setSortOption}
                  resultCount={filteredFlights.length}
                />

                {/* Flight List */}
                <FlightList
                  flights={filteredFlights}
                  selectedFlightId={selectedFlightId || undefined}
                  onSelectFlight={handleSelectFlight}
                  isLoading={isLoading}
                />
              </VStack>
            </Box>
          </Flex>

          {/* Continue Button (Fixed at bottom when flight selected) */}
          {selectedFlight && (
            <Box
              position="fixed"
              bottom="0"
              left="0"
              right="0"
              bg="white"
              borderTop="1px solid"
              borderColor="gray.200"
              p={{ base: '4', md: '5' }}
              boxShadow="lg"
              zIndex="sticky"
            >
              <Container maxW="7xl" px={{ base: '4', md: '8' }}>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="medium">Selected Flight</Text>
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                      {selectedFlight.priceWithMarkup.displayAmount}
                    </Text>
                  </Box>
                  <Button colorPalette="blue" size="lg" px="8" onClick={handleContinueToBooking}>
                    Continue to Booking
                  </Button>
                </Flex>
              </Container>
            </Box>
          )}

          {/* Spacer for fixed bottom bar */}
          {selectedFlight && <Box h="100px" />}
        </VStack>
      </Container>
    </Box>
  );
}

function LoadingFallback() {
  return (
    <Box minH="100vh" bg="gray.50" px={{ base: '4', md: '8' }}>
      <Container maxW="6xl" py={{ base: '8', md: '10' }}>
        <Flex justify="center" align="center" minH="400px">
          <VStack gap="4">
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.600">Loading flights...</Text>
          </VStack>
        </Flex>
      </Container>
    </Box>
  );
}

export default function FlightsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FlightsContent />
    </Suspense>
  );
}
