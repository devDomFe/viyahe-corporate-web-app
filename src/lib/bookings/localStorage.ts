/**
 * localStorage-based booking storage
 * Used for development to keep all booking data in the browser
 * Both client and agent interfaces read/write from the same storage
 */

import type { BookingWithDocuments, BookingStatus, BookingDocument, BookingDocumentType } from '@/types/booking';

const BOOKINGS_STORAGE_KEY = 'viyahe_submitted_bookings';

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
 * Get all submitted bookings from localStorage
 */
export function getBookings(): BookingWithDocuments[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (err) {
    console.error('Failed to load bookings from localStorage:', err);
    return [];
  }
}

/**
 * Get a single booking by ID
 */
export function getBookingById(id: string): BookingWithDocuments | null {
  const bookings = getBookings();
  return bookings.find(b => b.id === id) || null;
}

/**
 * Save a new booking to localStorage
 */
export function saveBooking(booking: BookingWithDocuments): void {
  if (typeof window === 'undefined') return;

  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
}

/**
 * Update a booking in localStorage
 */
export function updateBooking(id: string, updates: Partial<BookingWithDocuments>): BookingWithDocuments | null {
  if (typeof window === 'undefined') return null;

  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === id);

  if (index === -1) return null;

  const updated = {
    ...bookings[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  bookings[index] = updated;
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));

  return updated;
}

/**
 * Update booking status
 */
export function updateBookingStatus(
  id: string,
  status: BookingStatus,
  options?: { agentNotes?: string; rejectionReason?: string }
): BookingWithDocuments | null {
  const booking = getBookingById(id);
  if (!booking) return null;

  const now = new Date().toISOString();
  const updates: Partial<BookingWithDocuments> = {
    status,
    updatedAt: now,
  };

  if (status === 'CONFIRMED') {
    updates.confirmedAt = now;
    if (options?.agentNotes) {
      updates.agentNotes = options.agentNotes;
    }
  } else if (status === 'REJECTED') {
    updates.rejectedAt = now;
    if (options?.rejectionReason) {
      updates.rejectionReason = options.rejectionReason;
    }
  } else if (status === 'FULFILLED') {
    updates.fulfilledAt = now;
  }

  return updateBooking(id, updates);
}

/**
 * Add a document to a booking
 */
export function addDocument(
  bookingId: string,
  document: {
    type: BookingDocumentType;
    fileName: string;
    fileSize: number;
    mimeType: string;
    dataUrl: string;
  }
): BookingDocument | null {
  const booking = getBookingById(bookingId);
  if (!booking) return null;

  const newDocument: BookingDocument = {
    id: generateDocumentId(),
    bookingId,
    type: document.type,
    fileName: document.fileName,
    fileSize: document.fileSize,
    mimeType: document.mimeType,
    dataUrl: document.dataUrl,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'agent',
  };

  const updatedDocuments = [...booking.documents, newDocument];
  updateBooking(bookingId, { documents: updatedDocuments });

  return newDocument;
}

/**
 * Remove a document from a booking
 */
export function removeDocument(bookingId: string, documentId: string): boolean {
  const booking = getBookingById(bookingId);
  if (!booking) return false;

  const updatedDocuments = booking.documents.filter(d => d.id !== documentId);
  updateBooking(bookingId, { documents: updatedDocuments });

  return true;
}

/**
 * Clear all bookings (for testing/reset)
 */
export function clearAllBookings(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BOOKINGS_STORAGE_KEY);
}
