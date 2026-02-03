import type { BookingClient, CreateBookingData, CreateDocumentData, StatusUpdateOptions } from './client';
import type {
  Booking,
  BookingDocument,
  BookingStatus,
  BookingWithDocuments,
} from '@/types/booking';
import {
  MOCK_BOOKINGS,
  MOCK_AGENT_ID,
  generateBookingId,
  generateDocumentId,
} from '@/mocks/bookings';

/**
 * Simulated network delay for realistic mock behavior
 */
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Valid status transitions
 */
const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  BOOKING_REQUESTED: ['CONFIRMED', 'REJECTED'],
  CONFIRMED: ['FULFILLED'],
  REJECTED: [],
  FULFILLED: [],
};

/**
 * Mock implementation of BookingClient
 * Stores data in memory for the session
 */
export class MockBookingClient implements BookingClient {
  private bookings: BookingWithDocuments[];
  private documents: BookingDocument[];

  constructor() {
    // Initialize with mock data, making a copy to avoid mutations
    this.bookings = MOCK_BOOKINGS.map((b) => ({ ...b, documents: [...b.documents] }));
    this.documents = [];
  }

  async list(options?: { status?: BookingStatus }): Promise<BookingWithDocuments[]> {
    await delay();

    let result = [...this.bookings];

    if (options?.status) {
      result = result.filter((b) => b.status === options.status);
    }

    // Sort by createdAt descending (newest first)
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Attach documents to each booking
    return result.map((booking) => ({
      ...booking,
      documents: this.documents.filter((d) => d.bookingId === booking.id),
    }));
  }

  async get(id: string): Promise<BookingWithDocuments | null> {
    await delay();

    const booking = this.bookings.find((b) => b.id === id);
    if (!booking) return null;

    return {
      ...booking,
      documents: this.documents.filter((d) => d.bookingId === id),
    };
  }

  async create(data: CreateBookingData): Promise<Booking> {
    await delay();

    const now = new Date().toISOString();
    const newBooking: BookingWithDocuments = {
      id: generateBookingId(),
      request: data.request,
      status: 'BOOKING_REQUESTED',
      originalPrice: data.originalPrice,
      finalPrice: data.finalPrice,
      currency: data.currency,
      createdAt: now,
      updatedAt: now,
      documents: [],
    };

    this.bookings.push(newBooking);
    return newBooking;
  }

  async updateStatus(
    id: string,
    status: BookingStatus,
    options?: StatusUpdateOptions
  ): Promise<Booking> {
    await delay();

    const index = this.bookings.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error(`Booking with ID ${id} not found`);
    }

    const booking = this.bookings[index];

    // Validate status transition
    const allowedTransitions = VALID_TRANSITIONS[booking.status];
    if (!allowedTransitions.includes(status)) {
      throw new Error(
        `Invalid status transition from ${booking.status} to ${status}`
      );
    }

    // Additional validation for FULFILLED
    if (status === 'FULFILLED') {
      const docs = this.documents.filter((d) => d.bookingId === id);
      if (docs.length === 0) {
        throw new Error('Cannot fulfill booking without documents');
      }
    }

    const now = new Date().toISOString();
    const updated: BookingWithDocuments = {
      ...booking,
      status,
      updatedAt: now,
      agentId: options?.agentId || MOCK_AGENT_ID,
    };

    // Set timestamp and reason based on status
    if (status === 'CONFIRMED') {
      updated.confirmedAt = now;
      if (options?.agentNotes) {
        updated.agentNotes = options.agentNotes;
      }
    } else if (status === 'REJECTED') {
      updated.rejectedAt = now;
      if (options?.rejectionReason) {
        updated.rejectionReason = options.rejectionReason;
      }
    } else if (status === 'FULFILLED') {
      updated.fulfilledAt = now;
    }

    this.bookings[index] = updated;
    return updated;
  }

  async uploadDocument(
    bookingId: string,
    document: CreateDocumentData
  ): Promise<BookingDocument> {
    await delay();

    // Verify booking exists and is in valid state for upload
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new Error(`Booking with ID ${bookingId} not found`);
    }

    if (booking.status !== 'CONFIRMED') {
      throw new Error('Documents can only be uploaded to confirmed bookings');
    }

    const now = new Date().toISOString();
    const newDocument: BookingDocument = {
      id: generateDocumentId(),
      bookingId,
      type: document.type,
      fileName: document.fileName,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      dataUrl: document.dataUrl,
      uploadedAt: now,
      uploadedBy: MOCK_AGENT_ID,
    };

    this.documents.push(newDocument);
    return newDocument;
  }

  async listDocuments(bookingId: string): Promise<BookingDocument[]> {
    await delay(100);
    return this.documents.filter((d) => d.bookingId === bookingId);
  }

  async deleteDocument(documentId: string): Promise<void> {
    await delay();

    const index = this.documents.findIndex((d) => d.id === documentId);
    if (index === -1) {
      throw new Error(`Document with ID ${documentId} not found`);
    }

    this.documents.splice(index, 1);
  }
}

/**
 * Global singleton storage to persist across Next.js hot reloads in development.
 * Uses the Node.js global object directly for server-side persistence.
 */
declare const global: {
  __viyaheMockBookingClient?: BookingClient;
  __viyaheServerSessionId?: string;
};

// Initialize globals if they don't exist
if (!global.__viyaheServerSessionId) {
  global.__viyaheServerSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  console.log('[Viyahe] New server session:', global.__viyaheServerSessionId);
}

/**
 * Server session ID - generated once when the server starts.
 * This ID changes when the server restarts (full restart, not HMR),
 * which is the same condition that clears the mock booking storage.
 * Clients use this to detect server restarts and clear stale localStorage.
 */
export const SERVER_SESSION_ID = global.__viyaheServerSessionId;

/**
 * Get the booking client (singleton pattern for mock)
 * Uses global storage to ensure persistence across Next.js hot reloads
 */
export function getBookingClient(): BookingClient {
  if (!global.__viyaheMockBookingClient) {
    global.__viyaheMockBookingClient = new MockBookingClient();
    console.log('[Viyahe] New booking client instance created');
  }
  return global.__viyaheMockBookingClient;
}
