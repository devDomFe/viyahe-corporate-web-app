import { NextRequest, NextResponse } from 'next/server';
import type { BookingRequest, AgentNotification, BookingStatus } from '@/types/booking';
import { getBookingClient } from '@/lib/bookings';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * GET /api/bookings
 * List all bookings with optional status filter
 * Query params: status (optional)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for agents

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as BookingStatus | null;

    const client = getBookingClient();
    const bookings = await client.list(status ? { status } : undefined);

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Failed to list bookings:', error);
    return NextResponse.json(
      { error: 'Failed to list bookings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookings
 * Create a new booking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Add authentication check
    // const session = await getSession();
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Validate booking request
    const { flightOffer, searchParams, passengers, discountCode, specialRequests, contactEmail, contactPhone } = body;

    if (!flightOffer || !searchParams || !passengers || passengers.length === 0) {
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      );
    }

    if (!contactEmail || !contactPhone) {
      return NextResponse.json(
        { error: 'Contact email and phone are required' },
        { status: 400 }
      );
    }

    // Create booking request
    const bookingRequest: BookingRequest = {
      id: generateId(),
      flightOffer,
      searchParams,
      passengers,
      discountCode: discountCode || undefined,
      specialRequests: specialRequests || undefined,
      contactEmail,
      contactPhone,
      createdAt: new Date().toISOString(),
    };

    // Create booking using the client (persists to mock storage)
    const client = getBookingClient();
    const booking = await client.create({
      request: bookingRequest,
      originalPrice: flightOffer.totalPrice.amount,
      finalPrice: flightOffer.priceWithMarkup.amount,
      currency: flightOffer.priceWithMarkup.currency,
    });

    // Create agent notification
    const notification: AgentNotification = {
      bookingId: booking.id,
      type: 'new_booking',
      timestamp: new Date().toISOString(),
      booking: {
        flightDetails: {
          origin: searchParams.origin,
          destination: searchParams.destination,
          departureDate: searchParams.departureDate,
          returnDate: searchParams.returnDate,
          tripType: searchParams.tripType,
          cabinClass: searchParams.cabinClass,
        },
        passengers: passengers.map((p: { title: string; firstName: string; lastName: string; email: string; phone: string }) => ({
          name: `${p.title} ${p.firstName} ${p.lastName}`,
          email: p.email,
          phone: p.phone,
        })),
        pricing: {
          originalAmount: flightOffer.totalPrice.amount,
          markedUpAmount: flightOffer.priceWithMarkup.amount,
          currency: flightOffer.priceWithMarkup.currency,
        },
        specialRequests: specialRequests || undefined,
        discountCode: discountCode || undefined,
      },
    };

    console.log('New booking created:', booking.id);

    return NextResponse.json({
      success: true,
      data: {
        booking,
        notification,
      },
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
