import { NextRequest, NextResponse } from 'next/server';
import { getBookingClient } from '@/lib/bookings';
import type { BookingDocumentType } from '@/types/booking';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/bookings/[id]/documents
 * List documents for a booking
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Add authentication check

    const { id } = await params;
    const client = getBookingClient();
    const documents = await client.listDocuments(id);

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Failed to list documents:', error);
    return NextResponse.json(
      { error: 'Failed to list documents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookings/[id]/documents
 * Upload a document to a booking
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Add authentication check for agents

    const { id } = await params;
    const body = await request.json();

    const { type, fileName, fileSize, mimeType, dataUrl } = body as {
      type: BookingDocumentType;
      fileName: string;
      fileSize: number;
      mimeType: string;
      dataUrl: string;
    };

    // Validate required fields
    if (!type || !fileName || !dataUrl) {
      return NextResponse.json(
        { error: 'Missing required document fields' },
        { status: 400 }
      );
    }

    // Validate document type
    const validTypes: BookingDocumentType[] = ['itinerary', 'e_ticket', 'invoice', 'other'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    const client = getBookingClient();

    try {
      const document = await client.uploadDocument(id, {
        type,
        fileName,
        fileSize,
        mimeType,
        dataUrl,
      });

      return NextResponse.json({ document }, { status: 201 });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return NextResponse.json(
            { error: 'Booking not found' },
            { status: 404 }
          );
        }
        if (error.message.includes('only be uploaded to confirmed')) {
          return NextResponse.json(
            { error: error.message },
            { status: 400 }
          );
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Failed to upload document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
