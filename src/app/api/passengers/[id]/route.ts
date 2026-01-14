import { NextRequest, NextResponse } from 'next/server';
import { getPassengerClient } from '@/lib/passengers';
import type { UpdateSavedPassengerData } from '@/types/saved-passenger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/passengers/[id]
 * Get a single saved passenger by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Add authentication check

    const { id } = await params;
    const client = await getPassengerClient();
    const passenger = await client.get(id);

    if (!passenger) {
      return NextResponse.json(
        { error: 'Passenger not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ passenger });
  } catch (error) {
    console.error('Failed to get passenger:', error);
    return NextResponse.json(
      { error: 'Failed to get passenger' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/passengers/[id]
 * Update a saved passenger
 * Body: UpdateSavedPassengerData
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Add authentication check

    const { id } = await params;
    const body = await request.json() as UpdateSavedPassengerData;

    const client = await getPassengerClient();
    const passenger = await client.update(id, body);

    return NextResponse.json({ passenger });
  } catch (error) {
    console.error('Failed to update passenger:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Passenger not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update passenger' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/passengers/[id]
 * Soft delete a saved passenger
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Add authentication check

    const { id } = await params;
    const client = await getPassengerClient();
    await client.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete passenger:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Passenger not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete passenger' },
      { status: 500 }
    );
  }
}
