'use client';

import { Box, Button, Flex, Heading, Input, Text, VStack, HStack, Textarea, createListCollection } from '@chakra-ui/react';
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from '@chakra-ui/react/select';
import type { PassengerFormData, Gender, DocumentType } from '@/types/passenger';
import { DateOfBirthInput } from './DateOfBirthInput';
import { DatePicker } from '@/components/common';

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

interface PassengerFormProps {
  passengerNumber: number;
  data: PassengerFormData;
  onChange: (data: PassengerFormData) => void;
  errors?: Record<string, string>;
  isInternational?: boolean;
}

export function PassengerForm({
  passengerNumber,
  data,
  onChange,
  errors = {},
  isInternational = false,
}: PassengerFormProps) {
  const handleChange = (field: keyof PassengerFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Box bg="white" borderRadius="lg" boxShadow="sm" p={{ base: '6', md: '8' }}>
      <Heading size="md" mb="6">
        Passenger {passengerNumber}
      </Heading>

      <VStack gap="6" align="stretch">
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
              size="lg"
            >
              <SelectTrigger h="12" px="4">
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
              size="lg"
              px="4"
              py="3"
              h="12"
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
              size="lg"
              px="4"
              py="3"
              h="12"
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
              size="lg"
            >
              <SelectTrigger h="12" px="4">
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
              size="lg"
              px="4"
              py="3"
              h="12"
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
              size="lg"
              px="4"
              py="3"
              h="12"
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
            <Box h="1px" bg="gray.200" my="2" />
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
                  size="lg"
                >
                  <SelectTrigger h="12" px="4">
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
                  size="lg"
                  px="4"
                  py="3"
                  h="12"
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
                  size="lg"
                  px="4"
                  py="3"
                  h="12"
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
                />
              </Box>
            </Flex>
          </>
        )}
      </VStack>
    </Box>
  );
}

interface BookingExtrasProps {
  discountCode: string;
  specialRequests: string;
  onDiscountCodeChange: (code: string) => void;
  onSpecialRequestsChange: (requests: string) => void;
  isDisabled?: boolean;
}

export function BookingExtras({
  discountCode,
  specialRequests,
  onDiscountCodeChange,
  onSpecialRequestsChange,
  isDisabled = false,
}: BookingExtrasProps) {
  return (
    <Box bg="white" borderRadius="lg" boxShadow="sm" p={{ base: '6', md: '8' }}>
      <Heading size="md" mb="5">
        Additional Information
      </Heading>

      <VStack gap="5" align="stretch">
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb="1">
            Discount Code (optional)
          </Text>
          <Input
            value={discountCode}
            onChange={(e) => onDiscountCodeChange(e.target.value)}
            placeholder="Enter discount code"
            maxW="300px"
            size="lg"
            px="4"
            py="3"
            h="12"
            disabled={isDisabled}
          />
          <Text fontSize="xs" color="gray.500" mt="1">
            Corporate discount codes can be entered here
          </Text>
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb="1">
            Special Requests (optional)
          </Text>
          <Textarea
            value={specialRequests}
            onChange={(e) => onSpecialRequestsChange(e.target.value)}
            placeholder="Enter any special requests, dietary requirements, or notes for the travel agent..."
            rows={4}
            size="lg"
            px="4"
            py="3"
            disabled={isDisabled}
          />
        </Box>
      </VStack>
    </Box>
  );
}
