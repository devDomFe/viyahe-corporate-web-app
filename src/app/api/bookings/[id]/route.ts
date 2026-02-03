import { NextRequest, NextResponse } from 'next/server';
import { getBookingClient } from '@/lib/bookings';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/bookings/[id]
 * Get a single booking by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Add authentication check

    const { id } = await params;
    const client = getBookingClient();
    const booking = await client.get(id);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Failed to get booking:', error);
    return NextResponse.json(
      { error: 'Failed to get booking' },
      { status: 500 }
    );
  }
}
