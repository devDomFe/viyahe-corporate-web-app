'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  Spinner,
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
import { Checkbox } from '@chakra-ui/react/checkbox';
import type { PassengerFormData } from '@/types/passenger';

interface SavePassengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  passengers: PassengerFormData[];
  onSave: (passengers: PassengerFormData[]) => Promise<void>;
}

function getPassengerDisplayName(data: PassengerFormData): string {
  const parts = [];
  if (data.title) parts.push(data.title);
  if (data.firstName) parts.push(data.firstName);
  if (data.lastName) parts.push(data.lastName);
  return parts.join(' ') || 'Unknown Passenger';
}

export function SavePassengerModal({
  isOpen,
  onClose,
  passengers,
  onSave,
}: SavePassengerModalProps) {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    () => new Set(passengers.map((_, i) => i))
  );
  const [isSaving, setIsSaving] = useState(false);

  const togglePassenger = (index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSave = async () => {
    const passengersToSave = passengers.filter((_, i) => selectedIndices.has(i));
    if (passengersToSave.length === 0) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      await onSave(passengersToSave);
      onClose();
    } catch (error) {
      console.error('Failed to save passengers:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (passengers.length === 0) {
    return null;
  }

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
      size="md"
    >
      <DialogBackdrop />
      <DialogContent>
        <DialogHeader>
          <Heading size="md">Save Passengers for Future Bookings?</Heading>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          <Text fontSize="sm" color="gray.600" mb="4">
            Save these passengers to your organization's directory for quick selection in future
            bookings.
          </Text>

          <VStack gap="2" align="stretch">
            {passengers.map((passenger, index) => (
              <Box
                key={index}
                p="3"
                borderRadius="md"
                border="1px solid"
                borderColor={selectedIndices.has(index) ? 'blue.200' : 'gray.200'}
                bg={selectedIndices.has(index) ? 'blue.50' : 'white'}
                cursor="pointer"
                onClick={() => togglePassenger(index)}
                transition="all 0.15s"
                _hover={{ borderColor: 'blue.300' }}
              >
                <Flex align="center" gap="3">
                  <Checkbox.Root
                    checked={selectedIndices.has(index)}
                    onCheckedChange={() => togglePassenger(index)}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                  </Checkbox.Root>
                  <Box flex="1">
                    <Text fontWeight="medium" fontSize="sm">
                      {getPassengerDisplayName(passenger)}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {passenger.email}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            ))}
          </VStack>
        </DialogBody>

        <DialogFooter>
          <Flex gap="3" w="full" justify="flex-end">
            <Button variant="ghost" onClick={handleSkip} disabled={isSaving}>
              Skip
            </Button>
            <Button
              colorPalette="blue"
              onClick={handleSave}
              disabled={isSaving || selectedIndices.size === 0}
            >
              {isSaving ? (
                <>
                  <Spinner size="sm" mr="2" />
                  Saving...
                </>
              ) : (
                `Save ${selectedIndices.size} Passenger${selectedIndices.size !== 1 ? 's' : ''}`
              )}
            </Button>
          </Flex>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
