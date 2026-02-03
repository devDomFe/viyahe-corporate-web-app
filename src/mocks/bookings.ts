import type { BookingWithDocuments } from '@/types/booking';

/**
 * Mock organization ID for development
 */
export const MOCK_ORGANIZATION_ID = 'org-mock-001';

/**
 * Mock agent ID for development
 */
export const MOCK_AGENT_ID = 'agent-mock-001';

/**
 * Generate a unique booking ID
 */
export function generateBookingId(): string {
  return `bkg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Generate a unique document ID
 */
export function generateDocumentId(): string {
  return `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Initial bookings array - empty by default
 * Bookings are only added when clients submit them via the booking flow
 * This ensures data consistency between client and agent interfaces
 */
export const MOCK_BOOKINGS: BookingWithDocuments[] = [];
