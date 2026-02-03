# Expected Behaviors

## Data Consistency (CRITICAL)

### Single Source of Truth
- All bookings are stored in a single data store (MockBookingClient singleton in mock mode)
- Agent dashboard ONLY shows bookings submitted via the client interface
- No pre-seeded or placeholder data exists in the system
- Changes made by agents are immediately reflected for clients

### Real-Time Sync
- Client submits booking via `POST /api/bookings` → stored in shared data store
- Server returns booking ID → stored in client context as `serverBookingId`
- Agent views bookings via `GET /api/bookings` → reads from same data store
- Agent actions (confirm/reject/fulfill/upload) update the shared store
- Client confirmation page fetches latest status using `serverBookingId`
- Polling every 5 seconds ensures client sees agent changes promptly
- Polling stops once booking is no longer in BOOKING_REQUESTED status

### Data Flow
```
Client Booking Submission
    ↓
POST /api/bookings → MockBookingClient.create()
    ↓
Booking stored in singleton instance
    ↓
Agent Dashboard
    ↓
GET /api/bookings → MockBookingClient.list()
    ↓
Same singleton instance returns submitted bookings
    ↓
Agent Actions (confirm/reject/upload/fulfill)
    ↓
PATCH /api/bookings/[id]/status → MockBookingClient.updateStatus()
    ↓
Client fetches updated status
    ↓
GET /api/bookings/[id] → MockBookingClient.get()
```

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

## Agent Dashboard Behaviors

### Dashboard Access
- Agent dashboard available at `/agent`
- No authentication required in mock mode (to be added)
- "Back to Client View" button navigates to home page

### Booking List
- Bookings sorted by creation date (newest first)
- Status filter tabs update list in real-time (no page reload)
- Status counts displayed on each tab badge
- Empty state shown when no bookings match filter

### Status Actions Visibility
| Booking Status | Confirm | Reject | Upload Doc | Mark Fulfilled |
|----------------|---------|--------|------------|----------------|
| BOOKING_REQUESTED | Visible | Visible | Hidden | Hidden |
| CONFIRMED | Hidden | Hidden | Visible | Visible (if docs > 0) |
| REJECTED | Hidden | Hidden | Hidden | Hidden |
| FULFILLED | Hidden | Hidden | Hidden | Hidden |

### Confirm Booking
- Opens confirmation modal
- Optional agent notes field
- On confirm: status → CONFIRMED, confirmedAt timestamp set
- List refreshes automatically

### Reject Booking
- Opens rejection modal
- Optional rejection reason field
- On reject: status → REJECTED, rejectionReason stored
- Rejection reason visible to client on their confirmation page
- List refreshes automatically

### Document Upload
- Only available for CONFIRMED bookings
- Opens upload modal with:
  - Document type selector (Itinerary, E-Ticket, Invoice, Other)
  - File picker with drag-drop area
  - File validation (PDF, JPEG, PNG only, max 5MB)
- On upload success: document added, modal closes, list refreshes
- Documents stored as base64 data URLs in mock mode

### Document List
- Show/Hide toggle for document section
- Each document shows: type badge, filename, file size, upload timestamp
- Download button creates browser download from data URL
- Delete button removes document (with loading state)
- Delete only available before fulfillment

### Mark as Fulfilled
- Only visible when: status = CONFIRMED AND documents.length > 0
- Opens confirmation modal with summary
- Shows what will happen (booking complete, docs available, locked)
- On confirm: status → FULFILLED, fulfilledAt timestamp set
- Booking becomes fully read-only

## Client Confirmation Page Behaviors

### Server Booking ID Tracking
- When booking is submitted, `serverBookingId` is stored in client context
- This ID is used to fetch real-time status from the server
- Works both for fresh submissions (sessionStorage) and returning visits (context)

### Status Display
- Fetches latest booking status from server using `serverBookingId`
- Header icon and color change based on status:
  - Pending Review: Yellow, clock icon
  - Confirmed: Green, checkmark icon
  - Rejected: Red, X icon
  - Fulfilled: Blue, checkmark icon
- Status badge with color-coded pill

### Status Polling
- Polls server every 5 seconds while status = BOOKING_REQUESTED
- Polling stops when status changes to CONFIRMED, REJECTED, or FULFILLED
- Automatic UI update when status changes
- Works in both sessionStorage mode and context fallback mode

### Rejection Display
- When status = REJECTED, shows red alert banner
- Displays rejection reason if provided
- Header changes to "Booking Rejected" with red styling
- Otherwise shows generic message to contact support

### Confirmation Display
- When status = CONFIRMED, header shows "Booking Confirmed"
- Green styling with checkmark icon
- If documents already uploaded, shows document list
- Informs client that documents will be uploaded shortly if none yet

### Fulfilled Display
- Header shows "Booking Fulfilled" with blue styling
- Document download section with green "Your Travel Documents" heading
- DocumentList component displays all uploaded documents
- Download buttons allow client to save documents locally
- "Next Steps" section hidden for fulfilled bookings
