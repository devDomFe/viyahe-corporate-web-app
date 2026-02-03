# Implementation

## Architecture Overview

### System Design
- **Client Interface**: Corporate customers build trips, manage passengers, submit booking requests
- **Agent Interface**: Agents review, confirm/reject requests, fulfill bookings
- **Key Concept**: Trip-centric passenger management

### Client-Server Booking Sync

When a client submits a booking:
1. Client sends booking data to `POST /api/bookings`
2. Server creates booking with status `BOOKING_REQUESTED`
3. Server returns booking with generated `id`
4. Client stores this ID as `serverBookingId` in `DraftBooking` context
5. Client uses `serverBookingId` to poll for status updates

```typescript
interface DraftBooking {
  // ... other fields
  serverBookingId?: string; // Server-assigned ID after submission
}
```

### Dependency Flow
```
app/ (pages/routes) → src/components/ → src/features/
                                      ↓
                                src/lib/ (API clients)
                                      ↓
                                src/types/ (shared types)
```

### Key Principles
- Components depend on types and utilities, not API clients directly
- Features encapsulate business logic and can use API clients
- API clients are the only layer that communicates with external services
- No circular dependencies allowed

## Data Model

### Trip
```typescript
interface Trip {
  id: string;
  status: 'IN_PROGRESS' | 'BOOKING_REQUESTED' | 'CONFIRMED' | 'FULFILLED' | 'REJECTED';
  flights: Flight[];
  passengers: Passenger[];  // Passengers belong to trips, NOT flights
  createdAt: Date;
  updatedAt: Date;
}
```

### Passenger (Trip-Level)
```typescript
interface Passenger {
  id: string;
  tripId: string;  // Passengers belong to trips
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passport?: PassportInfo;
}
```

### BookingRequest
```typescript
interface BookingRequest {
  id: string;
  tripId: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  submittedAt: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
}
```

## Code Patterns

### Server Components (Default)
```typescript
// app/flights/page.tsx
export default async function FlightsPage() {
  const flights = await getFlights();
  return <FlightList flights={flights} />;
}
```

### Client Components (When Needed)
```typescript
'use client';
export function FlightSearchForm() { ... }
```

### State Management
```typescript
type FlightSearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Flight[] }
  | { status: 'error'; error: string };
```

### Trip Status Guards
```typescript
// Only allow edits when trip is IN_PROGRESS
function canEditTrip(trip: Trip): boolean {
  return trip.status === 'IN_PROGRESS';
}

// Validate before booking request
function canSubmitBookingRequest(trip: Trip): ValidationResult {
  if (trip.passengers.length === 0) {
    return { valid: false, error: 'Trip must have at least one passenger' };
  }
  if (trip.flights.length === 0) {
    return { valid: false, error: 'Trip must have at least one flight' };
  }
  // Check all passengers have complete details
  for (const passenger of trip.passengers) {
    if (!isPassengerComplete(passenger)) {
      return { valid: false, error: 'All passenger details must be complete' };
    }
  }
  return { valid: true };
}
```

### Mock-First Development
```typescript
const flightClient = process.env.USE_MOCK_DATA === 'true'
  ? new MockDuffelClient()
  : new DuffelClient(process.env.DUFFEL_API_TOKEN);
```

## Directory Structure

### app/
Next.js App Router pages and API routes
- Client routes: `/trips`, `/flights`, `/booking`
- Agent routes: `/agent/requests`, `/agent/review`

### src/components/
Shared UI components organized by domain:
- `layout/` - Header, Footer, Layout components
- `flights/` - SearchForm, FlightCard, FlightList, Filters, Sort
- `trips/` - TripCard, TripList, TripOverview
- `passengers/` - PassengerForm, PassengerList (trip-level)
- `booking/` - BookingRequestForm, BookingSummary
- `ui/` - LoadingSpinner, ErrorAlert, etc.

### src/lib/
External service clients:
- `duffel/` - Flight API client (client.ts, mock.ts, types.ts)
- `supabase/` - Database client (client.ts, mock.ts)

### src/types/
Shared TypeScript type definitions:
- `flight.ts` - Flight, FlightOffer, FlightSlice
- `passenger.ts` - Passenger, PassengerInfo
- `trip.ts` - Trip, TripStatus
- `booking.ts` - BookingRequest

### src/utils/
Utility functions:
- `format.ts` - Date, currency, duration formatting
- `pricing.ts` - Markup calculations
- `validation.ts` - Input validation, trip validation

### src/hooks/
Custom React hooks:
- `useFlightSearch.ts` - Flight search state management
- `useTrip.ts` - Trip state and operations
- `useBooking.ts` - Booking flow state management

### src/mocks/
Mock data for development:
- `flights.ts` - Mock flight data
- `airports.ts` - Mock airport data
- `trips.ts` - Mock trip data

## API Integration

### Duffel API
- Flight search, pricing, and booking
- Currently mocked for development
- Toggle with `USE_MOCK_DATA` environment variable

### Supabase
- Authentication (email/password)
- PostgreSQL database for trips, passengers, booking requests
- Currently mocked for development

## Agent Features Implementation

### Agent Dashboard Architecture

#### API Routes
- `GET /api/bookings` - List all bookings with optional status filter
- `GET /api/bookings/[id]` - Get single booking with documents
- `PATCH /api/bookings/[id]/status` - Update booking status (confirm/reject/fulfill)
- `POST /api/bookings/[id]/documents` - Upload document to booking
- `GET /api/bookings/[id]/documents` - List documents for booking
- `DELETE /api/documents/[id]` - Delete a document

#### Booking Storage (`src/lib/bookings/`)
```typescript
interface BookingClient {
  list(options?: { status?: BookingStatus }): Promise<BookingWithDocuments[]>;
  get(id: string): Promise<BookingWithDocuments | null>;
  create(data: CreateBookingData): Promise<Booking>;
  updateStatus(id: string, status: BookingStatus, options?: StatusUpdateOptions): Promise<Booking>;
  uploadDocument(bookingId: string, document: CreateDocumentData): Promise<BookingDocument>;
  listDocuments(bookingId: string): Promise<BookingDocument[]>;
  deleteDocument(documentId: string): Promise<void>;
}
```

#### Singleton Pattern (CRITICAL for Data Consistency)
MockBookingClient uses singleton pattern to ensure:
- All API routes share the same data store
- Client submissions are visible to agent dashboard
- Agent changes are visible to client confirmation page
- No data duplication or inconsistency between interfaces

```typescript
let mockClientInstance: BookingClient | null = null;

export function getBookingClient(): BookingClient {
  if (!mockClientInstance) {
    mockClientInstance = new MockBookingClient();
  }
  return mockClientInstance;
}
```

**Important**: The `MOCK_BOOKINGS` array is initialized empty. Bookings only exist when clients submit them through the booking flow. This ensures the agent dashboard shows real client data, not placeholder data.

### Agent Components (`src/components/agent/`)

| Component | Purpose |
|-----------|---------|
| `BookingStatusBadge` | Displays colored status badge |
| `BookingRequestCard` | Card displaying booking details with action buttons |
| `BookingRequestList` | List of booking cards with loading/empty states |
| `ConfirmBookingModal` | Modal for confirming booking with notes |
| `RejectBookingModal` | Modal for rejecting booking with reason |
| `DocumentUploadModal` | Modal for uploading documents |
| `DocumentList` | List of documents with download/delete |
| `FulfillBookingModal` | Confirmation modal for fulfillment |

### Agent Hook (`src/hooks/useAgentBookings.ts`)
```typescript
interface UseAgentBookingsResult {
  bookings: BookingWithDocuments[];
  filteredBookings: BookingWithDocuments[];
  state: AgentBookingsState;
  statusFilter: BookingStatusFilter;
  setStatusFilter: (status: BookingStatusFilter) => void;
  refreshBookings: () => Promise<void>;
  confirmBooking: (id: string, notes?: string) => Promise<boolean>;
  rejectBooking: (id: string, reason?: string) => Promise<boolean>;
  fulfillBooking: (id: string) => Promise<boolean>;
  uploadDocument: (bookingId: string, file: File, type: BookingDocumentType) => Promise<BookingDocument | null>;
  deleteDocument: (documentId: string) => Promise<boolean>;
  operationState: AgentOperationState;
}
```

### Booking Status Transitions

Valid transitions enforced in `MockBookingClient`:
```typescript
const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  BOOKING_REQUESTED: ['CONFIRMED', 'REJECTED'],
  CONFIRMED: ['FULFILLED'],
  REJECTED: [],
  FULFILLED: [],
};
```

### Fulfillment Validation
- Cannot fulfill without at least one document uploaded
- Validation occurs in `MockBookingClient.updateStatus()`
- Returns descriptive error message if validation fails

### Document Storage (Mock Mode)
- Documents stored as base64 data URLs in memory
- File converted to data URL on client side using FileReader
- Sent to API as JSON with dataUrl field
- Download creates link element with data URL href

### Types (`src/types/`)

#### BookingStatus
```typescript
export type BookingStatus = 'BOOKING_REQUESTED' | 'CONFIRMED' | 'REJECTED' | 'FULFILLED';
```

#### BookingDocument
```typescript
export interface BookingDocument {
  id: string;
  bookingId: string;
  type: BookingDocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  dataUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}
```

#### BookingWithDocuments
```typescript
export interface BookingWithDocuments extends Booking {
  documents: BookingDocument[];
}
