/**
 * Trip type for flight search
 */
export type TripType = 'one_way' | 'round_trip' | 'multi_city';

/**
 * Cabin class for flight booking
 */
export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

/**
 * Airport information
 */
export interface Airport {
  iataCode: string;
  name: string;
  city: string;
  country: string;
}

/**
 * Flight segment - a single flight between two airports
 */
export interface FlightSegment {
  id: string;
  origin: Airport;
  destination: Airport;
  departureTime: string; // ISO 8601
  arrivalTime: string; // ISO 8601
  duration: number; // minutes
  flightNumber: string;
  airline: Airline;
  aircraft: string;
  cabinClass: CabinClass;
}

/**
 * Flight slice - one leg of a journey (may have multiple segments with connections)
 */
export interface FlightSlice {
  id: string;
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: number; // total minutes including layovers
  segments: FlightSegment[];
  stops: number;
}

/**
 * Airline information
 */
export interface Airline {
  iataCode: string;
  name: string;
  logoUrl?: string;
}

/**
 * Price information
 */
export interface Price {
  amount: number; // in smallest currency unit (cents)
  currency: string; // ISO 4217 code
  displayAmount: string; // formatted for display (e.g., "$123.45")
}

/**
 * Flight offer - a complete flight option with pricing
 */
export interface FlightOffer {
  id: string;
  slices: FlightSlice[];
  totalPrice: Price;
  basePrice: Price;
  taxesAndFees: Price;
  priceWithMarkup: Price; // price after our markup is applied
  passengers: number;
  cabinClass: CabinClass;
  refundable: boolean;
  fareRules: string[];
  expiresAt: string; // ISO 8601
}

/**
 * Search parameters for flight search
 */
export interface FlightSearchParams {
  tripType: TripType;
  origin: string; // IATA code
  destination: string; // IATA code
  departureDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD (for round trip)
  passengers: number;
  cabinClass: CabinClass;
  // Multi-city specific
  additionalLegs?: Array<{
    origin: string;
    destination: string;
    date: string;
  }>;
}

/**
 * Flight search state for UI
 */
export type FlightSearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: FlightOffer[]; totalResults: number }
  | { status: 'error'; error: string };

/**
 * Filter options for flight results
 */
export interface FlightFilters {
  maxPrice?: number;
  maxStops?: number; // -1 for any, 0 for direct only, 1 for max 1 stop, etc.
  airlines?: string[]; // IATA codes
  departureTimeRange?: {
    start: string; // HH:MM
    end: string; // HH:MM
  };
  maxDuration?: number; // minutes
}

/**
 * Sort options for flight results
 */
export type FlightSortOption =
  | 'best_value'
  | 'price_low'
  | 'price_high'
  | 'duration_short'
  | 'duration_long'
  | 'departure_early'
  | 'departure_late';
