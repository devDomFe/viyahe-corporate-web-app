import type { Airport } from '@/types/flight';

/**
 * Mock airport data for development
 */
export const AIRPORTS: Airport[] = [
  // United States
  { iataCode: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'United States' },
  { iataCode: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'United States' },
  { iataCode: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'United States' },
  { iataCode: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'United States' },
  { iataCode: 'DEN', name: 'Denver International', city: 'Denver', country: 'United States' },
  { iataCode: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'United States' },
  { iataCode: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'United States' },
  { iataCode: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'United States' },
  { iataCode: 'MIA', name: 'Miami International', city: 'Miami', country: 'United States' },
  { iataCode: 'BOS', name: 'Boston Logan International', city: 'Boston', country: 'United States' },
  { iataCode: 'LAS', name: 'Harry Reid International', city: 'Las Vegas', country: 'United States' },
  { iataCode: 'PHX', name: 'Phoenix Sky Harbor International', city: 'Phoenix', country: 'United States' },

  // Europe
  { iataCode: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom' },
  { iataCode: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
  { iataCode: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
  { iataCode: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { iataCode: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain' },
  { iataCode: 'FCO', name: 'Leonardo da Vinci International', city: 'Rome', country: 'Italy' },

  // Asia
  { iataCode: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan' },
  { iataCode: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan' },
  { iataCode: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea' },
  { iataCode: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore' },
  { iataCode: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'China' },
  { iataCode: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
  { iataCode: 'MNL', name: 'Ninoy Aquino International', city: 'Manila', country: 'Philippines' },

  // Middle East
  { iataCode: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'United Arab Emirates' },
  { iataCode: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar' },

  // Australia
  { iataCode: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia' },
  { iataCode: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia' },

  // Canada
  { iataCode: 'YYZ', name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada' },
  { iataCode: 'YVR', name: 'Vancouver International', city: 'Vancouver', country: 'Canada' },
];

/**
 * Map of airport codes to Airport objects for quick lookup
 */
export const AIRPORT_MAP: Record<string, Airport> = AIRPORTS.reduce(
  (acc, airport) => {
    acc[airport.iataCode] = airport;
    return acc;
  },
  {} as Record<string, Airport>
);

/**
 * Get airport by IATA code
 */
export function getAirport(code: string): Airport | undefined {
  return AIRPORT_MAP[code.toUpperCase()];
}

/**
 * Search airports by query (code, name, or city)
 */
export function searchAirports(query: string): Airport[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  return AIRPORTS.filter(
    (airport) =>
      airport.iataCode.toLowerCase().includes(q) ||
      airport.name.toLowerCase().includes(q) ||
      airport.city.toLowerCase().includes(q)
  ).slice(0, 10); // Limit results
}
