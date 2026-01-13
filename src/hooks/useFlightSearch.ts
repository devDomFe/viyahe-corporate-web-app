'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  FlightOffer,
  FlightSearchParams,
  FlightFilters,
  FlightSortOption,
  Airline,
} from '@/types/flight';
import { generateMockFlights } from '@/mocks/flights';

interface UseFlightSearchResult {
  flights: FlightOffer[];
  filteredFlights: FlightOffer[];
  isLoading: boolean;
  error: string | null;
  filters: FlightFilters;
  setFilters: (filters: FlightFilters) => void;
  sortOption: FlightSortOption;
  setSortOption: (option: FlightSortOption) => void;
  availableAirlines: Airline[];
  maxPriceRange: number;
  maxDurationRange: number;
  selectedFlightId: string | null;
  setSelectedFlightId: (id: string | null) => void;
  selectedFlight: FlightOffer | null;
}

export function useFlightSearch(searchParams: FlightSearchParams | null): UseFlightSearchResult {
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FlightFilters>({});
  const [sortOption, setSortOption] = useState<FlightSortOption>('best_value');
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);

  // Fetch flights when search params change
  useEffect(() => {
    if (!searchParams) return;

    const fetchFlights = async () => {
      setIsLoading(true);
      setError(null);
      setSelectedFlightId(null);

      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Generate mock flights
        const results = generateMockFlights(searchParams);
        setFlights(results);
      } catch (err) {
        setError('Failed to search flights. Please try again.');
        console.error('Flight search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlights();
  }, [searchParams]);

  // Calculate available airlines from results
  const availableAirlines = useMemo(() => {
    const airlineMap = new Map<string, Airline>();
    flights.forEach((flight) => {
      flight.slices.forEach((slice) => {
        slice.segments.forEach((segment) => {
          if (!airlineMap.has(segment.airline.iataCode)) {
            airlineMap.set(segment.airline.iataCode, segment.airline);
          }
        });
      });
    });
    return Array.from(airlineMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [flights]);

  // Calculate max price range
  const maxPriceRange = useMemo(() => {
    if (flights.length === 0) return 100000;
    const maxPrice = Math.max(...flights.map((f) => f.priceWithMarkup.amount));
    // Round up to nearest 10000
    return Math.ceil(maxPrice / 10000) * 10000;
  }, [flights]);

  // Calculate max duration range
  const maxDurationRange = useMemo(() => {
    if (flights.length === 0) return 1200;
    const maxDuration = Math.max(
      ...flights.flatMap((f) => f.slices.map((s) => s.duration))
    );
    // Round up to nearest 60
    return Math.ceil(maxDuration / 60) * 60;
  }, [flights]);

  // Apply filters
  const filteredFlights = useMemo(() => {
    let result = [...flights];

    // Filter by stops
    if (filters.maxStops !== undefined && filters.maxStops >= 0) {
      result = result.filter((flight) =>
        flight.slices.every((slice) => slice.stops <= filters.maxStops!)
      );
    }

    // Filter by price
    if (filters.maxPrice !== undefined) {
      result = result.filter((flight) => flight.priceWithMarkup.amount <= filters.maxPrice!);
    }

    // Filter by duration
    if (filters.maxDuration !== undefined) {
      result = result.filter((flight) =>
        flight.slices.every((slice) => slice.duration <= filters.maxDuration!)
      );
    }

    // Filter by airlines
    if (filters.airlines && filters.airlines.length > 0) {
      result = result.filter((flight) =>
        flight.slices.some((slice) =>
          slice.segments.some((segment) => filters.airlines!.includes(segment.airline.iataCode))
        )
      );
    }

    // Sort results
    switch (sortOption) {
      case 'price_low':
        result.sort((a, b) => a.priceWithMarkup.amount - b.priceWithMarkup.amount);
        break;
      case 'price_high':
        result.sort((a, b) => b.priceWithMarkup.amount - a.priceWithMarkup.amount);
        break;
      case 'duration_short':
        result.sort(
          (a, b) =>
            a.slices.reduce((acc, s) => acc + s.duration, 0) -
            b.slices.reduce((acc, s) => acc + s.duration, 0)
        );
        break;
      case 'duration_long':
        result.sort(
          (a, b) =>
            b.slices.reduce((acc, s) => acc + s.duration, 0) -
            a.slices.reduce((acc, s) => acc + s.duration, 0)
        );
        break;
      case 'departure_early':
        result.sort(
          (a, b) =>
            new Date(a.slices[0].departureTime).getTime() -
            new Date(b.slices[0].departureTime).getTime()
        );
        break;
      case 'departure_late':
        result.sort(
          (a, b) =>
            new Date(b.slices[0].departureTime).getTime() -
            new Date(a.slices[0].departureTime).getTime()
        );
        break;
      case 'best_value':
      default:
        // Best value: combination of price and duration (lower is better)
        result.sort((a, b) => {
          const aScore =
            a.priceWithMarkup.amount / 100 +
            a.slices.reduce((acc, s) => acc + s.duration, 0);
          const bScore =
            b.priceWithMarkup.amount / 100 +
            b.slices.reduce((acc, s) => acc + s.duration, 0);
          return aScore - bScore;
        });
    }

    return result;
  }, [flights, filters, sortOption]);

  // Get selected flight
  const selectedFlight = useMemo(() => {
    if (!selectedFlightId) return null;
    return flights.find((f) => f.id === selectedFlightId) || null;
  }, [flights, selectedFlightId]);

  return {
    flights,
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
  };
}
