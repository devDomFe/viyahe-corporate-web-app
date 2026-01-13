import { NextRequest, NextResponse } from 'next/server';
import type { BookingRequest, Booking, AgentNotification } from '@/types/booking';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

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

    // Create booking record
    const booking: Booking = {
      id: generateId(),
      request: bookingRequest,
      status: 'pending',
      originalPrice: flightOffer.totalPrice.amount,
      finalPrice: flightOffer.priceWithMarkup.amount,
      currency: flightOffer.priceWithMarkup.currency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

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

    // TODO: In production:
    // 1. Save booking to database
    // 2. Send notification to agents (email/webhook)
    // 3. Send confirmation email to customer

    // For now, we just return the booking data
    // In the future, this would be stored in Supabase
    console.log('New booking created:', booking.id);
    console.log('Agent notification:', JSON.stringify(notification, null, 2));

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

export async function GET(request: NextRequest) {
  // TODO: Implement booking retrieval
  // This would require authentication and would fetch from database

  return NextResponse.json(
    { error: 'Booking retrieval not yet implemented' },
    { status: 501 }
  );
}
