import { NextRequest, NextResponse } from 'next/server';
import { getBookingClient } from '@/lib/bookings';
import type { BookingStatus } from '@/types/booking';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/bookings/[id]/status
 * Update booking status (confirm/reject/fulfill)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Add authentication check for agents

    const { id } = await params;
    const body = await request.json();
    const { status, agentNotes, rejectionReason } = body as {
      status: BookingStatus;
      agentNotes?: string;
      rejectionReason?: string;
    };

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses: BookingStatus[] = ['BOOKING_REQUESTED', 'CONFIRMED', 'REJECTED', 'FULFILLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const client = getBookingClient();

    try {
      const booking = await client.updateStatus(id, status, {
        agentNotes,
        rejectionReason,
      });

      return NextResponse.json({ booking });
    } catch (error) {
      // Handle specific error messages from the client
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return NextResponse.json(
            { error: 'Booking not found' },
            { status: 404 }
          );
        }
        if (error.message.includes('Invalid status transition')) {
          return NextResponse.json(
            { error: error.message },
            { status: 400 }
          );
        }
        if (error.message.includes('Cannot fulfill')) {
          return NextResponse.json(
            { error: error.message },
            { status: 400 }
          );
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Failed to update booking status:', error);
    return NextResponse.json(
      { error: 'Failed to update booking status' },
      { status: 500 }
    );
  }
}
