import type {
  Booking,
  BookingDocument,
  BookingDocumentType,
  BookingRequest,
  BookingStatus,
  BookingWithDocuments,
} from '@/types/booking';

/**
 * Data required to create a new booking
 */
export interface CreateBookingData {
  request: BookingRequest;
  originalPrice: number;
  finalPrice: number;
  currency: string;
}

/**
 * Data required to create a document
 */
export interface CreateDocumentData {
  type: BookingDocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  dataUrl: string;
}

/**
 * Options for status update
 */
export interface StatusUpdateOptions {
  agentNotes?: string;
  rejectionReason?: string;
  agentId?: string;
}

/**
 * Client interface for booking operations
 * Allows swapping between mock and real implementations
 */
export interface BookingClient {
  /**
   * List all bookings with optional status filter
   */
  list(options?: { status?: BookingStatus }): Promise<BookingWithDocuments[]>;

  /**
   * Get a single booking by ID
   */
  get(id: string): Promise<BookingWithDocuments | null>;

  /**
   * Create a new booking (called when client submits)
   */
  create(data: CreateBookingData): Promise<Booking>;

  /**
   * Update booking status (confirm/reject/fulfill)
   */
  updateStatus(
    id: string,
    status: BookingStatus,
    options?: StatusUpdateOptions
  ): Promise<Booking>;

  /**
   * Upload a document to a booking
   */
  uploadDocument(bookingId: string, document: CreateDocumentData): Promise<BookingDocument>;

  /**
   * List documents for a booking
   */
  listDocuments(bookingId: string): Promise<BookingDocument[]>;

  /**
   * Delete a document
   */
  deleteDocument(documentId: string): Promise<void>;
}
