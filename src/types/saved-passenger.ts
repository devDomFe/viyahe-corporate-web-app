import type { Gender, DocumentType, PassengerFormData } from './passenger';

/**
 * Saved passenger stored in the organization's directory
 */
export interface SavedPassenger {
  id: string;
  organizationId: string;

  // Personal info
  title: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: Gender;
  email: string;
  phone: string;
  nationality?: string; // ISO 3166-1 alpha-2

  // Identity document (optional)
  documentType?: DocumentType;
  documentNumber?: string;
  documentIssuingCountry?: string; // ISO 3166-1 alpha-2
  documentExpiryDate?: string; // YYYY-MM-DD

  // Metadata
  createdBy: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Data for creating a new saved passenger
 */
export interface CreateSavedPassengerData {
  title: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: Gender;
  email: string;
  phone: string;
  nationality?: string;
  documentType?: DocumentType;
  documentNumber?: string;
  documentIssuingCountry?: string;
  documentExpiryDate?: string;
}

/**
 * Data for updating an existing saved passenger
 */
export type UpdateSavedPassengerData = Partial<CreateSavedPassengerData>;

/**
 * Filter options for saved passengers search
 */
export interface SavedPassengerFilters {
  searchQuery?: string; // searches name and email
}

/**
 * State for saved passengers list
 */
export type SavedPassengersState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: SavedPassenger[] }
  | { status: 'error'; error: string };

/**
 * State for individual saved passenger operations
 */
export type SavedPassengerOperationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'error'; error: string };

/**
 * Passenger added to booking (tracks source and edit state)
 */
export interface BookingPassenger {
  id: string; // temporary ID for this booking session
  savedPassengerId?: string; // if loaded from saved passengers
  data: PassengerFormData;
  isExpanded: boolean;
  isModified: boolean; // true if user edited after loading from saved
}

/**
 * Convert a SavedPassenger to PassengerFormData for the booking form
 */
export function savedPassengerToFormData(passenger: SavedPassenger): PassengerFormData {
  return {
    title: passenger.title,
    firstName: passenger.firstName,
    lastName: passenger.lastName,
    middleName: passenger.middleName || '',
    dateOfBirth: passenger.dateOfBirth,
    gender: passenger.gender,
    email: passenger.email,
    phone: passenger.phone,
    nationality: passenger.nationality || '',
    documentType: passenger.documentType || '',
    documentNumber: passenger.documentNumber || '',
    documentIssuingCountry: passenger.documentIssuingCountry || '',
    documentExpiryDate: passenger.documentExpiryDate || '',
  };
}

/**
 * Convert PassengerFormData to CreateSavedPassengerData
 */
export function formDataToSavedPassenger(data: PassengerFormData): CreateSavedPassengerData {
  const result: CreateSavedPassengerData = {
    title: data.title,
    firstName: data.firstName,
    lastName: data.lastName,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender as Gender,
    email: data.email,
    phone: data.phone,
  };

  if (data.middleName) {
    result.middleName = data.middleName;
  }
  if (data.nationality) {
    result.nationality = data.nationality;
  }
  if (data.documentType) {
    result.documentType = data.documentType as DocumentType;
    result.documentNumber = data.documentNumber;
    result.documentIssuingCountry = data.documentIssuingCountry;
    result.documentExpiryDate = data.documentExpiryDate;
  }

  return result;
}

/**
 * Get display name for a saved passenger
 */
export function getPassengerDisplayName(passenger: SavedPassenger): string {
  return `${passenger.title} ${passenger.firstName} ${passenger.lastName}`.trim();
}
