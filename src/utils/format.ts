import { format, parseISO } from 'date-fns';

/**
 * Format a duration in minutes to a human-readable string
 * @param minutes - Duration in minutes
 * @returns Formatted string like "2h 30m"
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  return `${hours}h ${mins}m`;
}

/**
 * Format a price in cents to a display string
 * @param cents - Amount in cents
 * @param currency - ISO 4217 currency code
 * @returns Formatted string like "$123.45"
 */
export function formatCurrency(cents: number, currency: string = 'USD'): string {
  const amount = cents / 100;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string for display
 * @param isoDate - ISO 8601 date string
 * @param formatStr - date-fns format string
 * @returns Formatted date string
 */
export function formatDate(isoDate: string, formatStr: string = 'MMM d, yyyy'): string {
  return format(parseISO(isoDate), formatStr);
}

/**
 * Format a time string for display
 * @param isoDateTime - ISO 8601 datetime string
 * @returns Formatted time like "2:30 PM"
 */
export function formatTime(isoDateTime: string): string {
  return format(parseISO(isoDateTime), 'h:mm a');
}

/**
 * Format a datetime for display with both date and time
 * @param isoDateTime - ISO 8601 datetime string
 * @returns Formatted string like "Jan 15, 2024 at 2:30 PM"
 */
export function formatDateTime(isoDateTime: string): string {
  return format(parseISO(isoDateTime), "MMM d, yyyy 'at' h:mm a");
}

/**
 * Format flight route for display
 * @param origin - Origin airport IATA code
 * @param destination - Destination airport IATA code
 * @returns Formatted string like "JFK → LAX"
 */
export function formatRoute(origin: string, destination: string): string {
  return `${origin} → ${destination}`;
}

/**
 * Format number of stops for display
 * @param stops - Number of stops
 * @returns Formatted string like "Direct", "1 stop", "2 stops"
 */
export function formatStops(stops: number): string {
  if (stops === 0) {
    return 'Direct';
  }
  if (stops === 1) {
    return '1 stop';
  }
  return `${stops} stops`;
}

/**
 * Format passenger count for display
 * @param count - Number of passengers
 * @returns Formatted string like "1 passenger", "2 passengers"
 */
export function formatPassengers(count: number): string {
  if (count === 1) {
    return '1 passenger';
  }
  return `${count} passengers`;
}

/**
 * Format cabin class for display
 * @param cabinClass - Cabin class code
 * @returns Formatted string like "Economy", "Business"
 */
export function formatCabinClass(cabinClass: string): string {
  const labels: Record<string, string> = {
    economy: 'Economy',
    premium_economy: 'Premium Economy',
    business: 'Business',
    first: 'First Class',
  };
  return labels[cabinClass] || cabinClass;
}
