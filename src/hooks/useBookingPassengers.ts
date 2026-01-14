'use client';

import { useState, useCallback, useMemo } from 'react';
import type { PassengerFormData } from '@/types/passenger';
import type { SavedPassenger, BookingPassenger } from '@/types/saved-passenger';
import { EMPTY_PASSENGER_FORM } from '@/types/passenger';
import { savedPassengerToFormData } from '@/types/saved-passenger';
import { validatePassengerForm } from '@/utils/validation';

interface UseBookingPassengersResult {
  // Selected passengers for booking
  passengers: BookingPassenger[];

  // Actions
  addFromSaved: (savedPassenger: SavedPassenger) => void;
  addNew: () => void;
  updatePassenger: (id: string, data: PassengerFormData) => void;
  removePassenger: (id: string) => void;
  clearAll: () => void;

  // Expand/collapse
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;

  // Validation
  errors: Map<string, Record<string, string>>;
  validateAll: () => boolean;
  validatePassenger: (id: string) => boolean;

  // Helpers
  getPassengerFormData: () => PassengerFormData[];
  getNewPassengersToSave: () => PassengerFormData[];
  getSavedPassengerIds: () => string[];
  passengerCount: number;
  hasRequiredPassengers: (required: number) => boolean;
}

function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

export function useBookingPassengers(
  initialCount: number = 0
): UseBookingPassengersResult {
  const [passengers, setPassengers] = useState<BookingPassenger[]>(() => {
    // Initialize with empty passengers based on initial count
    return Array.from({ length: initialCount }, () => ({
      id: generateTempId(),
      data: { ...EMPTY_PASSENGER_FORM },
      isExpanded: initialCount === 1, // Auto-expand if only one passenger
      isModified: false,
    }));
  });

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Auto-expand first passenger if only one
    if (initialCount === 1) {
      return new Set([passengers[0]?.id].filter(Boolean));
    }
    return new Set();
  });

  const [errors, setErrors] = useState<Map<string, Record<string, string>>>(new Map());

  // Add a saved passenger to the booking
  const addFromSaved = useCallback((savedPassenger: SavedPassenger) => {
    const newPassenger: BookingPassenger = {
      id: generateTempId(),
      savedPassengerId: savedPassenger.id,
      data: savedPassengerToFormData(savedPassenger),
      isExpanded: false,
      isModified: false,
    };

    setPassengers((prev) => [...prev, newPassenger]);
  }, []);

  // Add a new empty passenger
  const addNew = useCallback(() => {
    const id = generateTempId();
    const newPassenger: BookingPassenger = {
      id,
      data: { ...EMPTY_PASSENGER_FORM },
      isExpanded: true, // Auto-expand new passenger for editing
      isModified: false,
    };

    setPassengers((prev) => [...prev, newPassenger]);
    setExpandedIds((prev) => new Set([...prev, id]));
  }, []);

  // Update a passenger's form data
  const updatePassenger = useCallback((id: string, data: PassengerFormData) => {
    setPassengers((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          data,
          isModified: true, // Mark as modified once edited
        };
      })
    );

    // Clear validation errors for this passenger when they update
    setErrors((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // Remove a passenger
  const removePassenger = useCallback((id: string) => {
    setPassengers((prev) => prev.filter((p) => p.id !== id));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setErrors((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // Clear all passengers
  const clearAll = useCallback(() => {
    setPassengers([]);
    setExpandedIds(new Set());
    setErrors(new Map());
  }, []);

  // Toggle expand/collapse for a passenger
  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Expand all passengers
  const expandAll = useCallback(() => {
    setExpandedIds(new Set(passengers.map((p) => p.id)));
  }, [passengers]);

  // Collapse all passengers
  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // Validate a single passenger
  const validatePassenger = useCallback(
    (id: string): boolean => {
      const passenger = passengers.find((p) => p.id === id);
      if (!passenger) return false;

      const result = validatePassengerForm(passenger.data);

      setErrors((prev) => {
        const next = new Map(prev);
        if (result.valid) {
          next.delete(id);
        } else {
          next.set(id, result.errors);
        }
        return next;
      });

      return result.valid;
    },
    [passengers]
  );

  // Validate all passengers
  const validateAll = useCallback((): boolean => {
    const newErrors = new Map<string, Record<string, string>>();
    let allValid = true;

    for (const passenger of passengers) {
      const result = validatePassengerForm(passenger.data);
      if (!result.valid) {
        allValid = false;
        newErrors.set(passenger.id, result.errors);
      }
    }

    setErrors(newErrors);

    // Expand passengers with errors
    if (!allValid) {
      const idsWithErrors = Array.from(newErrors.keys());
      setExpandedIds((prev) => new Set([...prev, ...idsWithErrors]));
    }

    return allValid;
  }, [passengers]);

  // Get all passenger form data
  const getPassengerFormData = useCallback((): PassengerFormData[] => {
    return passengers.map((p) => p.data);
  }, [passengers]);

  // Get new passengers that aren't from saved (for auto-save prompt)
  const getNewPassengersToSave = useCallback((): PassengerFormData[] => {
    return passengers
      .filter((p) => !p.savedPassengerId || p.isModified)
      .map((p) => p.data);
  }, [passengers]);

  // Get IDs of saved passengers used in booking
  const getSavedPassengerIds = useCallback((): string[] => {
    return passengers
      .filter((p) => p.savedPassengerId && !p.isModified)
      .map((p) => p.savedPassengerId!);
  }, [passengers]);

  // Check if we have enough passengers
  const hasRequiredPassengers = useCallback(
    (required: number): boolean => {
      return passengers.length >= required;
    },
    [passengers]
  );

  const passengerCount = passengers.length;

  return {
    passengers,
    addFromSaved,
    addNew,
    updatePassenger,
    removePassenger,
    clearAll,
    expandedIds,
    toggleExpand,
    expandAll,
    collapseAll,
    errors,
    validateAll,
    validatePassenger,
    getPassengerFormData,
    getNewPassengersToSave,
    getSavedPassengerIds,
    passengerCount,
    hasRequiredPassengers,
  };
}
