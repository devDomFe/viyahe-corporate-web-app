import { NextRequest, NextResponse } from 'next/server';
import { getPassengerClient } from '@/lib/passengers';
import type { CreateSavedPassengerData } from '@/types/saved-passenger';

interface BulkCreateBody {
  passengers: CreateSavedPassengerData[];
}

/**
 * POST /api/passengers/bulk
 * Create multiple passengers at once
 * Used for auto-saving new passengers after booking
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // const session = await getSession();
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json() as BulkCreateBody;

    if (!body.passengers || !Array.isArray(body.passengers)) {
      return NextResponse.json(
        { error: 'passengers array is required' },
        { status: 400 }
      );
    }

    if (body.passengers.length === 0) {
      return NextResponse.json({ passengers: [] }, { status: 201 });
    }

    // Validate each passenger has required fields
    for (const passenger of body.passengers) {
      if (!passenger.firstName || !passenger.lastName || !passenger.email) {
        return NextResponse.json(
          { error: 'Each passenger must have firstName, lastName, and email' },
          { status: 400 }
        );
      }
    }

    const client = await getPassengerClient();
    const passengers = await client.bulkCreate(body.passengers);

    return NextResponse.json({ passengers }, { status: 201 });
  } catch (error) {
    console.error('Failed to bulk create passengers:', error);
    return NextResponse.json(
      { error: 'Failed to create passengers' },
      { status: 500 }
    );
  }
}
