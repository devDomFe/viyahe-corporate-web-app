'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  Badge,
  Table,
} from '@chakra-ui/react';
import { Spinner } from '@chakra-ui/react/spinner';
import { Alert } from '@chakra-ui/react/alert';
import { useSavedPassengers } from '@/hooks/useSavedPassengers';
import { AddEditPassengerModal, DeleteConfirmDialog } from '@/components/passengers';
import type { SavedPassenger, CreateSavedPassengerData, UpdateSavedPassengerData } from '@/types/saved-passenger';
import { getPassengerDisplayName } from '@/types/saved-passenger';

export default function PassengersPage() {
  const router = useRouter();
  const {
    filteredPassengers,
    state,
    searchQuery,
    setSearchQuery,
    createPassenger,
    updatePassenger,
    deletePassenger,
    operationState,
  } = useSavedPassengers();

  // Modal states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState<SavedPassenger | null>(null);

  const handleAddNew = () => {
    setSelectedPassenger(null);
    setIsAddEditOpen(true);
  };

  const handleEdit = (passenger: SavedPassenger) => {
    setSelectedPassenger(passenger);
    setIsAddEditOpen(true);
  };

  const handleDeleteClick = (passenger: SavedPassenger) => {
    setSelectedPassenger(passenger);
    setIsDeleteOpen(true);
  };

  const handleSave = async (data: CreateSavedPassengerData) => {
    if (selectedPassenger) {
      // Update existing
      await updatePassenger(selectedPassenger.id, data as UpdateSavedPassengerData);
    } else {
      // Create new
      await createPassenger(data);
    }
  };

  const handleDelete = async () => {
    if (selectedPassenger) {
      await deletePassenger(selectedPassenger.id);
    }
  };

  const isLoading = state.status === 'loading';
  const hasError = state.status === 'error';

  return (
    <Box minH="100vh" bg="gray.50" pb="10" pt={{ base: '4', md: '6' }}>
      <Container maxW="6xl" py={{ base: '6', md: '10' }} px={{ base: '4', md: '8' }}>
        <VStack gap="6" align="stretch">
          {/* Header */}
          <Flex
            justify="space-between"
            align={{ base: 'start', md: 'center' }}
            direction={{ base: 'column', md: 'row' }}
            gap="4"
          >
            <Box>
              <Heading size="xl" color="blue.600">
                Saved Passengers
              </Heading>
              <Text color="gray.600" mt="1">
                Manage your organization's passenger directory
              </Text>
            </Box>
            <HStack gap="3">
              <Button variant="outline" onClick={() => router.push('/')}>
                Back to Search
              </Button>
              <Button colorPalette="blue" onClick={handleAddNew}>
                + Add Passenger
              </Button>
            </HStack>
          </Flex>

          {/* Search Bar */}
          <Box bg="white" p="4" borderRadius="lg" boxShadow="sm">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              size="lg"
              maxW="400px"
              px="4"
            />
          </Box>

          {/* Error State */}
          {hasError && (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Error</Alert.Title>
                <Alert.Description>
                  {state.status === 'error' ? state.error : 'Failed to load passengers'}
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          {/* Loading State */}
          {isLoading && (
            <Flex justify="center" py="12">
              <VStack gap="4">
                <Spinner size="xl" color="blue.500" />
                <Text color="gray.600">Loading passengers...</Text>
              </VStack>
            </Flex>
          )}

          {/* Empty State */}
          {!isLoading && !hasError && filteredPassengers.length === 0 && (
            <Box bg="white" p="12" borderRadius="lg" textAlign="center">
              {searchQuery ? (
                <>
                  <Text fontSize="lg" color="gray.600" mb="2">
                    No passengers found matching "{searchQuery}"
                  </Text>
                  <Button variant="ghost" colorPalette="blue" onClick={() => setSearchQuery('')}>
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <Text fontSize="lg" color="gray.600" mb="4">
                    No saved passengers yet
                  </Text>
                  <Text color="gray.500" mb="6">
                    Add passengers to your directory for quick selection during bookings.
                  </Text>
                  <Button colorPalette="blue" onClick={handleAddNew}>
                    Add Your First Passenger
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* Passengers Table */}
          {!isLoading && !hasError && filteredPassengers.length > 0 && (
            <Box bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden">
              <Table.Root size="md">
                <Table.Header>
                  <Table.Row bg="gray.50">
                    <Table.ColumnHeader py="4" px="6">
                      Name
                    </Table.ColumnHeader>
                    <Table.ColumnHeader py="4" px="6" display={{ base: 'none', md: 'table-cell' }}>
                      Email
                    </Table.ColumnHeader>
                    <Table.ColumnHeader py="4" px="6" display={{ base: 'none', lg: 'table-cell' }}>
                      Phone
                    </Table.ColumnHeader>
                    <Table.ColumnHeader py="4" px="6" display={{ base: 'none', lg: 'table-cell' }}>
                      Document
                    </Table.ColumnHeader>
                    <Table.ColumnHeader py="4" px="6" textAlign="right">
                      Actions
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredPassengers.map((passenger) => (
                    <Table.Row
                      key={passenger.id}
                      _hover={{ bg: 'gray.50' }}
                      transition="background 0.15s"
                    >
                      <Table.Cell py="4" px="6">
                        <VStack align="start" gap="0">
                          <Text fontWeight="medium">
                            {getPassengerDisplayName(passenger)}
                          </Text>
                          <Text
                            fontSize="sm"
                            color="gray.500"
                            display={{ base: 'block', md: 'none' }}
                          >
                            {passenger.email}
                          </Text>
                        </VStack>
                      </Table.Cell>
                      <Table.Cell py="4" px="6" display={{ base: 'none', md: 'table-cell' }}>
                        <Text color="gray.600">{passenger.email}</Text>
                      </Table.Cell>
                      <Table.Cell py="4" px="6" display={{ base: 'none', lg: 'table-cell' }}>
                        <Text color="gray.600">{passenger.phone}</Text>
                      </Table.Cell>
                      <Table.Cell py="4" px="6" display={{ base: 'none', lg: 'table-cell' }}>
                        {passenger.documentType ? (
                          <Badge colorPalette="blue" size="sm">
                            {passenger.documentType === 'passport'
                              ? 'Passport'
                              : passenger.documentType === 'national_id'
                              ? 'National ID'
                              : "Driver's License"}
                          </Badge>
                        ) : (
                          <Text color="gray.400" fontSize="sm">
                            None
                          </Text>
                        )}
                      </Table.Cell>
                      <Table.Cell py="4" px="6">
                        <HStack gap="2" justify="flex-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(passenger)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorPalette="red"
                            onClick={() => handleDeleteClick(passenger)}
                          >
                            Delete
                          </Button>
                        </HStack>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>

              {/* Results count */}
              <Box px="6" py="3" borderTop="1px solid" borderColor="gray.100" bg="gray.50">
                <Text fontSize="sm" color="gray.600">
                  {filteredPassengers.length} passenger
                  {filteredPassengers.length !== 1 ? 's' : ''}
                  {searchQuery && ` matching "${searchQuery}"`}
                </Text>
              </Box>
            </Box>
          )}
        </VStack>
      </Container>

      {/* Add/Edit Modal */}
      <AddEditPassengerModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setSelectedPassenger(null);
        }}
        passenger={selectedPassenger}
        onSave={handleSave}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedPassenger(null);
        }}
        passenger={selectedPassenger}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
