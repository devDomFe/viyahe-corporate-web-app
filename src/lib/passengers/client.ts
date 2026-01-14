import type {
  SavedPassenger,
  CreateSavedPassengerData,
  UpdateSavedPassengerData,
} from '@/types/saved-passenger';

/**
 * Client interface for passenger operations
 * Allows swapping between mock and real implementations
 */
export interface PassengerClient {
  /**
   * List all saved passengers for the organization
   */
  list(options?: { search?: string }): Promise<SavedPassenger[]>;

  /**
   * Get a single passenger by ID
   */
  get(id: string): Promise<SavedPassenger | null>;

  /**
   * Create a new saved passenger
   */
  create(data: CreateSavedPassengerData): Promise<SavedPassenger>;

  /**
   * Update an existing saved passenger
   */
  update(id: string, data: UpdateSavedPassengerData): Promise<SavedPassenger>;

  /**
   * Delete a saved passenger (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Create multiple passengers at once
   */
  bulkCreate(passengers: CreateSavedPassengerData[]): Promise<SavedPassenger[]>;
}

/**
 * Get the appropriate passenger client based on environment
 */
export async function getPassengerClient(): Promise<PassengerClient> {
  // Always use mock for now until Supabase is configured
  const { MockPassengerClient } = await import('./mock');
  return new MockPassengerClient();
}
