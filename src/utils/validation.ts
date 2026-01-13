import { z } from 'zod';
import type { FlightSearchParams, TripType, CabinClass } from '@/types/flight';
import type { PassengerFormData } from '@/types/passenger';

/**
 * Validation schema for flight search parameters
 */
export const flightSearchSchema = z.object({
  tripType: z.enum(['one_way', 'round_trip', 'multi_city'] as const),
  origin: z
    .string()
    .length(3, 'Origin must be a 3-letter airport code')
    .toUpperCase(),
  destination: z
    .string()
    .length(3, 'Destination must be a 3-letter airport code')
    .toUpperCase(),
  departureDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .optional(),
  passengers: z
    .number()
    .int()
    .min(1, 'At least 1 passenger required')
    .max(9, 'Maximum 9 passengers'),
  cabinClass: z.enum(['economy', 'premium_economy', 'business', 'first'] as const),
  additionalLegs: z
    .array(
      z.object({
        origin: z.string().length(3).toUpperCase(),
        destination: z.string().length(3).toUpperCase(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
    )
    .optional(),
}).refine(
  (data) => {
    // Return date required for round trip
    if (data.tripType === 'round_trip' && !data.returnDate) {
      return false;
    }
    return true;
  },
  { message: 'Return date is required for round-trip flights' }
).refine(
  (data) => {
    // Origin and destination must be different
    return data.origin !== data.destination;
  },
  { message: 'Origin and destination must be different' }
);

/**
 * Validate flight search parameters
 */
export function validateSearchParams(params: unknown): {
  valid: boolean;
  data?: FlightSearchParams;
  error?: string;
} {
  const result = flightSearchSchema.safeParse(params);

  if (result.success) {
    return { valid: true, data: result.data as FlightSearchParams };
  }

  const firstError = result.error.issues[0];
  return { valid: false, error: firstError?.message || 'Invalid search parameters' };
}

/**
 * Validation schema for passenger form
 */
export const passengerFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  middleName: z.string().max(50).optional(),
  dateOfBirth: z.string()
    .min(1, 'Date of birth is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please select month, day, and year'),
  gender: z.enum(['male', 'female', 'other'] as const),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  nationality: z.string().refine((val) => val === '' || val.length === 2, 'Invalid country code').optional(),
  documentType: z.enum(['passport', 'national_id', 'drivers_license'] as const).optional(),
  documentNumber: z.string().optional(),
  documentIssuingCountry: z.string().optional(),
  documentExpiryDate: z.string().optional(),
}).refine(
  (data) => {
    // If document type is provided, document number is required
    if (data.documentType && !data.documentNumber) {
      return false;
    }
    return true;
  },
  { message: 'Document number is required when document type is specified' }
);

/**
 * Validate passenger form data
 */
export function validatePassengerForm(data: PassengerFormData): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const result = passengerFormSchema.safeParse(data);

  if (result.success) {
    return { valid: true, errors: {} };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return { valid: false, errors };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  // Allow digits, spaces, dashes, parentheses, and plus sign
  const phoneRegex = /^[\d\s\-()+ ]{10,20}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate IATA airport code
 */
export function isValidAirportCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code.toUpperCase());
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

/**
 * Check if return date is after departure date
 */
export function isReturnAfterDeparture(departure: string, returnDate: string): boolean {
  return new Date(returnDate) > new Date(departure);
}
