'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { BookingWithDocuments, BookingDocument, BookingDocumentType } from '@/types/booking';
import type { AgentBookingsState, AgentOperationState, BookingStatusFilter } from '@/types/agent';
import {
  getBookings,
  getBookingById,
  updateBookingStatus,
  addDocument,
  removeDocument,
} from '@/lib/bookings/localStorage';

interface UseAgentBookingsResult {
  // Data
  bookings: BookingWithDocuments[];
  filteredBookings: BookingWithDocuments[];

  // State
  state: AgentBookingsState;
  statusFilter: BookingStatusFilter;

  // Actions
  setStatusFilter: (status: BookingStatusFilter) => void;
  refreshBookings: () => void;

  // Operations
  confirmBooking: (id: string, notes?: string) => Promise<boolean>;
  rejectBooking: (id: string, reason?: string) => Promise<boolean>;
  fulfillBooking: (id: string) => Promise<boolean>;

  // Document operations
  uploadDocument: (bookingId: string, file: File, type: BookingDocumentType) => Promise<BookingDocument | null>;
  deleteDocument: (bookingId: string, documentId: string) => Promise<boolean>;

  // Operation state
  operationState: AgentOperationState;
}

export function useAgentBookings(): UseAgentBookingsResult {
  const [state, setState] = useState<AgentBookingsState>({ status: 'idle' });
  const [operationState, setOperationState] = useState<AgentOperationState>({ status: 'idle' });
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>('all');

  // Load bookings from localStorage
  const loadBookings = useCallback(() => {
    setState({ status: 'loading' });

    try {
      const bookings = getBookings();
      setState({ status: 'success', data: bookings });
    } catch (error) {
      console.error('Failed to load bookings:', error);
      setState({ status: 'error', error: 'Failed to load bookings' });
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Get bookings from state
  const bookings = useMemo(() => {
    if (state.status === 'success') {
      return state.data;
    }
    return [];
  }, [state]);

  // Filter bookings by status
  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') {
      return bookings;
    }
    return bookings.filter((booking) => booking.status === statusFilter);
  }, [bookings, statusFilter]);

  // Confirm a booking
  const confirmBooking = useCallback(
    async (id: string, notes?: string): Promise<boolean> => {
      setOperationState({ status: 'loading' });

      try {
        const updated = updateBookingStatus(id, 'CONFIRMED', { agentNotes: notes });
        if (!updated) {
          throw new Error('Booking not found');
        }

        setOperationState({ status: 'success' });
        loadBookings();
        return true;
      } catch (error) {
        console.error('Failed to confirm booking:', error);
        setOperationState({ status: 'error', error: 'Failed to confirm booking' });
        return false;
      }
    },
    [loadBookings]
  );

  // Reject a booking
  const rejectBooking = useCallback(
    async (id: string, reason?: string): Promise<boolean> => {
      setOperationState({ status: 'loading' });

      try {
        const updated = updateBookingStatus(id, 'REJECTED', { rejectionReason: reason });
        if (!updated) {
          throw new Error('Booking not found');
        }

        setOperationState({ status: 'success' });
        loadBookings();
        return true;
      } catch (error) {
        console.error('Failed to reject booking:', error);
        setOperationState({ status: 'error', error: 'Failed to reject booking' });
        return false;
      }
    },
    [loadBookings]
  );

  // Fulfill a booking
  const fulfillBooking = useCallback(
    async (id: string): Promise<boolean> => {
      setOperationState({ status: 'loading' });

      try {
        const booking = getBookingById(id);
        if (!booking) {
          throw new Error('Booking not found');
        }

        if (booking.documents.length === 0) {
          throw new Error('Cannot fulfill booking without documents');
        }

        const updated = updateBookingStatus(id, 'FULFILLED');
        if (!updated) {
          throw new Error('Failed to update booking');
        }

        setOperationState({ status: 'success' });
        loadBookings();
        return true;
      } catch (error) {
        console.error('Failed to fulfill booking:', error);
        setOperationState({
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to fulfill booking',
        });
        return false;
      }
    },
    [loadBookings]
  );

  // Upload document
  const uploadDocument = useCallback(
    async (bookingId: string, file: File, type: BookingDocumentType): Promise<BookingDocument | null> => {
      setOperationState({ status: 'loading' });

      try {
        // Convert file to base64 data URL
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const document = addDocument(bookingId, {
          type,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          dataUrl,
        });

        if (!document) {
          throw new Error('Failed to add document');
        }

        setOperationState({ status: 'success' });
        loadBookings();
        return document;
      } catch (error) {
        console.error('Failed to upload document:', error);
        setOperationState({ status: 'error', error: 'Failed to upload document' });
        return null;
      }
    },
    [loadBookings]
  );

  // Delete document
  const deleteDocument = useCallback(
    async (bookingId: string, documentId: string): Promise<boolean> => {
      setOperationState({ status: 'loading' });

      try {
        const success = removeDocument(bookingId, documentId);
        if (!success) {
          throw new Error('Failed to delete document');
        }

        setOperationState({ status: 'success' });
        loadBookings();
        return true;
      } catch (error) {
        console.error('Failed to delete document:', error);
        setOperationState({ status: 'error', error: 'Failed to delete document' });
        return false;
      }
    },
    [loadBookings]
  );

  return {
    bookings,
    filteredBookings,
    state,
    statusFilter,
    setStatusFilter,
    refreshBookings: loadBookings,
    confirmBooking,
    rejectBooking,
    fulfillBooking,
    uploadDocument,
    deleteDocument,
    operationState,
  };
}
