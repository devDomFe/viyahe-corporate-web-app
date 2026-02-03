/**
 * Server session endpoint
 * Returns a unique session ID that changes when the server restarts.
 * Clients use this to detect server restarts and clear stale localStorage data.
 *
 * The session ID is imported from the bookings module to ensure it stays
 * in sync with the mock booking storage - both reset together.
 */

import { SERVER_SESSION_ID } from '@/lib/bookings';

export async function GET() {
  return Response.json({ sessionId: SERVER_SESSION_ID });
}
