'use client';

import { useMultiBookingContext } from '@/contexts/MultiBookingContext';
import type { DraftBooking } from '@/types/multi-booking';
import type { FlightOffer, FlightSearchParams } from '@/types/flight';
import type { BookingPassenger } from '@/types/saved-passenger';

/**
 * Hook for managing multiple concurrent bookings
 *
 * Provides access to:
 * - All draft bookings
 * - The currently active booking
 * - Methods to create, update, and remove bookings
 */
export function useMultiBooking() {
  const context = useMultiBookingContext();

  return {
    // State
    bookings: context.bookings,
    activeBooking: context.activeBooking,
    activeBookingId: context.state.activeBookingId,

    // Actions
    createBooking: context.createBooking,
    removeBooking: context.removeBooking,
    setActiveBooking: context.setActiveBooking,

    // Update methods
    updateBooking: context.updateBooking,
    setSearchParams: context.setSearchParams,
    setSelectedFlight: context.setSelectedFlight,
    clearSelectedFlight: context.clearSelectedFlight,
    setPassengers: context.setPassengers,
    setBookingStatus: context.setBookingStatus,
  };
}

/**
 * Hook for working with the active booking only
 * Provides a simpler API when you only care about the current booking
 */
export function useActiveBooking() {
  const { activeBooking, updateBooking, setSearchParams, setSelectedFlight, clearSelectedFlight, setPassengers, setBookingStatus } =
    useMultiBooking();

  const update = (updates: Partial<DraftBooking>) => {
    if (activeBooking) {
      updateBooking(activeBooking.id, updates);
    }
  };

  const setSearch = (params: FlightSearchParams) => {
    if (activeBooking) {
      setSearchParams(activeBooking.id, params);
    }
  };

  const setFlight = (flight: FlightOffer) => {
    if (activeBooking) {
      setSelectedFlight(activeBooking.id, flight);
    }
  };

  const clearFlight = () => {
    if (activeBooking) {
      clearSelectedFlight(activeBooking.id);
    }
  };

  const setBookingPassengers = (passengers: BookingPassenger[]) => {
    if (activeBooking) {
      setPassengers(activeBooking.id, passengers);
    }
  };

  const setStatus = (status: DraftBooking['status']) => {
    if (activeBooking) {
      setBookingStatus(activeBooking.id, status);
    }
  };

  return {
    booking: activeBooking,
    searchParams: activeBooking?.searchParams ?? null,
    selectedFlight: activeBooking?.selectedFlight ?? null,
    passengers: activeBooking?.passengers ?? [],
    status: activeBooking?.status ?? null,

    update,
    setSearch,
    setFlight,
    clearFlight,
    setPassengers: setBookingPassengers,
    setStatus,
  };
}
