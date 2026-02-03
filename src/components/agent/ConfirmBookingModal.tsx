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

interface ConfirmBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => Promise<boolean>;
  bookingRoute?: string;
}

export function ConfirmBookingModal({
  isOpen,
  onClose,
  onConfirm,
  bookingRoute,
}: ConfirmBookingModalProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const success = await onConfirm(notes || undefined);
      if (success) {
        setNotes('');
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNotes('');
      onClose();
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(details) => !details.open && handleClose()}>
      <DialogBackdrop />
      <DialogContent>
        <DialogHeader>
          <Heading size="md">Confirm Booking</Heading>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          <Box>
            {bookingRoute && (
              <Text mb="4" color="gray.600">
                Confirm booking for <strong>{bookingRoute}</strong>?
              </Text>
            )}

            <Text mb="2" fontSize="sm" fontWeight="medium" color="gray.700">
              Agent Notes (optional)
            </Text>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes for this confirmation..."
              rows={3}
              disabled={isSubmitting}
            />
            <Text mt="2" fontSize="xs" color="gray.500">
              These notes will be stored with the booking record.
            </Text>
          </Box>
        </DialogBody>

        <DialogFooter>
          <Flex gap="3" justify="flex-end" w="full">
            <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              colorPalette="green"
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" mr="2" />
                  Confirming...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </Flex>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
