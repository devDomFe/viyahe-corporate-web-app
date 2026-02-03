'use client';

import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  createListCollection,
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
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from '@chakra-ui/react/select';
import { Spinner } from '@chakra-ui/react/spinner';
import { Alert } from '@chakra-ui/react/alert';
import type { BookingDocumentType, BookingDocument } from '@/types/booking';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, type: BookingDocumentType) => Promise<BookingDocument | null>;
  bookingRoute?: string;
}

const documentTypes = createListCollection({
  items: [
    { value: 'itinerary', label: 'Itinerary' },
    { value: 'e_ticket', label: 'E-Ticket' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'other', label: 'Other' },
  ],
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function DocumentUploadModal({
  isOpen,
  onClose,
  onUpload,
  bookingRoute,
}: DocumentUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<BookingDocumentType>('itinerary');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF, JPEG, and PNG files are allowed');
      setSelectedFile(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 5MB limit');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await onUpload(selectedFile, documentType);
      if (result) {
        handleClose();
      } else {
        setError('Failed to upload document. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setDocumentType('itinerary');
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(details) => !details.open && handleClose()}>
      <DialogBackdrop />
      <DialogContent>
        <DialogHeader>
          <Heading size="md">Upload Document</Heading>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          <VStack gap="4" align="stretch">
            {bookingRoute && (
              <Text color="gray.600">
                Upload document for <strong>{bookingRoute}</strong>
              </Text>
            )}

            {error && (
              <Alert.Root status="error">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>{error}</Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}

            {/* Document Type Selector */}
            <Box>
              <Text mb="2" fontSize="sm" fontWeight="medium" color="gray.700">
                Document Type
              </Text>
              <SelectRoot
                collection={documentTypes}
                value={[documentType]}
                onValueChange={(e) => setDocumentType(e.value[0] as BookingDocumentType)}
                disabled={isUploading}
              >
                <SelectTrigger>
                  <SelectValueText placeholder="Select document type" />
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

            {/* File Input */}
            <Box>
              <Text mb="2" fontSize="sm" fontWeight="medium" color="gray.700">
                Select File
              </Text>
              <Box
                border="2px dashed"
                borderColor={selectedFile ? 'green.300' : 'gray.300'}
                borderRadius="md"
                p="4"
                textAlign="center"
                bg={selectedFile ? 'green.50' : 'gray.50'}
                cursor={isUploading ? 'not-allowed' : 'pointer'}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                _hover={!isUploading ? { borderColor: 'blue.400', bg: 'blue.50' } : undefined}
                transition="all 0.2s"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  disabled={isUploading}
                />
                {selectedFile ? (
                  <VStack gap="1">
                    <Text fontWeight="medium" color="green.700">
                      {selectedFile.name}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {formatFileSize(selectedFile.size)}
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      disabled={isUploading}
                    >
                      Remove
                    </Button>
                  </VStack>
                ) : (
                  <VStack gap="1">
                    <Text color="gray.600">Click to select a file</Text>
                    <Text fontSize="sm" color="gray.500">
                      PDF, JPEG, or PNG (max 5MB)
                    </Text>
                  </VStack>
                )}
              </Box>
            </Box>
          </VStack>
        </DialogBody>

        <DialogFooter>
          <Flex gap="3" justify="flex-end" w="full">
            <Button variant="ghost" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              colorPalette="blue"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Spinner size="sm" mr="2" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </Flex>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
