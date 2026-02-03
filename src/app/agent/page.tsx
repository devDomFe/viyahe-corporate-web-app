"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
} from "@chakra-ui/react";
import { Alert } from "@chakra-ui/react/alert";
import { useAgentBookings } from "@/hooks/useAgentBookings";
import {
  BookingRequestList,
  ConfirmBookingModal,
  RejectBookingModal,
  DocumentUploadModal,
  FulfillBookingModal,
} from "@/components/agent";
import type { BookingStatusFilter } from "@/types/agent";
import type { BookingDocumentType, BookingDocument } from "@/types/booking";
import { formatRoute } from "@/utils/format";

const STATUS_TABS: { value: BookingStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "BOOKING_REQUESTED", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "REJECTED", label: "Rejected" },
  { value: "FULFILLED", label: "Fulfilled" },
];

export default function AgentDashboardPage() {
  const router = useRouter();
  const {
    filteredBookings,
    bookings,
    state,
    statusFilter,
    setStatusFilter,
    confirmBooking,
    rejectBooking,
    fulfillBooking,
    uploadDocument,
    deleteDocument,
    operationState,
  } = useAgentBookings();

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);

  // Get selected booking for modal context
  const selectedBooking = selectedBookingId
    ? bookings.find((b) => b.id === selectedBookingId)
    : null;
  const selectedBookingRoute = selectedBooking
    ? formatRoute(
        selectedBooking.request.searchParams.origin,
        selectedBooking.request.searchParams.destination,
      )
    : undefined;

  // Count by status
  const statusCounts = {
    all: bookings.length,
    BOOKING_REQUESTED: bookings.filter((b) => b.status === "BOOKING_REQUESTED")
      .length,
    CONFIRMED: bookings.filter((b) => b.status === "CONFIRMED").length,
    REJECTED: bookings.filter((b) => b.status === "REJECTED").length,
    FULFILLED: bookings.filter((b) => b.status === "FULFILLED").length,
  };

  const handleConfirm = (id: string) => {
    setSelectedBookingId(id);
    setIsConfirmModalOpen(true);
  };

  const handleReject = (id: string) => {
    setSelectedBookingId(id);
    setIsRejectModalOpen(true);
  };

  const handleConfirmSubmit = async (notes?: string) => {
    if (!selectedBookingId) return false;
    const success = await confirmBooking(selectedBookingId, notes);
    if (success) {
      setSelectedBookingId(null);
    }
    return success;
  };

  const handleRejectSubmit = async (reason?: string) => {
    if (!selectedBookingId) return false;
    const success = await rejectBooking(selectedBookingId, reason);
    if (success) {
      setSelectedBookingId(null);
    }
    return success;
  };

  const handleViewDetails = (id: string) => {
    setSelectedBookingId(id);
    // Could navigate to detail page or open modal
  };

  const handleUploadDocument = (id: string) => {
    setSelectedBookingId(id);
    setIsDocumentModalOpen(true);
  };

  const handleDocumentUpload = async (
    file: File,
    type: BookingDocumentType,
  ): Promise<BookingDocument | null> => {
    if (!selectedBookingId) return null;
    return await uploadDocument(selectedBookingId, file, type);
  };

  const handleDeleteDocument = async (bookingId: string, documentId: string) => {
    await deleteDocument(bookingId, documentId);
  };

  const handleFulfill = (id: string) => {
    setSelectedBookingId(id);
    setIsFulfillModalOpen(true);
  };

  const handleFulfillSubmit = async (): Promise<boolean> => {
    if (!selectedBookingId) return false;
    const success = await fulfillBooking(selectedBookingId);
    if (success) {
      setSelectedBookingId(null);
    }
    return success;
  };

  const isLoading = state.status === "loading";
  const hasError = state.status === "error";
  const isOperationLoading = operationState.status === "loading";

  return (
    <Box minH="100vh" bg="gray.50" pb="10" pt={{ base: "4", md: "6" }}>
      <Container
        maxW="6xl"
        mx="auto"
        py={{ base: "6", md: "10" }}
        px={{ base: "4", md: "8" }}
      >
        <VStack gap="6" align="stretch">
          {/* Header */}
          <Flex
            justify="space-between"
            align={{ base: "start", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap="4"
          >
            <Box>
              <Heading size="xl" color="blue.600">
                Agent Dashboard
              </Heading>
              <Text color="gray.600" mt="1">
                Review and manage booking requests
              </Text>
            </Box>
            {/* <Button variant="outline" onClick={() => router.push("/")}>
              Back to Client View
            </Button> */}
          </Flex>

          {/* Status Tabs */}
          <Box bg="white" p="2" borderRadius="lg" boxShadow="sm">
            <HStack gap="2" wrap="wrap">
              {STATUS_TABS.map((tab) => (
                <Button
                  key={tab.value}
                  size="sm"
                  variant={statusFilter === tab.value ? "solid" : "ghost"}
                  colorPalette={statusFilter === tab.value ? "blue" : "gray"}
                  onClick={() => setStatusFilter(tab.value)}
                >
                  {tab.label} ({statusCounts[tab.value]})
                </Button>
              ))}
            </HStack>
          </Box>

          {/* Error State */}
          {hasError && (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Error</Alert.Title>
                <Alert.Description>
                  {state.status === "error"
                    ? state.error
                    : "Failed to load bookings"}
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          {/* Operation Error */}
          {operationState.status === "error" && (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>{operationState.error}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          {/* Booking List */}
          <BookingRequestList
            bookings={filteredBookings}
            isLoading={isLoading}
            onConfirm={handleConfirm}
            onReject={handleReject}
            onViewDetails={handleViewDetails}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
            onFulfill={handleFulfill}
            isOperationLoading={isOperationLoading}
          />

          {/* Results count */}
          {!isLoading && !hasError && filteredBookings.length > 0 && (
            <Box px="1">
              <Text fontSize="sm" color="gray.600">
                Showing {filteredBookings.length} booking
                {filteredBookings.length !== 1 ? "s" : ""}
                {statusFilter !== "all" &&
                  ` with status "${statusFilter.replace("_", " ").toLowerCase()}"`}
              </Text>
            </Box>
          )}
        </VStack>
      </Container>

      {/* Confirm Modal */}
      <ConfirmBookingModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedBookingId(null);
        }}
        onConfirm={handleConfirmSubmit}
        bookingRoute={selectedBookingRoute}
      />

      {/* Reject Modal */}
      <RejectBookingModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedBookingId(null);
        }}
        onReject={handleRejectSubmit}
        bookingRoute={selectedBookingRoute}
      />

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isDocumentModalOpen}
        onClose={() => {
          setIsDocumentModalOpen(false);
          setSelectedBookingId(null);
        }}
        onUpload={handleDocumentUpload}
        bookingRoute={selectedBookingRoute}
      />

      {/* Fulfill Modal */}
      <FulfillBookingModal
        isOpen={isFulfillModalOpen}
        onClose={() => {
          setIsFulfillModalOpen(false);
          setSelectedBookingId(null);
        }}
        onFulfill={handleFulfillSubmit}
        bookingRoute={selectedBookingRoute}
        documentCount={selectedBooking?.documents.length}
      />
    </Box>
  );
}
