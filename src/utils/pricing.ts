import type { Price } from '@/types/flight';
import { formatCurrency } from './format';

/**
 * Default markup percentage if not specified in environment
 */
const DEFAULT_MARKUP_PERCENT = 10;

/**
 * Get the configured markup percentage
 * @returns Markup percentage (e.g., 10 for 10%)
 */
export function getMarkupPercent(): number {
  const envMarkup = process.env.DEFAULT_MARKUP_PERCENT;
  if (envMarkup) {
    const parsed = parseFloat(envMarkup);
    if (!isNaN(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return DEFAULT_MARKUP_PERCENT;
}

/**
 * Apply markup to a price
 * @param priceInCents - Original price in cents
 * @param markupPercent - Markup percentage (defaults to configured value)
 * @returns Price in cents after markup
 */
export function applyMarkup(priceInCents: number, markupPercent?: number): number {
  const percent = markupPercent ?? getMarkupPercent();
  const markup = Math.round(priceInCents * (percent / 100));
  return priceInCents + markup;
}

/**
 * Calculate markup amount
 * @param priceInCents - Original price in cents
 * @param markupPercent - Markup percentage (defaults to configured value)
 * @returns Markup amount in cents
 */
export function calculateMarkup(priceInCents: number, markupPercent?: number): number {
  const percent = markupPercent ?? getMarkupPercent();
  return Math.round(priceInCents * (percent / 100));
}

/**
 * Create a Price object with markup applied
 * @param amountInCents - Original amount in cents
 * @param currency - Currency code
 * @param markupPercent - Optional markup percentage
 * @returns Price object with original and marked-up prices
 */
export function createPriceWithMarkup(
  amountInCents: number,
  currency: string,
  markupPercent?: number
): { originalPrice: Price; priceWithMarkup: Price } {
  const markedUpAmount = applyMarkup(amountInCents, markupPercent);

  return {
    originalPrice: {
      amount: amountInCents,
      currency,
      displayAmount: formatCurrency(amountInCents, currency),
    },
    priceWithMarkup: {
      amount: markedUpAmount,
      currency,
      displayAmount: formatCurrency(markedUpAmount, currency),
    },
  };
}

/**
 * Calculate total price for multiple passengers
 * @param pricePerPassenger - Price per passenger in cents
 * @param passengerCount - Number of passengers
 * @returns Total price in cents
 */
export function calculateTotalForPassengers(
  pricePerPassenger: number,
  passengerCount: number
): number {
  return pricePerPassenger * passengerCount;
}

/**
 * Calculate per-passenger price from total
 * @param totalPrice - Total price in cents
 * @param passengerCount - Number of passengers
 * @returns Price per passenger in cents (rounded)
 */
export function calculatePerPassengerPrice(
  totalPrice: number,
  passengerCount: number
): number {
  if (passengerCount <= 0) {
    return 0;
  }
  return Math.round(totalPrice / passengerCount);
}
