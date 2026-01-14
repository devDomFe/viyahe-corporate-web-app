'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  SavedPassenger,
  CreateSavedPassengerData,
  UpdateSavedPassengerData,
  SavedPassengersState,
  SavedPassengerOperationState,
} from '@/types/saved-passenger';

interface UseSavedPassengersResult {
  // Data
  savedPassengers: SavedPassenger[];
  filteredPassengers: SavedPassenger[];

  // State
  state: SavedPassengersState;
  searchQuery: string;

  // Actions
  setSearchQuery: (query: string) => void;
  refreshPassengers: () => Promise<void>;

  // CRUD operations
  createPassenger: (data: CreateSavedPassengerData) => Promise<SavedPassenger | null>;
  updatePassenger: (id: string, data: UpdateSavedPassengerData) => Promise<boolean>;
  deletePassenger: (id: string) => Promise<boolean>;
  bulkCreatePassengers: (data: CreateSavedPassengerData[]) => Promise<SavedPassenger[]>;

  // Operation state
  operationState: SavedPassengerOperationState;
}

export function useSavedPassengers(): UseSavedPassengersResult {
  const [state, setState] = useState<SavedPassengersState>({ status: 'idle' });
  const [operationState, setOperationState] = useState<SavedPassengerOperationState>({
    status: 'idle',
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch passengers on mount
  const fetchPassengers = useCallback(async () => {
    setState({ status: 'loading' });

    try {
      const response = await fetch('/api/passengers');
      if (!response.ok) {
        throw new Error('Failed to fetch passengers');
      }

      const data = await response.json();
      setState({ status: 'success', data: data.passengers });
    } catch (error) {
      console.error('Failed to fetch saved passengers:', error);
      setState({ status: 'error', error: 'Failed to load saved passengers' });
    }
  }, []);

  useEffect(() => {
    fetchPassengers();
  }, [fetchPassengers]);

  // Saved passengers from state
  const savedPassengers = useMemo(() => {
    if (state.status === 'success') {
      return state.data;
    }
    return [];
  }, [state]);

  // Filter passengers by search query (client-side for responsiveness)
  const filteredPassengers = useMemo(() => {
    if (!searchQuery.trim()) {
      return savedPassengers;
    }

    const lowerQuery = searchQuery.toLowerCase().trim();
    return savedPassengers.filter((passenger) => {
      const fullName = `${passenger.firstName} ${passenger.lastName}`.toLowerCase();
      const email = passenger.email.toLowerCase();
      return fullName.includes(lowerQuery) || email.includes(lowerQuery);
    });
  }, [savedPassengers, searchQuery]);

  // Create a new passenger
  const createPassenger = useCallback(
    async (data: CreateSavedPassengerData): Promise<SavedPassenger | null> => {
      setOperationState({ status: 'loading' });

      try {
        const response = await fetch('/api/passengers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to create passenger');
        }

        const result = await response.json();
        setOperationState({ status: 'success' });

        // Refresh the list
        await fetchPassengers();

        return result.passenger;
      } catch (error) {
        console.error('Failed to create passenger:', error);
        setOperationState({ status: 'error', error: 'Failed to save passenger' });
        return null;
      }
    },
    [fetchPassengers]
  );

  // Update a passenger
  const updatePassenger = useCallback(
    async (id: string, data: UpdateSavedPassengerData): Promise<boolean> => {
      setOperationState({ status: 'loading' });

      try {
        const response = await fetch(`/api/passengers/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update passenger');
        }

        setOperationState({ status: 'success' });

        // Refresh the list
        await fetchPassengers();

        return true;
      } catch (error) {
        console.error('Failed to update passenger:', error);
        setOperationState({ status: 'error', error: 'Failed to update passenger' });
        return false;
      }
    },
    [fetchPassengers]
  );

  // Delete a passenger
  const deletePassenger = useCallback(
    async (id: string): Promise<boolean> => {
      setOperationState({ status: 'loading' });

      try {
        const response = await fetch(`/api/passengers/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete passenger');
        }

        setOperationState({ status: 'success' });

        // Refresh the list
        await fetchPassengers();

        return true;
      } catch (error) {
        console.error('Failed to delete passenger:', error);
        setOperationState({ status: 'error', error: 'Failed to delete passenger' });
        return false;
      }
    },
    [fetchPassengers]
  );

  // Bulk create passengers
  const bulkCreatePassengers = useCallback(
    async (data: CreateSavedPassengerData[]): Promise<SavedPassenger[]> => {
      if (data.length === 0) return [];

      setOperationState({ status: 'loading' });

      try {
        const response = await fetch('/api/passengers/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passengers: data }),
        });

        if (!response.ok) {
          throw new Error('Failed to create passengers');
        }

        const result = await response.json();
        setOperationState({ status: 'success' });

        // Refresh the list
        await fetchPassengers();

        return result.passengers;
      } catch (error) {
        console.error('Failed to bulk create passengers:', error);
        setOperationState({ status: 'error', error: 'Failed to save passengers' });
        return [];
      }
    },
    [fetchPassengers]
  );

  return {
    savedPassengers,
    filteredPassengers,
    state,
    searchQuery,
    setSearchQuery,
    refreshPassengers: fetchPassengers,
    createPassenger,
    updatePassenger,
    deletePassenger,
    bulkCreatePassengers,
    operationState,
  };
}
