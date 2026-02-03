'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  createListCollection,
} from '@chakra-ui/react';
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from '@chakra-ui/react/select';
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemControl,
  RadioGroupItemText,
} from '@chakra-ui/react/radio-group';
import type { TripType, CabinClass, FlightSearchParams } from '@/types/flight';
import { searchAirports } from '@/mocks/airports';
import type { Airport } from '@/types/flight';
import { DatePicker } from '@/components/common';
import { useMultiBooking } from '@/hooks/useMultiBooking';

const tripTypes = createListCollection({
  items: [
    { value: 'round_trip', label: 'Round Trip' },
    { value: 'one_way', label: 'One Way' },
    { value: 'multi_city', label: 'Multi-City' },
  ],
});

const cabinClasses = createListCollection({
  items: [
    { value: 'economy', label: 'Economy' },
    { value: 'premium_economy', label: 'Premium Economy' },
    { value: 'business', label: 'Business' },
    { value: 'first', label: 'First Class' },
  ],
});

const passengerOptions = createListCollection({
  items: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({
    value: String(n),
    label: `${n} ${n === 1 ? 'Passenger' : 'Passengers'}`,
  })),
});

interface AirportInputProps {
  label: string;
  value: string;
  onChange: (code: string) => void;
  placeholder: string;
}

function AirportInput({ label, value, onChange, placeholder }: AirportInputProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sync query with external value changes (e.g., when switching bookings)
  useEffect(() => {
    if (value) {
      // Try to find the airport to show city name
      const airports = searchAirports(value);
      const airport = airports.find(a => a.iataCode === value);
      if (airport) {
        setQuery(`${airport.city} (${airport.iataCode})`);
      } else {
        setQuery(value);
      }
    } else {
      setQuery('');
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 2) {
      setSuggestions(searchAirports(val));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (airport: Airport) => {
    setQuery(`${airport.city} (${airport.iataCode})`);
    onChange(airport.iataCode);
    setShowSuggestions(false);
  };

  return (
    <Box position="relative" flex="1">
      <Text fontSize="sm" fontWeight="medium" mb="1" color="gray.700">
        {label}
      </Text>
      <Input
        value={query}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        bg="white"
        size="lg"
        px="4"
        py="3"
        h="12"
      />
      {showSuggestions && suggestions.length > 0 && (
        <Box
          position="absolute"
          top="100%"
          left="0"
          right="0"
          bg="white"
          borderRadius="md"
          boxShadow="lg"
          zIndex="dropdown"
          maxH="200px"
          overflowY="auto"
          mt="1"
        >
          {suggestions.map((airport) => (
            <Box
              key={airport.iataCode}
              p="3"
              cursor="pointer"
              _hover={{ bg: 'gray.100' }}
              onClick={() => handleSelect(airport)}
            >
              <Text fontWeight="medium">
                {airport.city} ({airport.iataCode})
              </Text>
              <Text fontSize="sm" color="gray.500">
                {airport.name}
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

interface MultiCityLeg {
  origin: string;
  destination: string;
  date: string;
}

export function SearchForm() {
  const router = useRouter();
  const { activeBooking, activeBookingId, createBooking, setSearchParams: setBookingSearchParams } = useMultiBooking();

  // Initialize form state from activeBooking if available
  const savedParams = activeBooking?.searchParams;
  const [tripType, setTripType] = useState<TripType>(savedParams?.tripType ?? 'round_trip');
  const [origin, setOrigin] = useState(savedParams?.origin ?? '');
  const [destination, setDestination] = useState(savedParams?.destination ?? '');
  const [departureDate, setDepartureDate] = useState(savedParams?.departureDate ?? '');
  const [returnDate, setReturnDate] = useState(savedParams?.returnDate ?? '');
  const [passengers, setPassengers] = useState(savedParams?.passengers?.toString() ?? '1');
  const [cabinClass, setCabinClass] = useState<CabinClass>(savedParams?.cabinClass ?? 'economy');
  const [isLoading, setIsLoading] = useState(false);

  // Multi-city legs (first leg uses origin/destination/departureDate, additional legs stored here)
  const [additionalLegs, setAdditionalLegs] = useState<MultiCityLeg[]>(savedParams?.additionalLegs ?? []);

  // Sync form state when switching to a different booking
  useEffect(() => {
    const params = activeBooking?.searchParams;
    setTripType(params?.tripType ?? 'round_trip');
    setOrigin(params?.origin ?? '');
    setDestination(params?.destination ?? '');
    setDepartureDate(params?.departureDate ?? '');
    setReturnDate(params?.returnDate ?? '');
    setPassengers(params?.passengers?.toString() ?? '1');
    setCabinClass(params?.cabinClass ?? 'economy');
    setAdditionalLegs(params?.additionalLegs ?? []);
  }, [activeBookingId]); // Only re-run when activeBookingId changes

  const addLeg = () => {
    const lastLeg = additionalLegs.length > 0
      ? additionalLegs[additionalLegs.length - 1]
      : { origin, destination, date: departureDate };
    setAdditionalLegs([...additionalLegs, { origin: lastLeg.destination, destination: '', date: '' }]);
  };

  const removeLeg = (index: number) => {
    setAdditionalLegs(additionalLegs.filter((_, i) => i !== index));
  };

  const updateLeg = (index: number, field: keyof MultiCityLeg, value: string) => {
    setAdditionalLegs(additionalLegs.map((leg, i) =>
      i === index ? { ...leg, [field]: value } : leg
    ));
  };

  const handleSearch = () => {
    if (!origin || !destination || !departureDate) {
      return;
    }

    if (tripType === 'round_trip' && !returnDate) {
      return;
    }

    // Validate multi-city legs
    if (tripType === 'multi_city') {
      for (const leg of additionalLegs) {
        if (!leg.origin || !leg.destination || !leg.date) {
          return;
        }
      }
    }

    setIsLoading(true);

    const params: FlightSearchParams = {
      tripType,
      origin,
      destination,
      departureDate,
      returnDate: tripType === 'round_trip' ? returnDate : undefined,
      passengers: parseInt(passengers),
      cabinClass,
      additionalLegs: tripType === 'multi_city' && additionalLegs.length > 0 ? additionalLegs : undefined,
    };

    // Ensure we have an active booking
    let bookingId = activeBookingId;
    if (!bookingId) {
      bookingId = createBooking();
    }

    // Update the booking with search params
    setBookingSearchParams(bookingId, params);

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
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Box bg="white" borderRadius="xl" boxShadow="lg" p={{ base: '6', md: '10' }}>
      <VStack gap={{ base: '5', md: '7' }} align="stretch">
        <Heading size="lg" color="gray.800">
          Search Flights
        </Heading>

        {/* Trip Type */}
        <RadioGroup.Root
          value={tripType}
          onValueChange={(e) => setTripType(e.value as TripType)}
        >
          <HStack gap="6">
            <RadioGroup.Item value="round_trip">
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemControl />
              <RadioGroup.ItemText>Round Trip</RadioGroup.ItemText>
            </RadioGroup.Item>
            <RadioGroup.Item value="one_way">
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemControl />
              <RadioGroup.ItemText>One Way</RadioGroup.ItemText>
            </RadioGroup.Item>
            <RadioGroup.Item value="multi_city">
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemControl />
              <RadioGroup.ItemText>Multi-City</RadioGroup.ItemText>
            </RadioGroup.Item>
          </HStack>
        </RadioGroup.Root>

        {/* Origin & Destination */}
        <Flex gap={{ base: '4', md: '6' }} direction={{ base: 'column', md: 'row' }}>
          <AirportInput
            label="From"
            value={origin}
            onChange={setOrigin}
            placeholder="City or airport"
          />
          <AirportInput
            label="To"
            value={destination}
            onChange={setDestination}
            placeholder="City or airport"
          />
        </Flex>

        {/* Dates */}
        <Flex gap={{ base: '4', md: '6' }} direction={{ base: 'column', md: 'row' }}>
          <Box flex="1">
            <Text fontSize="sm" fontWeight="medium" mb="1" color="gray.700">
              Departure Date
            </Text>
            <DatePicker
              value={departureDate}
              onChange={setDepartureDate}
              minDate={minDate}
              placeholder="Select departure date"
            />
          </Box>
          {tripType === 'round_trip' && (
            <Box flex="1">
              <Text fontSize="sm" fontWeight="medium" mb="1" color="gray.700">
                Return Date
              </Text>
              <DatePicker
                value={returnDate}
                onChange={setReturnDate}
                minDate={departureDate || minDate}
                placeholder="Select return date"
              />
            </Box>
          )}
        </Flex>

        {/* Multi-City Additional Legs */}
        {tripType === 'multi_city' && (
          <VStack gap="4" align="stretch">
            {additionalLegs.map((leg, index) => (
              <Box
                key={index}
                p="4"
                bg="gray.50"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.200"
              >
                <Flex justify="space-between" align="center" mb="3">
                  <Text fontWeight="medium" fontSize="sm" color="gray.700">
                    Flight {index + 2}
                  </Text>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorPalette="red"
                    onClick={() => removeLeg(index)}
                  >
                    Remove
                  </Button>
                </Flex>
                <Flex gap={{ base: '3', md: '4' }} direction={{ base: 'column', md: 'row' }}>
                  <AirportInput
                    label="From"
                    value={leg.origin}
                    onChange={(code) => updateLeg(index, 'origin', code)}
                    placeholder="City or airport"
                  />
                  <AirportInput
                    label="To"
                    value={leg.destination}
                    onChange={(code) => updateLeg(index, 'destination', code)}
                    placeholder="City or airport"
                  />
                  <Box flex="1">
                    <Text fontSize="sm" fontWeight="medium" mb="1" color="gray.700">
                      Date
                    </Text>
                    <DatePicker
                      value={leg.date}
                      onChange={(date) => updateLeg(index, 'date', date)}
                      minDate={index === 0 ? departureDate || minDate : additionalLegs[index - 1]?.date || minDate}
                      placeholder="Select date"
                    />
                  </Box>
                </Flex>
              </Box>
            ))}
            <Button
              variant="outline"
              onClick={addLeg}
              alignSelf="flex-start"
            >
              + Add Another Flight
            </Button>
          </VStack>
        )}

        {/* Passengers & Class */}
        <Flex gap={{ base: '4', md: '6' }} direction={{ base: 'column', md: 'row' }}>
          <Box flex="1">
            <Text fontSize="sm" fontWeight="medium" mb="1" color="gray.700">
              Passengers
            </Text>
            <SelectRoot
              collection={passengerOptions}
              value={[passengers]}
              onValueChange={(e) => setPassengers(e.value[0])}
              size="lg"
            >
              <SelectTrigger h="12" px="4">
                <SelectValueText placeholder="Select passengers" />
              </SelectTrigger>
              <SelectContent bg="white" borderRadius="md" boxShadow="lg" p="1">
                {passengerOptions.items.map((item) => (
                  <SelectItem
                    key={item.value}
                    item={item}
                    px="3"
                    py="2"
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: 'gray.100' }}
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Box>
          <Box flex="1">
            <Text fontSize="sm" fontWeight="medium" mb="1" color="gray.700">
              Cabin Class
            </Text>
            <SelectRoot
              collection={cabinClasses}
              value={[cabinClass]}
              onValueChange={(e) => setCabinClass(e.value[0] as CabinClass)}
              size="lg"
            >
              <SelectTrigger h="12" px="4">
                <SelectValueText placeholder="Select class" />
              </SelectTrigger>
              <SelectContent bg="white" borderRadius="md" boxShadow="lg" p="1">
                {cabinClasses.items.map((item) => (
                  <SelectItem
                    key={item.value}
                    item={item}
                    px="3"
                    py="2"
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: 'gray.100' }}
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Box>
        </Flex>

        {/* Search Button */}
        <Button
          colorPalette="blue"
          size="lg"
          mt="2"
          onClick={handleSearch}
          loading={isLoading}
          disabled={!origin || !destination || !departureDate || (tripType === 'round_trip' && !returnDate)}
        >
          Search Flights
        </Button>
      </VStack>
    </Box>
  );
}
