'use client';

import { createContext, useContext, useReducer, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type {
  DraftBooking,
  MultiBookingState,
  MultiBookingAction,
  StoredMultiBookingState,
} from '@/types/multi-booking';
import {
  MULTI_BOOKING_STORAGE_KEY,
  STORAGE_VERSION,
  generateBookingId,
  createDraftBooking,
} from '@/types/multi-booking';
import type { FlightOffer, FlightSearchParams } from '@/types/flight';
import type { BookingPassenger } from '@/types/saved-passenger';

/**
 * Initial state for multi-booking
 */
const initialState: MultiBookingState = {
  bookings: [],
  activeBookingId: null,
};

/**
 * Reducer for multi-booking state management
 */
function multiBookingReducer(state: MultiBookingState, action: MultiBookingAction): MultiBookingState {
  switch (action.type) {
    case 'CREATE_BOOKING': {
      const newBooking = createDraftBooking(action.payload.id);
      return {
        bookings: [...state.bookings, newBooking],
        activeBookingId: newBooking.id,
      };
    }

    case 'UPDATE_BOOKING': {
      return {
        ...state,
        bookings: state.bookings.map((booking) =>
          booking.id === action.payload.id
            ? { ...booking, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : booking
        ),
      };
    }

    case 'SET_ACTIVE': {
      return {
        ...state,
        activeBookingId: action.payload.id,
      };
    }

    case 'REMOVE_BOOKING': {
      const newBookings = state.bookings.filter((b) => b.id !== action.payload.id);
      return {
        bookings: newBookings,
        activeBookingId:
          state.activeBookingId === action.payload.id
            ? newBookings.length > 0
              ? newBookings[0].id
              : null
            : state.activeBookingId,
      };
    }

    case 'LOAD_FROM_STORAGE': {
      return action.payload;
    }

    default:
      return state;
  }
}

/**
 * Load state from localStorage
 */
function loadFromStorage(): MultiBookingState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(MULTI_BOOKING_STORAGE_KEY);
    if (!stored) return null;

    const parsed: StoredMultiBookingState = JSON.parse(stored);

    // Version check for future migrations
    if (parsed.version !== STORAGE_VERSION) {
      console.warn('Storage version mismatch, resetting state');
      localStorage.removeItem(MULTI_BOOKING_STORAGE_KEY);
      return null;
    }

    return {
      bookings: parsed.bookings,
      activeBookingId: parsed.activeBookingId,
    };
  } catch (err) {
    console.error('Failed to load from localStorage:', err);
    return null;
  }
}

/**
 * Save state to localStorage
 */
function saveToStorage(state: MultiBookingState): void {
  if (typeof window === 'undefined') return;

  try {
    const toStore: StoredMultiBookingState = {
      bookings: state.bookings,
      activeBookingId: state.activeBookingId,
      version: STORAGE_VERSION,
    };
    localStorage.setItem(MULTI_BOOKING_STORAGE_KEY, JSON.stringify(toStore));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

/**
 * Context value interface
 */
interface MultiBookingContextValue {
  state: MultiBookingState;
  bookings: DraftBooking[];
  activeBooking: DraftBooking | null;
  createBooking: () => string;
  updateBooking: (id: string, updates: Partial<DraftBooking>) => void;
  setActiveBooking: (id: string | null) => void;
  removeBooking: (id: string) => void;
  // Convenience methods for common updates
  setSearchParams: (id: string, params: FlightSearchParams) => void;
  setSelectedFlight: (id: string, flight: FlightOffer) => void;
  setPassengers: (id: string, passengers: BookingPassenger[]) => void;
  setBookingStatus: (id: string, status: DraftBooking['status']) => void;
}

const MultiBookingContext = createContext<MultiBookingContextValue | null>(null);

/**
 * Provider component for multi-booking context
 */
export function MultiBookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(multiBookingReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      dispatch({ type: 'LOAD_FROM_STORAGE', payload: stored });
    }
  }, []);

  // Ref to hold latest state for synchronous saves
  const stateRef = useRef(state);
  stateRef.current = state;

  // Custom dispatch that saves to localStorage immediately after dispatch
  const dispatchAndSave = useCallback((action: MultiBookingAction) => {
    dispatch(action);
    // Compute new state and save immediately (for navigation-sensitive operations)
    const newState = multiBookingReducer(stateRef.current, action);
    saveToStorage(newState);
  }, []);

  const createBooking = useCallback(() => {
    const id = generateBookingId();
    dispatchAndSave({ type: 'CREATE_BOOKING', payload: { id } });
    return id;
  }, [dispatchAndSave]);

  const updateBooking = useCallback((id: string, updates: Partial<DraftBooking>) => {
    dispatchAndSave({ type: 'UPDATE_BOOKING', payload: { id, updates } });
  }, [dispatchAndSave]);

  const setActiveBooking = useCallback((id: string | null) => {
    dispatchAndSave({ type: 'SET_ACTIVE', payload: { id } });
  }, [dispatchAndSave]);

  const removeBooking = useCallback((id: string) => {
    dispatchAndSave({ type: 'REMOVE_BOOKING', payload: { id } });
  }, [dispatchAndSave]);

  // Convenience methods
  const setSearchParams = useCallback(
    (id: string, params: FlightSearchParams) => {
      updateBooking(id, { searchParams: params, status: 'searching' });
    },
    [updateBooking]
  );

  const setSelectedFlight = useCallback(
    (id: string, flight: FlightOffer) => {
      updateBooking(id, { selectedFlight: flight, status: 'selecting' });
    },
    [updateBooking]
  );

  const setPassengers = useCallback(
    (id: string, passengers: BookingPassenger[]) => {
      updateBooking(id, { passengers });
    },
    [updateBooking]
  );

  const setBookingStatus = useCallback(
    (id: string, status: DraftBooking['status']) => {
      updateBooking(id, { status });
    },
    [updateBooking]
  );

  const activeBooking = state.activeBookingId
    ? state.bookings.find((b) => b.id === state.activeBookingId) ?? null
    : null;

  const value: MultiBookingContextValue = {
    state,
    bookings: state.bookings,
    activeBooking,
    createBooking,
    updateBooking,
    setActiveBooking,
    removeBooking,
    setSearchParams,
    setSelectedFlight,
    setPassengers,
    setBookingStatus,
  };

  return <MultiBookingContext.Provider value={value}>{children}</MultiBookingContext.Provider>;
}

/**
 * Hook to access multi-booking context
 */
export function useMultiBookingContext(): MultiBookingContextValue {
  const context = useContext(MultiBookingContext);
  if (!context) {
    throw new Error('useMultiBookingContext must be used within a MultiBookingProvider');
  }
  return context;
}
