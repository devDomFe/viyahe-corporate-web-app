import { NextRequest, NextResponse } from 'next/server';
import { validateSearchParams } from '@/utils/validation';
import { generateMockFlights } from '@/mocks/flights';
import type { FlightSearchParams } from '@/types/flight';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate search parameters
    const validation = validateSearchParams(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const searchParams = validation.data as FlightSearchParams;

    // In production, this would call the Duffel API
    // For now, we use mock data
    const useMock = process.env.USE_MOCK_DATA === 'true';

    if (useMock) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const flights = generateMockFlights(searchParams);

      return NextResponse.json({
        success: true,
        data: {
          offers: flights,
          totalResults: flights.length,
          searchParams,
        },
      });
    }

    // TODO: Implement real Duffel API integration
    // const duffelClient = new DuffelClient(process.env.DUFFEL_API_TOKEN);
    // const offers = await duffelClient.searchFlights(searchParams);

    return NextResponse.json(
      { error: 'Duffel API integration not yet implemented' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Flight search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to search for flights.' },
    { status: 405 }
  );
}
