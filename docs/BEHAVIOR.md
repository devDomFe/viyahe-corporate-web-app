# Expected Behaviors

## Trip Status Workflow

### Status Definitions

| Status | Description | Allowed Actions |
|--------|-------------|-----------------|
| `IN_PROGRESS` | Trip being built | Full editing (add/delete flights, manage passengers) |
| `BOOKING_REQUESTED` | Submitted for review | **LOCKED** - no trip edits |
| `CONFIRMED` | Agent approved | Client can request changes via support only |
| `FULFILLED` | Complete | All documents uploaded, read-only |
| `REJECTED` | Denied | Optional rejection reason provided |

### Status Transitions
- `IN_PROGRESS` → `BOOKING_REQUESTED`: Client submits booking request
- `BOOKING_REQUESTED` → `CONFIRMED`: Agent approves
- `BOOKING_REQUESTED` → `REJECTED`: Agent denies
- `CONFIRMED` → `FULFILLED`: Agent uploads all documents

## Passenger Management (CRITICAL)

### Core Rule
**Passengers are managed ONLY at the trip level.**

### Required Behaviors
- Flights inherit passengers from their parent trip
- No passenger data stored on individual flights
- All passenger entry points must redirect to "Trip Overview → Passengers"
- Display message: "Passengers are managed at the trip level"

### Validation Before Booking Request
- Trip must have ≥1 passenger
- All passenger details must be complete
- Trip must have ≥1 flight

## Flight Search

### Search Form
- Form validates required fields before submission
- Origin and destination cannot be the same airport
- Departure date must be today or in the future
- Return date (if round-trip) must be on or after departure date
- Passenger count minimum is 1 adult

### Search Results
- Results update client-side without full page reloads
- Scroll position preserved when applying filters or sorting
- Loading spinner shown during search
- Empty state displayed when no results match criteria

## Booking Flow

### Trip Building (IN_PROGRESS)
- Full editing capabilities
- Add/remove flights
- Add/remove passengers
- Edit passenger details

### Booking Request (BOOKING_REQUESTED)
- Trip is LOCKED
- No edits allowed
- Negotiation happens off-platform
- Client waits for agent response

### Confirmation Display
- Booking summary displays all flight and passenger details
- Clear next steps provided to user

## UI/UX Patterns

### Navigation
- Form state maintained when navigating back to search
- Instant feedback on user actions

### Loading States
- Spinners for async operations
- Skeleton loaders for content areas
- Non-blocking UI during data fetching

### Error Handling
- User-friendly error messages displayed
- Errors logged to console for debugging
- Retry options where appropriate

### Trip Locking (Implemented)
When a booking is submitted (status = 'submitted'), the following UI behaviors apply:

- **Warning Banner**: Yellow alert at top of booking page: "This booking has been submitted and cannot be edited. Contact support for changes."
- **Flight Summary**: Remove button (X) is hidden when locked
- **Passenger Cards**: Remove buttons hidden, all form inputs disabled
- **Add Passenger Buttons**: Disabled (both mobile and desktop)
- **Booking Extras**: Discount code and special requests inputs disabled
- **Submit Button**: Hidden and replaced with "View Confirmation" button
- **Saved Passengers Sidebar**: Selection disabled when locked

### Flight Removal
- Remove flight button (X icon) appears in FlightSummary header
- Only visible when booking status is not 'submitted'
- Clicking removes the selected flight and redirects to home page for new search
- Clears passengers from the booking as well
