import type {
  FlightOffer,
  FlightSlice,
  FlightSegment,
  FlightSearchParams,
  CabinClass,
  Price,
} from '@/types/flight';
import { getAirport, AIRPORT_MAP } from './airports';
import { getAirline, AIRLINES } from './airlines';
import { formatCurrency } from '@/utils/format';
import { applyMarkup } from '@/utils/pricing';

/**
 * Generate a unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Generate a random flight number
 */
function generateFlightNumber(airlineCode: string): string {
  const num = Math.floor(Math.random() * 9000) + 100;
  return `${airlineCode}${num}`;
}

/**
 * Generate a random price in cents based on route and class
 */
function generateBasePrice(
  origin: string,
  destination: string,
  cabinClass: CabinClass,
  stops: number
): number {
  // Base price influenced by "distance" (simplified)
  const domestic = ['JFK', 'LAX', 'ORD', 'DFW', 'DEN', 'SFO', 'SEA', 'ATL', 'MIA', 'BOS'];
  const isDomestic = domestic.includes(origin) && domestic.includes(destination);

  let basePrice = isDomestic ? 15000 : 45000; // $150 or $450 base

  // Cabin class multipliers
  const classMultipliers: Record<CabinClass, number> = {
    economy: 1,
    premium_economy: 1.8,
    business: 3.5,
    first: 6,
  };

  basePrice *= classMultipliers[cabinClass];

  // Direct flights cost more
  if (stops === 0) {
    basePrice *= 1.2;
  }

  // Add some randomness (±30%)
  const variation = 0.7 + Math.random() * 0.6;
  basePrice *= variation;

  return Math.round(basePrice);
}

/**
 * Generate a departure time
 */
function generateDepartureTime(date: string, index: number): string {
  // Spread flights throughout the day
  const hour = 6 + Math.floor((index * 3) % 18);
  const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
  return `${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
}

/**
 * Calculate arrival time based on departure and duration
 */
function calculateArrivalTime(departureTime: string, durationMinutes: number): string {
  const departure = new Date(departureTime);
  departure.setMinutes(departure.getMinutes() + durationMinutes);
  return departure.toISOString().slice(0, 19);
}

/**
 * Generate flight duration in minutes (simplified)
 */
function generateDuration(origin: string, destination: string, stops: number): number {
  // Simplified duration estimation
  const domestic = ['JFK', 'LAX', 'ORD', 'DFW', 'DEN', 'SFO', 'SEA', 'ATL', 'MIA', 'BOS'];
  const isDomestic = domestic.includes(origin) && domestic.includes(destination);

  let baseDuration = isDomestic ? 180 : 480; // 3 hours or 8 hours base

  // Coast to coast is longer
  if (
    (origin === 'JFK' && destination === 'LAX') ||
    (origin === 'LAX' && destination === 'JFK')
  ) {
    baseDuration = 330; // ~5.5 hours
  }

  // Add time for stops
  baseDuration += stops * 90; // 1.5 hours per stop

  // Add some variation
  baseDuration += Math.floor(Math.random() * 60) - 30;

  return Math.max(60, baseDuration);
}

/**
 * Create a Price object
 */
function createPrice(cents: number, currency: string = 'USD'): Price {
  return {
    amount: cents,
    currency,
    displayAmount: formatCurrency(cents, currency),
  };
}

/**
 * Generate a flight segment
 */
function generateSegment(
  origin: string,
  destination: string,
  departureTime: string,
  cabinClass: CabinClass
): FlightSegment {
  const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
  const duration = generateDuration(origin, destination, 0);
  const arrivalTime = calculateArrivalTime(departureTime, duration);

  return {
    id: generateId(),
    origin: getAirport(origin) || AIRPORT_MAP['JFK'],
    destination: getAirport(destination) || AIRPORT_MAP['LAX'],
    departureTime,
    arrivalTime,
    duration,
    flightNumber: generateFlightNumber(airline.iataCode),
    airline,
    aircraft: ['Boeing 737', 'Boeing 777', 'Airbus A320', 'Airbus A350'][
      Math.floor(Math.random() * 4)
    ],
    cabinClass,
  };
}

/**
 * Generate a flight slice (one direction of journey)
 */
function generateSlice(
  origin: string,
  destination: string,
  date: string,
  cabinClass: CabinClass,
  stops: number,
  flightIndex: number
): FlightSlice {
  const departureTime = generateDepartureTime(date, flightIndex);
  const segments: FlightSegment[] = [];

  if (stops === 0) {
    // Direct flight
    segments.push(generateSegment(origin, destination, departureTime, cabinClass));
  } else {
    // Flight with connection(s)
    const connectionAirports = ['ORD', 'DFW', 'ATL', 'DEN'].filter(
      (a) => a !== origin && a !== destination
    );
    const connection = connectionAirports[Math.floor(Math.random() * connectionAirports.length)];

    // First segment
    const firstSegment = generateSegment(origin, connection, departureTime, cabinClass);
    segments.push(firstSegment);

    // Layover time (1-3 hours)
    const layoverMinutes = 60 + Math.floor(Math.random() * 120);
    const connectionDepartureTime = calculateArrivalTime(
      firstSegment.arrivalTime,
      layoverMinutes
    );

    // Second segment
    segments.push(generateSegment(connection, destination, connectionDepartureTime, cabinClass));
  }

  const totalDuration = segments.reduce((acc, seg) => acc + seg.duration, 0);
  // Add layover time to total duration
  const layoverTime = stops > 0 ? 90 * stops : 0;

  return {
    id: generateId(),
    origin: getAirport(origin) || AIRPORT_MAP['JFK'],
    destination: getAirport(destination) || AIRPORT_MAP['LAX'],
    departureTime: segments[0].departureTime,
    arrivalTime: segments[segments.length - 1].arrivalTime,
    duration: totalDuration + layoverTime,
    segments,
    stops,
  };
}

/**
 * Generate mock flight offers based on search parameters
 */
export function generateMockFlights(params: FlightSearchParams): FlightOffer[] {
  const { origin, destination, departureDate, returnDate, passengers, cabinClass, tripType } =
    params;

  const offers: FlightOffer[] = [];
  const numOffers = 8 + Math.floor(Math.random() * 8); // 8-15 offers

  for (let i = 0; i < numOffers; i++) {
    const stops = [0, 0, 0, 1, 1, 2][Math.floor(Math.random() * 6)]; // More direct flights
    const slices: FlightSlice[] = [];

    // Outbound flight
    slices.push(generateSlice(origin, destination, departureDate, cabinClass, stops, i));

    // Return flight for round trip
    if (tripType === 'round_trip' && returnDate) {
      const returnStops = [0, 0, 1, 1][Math.floor(Math.random() * 4)];
      slices.push(
        generateSlice(destination, origin, returnDate, cabinClass, returnStops, i + 10)
      );
    }

    // Calculate pricing
    const basePricePerPax = generateBasePrice(origin, destination, cabinClass, stops);
    const totalBase = basePricePerPax * passengers * slices.length;
    const taxes = Math.round(totalBase * 0.15); // 15% taxes
    const total = totalBase + taxes;
    const withMarkup = applyMarkup(total);

    // Fare rules
    const fareRules = [
      'Non-refundable ticket',
      'Changes allowed with fee',
      'Seat selection available at check-in',
    ];
    if (cabinClass !== 'economy') {
      fareRules.push('Priority boarding included');
      fareRules.push('Lounge access included');
    }
    if (Math.random() > 0.7) {
      fareRules[0] = 'Fully refundable within 24 hours';
    }

    const offer: FlightOffer = {
      id: generateId(),
      slices,
      totalPrice: createPrice(total),
      basePrice: createPrice(totalBase),
      taxesAndFees: createPrice(taxes),
      priceWithMarkup: createPrice(withMarkup),
      passengers,
      cabinClass,
      refundable: Math.random() > 0.7,
      fareRules,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins from now
    };

    offers.push(offer);
  }

  // Sort by price (default)
  return offers.sort((a, b) => a.priceWithMarkup.amount - b.priceWithMarkup.amount);
}
