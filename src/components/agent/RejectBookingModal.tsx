'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Textarea,
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
import { Alert } from '@chakra-ui/react/alert';

interface RejectBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (reason?: string) => Promise<boolean>;
  bookingRoute?: string;
}

export function RejectBookingModal({
  isOpen,
  onClose,
  onReject,
  bookingRoute,
}: RejectBookingModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      const success = await onReject(reason || undefined);
      if (success) {
        setReason('');
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      onClose();
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(details) => !details.open && handleClose()}>
      <DialogBackdrop />
      <DialogContent>
        <DialogHeader>
          <Heading size="md" color="red.600">Reject Booking</Heading>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          <Box>
            <Alert.Root status="warning" mb="4">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  This action cannot be undone. The client will be notified of the rejection.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>

            {bookingRoute && (
              <Text mb="4" color="gray.600">
                Reject booking for <strong>{bookingRoute}</strong>?
              </Text>
            )}

            <Text mb="2" fontSize="sm" fontWeight="medium" color="gray.700">
              Rejection Reason (optional but recommended)
            </Text>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a reason for rejection..."
              rows={3}
              disabled={isSubmitting}
            />
            <Text mt="2" fontSize="xs" color="gray.500">
              This reason will be visible to the client.
            </Text>
          </Box>
        </DialogBody>

        <DialogFooter>
          <Flex gap="3" justify="flex-end" w="full">
            <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              colorPalette="red"
              onClick={handleReject}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" mr="2" />
                  Rejecting...
                </>
              ) : (
                'Reject Booking'
              )}
            </Button>
          </Flex>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
