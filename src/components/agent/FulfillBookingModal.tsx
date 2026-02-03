'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogBackdrop,
} from '@chakra-ui/react/dialog';
import { Spinner } from '@chakra-ui/react/spinner';

interface FulfillBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFulfill: () => Promise<boolean>;
  bookingRoute?: string;
  documentCount?: number;
}

export function FulfillBookingModal({
  isOpen,
  onClose,
  onFulfill,
  bookingRoute,
  documentCount = 0,
}: FulfillBookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFulfill = async () => {
    setIsSubmitting(true);
    try {
      const success = await onFulfill();
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(details) => !details.open && handleClose()}>
      <DialogBackdrop />
      <DialogContent>
        <DialogHeader>
          <Heading size="md">Mark as Fulfilled</Heading>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          <VStack gap="4" align="stretch">
            {bookingRoute && (
              <Text>
                You are about to mark the booking for <strong>{bookingRoute}</strong> as fulfilled.
              </Text>
            )}

            <Box bg="blue.50" p="4" borderRadius="md">
              <Text fontSize="sm" color="blue.800">
                <strong>This action will:</strong>
              </Text>
              <VStack align="start" gap="1" mt="2" pl="4">
                <Text fontSize="sm" color="blue.700">
                  - Mark the booking as complete
                </Text>
                <Text fontSize="sm" color="blue.700">
                  - Make all {documentCount} uploaded document(s) available to the client
                </Text>
                <Text fontSize="sm" color="blue.700">
                  - Lock the booking from further modifications
                </Text>
              </VStack>
            </Box>

            <Box bg="yellow.50" p="3" borderRadius="md">
              <Text fontSize="sm" color="yellow.800">
                <strong>Note:</strong> This action cannot be undone.
              </Text>
            </Box>
          </VStack>
        </DialogBody>

        <DialogFooter>
          <Flex gap="3" justify="flex-end" w="full">
            <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              colorPalette="blue"
              onClick={handleFulfill}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" mr="2" />
                  Processing...
                </>
              ) : (
                'Confirm Fulfillment'
              )}
            </Button>
          </Flex>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
