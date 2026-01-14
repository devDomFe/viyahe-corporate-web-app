import type { SavedPassenger } from '@/types/saved-passenger';

/**
 * Mock organization ID for development
 */
export const MOCK_ORGANIZATION_ID = 'org-001';

/**
 * Mock user ID for development
 */
export const MOCK_USER_ID = 'user-001';

/**
 * Mock saved passengers for development
 */
export const MOCK_SAVED_PASSENGERS: SavedPassenger[] = [
  {
    id: 'sp-001',
    organizationId: MOCK_ORGANIZATION_ID,
    title: 'Mr',
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: '1985-06-15',
    gender: 'male',
    email: 'john.smith@acmecorp.com',
    phone: '+1 555-0101',
    nationality: 'US',
    documentType: 'passport',
    documentNumber: 'ABC123456',
    documentIssuingCountry: 'US',
    documentExpiryDate: '2028-06-15',
    createdBy: MOCK_USER_ID,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'sp-002',
    organizationId: MOCK_ORGANIZATION_ID,
    title: 'Ms',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: '1990-03-22',
    gender: 'female',
    email: 'sarah.johnson@acmecorp.com',
    phone: '+1 555-0102',
    nationality: 'US',
    documentType: 'passport',
    documentNumber: 'DEF789012',
    documentIssuingCountry: 'US',
    documentExpiryDate: '2029-03-22',
    createdBy: MOCK_USER_ID,
    createdAt: '2024-01-16T14:30:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
  },
  {
    id: 'sp-003',
    organizationId: MOCK_ORGANIZATION_ID,
    title: 'Dr',
    firstName: 'Michael',
    lastName: 'Chen',
    middleName: 'Wei',
    dateOfBirth: '1978-11-08',
    gender: 'male',
    email: 'michael.chen@acmecorp.com',
    phone: '+1 555-0103',
    nationality: 'US',
    documentType: 'passport',
    documentNumber: 'GHI345678',
    documentIssuingCountry: 'US',
    documentExpiryDate: '2027-11-08',
    createdBy: MOCK_USER_ID,
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:15:00Z',
  },
  {
    id: 'sp-004',
    organizationId: MOCK_ORGANIZATION_ID,
    title: 'Mrs',
    firstName: 'Emily',
    lastName: 'Davis',
    dateOfBirth: '1982-07-30',
    gender: 'female',
    email: 'emily.davis@acmecorp.com',
    phone: '+1 555-0104',
    nationality: 'US',
    documentType: 'passport',
    documentNumber: 'JKL901234',
    documentIssuingCountry: 'US',
    documentExpiryDate: '2030-07-30',
    createdBy: MOCK_USER_ID,
    createdAt: '2024-01-18T11:45:00Z',
    updatedAt: '2024-01-18T11:45:00Z',
  },
  {
    id: 'sp-005',
    organizationId: MOCK_ORGANIZATION_ID,
    title: 'Mr',
    firstName: 'Robert',
    lastName: 'Wilson',
    dateOfBirth: '1975-02-14',
    gender: 'male',
    email: 'robert.wilson@acmecorp.com',
    phone: '+1 555-0105',
    nationality: 'US',
    documentType: 'passport',
    documentNumber: 'MNO567890',
    documentIssuingCountry: 'US',
    documentExpiryDate: '2026-02-14',
    createdBy: MOCK_USER_ID,
    createdAt: '2024-01-19T16:20:00Z',
    updatedAt: '2024-01-19T16:20:00Z',
  },
  {
    id: 'sp-006',
    organizationId: MOCK_ORGANIZATION_ID,
    title: 'Ms',
    firstName: 'Jennifer',
    lastName: 'Martinez',
    dateOfBirth: '1988-09-05',
    gender: 'female',
    email: 'jennifer.martinez@acmecorp.com',
    phone: '+1 555-0106',
    nationality: 'US',
    documentType: 'passport',
    documentNumber: 'PQR123789',
    documentIssuingCountry: 'US',
    documentExpiryDate: '2029-09-05',
    createdBy: MOCK_USER_ID,
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-20T08:00:00Z',
  },
  {
    id: 'sp-007',
    organizationId: MOCK_ORGANIZATION_ID,
    title: 'Mr',
    firstName: 'David',
    lastName: 'Anderson',
    middleName: 'James',
    dateOfBirth: '1992-12-18',
    gender: 'male',
    email: 'david.anderson@acmecorp.com',
    phone: '+1 555-0107',
    nationality: 'US',
    documentType: 'passport',
    documentNumber: 'STU456012',
    documentIssuingCountry: 'US',
    documentExpiryDate: '2028-12-18',
    createdBy: MOCK_USER_ID,
    createdAt: '2024-01-21T13:30:00Z',
    updatedAt: '2024-01-21T13:30:00Z',
  },
  {
    id: 'sp-008',
    organizationId: MOCK_ORGANIZATION_ID,
    title: 'Mrs',
    firstName: 'Amanda',
    lastName: 'Taylor',
    dateOfBirth: '1980-04-25',
    gender: 'female',
    email: 'amanda.taylor@acmecorp.com',
    phone: '+1 555-0108',
    nationality: 'CA',
    documentType: 'passport',
    documentNumber: 'VWX789345',
    documentIssuingCountry: 'CA',
    documentExpiryDate: '2027-04-25',
    createdBy: MOCK_USER_ID,
    createdAt: '2024-01-22T10:15:00Z',
    updatedAt: '2024-01-22T10:15:00Z',
  },
  {
    id: 'sp-009',
    organizationId: MOCK_ORGANIZATION_ID,
    title: 'Mr',
    firstName: 'James',
    lastName: 'Brown',
    dateOfBirth: '1970-08-12',
    gender: 'male',
    email: 'james.brown@acmecorp.com',
    phone: '+1 555-0109',
    nationality: 'US',
    createdBy: MOCK_USER_ID,
    createdAt: '2024-01-23T15:45:00Z',
    updatedAt: '2024-01-23T15:45:00Z',
  },
  {
    id: 'sp-010',
    organizationId: MOCK_ORGANIZATION_ID,
    title: 'Ms',
    firstName: 'Lisa',
    lastName: 'Garcia',
    dateOfBirth: '1995-01-28',
    gender: 'female',
    email: 'lisa.garcia@acmecorp.com',
    phone: '+1 555-0110',
    nationality: 'US',
    documentType: 'passport',
    documentNumber: 'YZA012678',
    documentIssuingCountry: 'US',
    documentExpiryDate: '2031-01-28',
    createdBy: MOCK_USER_ID,
    createdAt: '2024-01-24T12:00:00Z',
    updatedAt: '2024-01-24T12:00:00Z',
  },
];

/**
 * Filter mock passengers by search query
 */
export function filterMockPassengers(
  passengers: SavedPassenger[],
  query: string
): SavedPassenger[] {
  if (!query.trim()) {
    return passengers;
  }

  const lowerQuery = query.toLowerCase().trim();

  return passengers.filter((passenger) => {
    const fullName = `${passenger.firstName} ${passenger.lastName}`.toLowerCase();
    const email = passenger.email.toLowerCase();

    return fullName.includes(lowerQuery) || email.includes(lowerQuery);
  });
}

/**
 * Generate a unique ID for new mock passengers
 */
export function generateMockPassengerId(): string {
  return `sp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}
