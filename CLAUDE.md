# Viyahe Web App - Development Guidelines

# Claude Instructions

## Environment Setup
- Start the dev server with `npm run dev`
- App runs at http://localhost:3000

## Documentation Requirements
Keep docs/ in sync with all code changes:

- **docs/FEATURES.md** - Update when adding new features
- **docs/BEHAVIOR.md** - Update when changing expected behaviors
- **docs/TESTING.md** - Update when modifying tests or verification steps
- **docs/IMPLEMENTATION.md** - Update when changing architecture or code patterns

## Project Overview

This is a B2B flight booking platform with separate client and agent interfaces. The system integrates with Duffel for flight inventory, pricing, and ticketing.

**Purpose**: Enable self-service flight booking for corporate travelers, reducing turnaround time and eliminating the need for travel agents during the search and selection phase.

**System Design**:
- **Client Interface**: Corporate customers build trips, manage passengers, submit booking requests
- **Agent Interface**: Agents review, confirm/reject requests, fulfill bookings
- **Key Concept**: Trip-centric passenger management (passengers belong to trips, NOT individual flights)

**Key Features**:
- Flight search with multi-city, one-way, and round-trip support
- Filterable and sortable flight results (price, stops, duration, carriers)
- Trip-based passenger management
- Booking request workflow with agent review
- Automated price markup system
- Agent notification system for booking review
- Invoice generation and itinerary export

## Data Consistency (CRITICAL)

**ALWAYS ENFORCE**: Agent interface uses ONLY data submitted via client interface.

- No pre-seeded or placeholder bookings in the system
- Agent dashboard shows empty state until client submits bookings
- All bookings flow: Client submits → API stores → Agent reviews
- Agent actions (confirm/reject/fulfill) reflect in real-time on client side
- Single source of truth via MockBookingClient singleton pattern

## Trip Status Rules (CRITICAL)

| Status | Description | Allowed Actions |
|--------|-------------|-----------------|
| `IN_PROGRESS` | Trip being built | Full editing (add/delete flights, manage passengers) |
| `BOOKING_REQUESTED` | Submitted for review | **LOCKED** - no trip edits, negotiation happens off-platform |
| `CONFIRMED` | Agent approved | Client can request changes via support only |
| `FULFILLED` | Complete | All documents uploaded, read-only |
| `REJECTED` | Denied | Optional rejection reason provided |

## Passenger Management (CRITICAL UX RULE)

**ALWAYS ENFORCE**: Passengers are managed ONLY at the trip level.

- Flights inherit passengers from their parent trip
- No passenger data stored on individual flights
- All passenger entry points must redirect to "Trip Overview → Passengers"
- Show message: "Passengers are managed at the trip level"

## Booking Request Validation

Before allowing `BOOKING_REQUESTED` status:
- ✅ Trip must have ≥1 passenger
- ✅ All passenger details must be complete
- ✅ Trip must have ≥1 flight

## Feature Implementation Status

### ✅ Implemented - Client Features
- Flight search with fare display
- Add flight to trip
- Remove flight from trip (via FlightSummary X button, when status allows)
- Basic trip creation
- Multi-booking sidebar for managing concurrent trips
- Booking request submission with automatic status transition to 'submitted'
- Trip locking when submitted (all edit controls disabled)
- Saved travelers CRUD at /passengers page
- "Add to Trip" from saved travelers sidebar
- Passenger management at trip level
- Validation before booking submission
- **Multi-city per-leg flight selection** - Each leg selected individually with auto-advance, combined at booking
- **Booking status display** - Client confirmation page shows real-time booking status (Pending, Confirmed, Rejected, Fulfilled)
- **Document download** - Clients can download documents (e-tickets, itinerary) when booking is fulfilled

### ✅ Implemented - Agent Features

**Task #5: Agent booking request review** [COMPLETE]
- `/agent` dashboard page at http://localhost:3000/agent
- List all bookings with filterable status tabs (All, Pending, Confirmed, Rejected, Fulfilled)
- Show booking details: route, passengers, total price, special requests
- Display booking request timestamp
- Status counts displayed on each tab

**Task #6: Confirm/reject booking requests** [COMPLETE]
- "Confirm" and "Reject" buttons with confirmation modals
- Confirm → status changes to `CONFIRMED`, optional agent notes
- Reject → status changes to `REJECTED`, optional rejection reason
- Rejection reason displayed to client on their confirmation page

**Task #7: Document upload for agents** [COMPLETE]
- Document upload modal with file type selection (Itinerary, E-Ticket, Invoice, Other)
- File validation: PDF, JPEG, PNG only, max 5MB
- Documents stored with base64 encoding (mock mode)
- Document list with show/hide toggle on booking cards
- Download and delete functionality for uploaded documents
- Only available for CONFIRMED bookings

**Task #8: Mark trip as fulfilled** [COMPLETE]
- "Mark as Fulfilled" button with confirmation modal
- Only visible when status=CONFIRMED AND at least one document uploaded
- Status changes to `FULFILLED`
- Trip becomes fully read-only for all parties
- Client can view and download all documents

## Tech Stack

**Framework & Language**:
- Next.js 15 (App Router)
- TypeScript 5.7 with strict mode enabled
- React 19 with React Compiler

**UI & Styling**:
- Chakra UI - Component library and design system
- Chakra UI defaults for all styling (no custom brand guidelines)

**Backend & Database**:
- Supabase - Authentication (email/password) and PostgreSQL database
- Supabase PostgREST for data access
- Currently mocked for development

**External APIs**:
- Duffel API - Flight search, pricing, and booking (currently mocked)

**Development & Deployment**:
- Local development initially
- Vercel for production deployment
- No email service configured yet (notifications mocked)

**Module System**: ESNext modules with Next.js conventions

## Core Design Principles

### 1. Feature-Based Architecture
- **Features** live in `src/features/` organized by domain (flights, booking, passengers)
- **Shared components** in `src/components/` for reusable UI elements
- **API routes** in `app/api/` following Next.js conventions
- **Types** colocated with features or in `src/types/` for shared types

### 2. Separation of Concerns
- **UI components** separate from **business logic**
- **API clients** abstract external service details (Duffel, Supabase)
- **Mock data** easily swappable with real API calls
- Each module has a single, well-defined responsibility

### 3. Type Safety First
- Strict TypeScript configuration (no `any` types without justification)
- Explicit types for all API responses and component props
- Use discriminated unions for state management (loading, error, success)
- Duffel API types should match their official TypeScript definitions

### 4. Progressive Enhancement
- Start with mocked data, design for real API integration
- Feature flags or environment variables to toggle mock vs real APIs
- All mock implementations should match expected real API contracts

### 5. User-Centric Design
- Prioritize speed and clarity for business travelers
- Clear error messages and loading states
- Mobile-responsive layouts using Chakra UI breakpoints

### 6. SOLID Principles
All code must adhere to SOLID principles for maintainability:

- **S - Single Responsibility**: Each component/hook handles one concern
  - Example: `useFlightSearch` only manages search state, not booking logic

- **O - Open/Closed**: New flight filters can be added without modifying core search logic
  - Example: Filter components are composable and independent

- **L - Liskov Substitution**: Mock API clients are interchangeable with real ones
  - Example: `MockDuffelClient` implements the same interface as `DuffelClient`

- **I - Interface Segregation**: Components receive only the props they need
  - Example: `FlightCard` doesn't receive full booking state, just display data

- **D - Dependency Inversion**: Features depend on abstractions
  - Example: Booking service depends on `FlightAPIClient` interface, not Duffel directly

### 7. CLEAN Code Principles
All code must follow CLEAN code practices:

- **Meaningful Names**: Variables and functions reveal intent
  - Good: `searchFlights()`, `formatFlightDuration()`, `isRoundTrip`
  - Bad: `getData()`, `process()`, `flag`

- **Small Functions**: Functions under 20 lines, extract complex logic
  - Example: `calculateTotalPrice()` delegates to `applyMarkup()`, `formatCurrency()`

- **DRY (Don't Repeat Yourself)**: Shared utilities for common operations
  - Example: `formatDate()`, `formatCurrency()` in `src/utils/`

- **Comments Explain Why, Not What**: Code should be self-documenting
  - Good: `// Duffel returns prices in cents, convert to dollars for display`
  - Bad: `// Divide by 100`

- **Consistent Formatting**: Follow Next.js and TypeScript conventions
  - Use ESLint and Prettier configurations
  - Consistent component structure

## Code Style Rules (Mandatory)

### Naming Conventions
- **Components**: `PascalCase` (e.g., `FlightCard`, `PassengerForm`)
- **Hooks**: `camelCase` with `use` prefix (e.g., `useFlightSearch`)
- **Types/Interfaces**: `PascalCase` (e.g., `Flight`, `Passenger`, `BookingRequest`)
- **Functions/Methods**: `camelCase` (e.g., `searchFlights`, `formatDuration`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `MAX_PASSENGERS`, `DEFAULT_MARKUP_PERCENT`)
- **Files**: `kebab-case` for utilities, `PascalCase` for components

### File Structure
- One component per file for major components
- Colocate tests with components: `ComponentName.test.tsx`
- Colocate styles if needed: `ComponentName.styles.ts`
- Export from index files for clean imports

### TypeScript Specifics
```typescript
// DO: Explicit types for component props
interface FlightCardProps {
  flight: Flight;
  onSelect: (flightId: string) => void;
  isSelected?: boolean;
}

// DO: Discriminated unions for async state
type FlightSearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Flight[] }
  | { status: 'error'; error: string };

// DO: Type API responses explicitly
interface DuffelFlightOffer {
  id: string;
  slices: DuffelSlice[];
  total_amount: string;
  total_currency: string;
}

// DON'T: Implicit any or loose typing
const handleFlight = (data) => { ... } // NO!
```

### React & Next.js Patterns
```typescript
// DO: Use Server Components by default
// app/flights/page.tsx
export default async function FlightsPage() {
  const flights = await getFlights();
  return <FlightList flights={flights} />;
}

// DO: Mark Client Components explicitly
'use client';
export function FlightSearchForm() { ... }

// DO: Use Chakra UI components consistently
import { Box, Button, Flex, Text } from '@chakra-ui/react';

// DON'T: Mix CSS frameworks or use raw CSS unless necessary
```

### Error Handling
```typescript
// DO: Handle loading and error states explicitly
if (state.status === 'loading') {
  return <Spinner />;
}
if (state.status === 'error') {
  return <Alert status="error">{state.error}</Alert>;
}

// DO: Validate user input before API calls
if (!origin || !destination) {
  throw new Error('Origin and destination are required');
}

// DO: Provide user-friendly error messages
catch (error) {
  setError('Unable to search flights. Please try again.');
  console.error('Flight search failed:', error);
}
```

## Folder Structure

```
viyahe-web-app/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout + Chakra provider
│   ├── page.tsx                  # Home page (search form)
│   ├── providers.tsx             # Client-side providers wrapper
│   ├── flights/
│   │   └── page.tsx              # Flight search results
│   ├── booking/
│   │   ├── page.tsx              # Passenger info form
│   │   └── confirmation/
│   │       └── page.tsx          # Booking confirmation
│   └── api/                      # API routes
│       ├── flights/
│       │   └── search/route.ts   # Flight search endpoint
│       └── bookings/
│           └── route.ts          # Booking submission endpoint
├── src/
│   ├── components/               # Shared UI components
│   │   ├── layout/
│   │   │   └── Header.tsx
│   │   ├── flights/
│   │   │   ├── SearchForm.tsx
│   │   │   ├── FlightCard.tsx
│   │   │   ├── FlightList.tsx
│   │   │   ├── FlightFilters.tsx
│   │   │   └── FlightSort.tsx
│   │   ├── booking/
│   │   │   └── PassengerForm.tsx
│   │   └── ui/
│   │       └── LoadingSpinner.tsx
│   ├── lib/                      # External service clients
│   │   ├── duffel/
│   │   │   ├── client.ts         # Duffel API client interface
│   │   │   ├── mock.ts           # Mock implementation
│   │   │   └── types.ts          # Duffel-specific types
│   │   └── supabase/
│   │       ├── client.ts         # Supabase client
│   │       └── mock.ts           # Mock implementation
│   ├── types/                    # Shared type definitions
│   │   ├── flight.ts
│   │   ├── passenger.ts
│   │   └── booking.ts
│   ├── utils/                    # Utility functions
│   │   ├── format.ts             # Date, currency, duration formatting
│   │   ├── pricing.ts            # Markup calculations
│   │   └── validation.ts         # Input validation
│   ├── hooks/                    # Custom React hooks
│   │   ├── useFlightSearch.ts
│   │   └── useBooking.ts
│   └── mocks/                    # Mock data for development
│       ├── flights.ts
│       └── airports.ts
├── public/                       # Static assets
├── .env.local                    # Environment variables (gitignored)
├── .env.example                  # Example environment variables
├── package.json
├── tsconfig.json
├── next.config.ts
└── CLAUDE.md                     # This file
```

## Rules

### Environment & Configuration
1. **NEVER commit `.env.local` files** - Keep API keys out of version control
2. **Required environment variables** (for production):
   - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
   - `DUFFEL_API_TOKEN` - Duffel API access token
   - `DUFFEL_ENV` - `test` or `live`
3. **Use mock mode by default** - Set `USE_MOCK_DATA=true` for development
4. **No hardcoded credentials** anywhere in the codebase

### UI/UX Patterns
1. **No full page reloads for list interactions** - Pagination, sorting, and filtering must update results client-side without reloading the entire page
2. **Preserve scroll position** when applying filters or changing sort order
3. **Show loading indicators** for async operations (spinners, skeletons) without blocking the entire UI
4. **Maintain form state** - Don't clear search form when viewing results or navigating back
5. **Instant feedback** - UI should respond immediately to user actions, even if data is still loading

### Flight Search & Display
1. **Support all trip types**: one-way, round-trip, multi-city
2. **Required search params**: origin, destination, dates, passenger count
3. **Filter options**: price, stops, duration, carriers
4. **Sort options**: best value, departure time, duration, price
5. **Display fare rules** before booking confirmation

### Booking Flow
1. **Collect passenger info**: name, email, phone, passport (for international)
2. **Discount code field**: Optional input, not validated in our system
3. **Special requests**: Free-form text field for agent review
4. **Confirmation page**: Display booking summary and next steps

### Pricing & Markup
1. **Auto-apply markup** to all Duffel prices (configurable percentage)
2. **Display final price** to user (after markup)
3. **Store original and marked-up prices** in booking records
4. **Currency handling**: Use Duffel's currency, format appropriately

### Agent Notification System
1. **Agents don't access the app** - They receive notifications only
2. **Notification contains**: Booking details as JSON for initial implementation
3. **Display JSON on confirmation page** with note about agent notification
4. **Future**: Email/webhook integration for actual notifications

### Authentication
1. **Supabase email/password** authentication
2. **Single user role** - No distinction between coordinators and travelers
3. **Multi-tenancy aware** - Users belong to organizations (billing external)
4. **Protect booking routes** - Require authentication for booking submission

### Database Operations
1. **Use Supabase client** for all database operations
2. **Mock database** for development until Supabase is configured
3. **Store bookings** with: flight details, passenger info, pricing, status
4. **No invoice generation** in app - Handled externally

### Git & Version Control
1. **Commit messages** should be clear and describe the change
2. **DO NOT include** "Generated with Claude Code" or "Co-Authored-By: Claude" in commits
3. **Keep commits focused** - One logical change per commit
4. **No sensitive data** in commit history

## Testing Standards

### Test Organization
- **Unit tests**: Colocate with components/functions
- **Integration tests**: `__tests__/` directories
- **Test file naming**: `*.test.ts` or `*.test.tsx`

### Testing Requirements
```typescript
// DO: Test utility functions thoroughly
describe('formatFlightDuration', () => {
  it('formats hours and minutes correctly', () => {
    expect(formatFlightDuration(150)).toBe('2h 30m');
  });

  it('handles exact hours', () => {
    expect(formatFlightDuration(120)).toBe('2h 0m');
  });
});

// DO: Test component rendering and interactions
describe('FlightCard', () => {
  it('displays flight information correctly', () => {
    render(<FlightCard flight={mockFlight} onSelect={jest.fn()} />);
    expect(screen.getByText('JFK → LAX')).toBeInTheDocument();
  });
});
```

### Coverage Expectations
- **Utility functions**: 100% coverage
- **Components**: Test rendering and key interactions
- **Hooks**: Test state transitions
- **Overall target**: 70%+ coverage

## Architectural Rules

### Dependency Flow
```
app/ (pages/routes) → src/components/ → src/features/
                                      ↓
                                src/lib/ (API clients)
                                      ↓
                                src/types/ (shared types)
```

**Rules**:
- Components depend on types and utilities, not API clients directly
- Features encapsulate business logic and can use API clients
- API clients are the only layer that communicates with external services
- No circular dependencies allowed

### Adding New Features

**Before adding any feature**:
1. Determine if it's MVP or post-MVP
2. Check if existing patterns can be reused
3. Define types/interfaces first
4. Implement with mock data before real API integration
5. Add appropriate tests

**Example flow for adding seat selection** (post-MVP):
1. Define `SeatSelection` types in `src/types/`
2. Create mock seat data in `src/mocks/`
3. Build `SeatSelector` component
4. Add to booking flow with feature flag
5. Implement Duffel seat API integration when ready

## Claude Interaction Rules

### When Reviewing Code
- **Point out violations** of the rules in this document
- **Suggest alternatives** that align with project principles
- **Warn about security issues** (XSS, injection, exposed credentials)
- **Check for accessibility** in UI components

### When Writing Code
- **Always read existing files** before suggesting modifications
- **Follow established patterns** in the codebase
- **Prefer editing over creating** - Don't create new files unnecessarily
- **Use Chakra UI components** - Don't introduce other UI libraries
- **Mock-first development** - Ensure mock implementations exist

### When Answering Questions
- **Reference specific files and line numbers** (e.g., `src/lib/duffel/client.ts:45`)
- **Cite actual code examples** from the project
- **Explain domain concepts** using project terminology

### What to Warn About
- **Critical warnings** (always flag these):
- API credentials in code or commits
- Missing authentication checks on protected routes
- Unvalidated user input
- Missing error handling in async operations
- Direct DOM manipulation instead of React patterns

- **Style warnings** (mention if noticed):
- Missing TypeScript types
- Inconsistent component patterns
- Missing loading/error states
- Accessibility issues (missing alt text, labels)

### What NOT to Do
- Don't create documentation files unless explicitly requested
- Don't add emojis to code or comments unless requested
- Don't refactor working code unless asked or fixing a bug
- Don't add features beyond MVP scope without confirmation
- Don't introduce new dependencies without justification
- Don't use CSS frameworks other than Chakra UI

## Non-Negotiable Requirements

These rules **MUST NEVER** be violated without explicit user approval:

### 1. Mock-First Development
```typescript
// ALWAYS have mock implementation available
const flightClient = process.env.USE_MOCK_DATA === 'true'
  ? new MockDuffelClient()
  : new DuffelClient(process.env.DUFFEL_API_TOKEN);
```

### 2. Type Safety
```typescript
// NEVER use any without justification
const flight: any = response.data; // NO!

// ALWAYS type API responses
const flight: DuffelFlightOffer = response.data;
```

### 3. Authentication Protection
```typescript
// NEVER allow unauthenticated booking submissions
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  // ... process booking
}
```

### 4. Secure Input Handling
```typescript
// NEVER trust user input directly
const searchParams = validateSearchParams(request.body);
if (!searchParams.valid) {
  return new Response(searchParams.error, { status: 400 });
}
```

### 5. Consistent UI Framework
```typescript
// NEVER mix UI frameworks
import { Button } from '@chakra-ui/react'; // YES
import { Button } from '@mui/material'; // NO!
```

## MVP Scope Checklist

**Must-Have (MVP)**:
- [ ] Flight search (one-way, round-trip, multi-city)
- [ ] Search filters (price, stops, duration, carriers)
- [ ] Search sorting (best value, departure, duration)
- [ ] Passenger information capture
- [ ] Discount code input field
- [ ] Special requests text field
- [ ] Booking request submission
- [ ] JSON notification display (for agent)
- [ ] Booking confirmation page
- [ ] Basic Supabase authentication

**Nice-to-Have (Post-MVP)**:
- [ ] Seat selection upsell
- [ ] Baggage selection upsell
- [ ] Expense integration
- [ ] Reporting dashboard
- [ ] Passenger profile autofill
- [ ] Email notifications
- [ ] Agent queue system

## Future Direction

**Planned Enhancements** (in priority order):
1. Email notification system for agents
2. Passenger profiles for autofill
3. Seat and baggage upsells
4. Reporting dashboard
5. Expense integration
6. Agent queue and assignment system

**Technical Debt to Address**:
- Replace mock data with real Supabase integration
- Replace mock Duffel client with real API
- Implement proper email service
- Add comprehensive E2E tests
- Performance optimization for flight search

---

## Final Instructions

**Claude, you must always:**

1. **Respect this document as the single source of truth** for all development decisions in this project

2. **Follow project rules unless explicitly asked to revise them** - If a user requests something that violates these rules, politely explain the conflict and suggest alternatives

3. **Notice when the human violates rules and warn them politely**:
   - "I notice this would add a dependency outside our stack. According to CLAUDE.md, we should use Chakra UI. Would you like me to implement it with Chakra instead?"
   - "This route doesn't check authentication. The guidelines require protecting booking routes. Should I add the auth check?"

4. **Prioritize MVP features** - Always confirm before implementing post-MVP features

5. **Mock-first development** - Ensure all features work with mocked data before real integration

6. **When in doubt, ask before proceeding** - It's better to clarify than to make assumptions

**Remember**: This app serves business travelers who value speed and reliability. Keep the UI clean, the code maintainable, and the booking flow frictionless.
