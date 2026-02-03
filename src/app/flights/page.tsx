"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
} from "@chakra-ui/react";
import { Alert } from "@chakra-ui/react/alert";
import { Spinner } from "@chakra-ui/react/spinner";
import { FlightList, FlightFilters, FlightSort } from "@/components/flights";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { useMultiBooking } from "@/hooks/useMultiBooking";
import type {
  FlightSearchParams,
  TripType,
  CabinClass,
  FlightOffer,
} from "@/types/flight";
import {
  formatDate,
  formatCabinClass,
  formatPassengers,
  formatRoute,
  formatCurrency,
} from "@/utils/format";

interface LegInfo {
  origin: string;
  destination: string;
  date: string;
}

function MultiCityLegSelector({
  legs,
  currentLegIndex,
  selectedFlights,
  onLegClick,
}: {
  legs: LegInfo[];
  currentLegIndex: number;
  selectedFlights: (FlightOffer | null)[];
  onLegClick: (index: number) => void;
}) {
  return (
    <Box bg="white" borderRadius="lg" boxShadow="sm" p={{ base: "4", md: "5" }}>
      <Text fontSize="sm" fontWeight="medium" color="gray.600" mb="3">
        Select flights for each leg:
      </Text>
      <VStack align="stretch" gap="2">
        {legs.map((leg, index) => {
          const isSelected = selectedFlights[index] !== null;
          const isCurrent = index === currentLegIndex;
          const flight = selectedFlights[index];

          return (
            <Box
              key={index}
              p="3"
              borderRadius="md"
              border="2px solid"
              borderColor={
                isCurrent ? "blue.500" : isSelected ? "green.500" : "gray.200"
              }
              bg={isCurrent ? "blue.50" : isSelected ? "green.50" : "white"}
              cursor="pointer"
              onClick={() => onLegClick(index)}
              _hover={{ borderColor: isCurrent ? "blue.500" : "blue.300" }}
            >
              <Flex justify="space-between" align="center">
                <HStack gap="3">
                  <Badge
                    colorPalette={
                      isCurrent ? "blue" : isSelected ? "green" : "gray"
                    }
                    size="lg"
                  >
                    {index + 1}
                  </Badge>
                  <Box>
                    <Text fontWeight="medium">
                      {formatRoute(leg.origin, leg.destination)}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {formatDate(leg.date)}
                    </Text>
                  </Box>
                </HStack>
                {isSelected && flight && (
                  <Text fontWeight="bold" color="green.600">
                    {flight.priceWithMarkup.displayAmount}
                  </Text>
                )}
                {!isSelected && isCurrent && (
                  <Badge colorPalette="blue">Selecting</Badge>
                )}
                {!isSelected && !isCurrent && (
                  <Text fontSize="sm" color="gray.400">
                    Not selected
                  </Text>
                )}
              </Flex>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
}

function SearchSummary({
  params,
  currentLeg,
}: {
  params: FlightSearchParams;
  currentLeg?: LegInfo;
}) {
  const isMultiCity = params.tripType === "multi_city";

  if (isMultiCity && currentLeg) {
    return (
      <Box
        bg="blue.50"
        borderRadius="lg"
        boxShadow="sm"
        p={{ base: "4", md: "5" }}
        border="2px solid"
        borderColor="blue.200"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "start", md: "center" }}
          gap="2"
        >
          <HStack gap="4" flexWrap="wrap">
            <Text fontWeight="bold" fontSize="lg">
              {formatRoute(currentLeg.origin, currentLeg.destination)}
            </Text>
            <Text color="gray.600">{formatDate(currentLeg.date)}</Text>
          </HStack>
          <HStack gap="2">
            <Text fontSize="sm" color="gray.500">
              {formatPassengers(params.passengers)} •{" "}
              {formatCabinClass(params.cabinClass)}
            </Text>
          </HStack>
        </Flex>
      </Box>
    );
  }

  return (
    <Box bg="white" borderRadius="lg" boxShadow="sm" p={{ base: "4", md: "5" }}>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "start", md: "center" }}
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
            {formatPassengers(params.passengers)} •{" "}
            {formatCabinClass(params.cabinClass)}
          </Text>
        </HStack>
      </Flex>
    </Box>
  );
}

function FlightsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    activeBooking,
    activeBookingId,
    createBooking,
    setSearchParams: setBookingSearchParams,
    setSelectedFlight: setBookingSelectedFlight,
    updateBooking,
    setBookingStatus,
  } = useMultiBooking();

  // Parse search params
  const flightSearchParams = useMemo<FlightSearchParams | null>(() => {
    const tripType = searchParams.get("tripType") as TripType | null;
    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");
    const departureDate = searchParams.get("departureDate");
    const returnDate = searchParams.get("returnDate");
    const passengers = searchParams.get("passengers");
    const cabinClass = searchParams.get("cabinClass") as CabinClass | null;
    const additionalLegsParam = searchParams.get("additionalLegs");

    if (!tripType || !origin || !destination || !departureDate || !cabinClass) {
      return null;
    }

    let additionalLegs:
      | { origin: string; destination: string; date: string }[]
      | undefined;
    if (additionalLegsParam) {
      try {
        additionalLegs = JSON.parse(additionalLegsParam);
      } catch {
        additionalLegs = undefined;
      }
    }

    return {
      tripType,
      origin,
      destination,
      departureDate,
      returnDate: returnDate || undefined,
      passengers: passengers ? parseInt(passengers) : 1,
      cabinClass,
      additionalLegs,
    };
  }, [searchParams]);

  // Build legs array for multi-city
  const legs = useMemo<LegInfo[]>(() => {
    if (!flightSearchParams) return [];
    if (flightSearchParams.tripType !== "multi_city") return [];

    const allLegs: LegInfo[] = [
      {
        origin: flightSearchParams.origin,
        destination: flightSearchParams.destination,
        date: flightSearchParams.departureDate,
      },
    ];

    if (flightSearchParams.additionalLegs) {
      flightSearchParams.additionalLegs.forEach((leg) => {
        allLegs.push({
          origin: leg.origin,
          destination: leg.destination,
          date: leg.date,
        });
      });
    }

    return allLegs;
  }, [flightSearchParams]);

  const isMultiCity =
    flightSearchParams?.tripType === "multi_city" && legs.length > 1;

  // Update booking status to 'selecting' when viewing flight results
  // Only update if the booking's searchParams match the URL params (prevents cross-contamination when switching bookings)
  useEffect(() => {
    if (activeBookingId && flightSearchParams && activeBooking?.searchParams) {
      // Verify this booking owns the current search by comparing key params
      const bookingParams = activeBooking.searchParams;
      const paramsMatch =
        bookingParams.origin === flightSearchParams.origin &&
        bookingParams.destination === flightSearchParams.destination &&
        bookingParams.departureDate === flightSearchParams.departureDate;

      if (paramsMatch) {
        setBookingStatus(activeBookingId, "selecting");
      }
    }
  }, [
    activeBookingId,
    flightSearchParams,
    activeBooking?.searchParams,
    setBookingStatus,
  ]);

  // Multi-city state
  const [currentLegIndex, setCurrentLegIndex] = useState(0);
  const [selectedFlights, setSelectedFlights] = useState<
    (FlightOffer | null)[]
  >(() => legs.map(() => null));

  // Current leg search params (for multi-city, search for current leg only)
  const currentSearchParams = useMemo<FlightSearchParams | null>(() => {
    if (!flightSearchParams) return null;

    if (isMultiCity && legs[currentLegIndex]) {
      const currentLeg = legs[currentLegIndex];
      return {
        ...flightSearchParams,
        tripType: "one_way" as TripType, // Search as one-way for each leg
        origin: currentLeg.origin,
        destination: currentLeg.destination,
        departureDate: currentLeg.date,
        returnDate: undefined,
        additionalLegs: undefined,
      };
    }

    return flightSearchParams;
  }, [flightSearchParams, isMultiCity, legs, currentLegIndex]);

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
  } = useFlightSearch(currentSearchParams);

  const handleSelectFlight = (flightId: string) => {
    if (isMultiCity) {
      // For multi-city, selecting a flight moves to next leg
      const flight = filteredFlights.find((f) => f.id === flightId);
      if (flight) {
        const newSelectedFlights = [...selectedFlights];
        newSelectedFlights[currentLegIndex] = flight;
        setSelectedFlights(newSelectedFlights);

        // Move to next unselected leg or stay if all selected
        const nextUnselectedIndex = newSelectedFlights.findIndex(
          (f, i) => f === null && i > currentLegIndex,
        );
        if (nextUnselectedIndex !== -1) {
          setCurrentLegIndex(nextUnselectedIndex);
        } else {
          // Check if there's any unselected leg
          const anyUnselected = newSelectedFlights.findIndex((f) => f === null);
          if (anyUnselected !== -1) {
            setCurrentLegIndex(anyUnselected);
          }
        }
      }
    } else {
      setSelectedFlightId(flightId === selectedFlightId ? null : flightId);
    }
  };

  const handleLegClick = (index: number) => {
    setCurrentLegIndex(index);
  };

  // Calculate total price for multi-city
  const totalMultiCityPrice = useMemo(() => {
    if (!isMultiCity) return 0;
    return selectedFlights.reduce((total, flight) => {
      return total + (flight?.priceWithMarkup.amount || 0);
    }, 0);
  }, [isMultiCity, selectedFlights]);

  const allLegsSelected =
    isMultiCity && selectedFlights.every((f) => f !== null);

  const handleContinueToBooking = () => {
    if (!flightSearchParams) return;

    // Ensure we have an active booking, create one if needed
    let bookingId = activeBookingId;
    if (!bookingId) {
      bookingId = createBooking();
    }

    if (isMultiCity && allLegsSelected) {
      // Combine all selected flights into one FlightOffer with multiple slices
      const combinedSlices = selectedFlights.flatMap(
        (flight) => flight?.slices || [],
      );
      const combinedFlight: FlightOffer = {
        id: `combined_${Date.now()}`,
        slices: combinedSlices,
        totalPrice: {
          amount: selectedFlights.reduce(
            (sum, f) => sum + (f?.totalPrice.amount || 0),
            0,
          ),
          currency: "USD",
          displayAmount: formatCurrency(
            selectedFlights.reduce(
              (sum, f) => sum + (f?.totalPrice.amount || 0),
              0,
            ),
            "USD",
          ),
        },
        basePrice: {
          amount: selectedFlights.reduce(
            (sum, f) => sum + (f?.basePrice.amount || 0),
            0,
          ),
          currency: "USD",
          displayAmount: formatCurrency(
            selectedFlights.reduce(
              (sum, f) => sum + (f?.basePrice.amount || 0),
              0,
            ),
            "USD",
          ),
        },
        taxesAndFees: {
          amount: selectedFlights.reduce(
            (sum, f) => sum + (f?.taxesAndFees.amount || 0),
            0,
          ),
          currency: "USD",
          displayAmount: formatCurrency(
            selectedFlights.reduce(
              (sum, f) => sum + (f?.taxesAndFees.amount || 0),
              0,
            ),
            "USD",
          ),
        },
        priceWithMarkup: {
          amount: totalMultiCityPrice,
          currency: "USD",
          displayAmount: formatCurrency(totalMultiCityPrice, "USD"),
        },
        passengers: flightSearchParams.passengers,
        cabinClass: flightSearchParams.cabinClass,
        refundable: selectedFlights.every((f) => f?.refundable),
        fareRules: selectedFlights[0]?.fareRules || [],
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      };

      setBookingSearchParams(bookingId, flightSearchParams);
      setBookingSelectedFlight(bookingId, combinedFlight);
    } else if (selectedFlight) {
      setBookingSearchParams(bookingId, flightSearchParams);
      setBookingSelectedFlight(bookingId, selectedFlight);
    } else {
      return;
    }

    router.push("/booking");
  };

  if (!flightSearchParams) {
    return (
      <Box minH="100vh" bg="gray.50" px={{ base: "4", md: "8" }}>
        <Container maxW="6xl" py={{ base: "8", md: "10" }}>
          <Alert.Root status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Invalid Search</Alert.Title>
              <Alert.Description>
                Please go back and enter your search criteria.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
          <Button mt="4" onClick={() => router.push("/")}>
            Back to Search
          </Button>
        </Container>
      </Box>
    );
  }

  const showContinueButton = isMultiCity ? allLegsSelected : !!selectedFlight;
  const displayPrice = isMultiCity
    ? totalMultiCityPrice
    : selectedFlight?.priceWithMarkup.amount;

  return (
    <Box
      h="100vh"
      bg="gray.50"
      px={{ base: "4", md: "8" }}
      pt={{ base: "4", md: "6" }}
    >
      <Container maxW="7xl" py={{ base: "6", md: "10" }}>
        <VStack gap={{ base: "5", md: "6" }} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <Heading size="xl" color="blue.600">
              Flight Results
            </Heading>
            <Button
              variant="outline"
              size="lg"
              px="6"
              onClick={() => router.push("/")}
            >
              New Search
            </Button>
          </Flex>

          {/* Multi-city leg selector */}
          {isMultiCity && (
            <MultiCityLegSelector
              legs={legs}
              currentLegIndex={currentLegIndex}
              selectedFlights={selectedFlights}
              onLegClick={handleLegClick}
            />
          )}

          {/* Search Summary for current leg */}
          <SearchSummary
            params={flightSearchParams}
            currentLeg={isMultiCity ? legs[currentLegIndex] : undefined}
          />

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
          <Flex gap="6" direction={{ base: "column", lg: "row" }}>
            {/* Filters Sidebar */}
            <Box w={{ base: "full", lg: "280px" }} flexShrink={0}>
              <FlightFilters
                filters={filters}
                onFiltersChange={setFilters}
                availableAirlines={availableAirlines}
                maxPriceRange={maxPriceRange}
                maxDurationRange={maxDurationRange}
              />
            </Box>

            {/* Results */}
            <Box flex="1" h="70vh">
              <VStack gap="4" align="stretch" h="100%">
                {/* Sort & Count */}
                <FlightSort
                  value={sortOption}
                  onChange={setSortOption}
                  resultCount={filteredFlights.length}
                />

                {/* Current leg indicator for multi-city */}
                {isMultiCity && (
                  <Alert.Root status="info">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Description>
                        Selecting flight for Leg {currentLegIndex + 1}:{" "}
                        {legs[currentLegIndex]?.origin} →{" "}
                        {legs[currentLegIndex]?.destination}
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                )}

                {/* Flight List */}
                <FlightList
                  flights={filteredFlights}
                  selectedFlightId={
                    isMultiCity
                      ? selectedFlights[currentLegIndex]?.id
                      : selectedFlightId || undefined
                  }
                  onSelectFlight={handleSelectFlight}
                  isLoading={isLoading}
                />
              </VStack>
            </Box>
          </Flex>

          {/* Continue Button (Fixed at bottom when flight selected) */}
          {showContinueButton && (
            <Box
              position="fixed"
              bottom="0"
              left="0"
              right="0"
              bg="white"
              borderTop="1px solid"
              borderColor="gray.200"
              p={{ base: "4", md: "5" }}
              boxShadow="lg"
              zIndex="sticky"
            >
              <Container maxW="7xl" px={{ base: "4", md: "8" }}>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="medium">
                      {isMultiCity
                        ? `All ${legs.length} flights selected`
                        : "Selected Flight"}
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                      {formatCurrency(displayPrice || 0, "USD")}
                    </Text>
                  </Box>
                  <Button
                    colorPalette="blue"
                    size="lg"
                    px="8"
                    onClick={handleContinueToBooking}
                  >
                    Continue to Booking
                  </Button>
                </Flex>
              </Container>
            </Box>
          )}

          {/* Spacer for fixed bottom bar */}
          {showContinueButton && <Box h="100px" />}
        </VStack>
      </Container>
    </Box>
  );
}

function LoadingFallback() {
  return (
    <Box minH="100vh" bg="gray.50" px={{ base: "4", md: "8" }}>
      <Container maxW="6xl" py={{ base: "8", md: "10" }}>
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
