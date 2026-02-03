'use client';

import { useEffect, useRef } from 'react';
import { useMultiBooking } from '@/hooks/useMultiBooking';

/**
 * Client component that clears the active booking on mount.
 * Used on pages where no booking should be active (e.g., home page).
 */
export function ClearActiveBooking() {
  const { setActiveBooking } = useMultiBooking();
  const hasCleared = useRef(false);

  useEffect(() => {
    // Only clear once on mount, not on subsequent renders
    if (!hasCleared.current) {
      hasCleared.current = true;
      setActiveBooking(null);
    }
  }, [setActiveBooking]);

  return null;
}
