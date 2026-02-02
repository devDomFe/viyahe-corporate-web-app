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
1. Start dev server: `docker compose up --build`
2. Navigate to http://localhost:5178
3. Test flight search with various inputs
4. Complete a full booking flow
5. Verify confirmation page displays correctly
