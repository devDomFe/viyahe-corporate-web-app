import type { FlightOffer, FlightSearchParams } from './flight';
import type { BookingPassenger } from './saved-passenger';

/**
 * Status of a draft booking in the multi-booking flow
 */
export type DraftBookingStatus = 'searching' | 'selecting' | 'filling' | 'submitted';

/**
 * Draft booking - a booking in progress that can be saved and resumed
 */
export interface DraftBooking {
  id: string;
  status: DraftBookingStatus;
  searchParams?: FlightSearchParams;
  selectedFlight?: FlightOffer;
  passengers: BookingPassenger[];
  discountCode?: string;
  specialRequests?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * State for managing multiple concurrent bookings
 */
export interface MultiBookingState {
  bookings: DraftBooking[];
  activeBookingId: string | null;
}

/**
 * Actions for the multi-booking reducer
 */
export type MultiBookingAction =
  | { type: 'CREATE_BOOKING'; payload: { id: string } }
  | { type: 'UPDATE_BOOKING'; payload: { id: string; updates: Partial<DraftBooking> } }
  | { type: 'SET_ACTIVE'; payload: { id: string | null } }
  | { type: 'REMOVE_BOOKING'; payload: { id: string } }
  | { type: 'LOAD_FROM_STORAGE'; payload: MultiBookingState };

/**
 * Schema for localStorage persistence
 */
export interface StoredMultiBookingState {
  bookings: DraftBooking[];
  activeBookingId: string | null;
  version: number;
}

/**
 * localStorage key for multi-booking state
 */
export const MULTI_BOOKING_STORAGE_KEY = 'viyahe_draft_bookings';

/**
 * Current storage schema version (for future migrations)
 */
export const STORAGE_VERSION = 1;

/**
 * Helper to generate a unique booking ID
 */
export function generateBookingId(): string {
  return `booking_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Helper to create a new draft booking
 */
export function createDraftBooking(id: string): DraftBooking {
  const now = new Date().toISOString();
  return {
    id,
    status: 'searching',
    passengers: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get display label for a draft booking
 */
export function getBookingDisplayLabel(booking: DraftBooking): string {
  if (booking.searchParams) {
    return `${booking.searchParams.origin} → ${booking.searchParams.destination}`;
  }
  return 'New Booking';
}

/**
 * Get formatted date for a draft booking
 */
export function getBookingDisplayDate(booking: DraftBooking): string | null {
  if (!booking.searchParams?.departureDate) return null;

  const date = new Date(booking.searchParams.departureDate);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
