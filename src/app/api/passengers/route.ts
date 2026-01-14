import { NextRequest, NextResponse } from 'next/server';
import { getPassengerClient } from '@/lib/passengers';
import type { CreateSavedPassengerData } from '@/types/saved-passenger';

/**
 * GET /api/passengers
 * List all saved passengers for the organization
 * Query params: search (optional)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // const session = await getSession();
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;

    const client = await getPassengerClient();
    const passengers = await client.list({ search });

    return NextResponse.json({ passengers });
  } catch (error) {
    console.error('Failed to list passengers:', error);
    return NextResponse.json(
      { error: 'Failed to list passengers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/passengers
 * Create a new saved passenger
 * Body: CreateSavedPassengerData
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // const session = await getSession();
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json() as CreateSavedPassengerData;

    // Basic validation
    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    const client = await getPassengerClient();
    const passenger = await client.create(body);

    return NextResponse.json({ passenger }, { status: 201 });
  } catch (error) {
    console.error('Failed to create passenger:', error);
    return NextResponse.json(
      { error: 'Failed to create passenger' },
      { status: 500 }
    );
  }
}
