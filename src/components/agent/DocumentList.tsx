'use client';

import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
} from '@chakra-ui/react';
import type { BookingDocument } from '@/types/booking';
import { formatDateTime } from '@/utils/format';

interface DocumentListProps {
  documents: BookingDocument[];
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  showActions?: boolean;
}

const DOCUMENT_TYPE_LABELS: Record<string, { label: string; colorPalette: string }> = {
  itinerary: { label: 'Itinerary', colorPalette: 'blue' },
  e_ticket: { label: 'E-Ticket', colorPalette: 'green' },
  invoice: { label: 'Invoice', colorPalette: 'purple' },
  other: { label: 'Other', colorPalette: 'gray' },
};

export function DocumentList({
  documents,
  onDelete,
  isLoading = false,
  showActions = true,
}: DocumentListProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = (document: BookingDocument) => {
    // Create a download link from the data URL
    const link = window.document.createElement('a');
    link.href = document.dataUrl;
    link.download = document.fileName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  if (documents.length === 0) {
    return (
      <Box
        p="4"
        bg="gray.50"
        borderRadius="md"
        textAlign="center"
        border="1px dashed"
        borderColor="gray.300"
      >
        <Text color="gray.500" fontSize="sm">
          No documents uploaded yet
        </Text>
      </Box>
    );
  }

  return (
    <VStack gap="2" align="stretch">
      {documents.map((doc) => {
        const typeConfig = DOCUMENT_TYPE_LABELS[doc.type] || DOCUMENT_TYPE_LABELS.other;

        return (
          <Box
            key={doc.id}
            p="3"
            bg="white"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
            _hover={{ borderColor: 'gray.300' }}
            transition="border-color 0.2s"
          >
            <Flex justify="space-between" align="start" gap="2">
              <Box flex="1" minW="0">
                <HStack gap="2" mb="1">
                  <Badge colorPalette={typeConfig.colorPalette} size="sm">
                    {typeConfig.label}
                  </Badge>
                </HStack>
                <Text
                  fontWeight="medium"
                  fontSize="sm"
                  lineClamp={1}
                  title={doc.fileName}
                >
                  {doc.fileName}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {formatFileSize(doc.fileSize)} • Uploaded {formatDateTime(doc.uploadedAt)}
                </Text>
              </Box>

              {showActions && (
                <HStack gap="1">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => handleDownload(doc)}
                  >
                    Download
                  </Button>
                  {onDelete && (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="red"
                      onClick={() => onDelete(doc.id)}
                      disabled={isLoading}
                    >
                      Delete
                    </Button>
                  )}
                </HStack>
              )}
            </Flex>
          </Box>
        );
      })}
    </VStack>
  );
}
