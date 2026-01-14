'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  Spinner,
  createListCollection,
} from '@chakra-ui/react';
import {
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
} from '@chakra-ui/react/dialog';
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from '@chakra-ui/react/select';
import { DateOfBirthInput } from '@/components/booking/DateOfBirthInput';
import { DatePicker } from '@/components/common';
import type { SavedPassenger, CreateSavedPassengerData } from '@/types/saved-passenger';
import type { Gender, DocumentType } from '@/types/passenger';

const titles = createListCollection({
  items: [
    { value: 'Mr', label: 'Mr' },
    { value: 'Mrs', label: 'Mrs' },
    { value: 'Ms', label: 'Ms' },
    { value: 'Dr', label: 'Dr' },
  ],
});

const genders = createListCollection({
  items: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ],
});

const documentTypes = createListCollection({
  items: [
    { value: '', label: 'None' },
    { value: 'passport', label: 'Passport' },
    { value: 'national_id', label: 'National ID' },
    { value: 'drivers_license', label: "Driver's License" },
  ],
});

interface FormData {
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

const EMPTY_FORM: FormData = {
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

interface AddEditPassengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  passenger?: SavedPassenger | null;
  onSave: (data: CreateSavedPassengerData) => Promise<void>;
}

export function AddEditPassengerModal({
  isOpen,
  onClose,
  passenger,
  onSave,
}: AddEditPassengerModalProps) {
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = Boolean(passenger);

  // Initialize form when modal opens or passenger changes
  useEffect(() => {
    if (isOpen) {
      if (passenger) {
        setFormData({
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
        });
      } else {
        setFormData(EMPTY_FORM);
      }
      setErrors({});
    }
  }, [isOpen, passenger]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone is required';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Phone must be at least 10 digits';
    }

    // Document validation
    if (formData.documentType && !formData.documentNumber) {
      newErrors.documentNumber = 'Document number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const saveData: CreateSavedPassengerData = {
        title: formData.title,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as Gender,
        email: formData.email,
        phone: formData.phone,
      };

      if (formData.middleName) saveData.middleName = formData.middleName;
      if (formData.nationality) saveData.nationality = formData.nationality;
      if (formData.documentType) {
        saveData.documentType = formData.documentType as DocumentType;
        saveData.documentNumber = formData.documentNumber;
        if (formData.documentIssuingCountry) {
          saveData.documentIssuingCountry = formData.documentIssuingCountry;
        }
        if (formData.documentExpiryDate) {
          saveData.documentExpiryDate = formData.documentExpiryDate;
        }
      }

      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error('Failed to save passenger:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
      size="lg"
    >
      <DialogBackdrop />
      <DialogContent maxH="90vh" overflow="auto">
        <DialogHeader>
          <Heading size="md">
            {isEditing ? 'Edit Passenger' : 'Add New Passenger'}
          </Heading>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          <VStack gap="5" align="stretch">
            {/* Name Row */}
            <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
              <Box w={{ base: 'full', md: '100px' }}>
                <Text fontSize="sm" fontWeight="medium" mb="1">
                  Title*
                </Text>
                <SelectRoot
                  collection={titles}
                  value={formData.title ? [formData.title] : []}
                  onValueChange={(e) => handleChange('title', e.value[0])}
                  size="md"
                >
                  <SelectTrigger h="10">
                    <SelectValueText placeholder="Title" />
                  </SelectTrigger>
                  <SelectContent bg="white" borderRadius="md" boxShadow="lg" p="1">
                    {titles.items.map((item) => (
                      <SelectItem
                        key={item.value}
                        item={item}
                        px="3"
                        py="2"
                        borderRadius="md"
                        cursor="pointer"
                        _hover={{ bg: 'gray.100' }}
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
                {errors.title && (
                  <Text fontSize="xs" color="red.500" mt="1">
                    {errors.title}
                  </Text>
                )}
              </Box>

              <Box flex="1">
                <Text fontSize="sm" fontWeight="medium" mb="1">
                  First Name*
                </Text>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="First name"
                  size="md"
                />
                {errors.firstName && (
                  <Text fontSize="xs" color="red.500" mt="1">
                    {errors.firstName}
                  </Text>
                )}
              </Box>

              <Box flex="1">
                <Text fontSize="sm" fontWeight="medium" mb="1">
                  Last Name*
                </Text>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Last name"
                  size="md"
                />
                {errors.lastName && (
                  <Text fontSize="xs" color="red.500" mt="1">
                    {errors.lastName}
                  </Text>
                )}
              </Box>
            </Flex>

            {/* Middle Name */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb="1">
                Middle Name
              </Text>
              <Input
                value={formData.middleName}
                onChange={(e) => handleChange('middleName', e.target.value)}
                placeholder="Middle name (optional)"
                size="md"
              />
            </Box>

            {/* DOB & Gender */}
            <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
              <Box flex="1">
                <Text fontSize="sm" fontWeight="medium" mb="1">
                  Date of Birth*
                </Text>
                <DateOfBirthInput
                  value={formData.dateOfBirth}
                  onChange={(value) => handleChange('dateOfBirth', value)}
                />
                {errors.dateOfBirth && (
                  <Text fontSize="xs" color="red.500" mt="1">
                    {errors.dateOfBirth}
                  </Text>
                )}
              </Box>

              <Box flex="1">
                <Text fontSize="sm" fontWeight="medium" mb="1">
                  Gender*
                </Text>
                <SelectRoot
                  collection={genders}
                  value={formData.gender ? [formData.gender] : []}
                  onValueChange={(e) => handleChange('gender', e.value[0] as Gender)}
                  size="md"
                >
                  <SelectTrigger h="10">
                    <SelectValueText placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent bg="white" borderRadius="md" boxShadow="lg" p="1">
                    {genders.items.map((item) => (
                      <SelectItem
                        key={item.value}
                        item={item}
                        px="3"
                        py="2"
                        borderRadius="md"
                        cursor="pointer"
                        _hover={{ bg: 'gray.100' }}
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
                {errors.gender && (
                  <Text fontSize="xs" color="red.500" mt="1">
                    {errors.gender}
                  </Text>
                )}
              </Box>
            </Flex>

            {/* Contact */}
            <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
              <Box flex="1">
                <Text fontSize="sm" fontWeight="medium" mb="1">
                  Email*
                </Text>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@example.com"
                  size="md"
                />
                {errors.email && (
                  <Text fontSize="xs" color="red.500" mt="1">
                    {errors.email}
                  </Text>
                )}
              </Box>

              <Box flex="1">
                <Text fontSize="sm" fontWeight="medium" mb="1">
                  Phone*
                </Text>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  size="md"
                />
                {errors.phone && (
                  <Text fontSize="xs" color="red.500" mt="1">
                    {errors.phone}
                  </Text>
                )}
              </Box>
            </Flex>

            {/* Nationality */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb="1">
                Nationality
              </Text>
              <Input
                value={formData.nationality}
                onChange={(e) => handleChange('nationality', e.target.value.toUpperCase())}
                placeholder="e.g., US"
                maxLength={2}
                size="md"
                w="100px"
              />
              <Text fontSize="xs" color="gray.500" mt="1">
                2-letter country code (optional)
              </Text>
            </Box>

            {/* Travel Document Section */}
            <Box borderTop="1px solid" borderColor="gray.200" pt="4" mt="2">
              <Text fontWeight="medium" mb="3">
                Travel Document (optional)
              </Text>

              <Flex gap="4" direction={{ base: 'column', md: 'row' }}>
                <Box flex="1">
                  <Text fontSize="sm" fontWeight="medium" mb="1">
                    Document Type
                  </Text>
                  <SelectRoot
                    collection={documentTypes}
                    value={formData.documentType ? [formData.documentType] : ['']}
                    onValueChange={(e) => handleChange('documentType', e.value[0] as DocumentType)}
                    size="md"
                  >
                    <SelectTrigger h="10">
                      <SelectValueText placeholder="Select document" />
                    </SelectTrigger>
                    <SelectContent bg="white" borderRadius="md" boxShadow="lg" p="1">
                      {documentTypes.items.map((item) => (
                        <SelectItem
                          key={item.value}
                          item={item}
                          px="3"
                          py="2"
                          borderRadius="md"
                          cursor="pointer"
                          _hover={{ bg: 'gray.100' }}
                        >
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </Box>

                <Box flex="1">
                  <Text fontSize="sm" fontWeight="medium" mb="1">
                    Document Number
                  </Text>
                  <Input
                    value={formData.documentNumber}
                    onChange={(e) => handleChange('documentNumber', e.target.value)}
                    placeholder="Document number"
                    size="md"
                    disabled={!formData.documentType}
                  />
                  {errors.documentNumber && (
                    <Text fontSize="xs" color="red.500" mt="1">
                      {errors.documentNumber}
                    </Text>
                  )}
                </Box>
              </Flex>

              <Flex gap="4" direction={{ base: 'column', md: 'row' }} mt="4">
                <Box flex="1">
                  <Text fontSize="sm" fontWeight="medium" mb="1">
                    Issuing Country
                  </Text>
                  <Input
                    value={formData.documentIssuingCountry}
                    onChange={(e) =>
                      handleChange('documentIssuingCountry', e.target.value.toUpperCase())
                    }
                    placeholder="e.g., US"
                    maxLength={2}
                    size="md"
                    disabled={!formData.documentType}
                  />
                </Box>

                <Box flex="1">
                  <Text fontSize="sm" fontWeight="medium" mb="1">
                    Expiry Date
                  </Text>
                  <DatePicker
                    value={formData.documentExpiryDate}
                    onChange={(value) => handleChange('documentExpiryDate', value)}
                    placeholder="Select expiry date"
                    disabled={!formData.documentType}
                  />
                </Box>
              </Flex>
            </Box>
          </VStack>
        </DialogBody>

        <DialogFooter>
          <Flex gap="3" justify="flex-end">
            <Button variant="ghost" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button colorPalette="blue" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Spinner size="sm" mr="2" />
                  Saving...
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Add Passenger'
              )}
            </Button>
          </Flex>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
