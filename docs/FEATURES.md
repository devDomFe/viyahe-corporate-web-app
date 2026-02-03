# Features

## System Architecture

### Client Interface
Corporate customers build trips, manage passengers, and submit booking requests.

### Agent Interface
Agents review, confirm/reject requests, and fulfill bookings.

## Current Features (Implemented)

### Flight Search
- One-way, round-trip, and multi-city trip support
- Origin and destination airport selection
- Date selection with calendar picker
- Passenger count selection (adults, children, infants)
- Cabin class selection (economy, premium economy, business, first)
- Fare display with pricing

### Trip Management
- Basic trip creation
- Add flight to trip
- Remove flight from trip (when status allows editing)
- Multi-booking sidebar for managing multiple trips

### Flight Results
- Filterable results by price, stops, duration, and carriers
- Sortable results (best value, departure time, duration, price)
- Flight cards displaying route, times, duration, and pricing
- Expandable flight details

### Booking Request Submission
- Create BookingRequest object on submit
- Automatic status transition to 'submitted' (BOOKING_REQUESTED)
- Trip locking when submitted (all edit controls disabled)
- Warning banner displayed for locked bookings
- View Confirmation button for submitted bookings
- JSON notification display for agent review

### Saved Travelers
- Full CRUD operations for traveler profiles at /passengers
- "Add to Trip" functionality via SavedPassengersSidebar
- Global traveler library with search filtering
- Bulk save new passengers after booking submission

### Passenger Management
- Trip-level passenger entry (passengers belong to trips, not flights)
- Passenger details form (name, email, phone, DOB, gender)
- Travel document fields for international flights (passport, national ID)
- Discount code input field
- Special requests text field
- Passenger count enforcement based on search criteria

### Pricing & Notifications
- Automated markup system applied to all Duffel prices
- Display of final price after markup
- Agent notification JSON on booking submission

### Booking Status Tracking
- Real-time status display on client confirmation page
- Status polling for pending bookings (auto-refresh every 10 seconds)
- Visual status badges: Pending Review, Confirmed, Rejected, Fulfilled
- Rejection reason display for rejected bookings
- Document download access for fulfilled bookings

## Agent Features (Implemented)

### Agent Dashboard (`/agent`)
- Dedicated agent dashboard for booking management
- Status filter tabs: All, Pending, Confirmed, Rejected, Fulfilled
- Booking count badges on each status tab
- Booking cards with route, passengers, pricing, and timestamps
- Special requests display
- Back to Client View navigation

### Booking Request Review
- View all pending booking requests
- Review trip details: flights, passengers, total price
- Review special requests and discount codes
- Booking timestamp display

### Confirm/Reject Actions
- Confirm booking with optional agent notes
- Reject booking with optional rejection reason
- Confirmation modals for both actions
- Automatic status update and list refresh

### Document Management
- Upload documents for confirmed bookings
- Document types: Itinerary, E-Ticket, Invoice, Other
- File validation: PDF, JPEG, PNG only, max 5MB
- Document list with type badges and file info
- Download documents directly
- Delete documents (before fulfillment)
- Show/hide toggle for document list

### Fulfillment
- Mark as Fulfilled button (requires at least one document)
- Fulfillment confirmation modal with summary
- Status changes to FULFILLED
- Documents become available to client
- Booking becomes read-only

## Planned Features (Post-MVP)
- Seat selection upsell
- Baggage selection upsell
- Expense integration
- Reporting dashboard
- Email notifications
- Agent queue system
