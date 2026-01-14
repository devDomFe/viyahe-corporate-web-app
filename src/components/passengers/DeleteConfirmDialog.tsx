'use client';

import { useState } from 'react';
import {
  Button,
  Flex,
  Heading,
  Text,
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
import type { SavedPassenger } from '@/types/saved-passenger';
import { getPassengerDisplayName } from '@/types/saved-passenger';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passenger: SavedPassenger | null;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  passenger,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Failed to delete passenger:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!passenger) return null;

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
      size="sm"
    >
      <DialogBackdrop />
      <DialogContent>
        <DialogHeader>
          <Heading size="md">Delete Passenger</Heading>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          <Text>
            Are you sure you want to delete{' '}
            <Text as="span" fontWeight="bold">
              {getPassengerDisplayName(passenger)}
            </Text>
            ? This action cannot be undone.
          </Text>
        </DialogBody>

        <DialogFooter>
          <Flex gap="3" justify="flex-end">
            <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button colorPalette="red" onClick={handleConfirm} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Spinner size="sm" mr="2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </Flex>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
