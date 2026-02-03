import { NextRequest, NextResponse } from 'next/server';
import { getBookingClient } from '@/lib/bookings';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/documents/[id]
 * Delete a document
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Add authentication check for agents

    const { id } = await params;
    const client = getBookingClient();

    try {
      await client.deleteDocument(id);
      return NextResponse.json({ success: true });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
