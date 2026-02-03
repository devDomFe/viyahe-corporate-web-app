"use client";

import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react/spinner";
import type { BookingWithDocuments } from "@/types/booking";
import { BookingRequestCard } from "./BookingRequestCard";

interface BookingRequestListProps {
  bookings: BookingWithDocuments[];
  isLoading: boolean;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetails: (id: string) => void;
  onUploadDocument: (id: string) => void;
  onDeleteDocument: (bookingId: string, documentId: string) => void;
  onFulfill: (id: string) => void;
  isOperationLoading?: boolean;
}

export function BookingRequestList({
  bookings,
  isLoading,
  onConfirm,
  onReject,
  onViewDetails,
  onUploadDocument,
  onDeleteDocument,
  onFulfill,
  isOperationLoading = false,
}: BookingRequestListProps) {
  if (isLoading) {
    return (
      <Flex justify="center" py="12">
        <VStack gap="4">
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">Loading bookings...</Text>
        </VStack>
      </Flex>
    );
  }

  if (bookings.length === 0) {
    return (
      <Box bg="white" p="12" borderRadius="lg" textAlign="center">
        <Text fontSize="lg" color="gray.600" mb="2">
          No booking requests found
        </Text>
        <Text color="gray.500">
          Booking requests will appear here when clients submit them.
        </Text>
      </Box>
    );
  }

  return (
    <VStack gap="4" align="stretch" h="65vh" overflowY="auto">
      {bookings.map((booking) => (
        <BookingRequestCard
          key={booking.id}
          booking={booking}
          onConfirm={() => onConfirm(booking.id)}
          onReject={() => onReject(booking.id)}
          onViewDetails={() => onViewDetails(booking.id)}
          onUploadDocument={() => onUploadDocument(booking.id)}
          onDeleteDocument={(docId) => onDeleteDocument(booking.id, docId)}
          onFulfill={() => onFulfill(booking.id)}
          isLoading={isOperationLoading}
        />
      ))}
    </VStack>
  );
}
