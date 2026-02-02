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

## Features To Implement

### Agent Features

#### Booking Request Review
- View pending booking requests
- Review trip and passenger details
- Confirm or reject requests with optional reason

#### Fulfillment
- Upload itinerary documents
- Upload tickets
- Mark trips as fulfilled

## Planned Features (Post-MVP)
- Seat selection upsell
- Baggage selection upsell
- Expense integration
- Reporting dashboard
- Email notifications
- Agent queue system
