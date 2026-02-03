'use client';

import { Badge } from '@chakra-ui/react';
import type { BookingStatus } from '@/types/booking';

interface BookingStatusBadgeProps {
  status: BookingStatus;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; colorPalette: string }> = {
  BOOKING_REQUESTED: { label: 'Pending Review', colorPalette: 'orange' },
  CONFIRMED: { label: 'Confirmed', colorPalette: 'green' },
  REJECTED: { label: 'Rejected', colorPalette: 'red' },
  FULFILLED: { label: 'Fulfilled', colorPalette: 'blue' },
};

export function BookingStatusBadge({ status, size = 'md' }: BookingStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge colorPalette={config.colorPalette} size={size}>
      {config.label}
    </Badge>
  );
}
