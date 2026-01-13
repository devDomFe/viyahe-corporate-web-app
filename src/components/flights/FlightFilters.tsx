'use client';

import { Box, Button, Flex, Heading, Text, VStack, HStack } from '@chakra-ui/react';
import { Checkbox } from '@chakra-ui/react/checkbox';
import { Slider } from '@chakra-ui/react/slider';
import type { FlightFilters as Filters, Airline } from '@/types/flight';
import { formatCurrency, formatDuration } from '@/utils/format';

interface FlightFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  availableAirlines: Airline[];
  maxPriceRange: number;
  maxDurationRange: number;
}

export function FlightFilters({
  filters,
  onFiltersChange,
  availableAirlines,
  maxPriceRange,
  maxDurationRange,
}: FlightFiltersProps) {
  const handleStopsChange = (stops: number) => {
    onFiltersChange({ ...filters, maxStops: stops });
  };

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({ ...filters, maxPrice: value[0] });
  };

  const handleDurationChange = (value: number[]) => {
    onFiltersChange({ ...filters, maxDuration: value[0] });
  };

  const handleAirlineToggle = (airlineCode: string, checked: boolean) => {
    const currentAirlines = filters.airlines || [];
    const newAirlines = checked
      ? [...currentAirlines, airlineCode]
      : currentAirlines.filter((code) => code !== airlineCode);
    onFiltersChange({ ...filters, airlines: newAirlines.length > 0 ? newAirlines : undefined });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.maxStops !== undefined ||
    filters.maxPrice !== undefined ||
    filters.maxDuration !== undefined ||
    (filters.airlines && filters.airlines.length > 0);

  return (
    <Box bg="white" borderRadius="lg" boxShadow="sm" p={{ base: '5', md: '6' }}>
      <Flex justify="space-between" align="center" mb="4">
        <Heading size="md">Filters</Heading>
        {hasActiveFilters && (
          <Button size="sm" variant="ghost" onClick={handleClearFilters}>
            Clear all
          </Button>
        )}
      </Flex>

      <VStack gap="6" align="stretch">
        {/* Stops */}
        <Box>
          <Text fontWeight="medium" mb="2">
            Stops
          </Text>
          <HStack gap="2" flexWrap="wrap">
            {[
              { value: -1, label: 'Any' },
              { value: 0, label: 'Direct' },
              { value: 1, label: '1 stop' },
              { value: 2, label: '2+ stops' },
            ].map((option) => (
              <Button
                key={option.value}
                size="sm"
                px="4"
                py="2"
                variant={filters.maxStops === option.value ? 'solid' : 'outline'}
                colorPalette={filters.maxStops === option.value ? 'blue' : 'gray'}
                onClick={() =>
                  handleStopsChange(option.value === filters.maxStops ? -1 : option.value)
                }
              >
                {option.label}
              </Button>
            ))}
          </HStack>
        </Box>

        {/* Price Range */}
        <Box>
          <Flex justify="space-between" mb="2">
            <Text fontWeight="medium">Max Price</Text>
            <Text color="blue.600" fontWeight="medium">
              {filters.maxPrice
                ? formatCurrency(filters.maxPrice)
                : formatCurrency(maxPriceRange)}
            </Text>
          </Flex>
          <Slider.Root
            value={[filters.maxPrice || maxPriceRange]}
            min={0}
            max={maxPriceRange}
            step={1000}
            onValueChange={(e) => handlePriceChange(e.value)}
          >
            <Slider.Control>
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumb index={0} />
            </Slider.Control>
          </Slider.Root>
        </Box>

        {/* Duration */}
        <Box>
          <Flex justify="space-between" mb="2">
            <Text fontWeight="medium">Max Duration</Text>
            <Text color="blue.600" fontWeight="medium">
              {filters.maxDuration
                ? formatDuration(filters.maxDuration)
                : formatDuration(maxDurationRange)}
            </Text>
          </Flex>
          <Slider.Root
            value={[filters.maxDuration || maxDurationRange]}
            min={60}
            max={maxDurationRange}
            step={30}
            onValueChange={(e) => handleDurationChange(e.value)}
          >
            <Slider.Control>
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumb index={0} />
            </Slider.Control>
          </Slider.Root>
        </Box>

        {/* Airlines */}
        {availableAirlines.length > 0 && (
          <Box>
            <Text fontWeight="medium" mb="2">
              Airlines
            </Text>
            <VStack gap="2" align="stretch">
              {availableAirlines.map((airline) => (
                <Checkbox.Root
                  key={airline.iataCode}
                  checked={filters.airlines?.includes(airline.iataCode)}
                  onCheckedChange={(e) =>
                    handleAirlineToggle(airline.iataCode, !!e.checked)
                  }
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>{airline.name}</Checkbox.Label>
                </Checkbox.Root>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
