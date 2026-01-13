/**
 * Passenger type
 */
export type PassengerType = 'adult' | 'child' | 'infant';

/**
 * Gender for passenger details
 */
export type Gender = 'male' | 'female' | 'other';

/**
 * Identity document type
 */
export type DocumentType = 'passport' | 'national_id' | 'drivers_license';

/**
 * Identity document for a passenger
 */
export interface IdentityDocument {
  type: DocumentType;
  number: string;
  issuingCountry: string; // ISO 3166-1 alpha-2
  expiryDate: string; // YYYY-MM-DD
}

/**
 * Passenger information for booking
 */
export interface Passenger {
  id: string;
  type: PassengerType;
  title: string; // Mr, Mrs, Ms, etc.
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: Gender;
  email: string;
  phone: string;
  nationality?: string; // ISO 3166-1 alpha-2
  identityDocument?: IdentityDocument;
}

/**
 * Lead passenger - the main contact for the booking
 */
export interface LeadPassenger extends Passenger {
  isLeadPassenger: true;
}

/**
 * Form state for passenger input
 */
export interface PassengerFormData {
  title: string;
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  gender: Gender | '';
  email: string;
  phone: string;
  nationality: string;
  documentType: DocumentType | '';
  documentNumber: string;
  documentIssuingCountry: string;
  documentExpiryDate: string;
}

/**
 * Initial empty passenger form data
 */
export const EMPTY_PASSENGER_FORM: PassengerFormData = {
  title: '',
  firstName: '',
  lastName: '',
  middleName: '',
  dateOfBirth: '',
  gender: '',
  email: '',
  phone: '',
  nationality: '',
  documentType: '',
  documentNumber: '',
  documentIssuingCountry: '',
  documentExpiryDate: '',
};
