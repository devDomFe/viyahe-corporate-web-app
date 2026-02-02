'use client';

import { Box, Flex, Text, Button, VStack, Badge, Collapsible } from '@chakra-ui/react';
import type { PassengerFormData } from '@/types/passenger';
import type { BookingPassenger } from '@/types/saved-passenger';
import { PassengerForm } from './PassengerForm';

interface PassengerCardProps {
  passenger: BookingPassenger;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onChange: (data: PassengerFormData) => void;
  onRemove: () => void;
  errors?: Record<string, string>;
  isInternational?: boolean;
  isLocked?: boolean;
}

function getPassengerSummary(data: PassengerFormData): string {
  const parts = [];
  if (data.title) parts.push(data.title);
  if (data.firstName) parts.push(data.firstName);
  if (data.lastName) parts.push(data.lastName);

  if (parts.length === 0) {
    return 'New Passenger';
  }

  return parts.join(' ');
}

function hasRequiredFields(data: PassengerFormData): boolean {
  return Boolean(data.firstName && data.lastName && data.email);
}

export function PassengerCard({
  passenger,
  index,
  isExpanded,
  onToggleExpand,
  onChange,
  onRemove,
  errors = {},
  isInternational = false,
  isLocked = false,
}: PassengerCardProps) {
  const summary = getPassengerSummary(passenger.data);
  const isComplete = hasRequiredFields(passenger.data);
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Box
      bg="white"
      borderRadius="lg"
      boxShadow="sm"
      border="1px solid"
      borderColor={hasErrors ? 'red.300' : 'gray.200'}
    >
      {/* Card Header - Always visible */}
      <Flex
        px={{ base: '4', md: '6' }}
        py="4"
        align="center"
        justify="space-between"
        cursor="pointer"
        onClick={onToggleExpand}
        bg={isExpanded ? 'gray.50' : 'white'}
        _hover={{ bg: 'gray.50' }}
        transition="background 0.15s"
      >
        <Flex align="center" gap="3" flex="1" minW="0">
          {/* Passenger Number Badge */}
          <Flex
            w="8"
            h="8"
            bg="blue.500"
            color="white"
            borderRadius="full"
            align="center"
            justify="center"
            fontWeight="bold"
            fontSize="sm"
            flexShrink={0}
          >
            {index + 1}
          </Flex>

          {/* Passenger Info */}
          <Box flex="1" minW="0">
            <Flex align="center" gap="2">
              <Text
                fontWeight="medium"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                {summary}
              </Text>
              {passenger.savedPassengerId && !passenger.isModified && (
                <Badge colorPalette="blue" size="sm" flexShrink={0}>
                  Saved
                </Badge>
              )}
              {hasErrors && (
                <Badge colorPalette="red" size="sm" flexShrink={0}>
                  Incomplete
                </Badge>
              )}
            </Flex>
            {isComplete && passenger.data.email && (
              <Text
                fontSize="sm"
                color="gray.500"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                {passenger.data.email}
              </Text>
            )}
          </Box>
        </Flex>

        {/* Actions */}
        <Flex align="center" gap="2">
          {!isLocked && (
            <Button
              size="sm"
              variant="ghost"
              colorPalette="red"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              Remove
            </Button>
          )}
          <Box
            transform={isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}
            transition="transform 0.2s"
            color="gray.500"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Box>
        </Flex>
      </Flex>

      {/* Collapsible Form Content */}
      <Collapsible.Root open={isExpanded}>
        <Collapsible.Content>
          <Box px={{ base: '4', md: '6' }} pb="6">
            <PassengerFormFields
              data={passenger.data}
              onChange={onChange}
              errors={errors}
              isInternational={isInternational}
              isDisabled={isLocked}
            />
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
}

// Embedded form fields (without the outer box/heading from PassengerForm)
interface PassengerFormFieldsProps {
  data: PassengerFormData;
  onChange: (data: PassengerFormData) => void;
  errors?: Record<string, string>;
  isInternational?: boolean;
  isDisabled?: boolean;
}

import {
  Input,
  createListCollection,
} from '@chakra-ui/react';
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from '@chakra-ui/react/select';
import { DateOfBirthInput } from './DateOfBirthInput';
import { DatePicker } from '@/components/common';
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
    { value: 'passport', label: 'Passport' },
    { value: 'national_id', label: 'National ID' },
    { value: 'drivers_license', label: "Driver's License" },
  ],
});

function PassengerFormFields({
  data,
  onChange,
  errors = {},
  isInternational = false,
  isDisabled = false,
}: PassengerFormFieldsProps) {
  const handleChange = (field: keyof PassengerFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <VStack gap="5" align="stretch">
      {/* Name Row */}
      <Flex gap={{ base: '4', md: '5' }} direction={{ base: 'column', md: 'row' }}>
        <Box w={{ base: 'full', md: '120px' }}>
          <Text fontSize="sm" fontWeight="medium" mb="1">
            Title*
          </Text>
          <SelectRoot
            collection={titles}
            value={data.title ? [data.title] : []}
            onValueChange={(e) => handleChange('title', e.value[0])}
            size="md"
            disabled={isDisabled}
          >
            <SelectTrigger h="10" px="3">
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
            value={data.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="First name"
            size="md"
            h="10"
            disabled={isDisabled}
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
            value={data.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Last name"
            size="md"
            h="10"
            disabled={isDisabled}
          />
          {errors.lastName && (
            <Text fontSize="xs" color="red.500" mt="1">
              {errors.lastName}
            </Text>
          )}
        </Box>
      </Flex>

      {/* Date of Birth & Gender */}
      <Flex gap={{ base: '4', md: '5' }} direction={{ base: 'column', md: 'row' }}>
        <Box flex="1">
          <Text fontSize="sm" fontWeight="medium" mb="1">
            Date of Birth*
          </Text>
          <DateOfBirthInput
            value={data.dateOfBirth}
            onChange={(value) => handleChange('dateOfBirth', value)}
            disabled={isDisabled}
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
            value={data.gender ? [data.gender] : []}
            onValueChange={(e) => handleChange('gender', e.value[0] as Gender)}
            size="md"
            disabled={isDisabled}
          >
            <SelectTrigger h="10" px="3">
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

      {/* Contact Info */}
      <Flex gap={{ base: '4', md: '5' }} direction={{ base: 'column', md: 'row' }}>
        <Box flex="1">
          <Text fontSize="sm" fontWeight="medium" mb="1">
            Email*
          </Text>
          <Input
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="email@example.com"
            size="md"
            h="10"
            disabled={isDisabled}
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
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            size="md"
            h="10"
            disabled={isDisabled}
          />
          {errors.phone && (
            <Text fontSize="xs" color="red.500" mt="1">
              {errors.phone}
            </Text>
          )}
        </Box>
      </Flex>

      {/* Identity Document (for international flights) */}
      {isInternational && (
        <>
          <Box h="1px" bg="gray.200" my="1" />
          <Text fontSize="sm" fontWeight="medium" color="gray.600">
            Travel Document (required for international flights)
          </Text>

          <Flex gap={{ base: '4', md: '5' }} direction={{ base: 'column', md: 'row' }}>
            <Box flex="1">
              <Text fontSize="sm" fontWeight="medium" mb="1">
                Document Type*
              </Text>
              <SelectRoot
                collection={documentTypes}
                value={data.documentType ? [data.documentType] : []}
                onValueChange={(e) => handleChange('documentType', e.value[0] as DocumentType)}
                size="md"
                disabled={isDisabled}
              >
                <SelectTrigger h="10" px="3">
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
                Document Number*
              </Text>
              <Input
                value={data.documentNumber}
                onChange={(e) => handleChange('documentNumber', e.target.value)}
                placeholder="Document number"
                size="md"
                h="10"
                disabled={isDisabled}
              />
            </Box>
          </Flex>

          <Flex gap={{ base: '4', md: '5' }} direction={{ base: 'column', md: 'row' }}>
            <Box flex="1">
              <Text fontSize="sm" fontWeight="medium" mb="1">
                Issuing Country
              </Text>
              <Input
                value={data.documentIssuingCountry}
                onChange={(e) => handleChange('documentIssuingCountry', e.target.value)}
                placeholder="e.g., US"
                maxLength={2}
                size="md"
                h="10"
                disabled={isDisabled}
              />
            </Box>

            <Box flex="1">
              <Text fontSize="sm" fontWeight="medium" mb="1">
                Expiry Date
              </Text>
              <DatePicker
                value={data.documentExpiryDate}
                onChange={(value) => handleChange('documentExpiryDate', value)}
                placeholder="Select expiry date"
                disabled={isDisabled}
              />
            </Box>
          </Flex>
        </>
      )}
    </VStack>
  );
}
