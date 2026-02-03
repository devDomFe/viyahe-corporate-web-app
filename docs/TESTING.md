# Testing

## Test Organization

### Unit Tests
- Colocated with components/functions
- File naming: `*.test.ts` or `*.test.tsx`

### Integration Tests
- Located in `__tests__/` directories
- Test component interactions and API integrations

## Running Tests

```bash
# Run all tests
nix-shell --run "npm test"

# Run tests in watch mode
nix-shell --run "npm test -- --watch"

# Run tests with coverage
nix-shell --run "npm test -- --coverage"
```

## Coverage Expectations

- **Utility functions**: 100% coverage
- **Components**: Test rendering and key interactions
- **Hooks**: Test state transitions
- **Overall target**: 70%+ coverage

## Test Patterns

### Utility Functions
```typescript
describe('formatFlightDuration', () => {
  it('formats hours and minutes correctly', () => {
    expect(formatFlightDuration(150)).toBe('2h 30m');
  });

  it('handles exact hours', () => {
    expect(formatFlightDuration(120)).toBe('2h 0m');
  });
});
```

### Components
```typescript
describe('FlightCard', () => {
  it('displays flight information correctly', () => {
    render(<FlightCard flight={mockFlight} onSelect={jest.fn()} />);
    expect(screen.getByText('JFK → LAX')).toBeInTheDocument();
  });
});
```

## Verification Steps

### Before Committing
1. Run `npm test` to ensure all tests pass
2. Check test coverage meets targets
3. Verify no console errors in test output

### Manual Testing
1. Start dev server: `npm run dev`
2. Navigate to http://localhost:3000
3. Test flight search with various inputs
4. Complete a full booking flow
5. Verify confirmation page displays correctly

## Agent Feature Testing

### Prerequisites
**Important**: The agent dashboard only shows bookings submitted via the client interface. Before testing agent features, you must first submit at least one booking through the client flow.

### Create Test Booking (Required First)
1. Navigate to http://localhost:3000
2. Search for a flight (e.g., JFK to LAX)
3. Select a flight from results
4. Add passenger details
5. Submit booking request
6. Verify confirmation page shows "Pending Review" status

### Agent Dashboard
1. Navigate to http://localhost:3000/agent
2. Verify dashboard shows the booking you just submitted
3. **Note**: If no bookings appear, you need to submit one via the client first
4. Test status filter tabs (All, Pending, Confirmed, Rejected, Fulfilled)
5. Verify status counts update correctly
6. Test "Back to Client View" navigation

### Confirm Booking Flow
1. Find a booking with status "Pending"
2. Click "Confirm" button
3. Optionally enter agent notes
4. Click "Confirm Booking"
5. Verify status changes to "Confirmed"
6. Verify booking list refreshes

### Reject Booking Flow
1. Find a booking with status "Pending"
2. Click "Reject" button
3. Enter rejection reason (optional but recommended)
4. Click "Reject Booking"
5. Verify status changes to "Rejected"
6. Verify rejection reason appears on booking card
7. Navigate to client confirmation page and verify rejection message

### Document Upload Flow
1. Find a booking with status "Confirmed"
2. Click "Upload Document" button
3. Select document type (Itinerary, E-Ticket, etc.)
4. Click file picker or drag file (PDF, JPEG, or PNG, max 5MB)
5. Click "Upload"
6. Verify document appears in list
7. Test "Show/Hide" toggle for documents
8. Test document download
9. Test document delete

### Mark as Fulfilled Flow
1. Find a confirmed booking with at least one document
2. Verify "Mark as Fulfilled" button is visible
3. Click button to open confirmation modal
4. Review fulfillment summary
5. Click "Confirm Fulfillment"
6. Verify status changes to "Fulfilled"
7. Verify no more action buttons visible
8. Navigate to client confirmation page
9. Verify client can see and download documents

### Client Status Tracking
1. Submit a new booking from client interface
2. Navigate to confirmation page
3. Verify status shows "Pending Review"
4. In separate tab, go to agent dashboard
5. Confirm the booking
6. Return to client confirmation page
7. Wait for poll or refresh
8. Verify status updates to "Confirmed"

### Error Handling
1. Try to fulfill booking without documents (should fail)
2. Try to upload file > 5MB (should show error)
3. Try to upload non-PDF/JPEG/PNG file (should show error)
4. Try invalid status transitions (should fail)
