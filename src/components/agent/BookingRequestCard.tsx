'use client';

import { useState } from 'react';
import { Box, Flex, Text, VStack, HStack, Button } from '@chakra-ui/react';
import type { BookingWithDocuments } from '@/types/booking';
import { BookingStatusBadge } from './BookingStatusBadge';
import { DocumentList } from './DocumentList';
import { formatCurrency, formatDate, formatRoute } from '@/utils/format';

interface BookingRequestCardProps {
  booking: BookingWithDocuments;
  onConfirm?: () => void;
  onReject?: () => void;
  onViewDetails?: () => void;
  onUploadDocument?: () => void;
  onDeleteDocument?: (documentId: string) => void;
  onFulfill?: () => void;
  isLoading?: boolean;
}

export function BookingRequestCard({
  booking,
  onConfirm,
  onReject,
  onViewDetails,
  onUploadDocument,
  onDeleteDocument,
  onFulfill,
  isLoading = false,
}: BookingRequestCardProps) {
  const [showDocuments, setShowDocuments] = useState(false);
  const { request, status, finalPrice, currency, createdAt, documents } = booking;
  const { searchParams, passengers } = request;

  const passengerNames = passengers
    .map((p) => `${p.firstName} ${p.lastName}`)
    .join(', ');

  const passengerCount = passengers.length;
  const documentCount = documents.length;

  const canConfirm = status === 'BOOKING_REQUESTED';
  const canReject = status === 'BOOKING_REQUESTED';
  const canUpload = status === 'CONFIRMED';
  const canFulfill = status === 'CONFIRMED' && documentCount > 0;

  return (
    <Box
      bg="white"
      borderRadius="lg"
      boxShadow="sm"
      p={{ base: '4', md: '5' }}
      border="1px solid"
      borderColor="gray.200"
      _hover={{ boxShadow: 'md' }}
      transition="box-shadow 0.2s"
    >
      <VStack align="stretch" gap="4">
        {/* Header: Route and Status */}
        <Flex justify="space-between" align="start" wrap="wrap" gap="2">
          <Box>
            <Text fontSize="lg" fontWeight="bold" color="gray.800">
              {formatRoute(searchParams.origin, searchParams.destination)}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {formatDate(searchParams.departureDate)}
              {searchParams.returnDate && ` - ${formatDate(searchParams.returnDate)}`}
            </Text>
          </Box>
          <BookingStatusBadge status={status} size="lg" />
        </Flex>

        {/* Details Grid */}
        <Flex gap="6" wrap="wrap">
          {/* Passengers */}
          <Box flex="1" minW="200px">
            <Text fontSize="xs" color="gray.500" fontWeight="medium" mb="1">
              PASSENGERS ({passengerCount})
            </Text>
            <Text fontSize="sm" color="gray.700" lineClamp={2}>
              {passengerNames}
            </Text>
          </Box>

          {/* Price */}
          <Box>
            <Text fontSize="xs" color="gray.500" fontWeight="medium" mb="1">
              TOTAL PRICE
            </Text>
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              {formatCurrency(finalPrice, currency)}
            </Text>
          </Box>

          {/* Submitted */}
          <Box>
            <Text fontSize="xs" color="gray.500" fontWeight="medium" mb="1">
              SUBMITTED
            </Text>
            <Text fontSize="sm" color="gray.700">
              {formatDate(createdAt)}
            </Text>
          </Box>
        </Flex>

        {/* Special Requests */}
        {request.specialRequests && (
          <Box bg="gray.50" p="3" borderRadius="md">
            <Text fontSize="xs" color="gray.500" fontWeight="medium" mb="1">
              SPECIAL REQUESTS
            </Text>
            <Text fontSize="sm" color="gray.700">
              {request.specialRequests}
            </Text>
          </Box>
        )}

        {/* Documents section for confirmed/fulfilled bookings */}
        {(status === 'CONFIRMED' || status === 'FULFILLED') && (
          <Box>
            <Flex justify="space-between" align="center" mb={showDocuments ? '3' : '0'}>
              <Text fontSize="xs" color="gray.500" fontWeight="medium">
                DOCUMENTS: {documentCount} uploaded
              </Text>
              {documentCount > 0 && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setShowDocuments(!showDocuments)}
                >
                  {showDocuments ? 'Hide' : 'Show'}
                </Button>
              )}
            </Flex>
            {showDocuments && documentCount > 0 && (
              <DocumentList
                documents={documents}
                onDelete={status === 'CONFIRMED' ? onDeleteDocument : undefined}
                isLoading={isLoading}
                showActions={status === 'CONFIRMED'}
              />
            )}
          </Box>
        )}

        {/* Rejection reason */}
        {status === 'REJECTED' && booking.rejectionReason && (
          <Box bg="red.50" p="3" borderRadius="md">
            <Text fontSize="xs" color="red.600" fontWeight="medium" mb="1">
              REJECTION REASON
            </Text>
            <Text fontSize="sm" color="red.700">
              {booking.rejectionReason}
            </Text>
          </Box>
        )}

        {/* Actions */}
        <Flex gap="2" wrap="wrap" pt="2" borderTop="1px solid" borderColor="gray.100">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            disabled={isLoading}
          >
            View Details
          </Button>

          {canConfirm && (
            <Button
              colorPalette="green"
              size="sm"
              onClick={onConfirm}
              disabled={isLoading}
            >
              Confirm
            </Button>
          )}

          {canReject && (
            <Button
              colorPalette="red"
              variant="outline"
              size="sm"
              onClick={onReject}
              disabled={isLoading}
            >
              Reject
            </Button>
          )}

          {canUpload && (
            <Button
              colorPalette="blue"
              variant="outline"
              size="sm"
              onClick={onUploadDocument}
              disabled={isLoading}
            >
              Upload Document
            </Button>
          )}

          {canFulfill && (
            <Button
              colorPalette="blue"
              size="sm"
              onClick={onFulfill}
              disabled={isLoading}
            >
              Mark as Fulfilled
            </Button>
          )}
        </Flex>
      </VStack>
    </Box>
  );
}
