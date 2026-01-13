import type { Airline } from '@/types/flight';

/**
 * Mock airline data for development
 */
export const AIRLINES: Airline[] = [
  { iataCode: 'AA', name: 'American Airlines' },
  { iataCode: 'DL', name: 'Delta Air Lines' },
  { iataCode: 'UA', name: 'United Airlines' },
  { iataCode: 'WN', name: 'Southwest Airlines' },
  { iataCode: 'B6', name: 'JetBlue Airways' },
  { iataCode: 'AS', name: 'Alaska Airlines' },
  { iataCode: 'NK', name: 'Spirit Airlines' },
  { iataCode: 'F9', name: 'Frontier Airlines' },
  { iataCode: 'BA', name: 'British Airways' },
  { iataCode: 'LH', name: 'Lufthansa' },
  { iataCode: 'AF', name: 'Air France' },
  { iataCode: 'KL', name: 'KLM Royal Dutch Airlines' },
  { iataCode: 'EK', name: 'Emirates' },
  { iataCode: 'QR', name: 'Qatar Airways' },
  { iataCode: 'SQ', name: 'Singapore Airlines' },
  { iataCode: 'CX', name: 'Cathay Pacific' },
  { iataCode: 'JL', name: 'Japan Airlines' },
  { iataCode: 'NH', name: 'All Nippon Airways' },
  { iataCode: 'QF', name: 'Qantas' },
  { iataCode: 'AC', name: 'Air Canada' },
  { iataCode: 'PR', name: 'Philippine Airlines' },
];

/**
 * Map of airline codes to Airline objects
 */
export const AIRLINE_MAP: Record<string, Airline> = AIRLINES.reduce(
  (acc, airline) => {
    acc[airline.iataCode] = airline;
    return acc;
  },
  {} as Record<string, Airline>
);

/**
 * Get airline by IATA code
 */
export function getAirline(code: string): Airline | undefined {
  return AIRLINE_MAP[code.toUpperCase()];
}
