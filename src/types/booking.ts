import type { FlightOffer, FlightSearchParams } from './flight';
import type { Passenger } from './passenger';

/**
 * Booking status
 */
export type BookingStatus =
  | 'pending' // Submitted, awaiting agent review
  | 'confirmed' // Agent confirmed, ticket issued
  | 'cancelled' // Booking cancelled
  | 'expired'; // Offer expired before confirmation

/**
 * Booking request submitted by user
 */
export interface BookingRequest {
  id: string;
  flightOffer: FlightOffer;
  searchParams: FlightSearchParams;
  passengers: Passenger[];
  discountCode?: string;
  specialRequests?: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string; // ISO 8601
  userId?: string; // Supabase user ID
  organizationId?: string; // For multi-tenancy
}

/**
 * Complete booking record
 */
export interface Booking {
  id: string;
  request: BookingRequest;
  status: BookingStatus;
  originalPrice: number; // in cents, before markup
  finalPrice: number; // in cents, after markup
  currency: string;
  confirmationNumber?: string; // PNR from airline
  ticketNumbers?: string[];
  agentNotes?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
}

/**
 * Notification payload sent to agents
 * This is displayed as JSON on the confirmation page for now
 */
export interface AgentNotification {
  bookingId: string;
  type: 'new_booking';
  timestamp: string;
  booking: {
    flightDetails: {
      origin: string;
      destination: string;
      departureDate: string;
      returnDate?: string;
      tripType: string;
      cabinClass: string;
    };
    passengers: Array<{
      name: string;
      email: string;
      phone: string;
    }>;
    pricing: {
      originalAmount: number;
      markedUpAmount: number;
      currency: string;
    };
    specialRequests?: string;
    discountCode?: string;
  };
}

/**
 * Booking form state for UI
 */
export type BookingState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; booking: Booking; notification: AgentNotification }
  | { status: 'error'; error: string };

/**
 * Form data for the booking page
 */
export interface BookingFormData {
  passengers: Passenger[];
  discountCode: string;
  specialRequests: string;
  contactEmail: string;
  contactPhone: string;
  agreeToTerms: boolean;
}
