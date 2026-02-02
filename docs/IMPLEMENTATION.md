# Implementation

## Architecture Overview

### System Design
- **Client Interface**: Corporate customers build trips, manage passengers, submit booking requests
- **Agent Interface**: Agents review, confirm/reject requests, fulfill bookings
- **Key Concept**: Trip-centric passenger management

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
