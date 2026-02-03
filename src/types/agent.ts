import type { BookingStatus, BookingWithDocuments } from './booking';

/**
 * State for agent booking list (discriminated union)
 */
export type AgentBookingsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: BookingWithDocuments[] }
  | { status: 'error'; error: string };

/**
 * State for agent operations
 */
export type AgentOperationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'error'; error: string };

/**
 * Filter options for booking list
 */
export type BookingStatusFilter = BookingStatus | 'all';

/**
 * Confirm booking request payload
 */
export interface ConfirmBookingRequest {
  bookingId: string;
  agentNotes?: string;
}

/**
 * Reject booking request payload
 */
export interface RejectBookingRequest {
  bookingId: string;
  reason?: string;
}

/**
 * Fulfill booking request payload
 */
export interface FulfillBookingRequest {
  bookingId: string;
}

/**
 * Status update request payload
 */
export interface StatusUpdateRequest {
  status: BookingStatus;
  agentNotes?: string;
  rejectionReason?: string;
}

/**
 * Document upload request payload
 */
export interface DocumentUploadRequest {
  bookingId: string;
  type: 'itinerary' | 'e_ticket' | 'invoice' | 'other';
  file: File;
}
