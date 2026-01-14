import type { PassengerClient } from './client';
import type {
  SavedPassenger,
  CreateSavedPassengerData,
  UpdateSavedPassengerData,
} from '@/types/saved-passenger';
import {
  MOCK_SAVED_PASSENGERS,
  MOCK_ORGANIZATION_ID,
  MOCK_USER_ID,
  filterMockPassengers,
  generateMockPassengerId,
} from '@/mocks/passengers';

/**
 * Simulated network delay for realistic mock behavior
 */
const MOCK_DELAY_MS = 300;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock implementation of PassengerClient
 * Stores data in memory for the session
 */
export class MockPassengerClient implements PassengerClient {
  private passengers: SavedPassenger[];

  constructor() {
    // Initialize with mock data, making a copy to avoid mutations
    this.passengers = [...MOCK_SAVED_PASSENGERS];
  }

  async list(options?: { search?: string }): Promise<SavedPassenger[]> {
    await delay();

    let result = [...this.passengers];

    if (options?.search) {
      result = filterMockPassengers(result, options.search);
    }

    // Sort by last name, then first name
    result.sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.firstName.localeCompare(b.firstName);
    });

    return result;
  }

  async get(id: string): Promise<SavedPassenger | null> {
    await delay();
    return this.passengers.find((p) => p.id === id) || null;
  }

  async create(data: CreateSavedPassengerData): Promise<SavedPassenger> {
    await delay();

    const now = new Date().toISOString();
    const newPassenger: SavedPassenger = {
      id: generateMockPassengerId(),
      organizationId: MOCK_ORGANIZATION_ID,
      ...data,
      createdBy: MOCK_USER_ID,
      createdAt: now,
      updatedAt: now,
    };

    this.passengers.push(newPassenger);
    return newPassenger;
  }

  async update(id: string, data: UpdateSavedPassengerData): Promise<SavedPassenger> {
    await delay();

    const index = this.passengers.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Passenger with ID ${id} not found`);
    }

    const updated: SavedPassenger = {
      ...this.passengers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.passengers[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    await delay();

    const index = this.passengers.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Passenger with ID ${id} not found`);
    }

    this.passengers.splice(index, 1);
  }

  async bulkCreate(passengersData: CreateSavedPassengerData[]): Promise<SavedPassenger[]> {
    await delay();

    const now = new Date().toISOString();
    const newPassengers: SavedPassenger[] = passengersData.map((data) => ({
      id: generateMockPassengerId(),
      organizationId: MOCK_ORGANIZATION_ID,
      ...data,
      createdBy: MOCK_USER_ID,
      createdAt: now,
      updatedAt: now,
    }));

    this.passengers.push(...newPassengers);
    return newPassengers;
  }
}
